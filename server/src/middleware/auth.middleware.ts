import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { httpStatus } from '../constants/statusCodes';
import { messages } from '../constants/messages';

interface JwtPayload {
  id: string;
  role: string;
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      email: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: messages.INVALID_OR_EXPIRED_TOKEN });
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