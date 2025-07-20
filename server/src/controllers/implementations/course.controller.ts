import { Request, Response } from 'express';
import { ICourseService } from '../../services/interfaces/course.interface';
import { httpStatus } from '../../constants/statusCodes';
import { messages } from '../../constants/messages';

export class CourseController {
    constructor(private _courseService: ICourseService) {}

    async createCourse(req: Request, res: Response) {
        try {
            const course = await this._courseService.createCourse(req.body);
            res.status(httpStatus.CREATED).json(course);
        } catch (error: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_CREATE_COURSE });
        }
    }

    async updateCourse(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const course = await this._courseService.updateCourse(id, req.body);
            if (!course) {
                return res.status(httpStatus.NOT_FOUND).json({ message: messages.COURSE_NOT_FOUND });
            }
            res.json(course);
        } catch (error: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_UPDATE_COURSE });
        }
    }

    // ... rest of the controller methods ...
} 