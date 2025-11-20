export interface LearningPathCourse {
  courseId: string;
  courseTitle?: string;
  courseThumbnail?: string;
  coursePrice?: number;
  note?: string;
  order: number;
  addedAt: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  targetDate?: string | null;
  isArchived: boolean;
  courses: LearningPathCourse[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningPathCourseCatalogItem {
  id: string;
  title: string;
  thumbnail?: string;
  price?: number;
  isActive?: boolean;
}

