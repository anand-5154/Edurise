import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import { IInstructorAuthRepository } from "../interfaces/instructorAuth.interface";
import { IInstructorAuth } from '../interfaces/instructorAuth.interface';
import Instructor from "../../models/implementations/instructorModel";

export class InstructorAuth implements IInstructorAuthRepository, IInstructorAuth {

    async create(instructorData: Partial<IInstructor>): Promise<IInstructor> {
        const instructor = await Instructor.create(instructorData);
        return instructor;
    }

    async createInstructor(userData: Partial<IInstructor>): Promise<IInstructor> {
        const instructor = await Instructor.create(userData);
        return instructor;
    }

    async findByEmail(email: string): Promise<IInstructor | null> {
        const instructor = await Instructor.findOne({email});
        return instructor;
    }

    async updateTutor(email: string, isVerified: boolean): Promise<IInstructor | null> {
        const tutor = await Instructor.findOneAndUpdate({email}, {isVerified: true}, {new: true});
        return tutor;
    }

    async deleteTutor(email: string): Promise<IInstructor | null> {
        return await Instructor.findOneAndDelete({email});
    }

    async getPendingInstructors(): Promise<IInstructor[]> {
        return await Instructor.find({ isVerified: false });
    }

    async verifyInstructor(instructorId: string): Promise<void> {
        const instructor = await Instructor.findById(instructorId);
        if (!instructor) {
            throw new Error('Instructor not found');
        }
        
        const updatedInstructor = await Instructor.findByIdAndUpdate(
            instructorId,
            {
                $set: {
                    isVerified: true,
                    accountStatus: 'approved'
                }
            },
            { new: true }
        );

        if (!updatedInstructor) {
            throw new Error('Failed to update instructor status');
        }
    }

    async rejectInstructor(instructorId: string): Promise<void> {
        const instructor = await Instructor.findById(instructorId);
        if (!instructor) {
            throw new Error('Instructor not found');
        }
        
        await Instructor.findByIdAndUpdate(instructorId, {
            accountStatus: 'rejected'
        });
    }

    async updatePassword(email: string, hashedPassword: string): Promise<IInstructor | null> {
        const instructor = await Instructor.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );
        return instructor;
    }

    async findById(id: string) {
        return Instructor.findById(id).select('-password -__v');
    }

    async updateById(id: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string }) {
        return Instructor.findByIdAndUpdate(id, update, { new: true }).select('-password -__v');
    }

    async updatePasswordById(id: string, hashedPassword: string) {
        return Instructor.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
    }
}