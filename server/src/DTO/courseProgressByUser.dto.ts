export interface CourseProgressByUserDTO {
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  progress: {
    watchedLectures: string[];
    totalLectures: number;
    progressPercentage: number;
    isCompleted: boolean;
    isCertificateIssued: boolean;
    lastAccessedAt?: Date;
  };
  enrollmentDate: Date;
}

export interface CourseProgressListDTO {
  progressList: CourseProgressByUserDTO[];
  total: number;
  totalPages: number;
  currentPage: number;
}

