import { IUserService, GetAllCoursesParams, GetAllCoursesResult } from '../interfaces/user.services';
import Course from '../../models/implementations/courseModel';
import { ICourse } from '../../models/interfaces/course.interface';

export class UserService implements IUserService {
  async getAllCourses(params: GetAllCoursesParams): Promise<GetAllCoursesResult> {
    try {
      const { page, limit, sort, order, search, category, level, minPrice, maxPrice } = params;

      // Build query
      const query: any = { isPublished: true };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        query.category = category;
      }

      if (level) {
        query.level = level;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = minPrice;
        if (maxPrice !== undefined) query.price.$lte = maxPrice;
      }

      // Get total count
      const total = await Course.countDocuments(query);

      // Get courses with pagination and sorting
      const courses = await Course.find(query)
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('instructor', 'name')
        .lean();

      return {
        courses: courses as ICourse[],
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      throw error;
    }
  }

  async getCourseById(courseId: string): Promise<ICourse | null> {
    try {
      const course = await Course.findOne({
        _id: courseId,
        isPublished: true
      })
      .populate('instructor', 'name email')
      .select('+demoVideo'); // Explicitly include demoVideo field

      return course;
    } catch (error) {
      console.error('Error in getCourseById:', error);
      throw error;
    }
  }
} 