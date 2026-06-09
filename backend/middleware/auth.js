import jwt from 'jsonwebtoken';
import { AppError } from './security.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return next(new AppError('No token provided', 401));
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new AppError('Invalid or expired token', 401));
    }
    
    req.user = user;
    next();
  });
}

export function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function generateRefreshToken(userId, email) {
  return jwt.sign(
    { userId, email, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
