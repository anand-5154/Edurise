import { IInstructor } from '../../models/interfaces/IInstructorAuth-interface';
import { IInstructorAuthRepository } from '../interfaces/IInstructorAuthRepository-interface';
import { IInstructorAuth } from '../interfaces/IInstructorAuth-interface';
import Instructor from "../../models/implementations/instructorModel";
import { BaseRepository } from './base.repository';

export class InstructorAuth extends BaseRepository<IInstructor> implements IInstructorAuthRepository, IInstructorAuth {
  constructor() {
    super(Instructor);
  }

    async create(instructorData: Partial<IInstructor>): Promise<IInstructor> {
    return this.model.create(instructorData);
    }

    async createInstructor(userData: Partial<IInstructor>): Promise<IInstructor> {
    return this.model.create(userData);
    }

    async findByEmail(email: string): Promise<IInstructor | null> {
    return this.model.findOne({email});
    }

    async updateTutor(email: string, isVerified: boolean): Promise<IInstructor | null> {
    return this.model.findOneAndUpdate({email}, {isVerified: true}, {new: true});
    }

    async deleteTutor(email: string): Promise<IInstructor | null> {
    return this.model.findOneAndDelete({email});
    }

    async getPendingInstructors(): Promise<IInstructor[]> {
    return this.model.find({ isVerified: false });
    }

    async verifyInstructor(instructorId: string): Promise<void> {
    const instructor = await this.model.findById(instructorId);
        if (!instructor) {
            throw new Error('Instructor not found');
        }
    const updatedInstructor = await this.model.findByIdAndUpdate(
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
    const instructor = await this.model.findById(instructorId);
        if (!instructor) {
            throw new Error('Instructor not found');
        }
    await this.model.findByIdAndUpdate(instructorId, {
            accountStatus: 'rejected'
        });
    }

    async updatePassword(email: string, hashedPassword: string): Promise<IInstructor | null> {
    return this.model.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );
    }

    async findById(id: string) {
    return this.model.findById(id).select('-password -__v');
    }

    async updateById(id: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string; education?: string[]; yearsOfExperience?: string[] }) {
    return this.model.findByIdAndUpdate(id, update, { new: true }).select('-password -__v');
    }

    async updatePasswordById(id: string, hashedPassword: string) {
    return this.model.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
    }

    async updateRefreshTokenById(id: string, refreshToken: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { refreshToken });
    }
}