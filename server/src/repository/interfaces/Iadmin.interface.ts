import { FilterQuery } from "mongoose";
import { IAdmin } from "../../models/interfaces/admin.interface";
import { IUser } from "../../models/interfaces/auth.interface";
import { IInstructor } from "../../models/interfaces/IinstructorAuth.interface";
import { DashboardData } from "../../types/admin.types";
import { UserActivityReportDTO } from "../../DTO/userActivityReport.dto";
import { CoursePerformanceReportDTO } from "../../DTO/coursePerformanceReport.dto";

export interface IAdminRepository {
  findAdminByEmail(email: string): Promise<IAdmin | null>;
  findOneAdmin():Promise<IAdmin|null>
  updateUserBlockStatus(email: string, blocked: boolean): Promise<IUser | null>;
  updateTutorBlockStatus(
    email: string,
    blocked: boolean
  ): Promise<IInstructor | null>;
  getAllUsers(
    page: number,
    limit: number,
    search: string
  ): Promise<{ users: IUser[]; total: number; totalPages: number }>;
  getAllTutors(
    page: number,
    limit: number,
    filter: FilterQuery<IInstructor>
  ): Promise<{ tutors: IInstructor[]; total: number; totalPages: number }>;
  getDashboardData():Promise<DashboardData>;
  getUserActivityReport(
    page: number,
    limit: number,
    search?: string
  ): Promise<UserActivityReportDTO>;
  getCoursePerformanceReport(
    page: number,
    limit: number,
    search?: string
  ): Promise<CoursePerformanceReportDTO>;
}
