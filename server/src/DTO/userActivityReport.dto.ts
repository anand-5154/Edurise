export interface UserActivityDTO {
  userId: string;
  userName: string;
  userEmail: string;
  profilePicture?: string;
  isBlocked: boolean;
  accountCreatedAt: Date;
  lastLoginAt?: Date;
  activity: {
    totalEnrollments: number;
    completedCourses: number;
    inProgressCourses: number;
    totalSpent: number;
    totalPurchases: number;
    averageProgress: number;
    certificatesEarned: number;
    lastActivityDate?: Date;
  };
  courses: {
    courseId: string;
    courseTitle: string;
    enrolledDate: Date;
    progressPercentage: number;
    isCompleted: boolean;
    amount: number;
  }[];
}

export interface UserActivityReportDTO {
  users: UserActivityDTO[];
  total: number;
  totalPages: number;
  currentPage: number;
  summary: {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalEnrollments: number;
    totalRevenue: number;
    averageCoursesPerUser: number;
  };
}

