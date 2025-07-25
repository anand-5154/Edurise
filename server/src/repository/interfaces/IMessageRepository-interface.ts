import { IMessage } from '../../models/interfaces/IMessage-interface';

export interface IMessageRepository {
  findByInstructor(instructorId: string, limit?: number): Promise<IMessage[]>;
  countByInstructor(instructorId: string): Promise<number>;
} 