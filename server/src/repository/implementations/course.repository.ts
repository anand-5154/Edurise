import { ICourseRepository, GetCoursesParams } from '../interfaces/course.repository';
import { ICourse } from '../../models/interfaces/course.interface';
import Course from '../../models/implementations/courseModel';

export class CourseRepository implements ICourseRepository {
  async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    const course = new Course(courseData);
    return await course.save();
  }

  async getCourseById(courseId: string): Promise<ICourse | null> {
    return await Course.findById(courseId)
      .populate('instructor', 'name email')
      .populate('category', 'name');
  }

  async getCoursesByInstructor(instructorId: string): Promise<ICourse[]> {
    return await Course.find({ instructor: instructorId })
      .populate('instructor', 'name email')
      .populate('category', 'name');
  }

  async updateCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null> {
    return await Course.findByIdAndUpdate(
      courseId,
      { $set: courseData },
      { new: true }
    )
    .populate('instructor', 'name email')
    .populate('category', 'name');
  }

  async deleteCourse(courseId: string): Promise<void> {
    await Course.findByIdAndDelete(courseId);
  }

  async getAllCourses(): Promise<ICourse[]> {
    return await Course.find()
      .populate('instructor', 'name email')
      .populate('category', 'name');
  }

  async getCourses(params: GetCoursesParams): Promise<ICourse[]> {
    const { query, page, limit, sort, order } = params;
    return await Course.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('instructor', 'name email')
      .populate('category', 'name');
  }

  async countCourses(query: any): Promise<number> {
    return await Course.countDocuments(query);
  }

  async updateCourseStatus(courseId: string, isPublished: boolean): Promise<ICourse | null> {
    return await Course.findByIdAndUpdate(
      courseId,
      { $set: { isPublished } },
      { new: true }
    )
    .populate('instructor', 'name email')
    .populate('category', 'name');
  }
} 