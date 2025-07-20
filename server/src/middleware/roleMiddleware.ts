import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../constants/statusCodes';
import { messages } from '../constants/messages';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(httpStatus.FORBIDDEN).json({ message: messages.FORBIDDEN });
    }

    next();
  };
}; 