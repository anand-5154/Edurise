import { INotificationRepository } from '../interfaces/notification.interface';
import Notification, { INotification } from '../../models/implementations/notificationModel';
import { BaseRepository } from './base.repository';

export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
  constructor() {
    super(Notification);
  }

  async createNotification(notification: Partial<INotification>): Promise<INotification> {
    return this.create(notification);
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    return this.model.find({ user: userId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return this.model.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  }
} 