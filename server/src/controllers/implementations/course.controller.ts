import { Request, Response } from 'express';
import { ICourseService } from '../../services/interfaces/course.interface';

export class CourseController {
    constructor(private courseService: ICourseService) {}

    async createCourse(req: Request, res: Response) {
        try {
            const course = await this.courseService.createCourse(req.body);
            res.status(201).json(course);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateCourse(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const course = await this.courseService.updateCourse(id, req.body);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.json(course);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    // ... rest of the controller methods ...
} 