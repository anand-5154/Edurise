import { IInstructorBankInfo } from '../../models/interfaces/IInstructorBankInfo-interface';

export interface IInstructorBankInfoRepository {
  createBankInfo(data: Partial<IInstructorBankInfo>): Promise<IInstructorBankInfo>;
  updateBankInfo(instructorId: string, data: Partial<IInstructorBankInfo>): Promise<IInstructorBankInfo | null>;
  getBankInfoByInstructorId(instructorId: string): Promise<IInstructorBankInfo | null>;
  deleteBankInfo(instructorId: string): Promise<void>;
} 