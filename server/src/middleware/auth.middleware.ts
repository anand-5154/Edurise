import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { httpStatus } from '../constants/statusCodes';

interface JwtPayload {
  id: string;
  role: string;
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'No token provided' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    if (!decoded || !decoded.id || !decoded.role) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
      return;
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(httpStatus.UNAUTHORIZED).json({ message: 'Authentication failed' });
  }
};

// Role-based middleware
export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: 'Authentication required' });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
        return;
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Authorization failed' });
    }
  };
}; 