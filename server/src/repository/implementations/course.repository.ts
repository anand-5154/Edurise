import { ICourseRepository, GetCoursesParams } from '../interfaces/course.repository';
import { ICourse } from '../../models/interfaces/course.interface';
import { GetAllCoursesParams, GetAllCoursesResult } from '../../services/interfaces/user.services';
import Course from '../../models/implementations/courseModel';
import Enrollment from '../../models/implementations/enrollmentModel';
import { BaseRepository } from './base.repository';

export class CourseRepository extends BaseRepository<ICourse> implements ICourseRepository {
  constructor() {
    super(Course);
  }

  async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    return this.create(courseData);
  }

  async getCourseById(courseId: string): Promise<ICourse | null> {
    return this.model.findById(courseId)
      .populate('instructor', 'name email')
      .populate('category', 'name');
  }

  async getCoursesByInstructor(instructorId: string): Promise<ICourse[]> {
    return this.model.find({ instructor: instructorId });
  }

  async updateCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null> {
    return this.model.findByIdAndUpdate(
      courseId,
      { $set: courseData },
      { new: true }
    )
    .populate('instructor', 'name email')
    .populate('category', 'name');
  }

  async updateCourseStatus(courseId: string, isPublished: boolean): Promise<ICourse | null> {
    return this.model.findByIdAndUpdate(
      courseId,
      { isPublished },
      { new: true }
    );
  }

  async deleteCourse(courseId: string): Promise<void> {
    await this.deleteById(courseId);
  }

  async getAllCourses(): Promise<ICourse[]> {
    return this.model.find()
      .populate('instructor', 'name email')
      .populate('category', 'name');
  }

  async getCourses(params: GetCoursesParams): Promise<any[]> {
    const { query, page, limit, sort, order } = params;
    // Use aggregation to get enrolled user count for each course
    const courses = await Course.aggregate([
      { $match: query },
      { $sort: { [sort]: order === 'asc' ? 1 : -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments',
        },
      },
      {
        $addFields: {
          enrolledCount: {
            $size: {
              $filter: {
                input: '$enrollments',
                as: 'enrollment',
                cond: { $eq: ['$$enrollment.status', 'completed'] },
              },
            },
          },
        },
      },
      {
        $project: {
          enrollments: 0,
        },
      },
    ]);
    // Populate instructor and category fields
    await Course.populate(courses, [
      { path: 'instructor', select: 'name email' },
      { path: 'category', select: 'name' },
    ]);
    return courses;
  }

  async countCourses(query: any): Promise<number> {
    return this.model.countDocuments(query);
  }

  async getCoursePerformanceReport(): Promise<any[]> {
    // Aggregate course performance: enrollments and completions per course
    return this.model.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments',
        },
      },
      {
        $addFields: {
          enrollments: { $size: '$enrollments' },
          completions: {
            $size: {
              $filter: {
                input: '$enrollments',
                as: 'enr',
                cond: { $eq: ['$$enr.status', 'completed'] },
              },
            },
          },
        },
      },
      {
        $project: {
          title: 1,
          enrollments: 1,
          completions: 1,
        },
      },
    ]);
  }

  async getCoursesWithPagination(params: GetAllCoursesParams): Promise<GetAllCoursesResult> {
    const { page, limit, sort, order, search, category, level, minPrice, maxPrice } = params;
    const query: any = { isPublished: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (level) query.level = level;
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }
    const total = await Course.countDocuments(query);
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
  }

  async findByIdIfPublished(courseId: string): Promise<ICourse | null> {
    return Course.findOne({ _id: courseId, isPublished: true })
      .populate('instructor', 'name email')
      .select('+demoVideo');
  }
} 