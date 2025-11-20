import { IProgress } from "../../models/interfaces/Iprogress.interface";
import { IProgressRepository } from "../interfaces/Iprogress.interface";
import Progress from "../../models/implementations/progressModel";
import { CourseProgressByUserDTO, CourseProgressListDTO } from "../../DTO/courseProgressByUser.dto";
import Order from "../../models/implementations/orderModel";
import Course from "../../models/implementations/courseModel";
import { Types } from "mongoose";
import { InstructorCoursePerformanceReportDTO } from "../../DTO/coursePerformanceReport.dto";
import Review from "../../models/implementations/reviewModel";

export class ProgressRepository implements IProgressRepository {
  async createProgress(
    userId: string,
    courseId: string,
    lectureId: string
  ): Promise<IProgress> {
    return Progress.create({
      userId,
      courseId,
      watchedLectures: [lectureId],
    });
  }

  async findProgress(
    userId: string,
    courseId: string
  ): Promise<IProgress | null> {
    return Progress.findOne({ userId, courseId });
  }

  async addWatchedLecture(
    userId: string,
    courseId: string,
    lectureId: string
  ): Promise<IProgress | null> {
    return Progress.findOneAndUpdate(
      { userId, courseId, watchedLectures: { $ne: lectureId } },
      { $push: { watchedLectures: lectureId } },
      { new: true }
    );
  }

  async markAsCompleted(userId: string, courseId: string): Promise<void> {
    await Progress.updateOne(
      { userId: userId, courseId: courseId },
      { $set: { isCompleted: true } }
    );
  }

  async removeProgress(userId: string, courseId: string): Promise<void> {
    await Progress.deleteOne({ userId, courseId });
  }

  async CheckStatus(
    userId: string,
    courseId: string
  ): Promise<{ isCompleted: boolean }> {
    const progress = await Progress.findOne({
      userId: userId,
      courseId: courseId,
    });

    if (!progress) {
      return { isCompleted: false };
    }

    return { isCompleted: progress.isCompleted };
  }

  async makeCertificateIssued(
    userId: string,
    courseId: string,
    isIssued: boolean
  ): Promise<void> {
    await Progress.findOneAndUpdate(
      { userId, courseId },
      { $set: { isCertificateIssued: isIssued } },
      { new: true }
    );
  }

  async getCourseProgressByUser(
    instructorId: string,
    courseId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<CourseProgressListDTO> {
    // Verify course belongs to instructor
    const course = await Course.findOne({
      _id: courseId,
      instructor: instructorId,
    }).populate("instructor");

    if (!course) {
      throw new Error("Course not found or does not belong to instructor");
    }

    // Calculate total lectures from course modules
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

    // Get all paid orders for this course
    const searchRegex = search ? new RegExp(search, "i") : null;

    const orders = await Order.find({
      courseId: courseId,
      status: "paid",
    })
      .populate<{
        userId: { _id: Types.ObjectId; name: string; email: string };
      }>({
        path: "userId",
        select: "_id name email",
      })
      .sort({ createdAt: -1 });

    // Filter by search if provided
    let filteredOrders = orders.filter((order) => {
      if (!order.userId) return false;
      const user = order.userId;
      if (!searchRegex) return true;
      return (
        user.name.match(searchRegex) || user.email.match(searchRegex)
      );
    });

    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / limit);

    // Paginate
    const paginatedOrders = filteredOrders.slice(
      (page - 1) * limit,
      page * limit
    );

    // Get progress for each user
    const progressList = await Promise.all(
      paginatedOrders.map(async (order) => {
        const user = order.userId;
        if (!user) {
          throw new Error("User not found");
        }

        const progress = await Progress.findOne({
          userId: user._id,
          courseId: courseId,
        });

        const watchedLectures = progress?.watchedLectures || [];
        const progressPercentage =
          totalLectures > 0
            ? Math.round((watchedLectures.length / totalLectures) * 100)
            : 0;

        return {
          userId: user._id.toString(),
          userName: user.name,
          userEmail: user.email,
          courseId: courseId,
          courseTitle: course.title,
          progress: {
            watchedLectures: watchedLectures,
            totalLectures: totalLectures,
            progressPercentage: progressPercentage,
            isCompleted: progress?.isCompleted || false,
            isCertificateIssued: progress?.isCertificateIssued || false,
            lastAccessedAt: progress?.updatedAt,
          },
          enrollmentDate: order.createdAt,
        } as CourseProgressByUserDTO;
      })
    );

    return {
      progressList,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async getCoursePerformanceReportByInstructor(
    instructorId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<InstructorCoursePerformanceReportDTO> {
    const skip = (page - 1) * limit;
    const searchRegex = search ? new RegExp(search, "i") : null;

    // Query instructor's courses
    const courseFilter: any = { instructor: instructorId };
    if (searchRegex) {
      courseFilter.title = { $regex: searchRegex };
    }
    const [courses, totalCourses] = await Promise.all([
      Course.find(courseFilter)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(courseFilter),
    ]);
    const totalPages = Math.ceil(totalCourses / limit);

    // Collect all orders, progress, reviews for this instructor's courses
    const courseIds = courses.map((course) => course._id.toString());
    const [allOrders, allProgress, allReviews] = await Promise.all([
      Order.find({
        courseId: { $in: courseIds },
        status: "paid",
      }).lean(),
      Progress.find({
        courseId: { $in: courseIds },
      }).lean(),
      Review.find({
        courseId: { $in: courseIds },
        isHidden: false,
      }).lean(),
    ]);

    // Build course performance
    const coursePerformances = courses.map((course) => {
      const courseId = course._id.toString();
      const enrollments = allOrders.filter((order) => order.courseId?.toString() === courseId);
      const progressRecords = allProgress.filter((progress) => progress.courseId?.toString() === courseId);
      const reviews = allReviews.filter((review) => review.courseId?.toString() === courseId);
      const totalEnrollments = enrollments.length;
      const completedEnrollments = progressRecords.filter((p) => p.isCompleted).length;
      const inProgressEnrollments = totalEnrollments - completedEnrollments;
      const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
      // Total lectures for progress calculation
      const totalLectures = course.modules?.reduce(
        (total, module) =>
          total + (module.chapters?.reduce(
            (chapterTotal, chapter) =>
              chapterTotal + (chapter.lectures?.length || 0),
            0
          ) || 0),
        0
      ) || 0;
      // Average progress
      let averageProgress = 0;
      if (progressRecords.length > 0) {
        const totalProgress = progressRecords.reduce((sum, p) => {
          const watchedCount = p.watchedLectures?.length || 0;
          const progressPercent = totalLectures > 0
            ? Math.round((watchedCount / totalLectures) * 100)
            : 0;
          return sum + (p.isCompleted ? 100 : progressPercent);
        }, 0);
        averageProgress = Math.round(totalProgress / progressRecords.length);
      }
      const totalRevenue = enrollments.reduce((sum, order) => sum + (order.amount || 0), 0);
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;
      return {
        courseId,
        courseTitle: course.title,
        instructorName: course.instructor?.name || "",
        category: course.category || "",
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
          refunds: 0,
        },
        students: {
          total: totalEnrollments,
          active: inProgressEnrollments,
          completed: completedEnrollments,
        },
      };
    });

    // Summary statistics (for instructor only)
    const totalEnrollments = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalCompleted = allProgress.filter((p) => p.isCompleted).length;
    const overallCompletionRate = allProgress.length > 0
      ? Math.round((totalCompleted / allProgress.length) * 100)
      : 0;
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
      : 0;
    const activeCourses = courses.filter((c) => c.isActive !== false).length;
    return {
      courses: coursePerformances,
      total: totalCourses,
      totalPages,
      currentPage: page,
      summary: {
        totalCourses,
        totalEnrollments,
        totalRevenue,
        averageCompletionRate: overallCompletionRate,
        averageRating: Math.round(averageRating * 100) / 100,
        activeCourses,
      },
    };
  }
}
