import { IInstructorBankInfoRepository } from '../interfaces/IInstructorBankInfoRepository-interface';
import InstructorBankInfo, { IInstructorBankInfo } from '../../models/implementations/instructorBankInfoModel';
import { BaseRepository } from './base.repository';

export class InstructorBankInfoRepository extends BaseRepository<IInstructorBankInfo> implements IInstructorBankInfoRepository {
  constructor() {
    super(InstructorBankInfo);
  }

  async createBankInfo(data: Partial<IInstructorBankInfo>): Promise<IInstructorBankInfo> {
    return InstructorBankInfo.create(data);
  }

  async updateBankInfo(instructorId: string, data: Partial<IInstructorBankInfo>): Promise<IInstructorBankInfo | null> {
    return this.model.findOneAndUpdate(
      { instructor: instructorId },
      { $set: data },
      { new: true, upsert: true }
    );
  }

  async getBankInfoByInstructorId(instructorId: string): Promise<IInstructorBankInfo | null> {
    return this.model.findOne({ instructor: instructorId });
  }

  async deleteBankInfo(instructorId: string): Promise<void> {
    await this.model.deleteOne({ instructor: instructorId });
  }
} 