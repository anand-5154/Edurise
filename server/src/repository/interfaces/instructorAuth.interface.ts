import { IInstructor } from "../../models/interfaces/instructorAuth.interface"

export interface IInstructorAuth {
    findByEmail(email: string): Promise<IInstructor | null>
    create(instructorData: Partial<IInstructor>): Promise<IInstructor>
    getPendingInstructors(): Promise<IInstructor[]>
    verifyInstructor(instructorId: string): Promise<void>
    rejectInstructor(instructorId: string): Promise<void>
}