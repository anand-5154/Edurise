import { IMessageRepository } from '../interfaces/message.interface';
import Message, { IMessage } from '../../models/implementations/messageModel';
import { BaseRepository } from './base.repository';

export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
  constructor() {
    super(Message);
  }

  async findByInstructor(instructorId: string, limit = 2): Promise<IMessage[]> {
    return this.model.find({ instructor: instructorId })
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
    return this.model.countDocuments({ instructor: instructorId });
  }
} 