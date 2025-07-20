import { IMessageRepository } from '../interfaces/message.interface';
import Message, { IMessage } from '../../models/implementations/messageModel';

export class MessageRepository implements IMessageRepository {
  async findByInstructor(instructorId: string, limit = 2): Promise<IMessage[]> {
    return Message.find({ instructor: instructorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'student',
        select: 'name',
        model: 'User',
        options: { lean: true }
      })
      .lean();
  }

  async countByInstructor(instructorId: string): Promise<number> {
    return Message.countDocuments({ instructor: instructorId });
  }
} 