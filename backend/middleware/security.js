import crypto from 'crypto';

export function validateEnv() {
  const required = [
    'JWT_SECRET',
    'DB_URL',
    'NODE_ENV'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>\"']/g, '')
    .slice(0, 255);
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 254;
}

export function validatePassword(password) {
  return password && password.length >= 8 && password.length <= 128;
}

export function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';
  
  let status = err.status || 500;
  let message = 'An error occurred';
  
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Invalid input';
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    message = 'Forbidden';
  }
  
  const response = { error: message };
  
  if (isDev) {
    response.details = err.message;
  }
  
  if (isDev) {
    console.error(err);
  }
  
  res.status(status).json(response);
}

export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}
