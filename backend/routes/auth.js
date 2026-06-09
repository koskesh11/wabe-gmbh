import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { 
  sanitizeInput, 
  validateEmail, 
  validatePassword,
  AppError 
} from '../middleware/security.js';
import { 
  generateToken, 
  generateRefreshToken,
  authenticateToken 
} from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!validateEmail(email)) {
      return next(new AppError('Invalid email format', 400));
    }

    if (!validatePassword(password)) {
      return next(new AppError('Password must be 8-128 characters', 400));
    }

    const sanitizedName = sanitizeInput(name);
    if (!sanitizedName || sanitizedName.length < 2) {
      return next(new AppError('Invalid name', 400));
    }

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return next(new AppError('Email already registered', 409));
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, name, created_at`,
      [email.toLowerCase(), passwordHash, sanitizedName]
    );

    const user = result.rows[0];

    // Log registration
    await query(
      `INSERT INTO audit_logs (user_id, action, status) 
       VALUES ($1, $2, $3)`,
      [user.id, 'user_registered', 'success']
    );

    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password required', 400));
    }

    const result = await query(
      'SELECT id, email, password_hash, name FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Log failed attempt
      await query(
        `INSERT INTO audit_logs (action, ip_address, status) 
         VALUES ($1, $2, $3)`,
        ['login_failed', req.ip, 'user_not_found']
      );
      return next(new AppError('Invalid credentials', 401));
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await query(
        `INSERT INTO audit_logs (user_id, action, status) 
         VALUES ($1, $2, $3)`,
        [user.id, 'login_failed', 'invalid_password']
      );
      return next(new AppError('Invalid credentials', 401));
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Log successful login
    await query(
      `INSERT INTO audit_logs (user_id, action, status) 
       VALUES ($1, $2, $3)`,
      [user.id, 'login_success', 'success']
    );

    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Verify token
router.post('/verify', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
