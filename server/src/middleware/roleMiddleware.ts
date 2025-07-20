import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../constants/statusCodes';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
    }

    next();
  };
}; 