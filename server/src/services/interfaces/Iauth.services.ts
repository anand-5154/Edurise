import { CourseDTO } from "../../DTO/course.dto";
import { InstructorDTO } from "../../DTO/instructor.dto";
import { NotificationDTO } from "../../DTO/notification.dto";
import { OrderDTO } from "../../DTO/order.dto";
import { ProgressDTO } from "../../DTO/progress.dto";
import { UserDTO } from "../../DTO/user.dto";
import { WalletDTO, TransactionDTO } from "../../DTO/wallet.dto";
import { IUser } from "../../models/interfaces/auth.interface";
import { IComplaint } from "../../models/interfaces/complaint.interface";
import { IQuiz } from "../../models/interfaces/Iquiz.interface";
import { IPurchase, PurchasedCourse } from "../../repository/implementations/order.repository";
import {
  LearningPathCourseCatalogDTO,
  LearningPathDTO,
} from "../../DTO/learningPath.dto";
import {
  CreateLearningPathPayload,
  UpdateLearningPathPayload,
} from "../../repository/interfaces/IlearningPath.interface";

export interface IAuthService {
  registerUser(email: string): Promise<void>;
  loginUser(
    email: string,
    password: string
  ): Promise<{ user: UserDTO; token: string; userRefreshToken:string }>;
  verifyOtp(
    data: IUser & { otp: string }
  ): Promise<{ user: UserDTO; token: string,userRefreshToken:string }>;
  handleForgotPassword(email: string): Promise<void>;
  verifyForgotOtp(data: { email: string; otp: string }): Promise<boolean>;
  handleResetPassword(data: {
    email: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<boolean>;
  handleResendOtp(email: string): Promise<void>;
  getProfileByEmail(email: string): Promise<UserDTO>;
  updateProfileService(
    email: string,
    {
      name,
      phone,
      profilePicture,
    }: { name?: string; phone?: string; profilePicture?: Express.Multer.File }
  ): Promise<UserDTO>;
  getCoursesService(page:number,limit:number,search:string,category:string,minPrice:number,maxPrice:number): Promise<{courses:CourseDTO[],total:number,totalPages:number}>;
  findCourseByIdService(courseId: string,userId:string): Promise<{ course: CourseDTO; isEnrolled: boolean }>;
  createOrder(courseId: string, userId: string): Promise<OrderDTO>;
  purchaseCourseWithWallet(courseId: string, userId: string): Promise<OrderDTO>;
  cancelOrder(orderId:string, userId: string):Promise<OrderDTO>
  retryPayment(orderId:string):Promise<OrderDTO>
  verifyPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{success:boolean}>;
  getPreviousOrder(userId:string,courseId:string):Promise<OrderDTO|null>
  updateLectureProgress(userId:string,courseId:string,lectureId:string):Promise<ProgressDTO>
  getUserCourseProgress(userId: string, courseId: string): Promise<ProgressDTO>,
  fetchPurchasedInstructors(userId:string):Promise<InstructorDTO[]>
  checkStatus(userId: string, courseId: string): Promise<boolean>,
  getNotifications(userId:string):Promise<NotificationDTO[]>
  markAsRead(notificationId:string):Promise<NotificationDTO>
  submitComplaint(data:Partial<IComplaint>):Promise<IComplaint|null>
  getPurchases(userId:string,page:number,limit:number):Promise<{ purchases: IPurchase[]; total: number; totalPages: number }>
  getUserWallet(userId:string,page:number,limit:number):Promise<{wallet: WalletDTO; transactions: TransactionDTO[]; total:number; totalPages:number}>
  changePassword(userId:string,oldPassword:string,newPassword:string,confirmPassword:string):Promise<void>
  getSpecificInstructor(instructorId:string):Promise<InstructorDTO>
  getCertificates(userId:string,page:number,limit:number):Promise<{_id:string,user:string,course:string,courseTitle:string,certificateUrl:string,issuedDate:Date}[]>
  getCategory():Promise<string[]|null>
  purchasedCourses(userId:string,page:number,limit:number):Promise<{purchasedCourses:PurchasedCourse[],total:number,totalPages:number}>
  getQuiz(courseId:string):Promise<IQuiz|null>
  submitQuiz(quizId:string,userId:string,courseId:string,answers:{[key:string]:string}):Promise<{ score: number; percentage: number; passed: boolean;isCertificateIssued: boolean; }>
  createLearningPath(userId: string, payload: CreateLearningPathPayload): Promise<LearningPathDTO>;
  getLearningPaths(userId: string): Promise<LearningPathDTO[]>;
  getLearningPathById(userId: string, pathId: string): Promise<LearningPathDTO>;
  updateLearningPath(
    userId: string,
    pathId: string,
    payload: UpdateLearningPathPayload
  ): Promise<LearningPathDTO>;
  deleteLearningPath(userId: string, pathId: string): Promise<void>;
  addCourseToLearningPath(
    userId: string,
    pathId: string,
    courseId: string,
    note?: string
  ): Promise<LearningPathDTO>;
  removeCourseFromLearningPath(
    userId: string,
    pathId: string,
    courseId: string
  ): Promise<LearningPathDTO>;
  reorderLearningPathCourses(
    userId: string,
    pathId: string,
    orderedCourseIds: string[]
  ): Promise<LearningPathDTO>;
  getLearningPathCourseCatalog(
    userId: string
  ): Promise<LearningPathCourseCatalogDTO[]>;
}
