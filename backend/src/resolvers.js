const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

// Custom scalar types
const DateTimeType = new GraphQLScalarType({
  name: 'DateTime',
  serialize: (value) => value.toISOString(),
  parseValue: (value) => new Date(value),
  parseLiteral: (ast) => ast.kind === Kind.STRING ? new Date(ast.value) : null
});

const UUIDType = new GraphQLScalarType({
  name: 'UUID',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast.kind === Kind.STRING ? ast.value : null
});

const { sendResetEmail } = require('./email');

const resolvers = {
  DateTime: DateTimeType,
  UUID: UUIDType,

  Query: {
    me: async (_, __, { db, user, isAuthenticated }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');
      
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [user.id]
      );
      return result.rows[0];
    },

    users: async (_, __, { db, isAuthenticated }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');
      
      const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    },

    user: async (_, { id }, { db }) => {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    },

    events: async (_, __, { db, isAuthenticated, isAdmin }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');
      
      let query = 'SELECT * FROM events';
      if (!isAdmin) {
        query += ' WHERE is_public = true';
      }
      query += ' ORDER BY event_date ASC';
      
      const result = await db.query(query);
      return result.rows;
    },

    publicEvents: async (_, __, { db }) => {
      const result = await db.query(
        'SELECT * FROM events WHERE is_public = true ORDER BY event_date ASC'
      );
      return result.rows;
    },

    event: async (_, { id }, { db, user, isAuthenticated }) => {
      const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);
      const event = result.rows[0];
      
      if (!event) return null;
      
      // Check if user can view this event
      if (!event.is_public && (!isAuthenticated || event.owner_id !== user?.id)) {
        throw new ForbiddenError('Cannot view private event');
      }
      
      return event;
    },

    myEvents: async (_, __, { db, user, isAuthenticated }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');
      
      const result = await db.query(
        'SELECT * FROM events WHERE owner_id = $1 ORDER BY event_date ASC',
        [user.id]
      );
      return result.rows;
    },

    myParticipatingEvents: async (_, __, { db, user, isAuthenticated }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');
      
      const result = await db.query(`
        SELECT e.* FROM events e
        JOIN event_participants ep ON e.id = ep.event_id
        WHERE ep.user_id = $1
        ORDER BY e.event_date ASC
      `, [user.id]);
      return result.rows;
    },

    tags: async (_, __, { db }) => {
      const result = await db.query('SELECT * FROM tags ORDER BY name');
      return result.rows;
    },

    eventComments: async (_, { eventId }, { db }) => {
      const result = await db.query(`
        SELECT * FROM comments 
        WHERE event_id = $1 
        ORDER BY created_at ASC
      `, [eventId]);
      return result.rows;
    },

    myReports: async (_, __, { db, user, isAuthenticated }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');
      
      const result = await db.query(
        'SELECT * FROM user_reports WHERE reporter_id = $1 ORDER BY created_at DESC',
        [user.id]
      );
      return result.rows;
    }
  },

  Mutation: {
    register: async (_, { input }, { db }) => {
      const { firstName, lastName, email, password } = input;
      
      // Check if user already exists
      const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        throw new UserInputError('User with this email already exists');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const result = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [firstName, lastName, email, hashedPassword]);
      
      const user = result.rows[0];
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.is_admin },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      return { token, user };
    },

    login: async (_, { input }, { db }) => {
      const { email, password } = input;
      
      // Find user
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new AuthenticationError('Invalid email or password');
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.is_admin },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      return { token, user };
    },

    // Send password reset email (log link in dev)
    requestPasswordReset: async (_, { email }, { db }) => {
      // Always respond true to avoid user enumeration
      const genericResponse = true;

      try {
        const userRes = await db.query('SELECT id, email FROM users WHERE email = $1', [email]);
        const user = userRes.rows[0];
        if (!user) {
          return genericResponse;
        }

        // Generate token and store hashed version
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.query(
          `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
           VALUES ($1, $2, $3)`,
          [user.id, tokenHash, expiresAt]
        );

        // Build reset URL for frontend
        const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendBase}/reset-password?token=${rawToken}`;

        // Send email if SMTP is configured; otherwise it will log
        await sendResetEmail(user.email, resetUrl);

        return genericResponse;
      } catch (e) {
        console.error('requestPasswordReset error:', e);
        // Still return generic true to avoid leaking info
        return genericResponse;
      }
    },

    // Reset password using provided token
    resetPassword: async (_, { token, newPassword }, { db }) => {
      if (!token || !newPassword || newPassword.length < 6) {
        throw new UserInputError('Invalid token or password too short');
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find valid token
      const now = new Date();
      const tokenRes = await db.query(
        `SELECT * FROM password_reset_tokens
         WHERE token_hash = $1 AND used_at IS NULL AND expires_at > $2
         LIMIT 1`,
        [tokenHash, now]
      );

      const tokenRow = tokenRes.rows[0];
      if (!tokenRow) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      // Update user password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);
      await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, tokenRow.user_id]);

      // Mark token as used
      await db.query('UPDATE password_reset_tokens SET used_at = $1 WHERE id = $2', [now, tokenRow.id]);

      // Fetch user for payload
      const userRes = await db.query('SELECT * FROM users WHERE id = $1', [tokenRow.user_id]);
      const user = userRes.rows[0];

      // Issue new JWT
      const jwtToken = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.is_admin },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return { token: jwtToken, user };
    },

    createEvent: async (_, { input }, { db, user, isAuthenticated }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');
      
      const { name, description, location, maxParticipants, eventDate, isPublic, games } = input;
      
      const result = await db.query(`
        INSERT INTO events (name, description, location, owner_id, max_participants, event_date, is_public, games)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [name, description, location, user.id, maxParticipants, eventDate, isPublic, games]);
      
      // Update user's hosted events count
      await db.query(
        'UPDATE users SET hosted_events_count = hosted_events_count + 1 WHERE id = $1',
        [user.id]
      );
      
      return result.rows[0];
    },

    updateEvent: async (_, { id, input }, { db, user, isAuthenticated, isAdmin }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');

      const existingRes = await db.query('SELECT * FROM events WHERE id = $1', [id]);
      const existing = existingRes.rows[0];

      if (!existing) {
        throw new UserInputError('Event not found');
      }

      if (existing.owner_id !== user.id && !isAdmin) {
        throw new ForbiddenError('Not authorized to update this event');
      }

      const columnMap = {
        name: 'name',
        description: 'description',
        location: 'location',
        maxParticipants: 'max_participants',
        eventDate: 'event_date',
        isPublic: 'is_public',
        games: 'games',
      };

      const values = [id];
      const setClauses = [];

      for (const [key, column] of Object.entries(columnMap)) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
          let value = input[key];

          if (key === 'eventDate' && value) {
            value = new Date(value);
          }

          values.push(value);
          setClauses.push(`${column} = $${values.length}`);
        }
      }

      if (setClauses.length === 0) {
        return existing;
      }

      const updateQuery = `
        UPDATE events
        SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(updateQuery, values);
      return result.rows[0];
    },

    deleteEvent: async (_, { id }, { db, user, isAuthenticated, isAdmin }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');

      const existingRes = await db.query('SELECT owner_id FROM events WHERE id = $1', [id]);
      const existing = existingRes.rows[0];

      if (!existing) {
        throw new UserInputError('Event not found');
      }

      if (existing.owner_id !== user.id && !isAdmin) {
        throw new ForbiddenError('Not authorized to delete this event');
      }

      await db.query('DELETE FROM events WHERE id = $1', [id]);
      return true;
    },

    joinEvent: async (_, { eventId }, { db, user, isAuthenticated }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');
      
      // Check if event exists and has space
      const eventResult = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
      const event = eventResult.rows[0];
      
      if (!event) throw new UserInputError('Event not found');
      
      // Check if already participating
      const participantCheck = await db.query(
        'SELECT 1 FROM event_participants WHERE event_id = $1 AND user_id = $2',
        [eventId, user.id]
      );
      
      if (participantCheck.rows.length > 0) {
        throw new UserInputError('Already participating in this event');
      }
      
      // Add participant
      await db.query(
        'INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2)',
        [eventId, user.id]
      );
      
      // Remove from applicants if exists
      await db.query(
        'DELETE FROM event_applicants WHERE event_id = $1 AND user_id = $2',
        [eventId, user.id]
      );
      
      return event;
    },

    createComment: async (_, { input }, { db, user, isAuthenticated }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');
      
      const { eventId, content, parentCommentId } = input;
      
      const result = await db.query(`
        INSERT INTO comments (event_id, user_id, content, parent_comment_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [eventId, user.id, content, parentCommentId]);
      
      return result.rows[0];
    },

    assignTag: async (_, { userId, tagId }, { db, user, isAuthenticated }) => {
      if (!isAuthenticated) throw new AuthenticationError('Not authenticated');
      
      // Insert tag assignment
      await db.query(`
        INSERT INTO user_tags (user_id, tag_id, assigned_by)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, tag_id) DO NOTHING
      `, [userId, tagId, user.id]);
      
      // Return updated user
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      return result.rows[0];
    },

    createTag: async (_, { name }, { db, isAdmin }) => {
      if (!isAdmin) throw new ForbiddenError('Admin access required');
      
      const result = await db.query(
        'INSERT INTO tags (name) VALUES ($1) RETURNING *',
        [name]
      );
      return result.rows[0];
    }
  },

  // Field resolvers
  User: {
    // Scalar mappings from snake_case to camelCase
    firstName: (parent) => parent.first_name ?? parent.firstName,
    lastName: (parent) => parent.last_name ?? parent.lastName,
    email: (parent) => parent.email,
    isAdmin: (parent) => (typeof parent.is_admin !== 'undefined' ? parent.is_admin : parent.isAdmin),
    hostedEventsCount: (parent) => parent.hosted_events_count ?? parent.hostedEventsCount ?? 0,
    createdAt: (parent) => parent.created_at ?? parent.createdAt,
    updatedAt: (parent) => parent.updated_at ?? parent.updatedAt,
    tags: async (parent, _, { db }) => {
      const result = await db.query(`
        SELECT t.* FROM tags t
        JOIN user_tags ut ON t.id = ut.tag_id
        WHERE ut.user_id = $1
      `, [parent.id]);
      return result.rows;
    },

    hostedEvents: async (parent, _, { db }) => {
      const result = await db.query(
        'SELECT * FROM events WHERE owner_id = $1 ORDER BY event_date ASC',
        [parent.id]
      );
      return result.rows;
    },

    participatingEvents: async (parent, _, { db }) => {
      const result = await db.query(`
        SELECT e.* FROM events e
        JOIN event_participants ep ON e.id = ep.event_id
        WHERE ep.user_id = $1
        ORDER BY e.event_date ASC
      `, [parent.id]);
      return result.rows;
    }
  },

  Event: {
    // Scalar mappings for event fields
    maxParticipants: (parent) => parent.max_participants ?? parent.maxParticipants,
    eventDate: (parent) => parent.event_date ?? parent.eventDate,
    isPublic: (parent) => (typeof parent.is_public !== 'undefined' ? parent.is_public : parent.isPublic),
    games: (parent) => parent.games || [],
    createdAt: (parent) => parent.created_at ?? parent.createdAt,
    updatedAt: (parent) => parent.updated_at ?? parent.updatedAt,
    owner: async (parent, _, { db }) => {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [parent.owner_id]);
      return result.rows[0];
    },

    participants: async (parent, _, { db }) => {
      const result = await db.query(`
        SELECT u.* FROM users u
        JOIN event_participants ep ON u.id = ep.user_id
        WHERE ep.event_id = $1
      `, [parent.id]);
      return result.rows;
    },

    applicants: async (parent, _, { db }) => {
      const result = await db.query(`
        SELECT u.* FROM users u
        JOIN event_applicants ea ON u.id = ea.user_id
        WHERE ea.event_id = $1 AND ea.status = 'pending'
      `, [parent.id]);
      return result.rows;
    },

    comments: async (parent, _, { db }) => {
      const result = await db.query(
        'SELECT * FROM comments WHERE event_id = $1 ORDER BY created_at ASC',
        [parent.id]
      );
      return result.rows;
    },

    participantCount: async (parent, _, { db }) => {
      const result = await db.query(
        'SELECT COUNT(*) FROM event_participants WHERE event_id = $1',
        [parent.id]
      );
      return parseInt(result.rows[0].count);
    },

    applicantCount: async (parent, _, { db }) => {
      const result = await db.query(
        'SELECT COUNT(*) FROM event_applicants WHERE event_id = $1 AND status = \'pending\'',
        [parent.id]
      );
      return parseInt(result.rows[0].count);
    }
  },

  Comment: {
    createdAt: (parent) => parent.created_at ?? parent.createdAt,
    updatedAt: (parent) => parent.updated_at ?? parent.updatedAt,
    event: async (parent, _, { db }) => {
      const result = await db.query('SELECT * FROM events WHERE id = $1', [parent.event_id]);
      return result.rows[0];
    },

    user: async (parent, _, { db }) => {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [parent.user_id]);
      return result.rows[0];
    },

    parentComment: async (parent, _, { db }) => {
      if (!parent.parent_comment_id) return null;
      const result = await db.query('SELECT * FROM comments WHERE id = $1', [parent.parent_comment_id]);
      return result.rows[0];
    },

    replies: async (parent, _, { db }) => {
      const result = await db.query(
        'SELECT * FROM comments WHERE parent_comment_id = $1 ORDER BY created_at ASC',
        [parent.id]
      );
      return result.rows;
    }
  }
  ,
  Tag: {
    createdAt: (parent) => parent.created_at ?? parent.createdAt,
  },
  UserReport: {
    reporter: async (parent, _, { db }) => {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [parent.reporter_id || parent.reporter?.id]);
      return result.rows[0] || parent.reporter;
    },
    reportedUser: async (parent, _, { db }) => {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [parent.reported_user_id || parent.reportedUser?.id]);
      return result.rows[0] || parent.reportedUser;
    },
    isBlocked: (parent) => (typeof parent.is_blocked !== 'undefined' ? parent.is_blocked : parent.isBlocked),
    createdAt: (parent) => parent.created_at ?? parent.createdAt,
  }
};

module.exports = resolvers;
