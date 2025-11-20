export interface LearningPathCourseDTO {
  courseId: string;
  courseTitle?: string;
  courseThumbnail?: string;
  coursePrice?: number;
  note?: string;
  order: number;
  addedAt: Date;
}

export interface LearningPathDTO {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date | null;
  isArchived: boolean;
  courses: LearningPathCourseDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPathCourseCatalogDTO {
  id: string;
  title: string;
  thumbnail?: string;
  price?: number;
  isActive?: boolean;
}

