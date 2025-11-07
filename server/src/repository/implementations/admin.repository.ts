import { IAdminRepository } from "../interfaces/Iadmin.interface";
import User from "../../models/implementations/userModel";
import Instructor from "../../models/implementations/instructorModel";
import { IUser } from "../../models/interfaces/auth.interface";
import { IInstructor } from "../../models/interfaces/IinstructorAuth.interface";
import { IAdmin } from "../../models/interfaces/admin.interface";
import Admin from "../../models/implementations/adminModel";
import { BaseRepository } from "../base.repository";
import Course from "../../models/implementations/courseModel";
import { DashboardData } from "../../types/admin.types";
import { FilterQuery } from "mongoose";
import { UserActivityReportDTO, UserActivityDTO } from "../../DTO/userActivityReport.dto";
import { CoursePerformanceReportDTO, CoursePerformanceDTO } from "../../DTO/coursePerformanceReport.dto";
import Order from "../../models/implementations/orderModel";
import Progress from "../../models/implementations/progressModel";
import Review from "../../models/implementations/reviewModel";
import { Types } from "mongoose";

export class AdminRepository
  extends BaseRepository<IAdmin>
  implements IAdminRepository
{
  constructor() {
    super(Admin);
  }
  async getAllUsers(page: number, limit: number, search: string): Promise<{ users: IUser[]; total: number; totalPages: number }> {
  const skip = (page - 1) * limit;

  const filter = search
    ? {
        name: { $regex: search, $options: "i" },
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { users, total, totalPages };
}

  async getAllTutors(
    page: number,
    limit: number,
    filter: FilterQuery<IInstructor>
  ): Promise<{ tutors: IInstructor[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [tutors, total] = await Promise.all([
      Instructor.find(filter).skip(skip).limit(limit).lean(),
      Instructor.countDocuments(filter),
    ]);

    const totalPages=Math.ceil(total/limit)

    return { tutors, total, totalPages };
  }

  async findAdminByEmail(email: string): Promise<IAdmin | null> {
    return await this.model.findOne({ email });
  }

  async findOneAdmin(): Promise<IAdmin | null> {
    return await this.model.findOne()
  }

  async updateUserBlockStatus(
    email: string,
    blocked: boolean
  ): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { email },
      { isBlocked: blocked, updatedAt: new Date() },
      { new: true }
    );
  }

  async updateTutorBlockStatus(
    email: string,
    blocked: boolean
  ): Promise<IInstructor | null> {
    return await Instructor.findOneAndUpdate(
      { email },
      { isBlocked: blocked },
      { new: true }
    );
  }

  async getDashboardData(): Promise<DashboardData> {
    const [totalUsers,totalTutors,totalCourses]=await Promise.all([
      User.countDocuments(),
      Instructor.countDocuments(),
      Course.countDocuments()
    ])

    return {totalUsers,totalTutors,totalCourses}
  }

  async getUserActivityReport(
    page: number,
    limit: number,
    search?: string
  ): Promise<UserActivityReportDTO> {
    const skip = (page - 1) * limit;
    const searchRegex = search ? new RegExp(search, "i") : null;

    // Build filter for users
    const userFilter: any = {};
    if (searchRegex) {
      userFilter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
      ];
    }

    // Get paginated users
    const [users, totalUsers] = await Promise.all([
      User.find(userFilter).skip(skip).limit(limit).lean(),
      User.countDocuments(userFilter),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    // Get all users for summary (not paginated)
    const allUsers = await User.find({}).lean();
    const allOrders = await Order.find({ status: "paid" }).lean();
    const allProgress = await Progress.find({}).lean();

    // Build user activity data
    const userActivities = await Promise.all(
      users.map(async (user) => {
        const userId = user._id.toString();

        // Get user's orders
        const userOrders = allOrders.filter(
          (order) => order.userId?.toString() === userId
        );

        // Get user's progress records
        const userProgressRecords = allProgress.filter(
          (progress) => progress.userId?.toString() === userId
        );

        // Calculate metrics
        const totalEnrollments = userOrders.length;
        const completedCourses = userProgressRecords.filter(
          (p) => p.isCompleted
        ).length;
        const inProgressCourses = totalEnrollments - completedCourses;
        const totalSpent = userOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
        
        // Calculate average progress
        let averageProgress = 0;
        if (userProgressRecords.length > 0) {
          const progressSum = userProgressRecords.reduce((sum, progress) => {
            // Get course to calculate total lectures
            const order = userOrders.find(
              (o) => o.courseId?.toString() === progress.courseId?.toString()
            );
            if (!order) return sum;
            return sum;
          }, 0);
          // For now, use a simpler calculation
          const totalProgress = userProgressRecords.reduce((sum, p) => {
            const watchedCount = p.watchedLectures?.length || 0;
            return sum + (p.isCompleted ? 100 : Math.min(watchedCount * 10, 100));
          }, 0);
          averageProgress = Math.round(totalProgress / userProgressRecords.length);
        }

        const certificatesEarned = userProgressRecords.filter(
          (p) => p.isCertificateIssued
        ).length;

        // Get course details for each enrollment
        const courses = await Promise.all(
          userOrders.map(async (order) => {
            const course = await Course.findById(order.courseId).lean();
            if (!course) return null;

            const progress = userProgressRecords.find(
              (p) => p.courseId?.toString() === order.courseId?.toString()
            );

            // Calculate total lectures
            const totalLectures = course.modules?.reduce(
              (total, module) =>
                total +
                (module.chapters?.reduce(
                  (chapterTotal, chapter) =>
                    chapterTotal + (chapter.lectures?.length || 0),
                  0
                ) || 0),
              0
            ) || 0;

            const watchedLectures = progress?.watchedLectures?.length || 0;
            const progressPercentage =
              totalLectures > 0
                ? Math.round((watchedLectures / totalLectures) * 100)
                : 0;

            return {
              courseId: course._id.toString(),
              courseTitle: course.title,
              enrolledDate: order.createdAt || new Date(),
              progressPercentage,
              isCompleted: progress?.isCompleted || false,
              amount: order.amount || 0,
            };
          })
        );

        // Get last activity date (most recent progress update or order)
        const lastProgressDate = userProgressRecords.length > 0
          ? new Date(
              Math.max(
                ...userProgressRecords.map((p) =>
                  p.updatedAt ? new Date(p.updatedAt).getTime() : 0
                )
              )
            )
          : undefined;
        const lastOrderDate = userOrders.length > 0
          ? new Date(
              Math.max(
                ...userOrders.map((o) =>
                  o.createdAt ? new Date(o.createdAt).getTime() : 0
                )
              )
            )
          : undefined;
        const lastActivityDate =
          lastProgressDate && lastOrderDate
            ? lastProgressDate > lastOrderDate
              ? lastProgressDate
              : lastOrderDate
            : lastProgressDate || lastOrderDate;

        return {
          userId,
          userName: user.name,
          userEmail: user.email,
          profilePicture: user.profilePicture,
          isBlocked: user.isBlocked || false,
          accountCreatedAt: user.createdAt || new Date(),
          lastLoginAt: user.updatedAt,
          activity: {
            totalEnrollments,
            completedCourses,
            inProgressCourses,
            totalSpent,
            totalPurchases: totalEnrollments,
            averageProgress,
            certificatesEarned,
            lastActivityDate,
          },
          courses: courses.filter((c) => c !== null) as {
            courseId: string;
            courseTitle: string;
            enrolledDate: Date;
            progressPercentage: number;
            isCompleted: boolean;
            amount: number;
          }[],
        } as UserActivityDTO;
      })
    );

    // Calculate summary statistics
    const totalRevenue = allOrders.reduce(
      (sum, order) => sum + (order.amount || 0),
      0
    );
    const activeUsers = allUsers.filter((u) => !u.isBlocked).length;
    const blockedUsers = allUsers.filter((u) => u.isBlocked).length;
    const totalEnrollments = allOrders.length;
    const averageCoursesPerUser =
      allUsers.length > 0 ? totalEnrollments / allUsers.length : 0;

    return {
      users: userActivities,
      total: totalUsers,
      totalPages,
      currentPage: page,
      summary: {
        totalUsers: allUsers.length,
        activeUsers,
        blockedUsers,
        totalEnrollments,
        totalRevenue,
        averageCoursesPerUser: Math.round(averageCoursesPerUser * 100) / 100,
      },
    };
  }

  async getCoursePerformanceReport(
    page: number,
    limit: number,
    search?: string
  ): Promise<CoursePerformanceReportDTO> {
    const skip = (page - 1) * limit;
    const searchRegex = search ? new RegExp(search, "i") : null;

    // Build filter for courses
    const courseFilter: any = {};
    if (searchRegex) {
      courseFilter.$or = [
        { title: searchRegex },
        { category: searchRegex },
      ];
    }

    // Get paginated courses
    const [courses, totalCourses] = await Promise.all([
      Course.find(courseFilter)
        .populate<{ instructor: { name: string } }>("instructor", "name")
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(courseFilter),
    ]);

    const totalPages = Math.ceil(totalCourses / limit);

    // Get all data for calculations
    const allOrders = await Order.find({ status: "paid" }).lean();
    const allProgress = await Progress.find({}).lean();
    const allReviews = await Review.find({ isHidden: false }).lean();

    // Build course performance data
    const coursePerformances = await Promise.all(
      courses.map(async (course) => {
        const courseId = course._id.toString();

        // Get enrollments for this course
        const enrollments = allOrders.filter(
          (order) => order.courseId?.toString() === courseId
        );

        // Get progress records for this course
        const progressRecords = allProgress.filter(
          (progress) => progress.courseId?.toString() === courseId
        );

        // Get reviews for this course
        const reviews = allReviews.filter(
          (review) => review.courseId?.toString() === courseId
        );

        // Calculate metrics
        const totalEnrollments = enrollments.length;
        const completedEnrollments = progressRecords.filter(
          (p) => p.isCompleted
        ).length;
        const inProgressEnrollments = totalEnrollments - completedEnrollments;
        const completionRate =
          totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0;

        // Calculate average progress
        const totalLectures = course.modules?.reduce(
          (total, module) =>
            total +
            (module.chapters?.reduce(
              (chapterTotal, chapter) =>
                chapterTotal + (chapter.lectures?.length || 0),
              0
            ) || 0),
          0
        ) || 0;

        let averageProgress = 0;
        if (progressRecords.length > 0) {
          const totalProgress = progressRecords.reduce((sum, p) => {
            const watchedCount = p.watchedLectures?.length || 0;
            const progressPercentage =
              totalLectures > 0
                ? Math.round((watchedCount / totalLectures) * 100)
                : 0;
            return sum + (p.isCompleted ? 100 : progressPercentage);
          }, 0);
          averageProgress = Math.round(totalProgress / progressRecords.length);
        }

        const totalRevenue = enrollments.reduce(
          (sum, order) => sum + (order.amount || 0),
          0
        );

        // Calculate average rating
        const averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
              reviews.length
            : 0;

        return {
          courseId,
          courseTitle: course.title,
          instructorName:
            (course.instructor as any)?.name || "Unknown Instructor",
          category: course.category || "Uncategorized",
          price: course.price || 0,
          thumbnail: course.thumbnail,
          createdAt: course.createdAt || new Date(),
          performance: {
            totalEnrollments,
            completedEnrollments,
            inProgressEnrollments,
            completionRate,
            averageProgress,
            totalRevenue,
            averageRating: Math.round(averageRating * 100) / 100,
            totalReviews: reviews.length,
            refunds: 0, // Can be added if refund tracking is implemented
          },
          students: {
            total: totalEnrollments,
            active: inProgressEnrollments,
            completed: completedEnrollments,
          },
        } as CoursePerformanceDTO;
      })
    );

    // Calculate summary statistics
    const allCourses = await Course.find({}).lean();
    const allCourseOrders = await Order.find({ status: "paid" }).lean();
    const allCourseProgress = await Progress.find({}).lean();
    const allCourseReviews = await Review.find({ isHidden: false }).lean();

    const totalEnrollments = allCourseOrders.length;
    const totalRevenue = allCourseOrders.reduce(
      (sum, order) => sum + (order.amount || 0),
      0
    );

    // Calculate overall completion rate
    const totalCompleted = allCourseProgress.filter((p) => p.isCompleted).length;
    const overallCompletionRate =
      allCourseProgress.length > 0
        ? Math.round((totalCompleted / allCourseProgress.length) * 100)
        : 0;

    // Calculate overall average rating
    const overallAverageRating =
      allCourseReviews.length > 0
        ? allCourseReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          allCourseReviews.length
        : 0;

    const activeCourses = allCourses.filter((c) => c.isActive !== false).length;

    return {
      courses: coursePerformances,
      total: totalCourses,
      totalPages,
      currentPage: page,
      summary: {
        totalCourses: allCourses.length,
        totalEnrollments,
        totalRevenue,
        averageCompletionRate: overallCompletionRate,
        averageRating: Math.round(overallAverageRating * 100) / 100,
        activeCourses,
      },
    };
  }
}
