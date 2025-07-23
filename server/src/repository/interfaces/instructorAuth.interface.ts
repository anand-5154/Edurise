import { IInstructor } from "../../models/interfaces/instructorAuth.interface"

export interface IInstructorAuthRepository {
    findByEmail(email: string): Promise<IInstructor | null>
    createInstructor(instructorData: Partial<IInstructor>): Promise<IInstructor>
    updateTutor(email: string, isVerified: boolean): Promise<IInstructor | null>
    deleteTutor(email: string): Promise<IInstructor | null>
    updatePassword(email: string, hashedPassword: string): Promise<IInstructor | null>
    verifyInstructor(instructorId: string): Promise<void>
    rejectInstructor(instructorId: string): Promise<void>
    updateRefreshTokenById(id: string, refreshToken: string): Promise<void>;
}