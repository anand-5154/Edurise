import { IMessage } from '../../models/implementations/messageModel';

export interface IMessageRepository {
  findByInstructor(instructorId: string, limit?: number): Promise<IMessage[]>;
  countByInstructor(instructorId: string): Promise<number>;
} 