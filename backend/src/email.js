const nodemailer = require('nodemailer');

function buildTransporterFromEnv() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  const secure = port === 465; // true for 465, false for other ports
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return transporter;
}

const transporter = buildTransporterFromEnv();

async function sendResetEmail(to, resetUrl) {
  const from = process.env.EMAIL_FROM || 'No-Reply <no-reply@example.com>';

  // If transporter is not configured, log and return gracefully
  if (!transporter) {
    console.warn('SMTP not configured. Logging reset URL instead.');
    console.log(`Password reset email to ${to}: ${resetUrl}`);
    return;
  }

  const subject = 'Reset your password';
  const html = `
    <p>You requested to reset your password.</p>
    <p>Click the link below to set a new password. This link expires in 1 hour.</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;
  const text = `Reset your password using the link below (valid for 1 hour):\n${resetUrl}`;

  await transporter.sendMail({ from, to, subject, text, html });
}

module.exports = { sendResetEmail };

