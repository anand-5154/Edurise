import express from 'express';
import { CourseController } from '../controllers/implementations/course.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const courseController = new CourseController(/* inject course service */);

// Create course
router.post('/', authMiddleware, courseController.createCourse.bind(courseController));

// Update course
router.put('/:id', authMiddleware, courseController.updateCourse.bind(courseController));

// ... rest of the routes ...

export default router; 