import { IProgress } from "../../models/interfaces/Iprogress.interface";
import { CourseProgressByUserDTO, CourseProgressListDTO } from "../../DTO/courseProgressByUser.dto";
import { InstructorCoursePerformanceReportDTO } from "../../DTO/coursePerformanceReport.dto";

export interface IProgressRepository {
  findProgress(userId: string, courseId: string): Promise<IProgress | null>;

  createProgress(
    userId: string,
    courseId: string,
    lectureId: string
  ): Promise<IProgress>;

  addWatchedLecture(
    userId: string,
    courseId: string,
    lectureId: string
  ): Promise<IProgress | null>;

  markAsCompleted(userId: string, courseId: string): Promise<void>;
  CheckStatus(userId: string, courseId: string): Promise<{isCompleted:boolean}>;
  removeProgress(userId: string, courseId: string): Promise<void>;
  makeCertificateIssued(
    userId: string,
    courseId: string,
    isIssued: boolean
  ): Promise<void>;
  getCourseProgressByUser(
    instructorId: string,
    courseId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<CourseProgressListDTO>;

  getCoursePerformanceReportByInstructor(
    instructorId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<InstructorCoursePerformanceReportDTO>;
}
