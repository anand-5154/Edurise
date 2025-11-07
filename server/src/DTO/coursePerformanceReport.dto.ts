export interface CoursePerformanceDTO {
  courseId: string;
  courseTitle: string;
  instructorName: string;
  category: string;
  price: number;
  thumbnail?: string;
  createdAt: Date;
  performance: {
    totalEnrollments: number;
    completedEnrollments: number;
    inProgressEnrollments: number;
    completionRate: number;
    averageProgress: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    refunds?: number;
  };
  students: {
    total: number;
    active: number;
    completed: number;
  };
}

export interface CoursePerformanceReportDTO {
  courses: CoursePerformanceDTO[];
  total: number;
  totalPages: number;
  currentPage: number;
  summary: {
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    averageCompletionRate: number;
    averageRating: number;
    activeCourses: number;
  };
}

export interface InstructorCoursePerformanceReportDTO {
  courses: CoursePerformanceDTO[];
  total: number;
  totalPages: number;
  currentPage: number;
  summary: {
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    averageCompletionRate: number;
    averageRating: number;
    activeCourses: number;
  };
}

