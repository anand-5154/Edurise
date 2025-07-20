import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IInstructor } from '../models/interfaces/instructor.interface';
import Instructor from '../models/implementations/instructorModel';
import { httpStatus } from '../constants/statusCodes';

declare global {
    namespace Express {
        interface Request {
            instructor?: IInstructor;
        }
    }
}

export const instructorAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        const instructor = await Instructor.findById(decoded.id).select('-password');

        if (!instructor) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Instructor not found' });
        }

        if (instructor.blocked) {
            return res.status(httpStatus.FORBIDDEN).json({ message: 'Your account has been blocked. Please contact support.' });
        }

        if (!instructor.isVerified) {
            return res.status(httpStatus.FORBIDDEN).json({ message: 'Please verify your email first' });
        }

        if (instructor.accountStatus !== 'approved') {
            return res.status(httpStatus.FORBIDDEN).json({ message: 'Your account is pending approval' });
        }

        req.instructor = instructor;
        next();
    } catch (error) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
    }
}; 