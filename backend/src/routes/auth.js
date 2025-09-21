const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { pool } = require('../context');
const { sendResetEmail } = require('../email');

const router = express.Router();

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    isAdmin: row.is_admin,
    hostedEventsCount: row.hosted_events_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// POST /auth/register { firstName, lastName, email, password }
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body || {};
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [firstName, lastName, email, hashed]
    );

    const userRow = result.rows[0];
    const token = jwt.sign(
      { id: userRow.id, email: userRow.email, isAdmin: userRow.is_admin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, user: mapUser(userRow) });
  } catch (err) {
    console.error('REST register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const userRow = result.rows[0];
    if (!userRow) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, userRow.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: userRow.id, email: userRow.email, isAdmin: userRow.is_admin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token, user: mapUser(userRow) });
  } catch (err) {
    console.error('REST login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/request-password-reset { email }
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(200).json({ success: true }); // generic response to avoid enumeration
  }

  try {
    const userRes = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];
    if (!user) {
      return res.status(200).json({ success: true });
    }

    // Generate token and store hashed version
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // Build reset URL and send email (or log in dev)
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendBase}/reset-password?token=${rawToken}`;
    await sendResetEmail(user.email, resetUrl);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('REST requestPasswordReset error:', err);
    // Generic success to avoid leaking details
    return res.status(200).json({ success: true });
  }
});

// POST /auth/reset-password { token, newPassword }
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Invalid token or password too short' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date();
    const tokenRes = await pool.query(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > $2
       LIMIT 1`,
      [tokenHash, now]
    );

    const tokenRow = tokenRes.rows[0];
    if (!tokenRow) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    // Update user password
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, tokenRow.user_id]);

    // Mark token as used
    await pool.query('UPDATE password_reset_tokens SET used_at = $1 WHERE id = $2', [now, tokenRow.id]);

    // Fetch user and issue JWT
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [tokenRow.user_id]);
    const userRow = userRes.rows[0];
    const authToken = jwt.sign(
      { id: userRow.id, email: userRow.email, isAdmin: userRow.is_admin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token: authToken, user: mapUser(userRow) });
  } catch (err) {
    console.error('REST resetPassword error:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
