import { INotificationRepository } from '../interfaces/notification.interface';
import Notification, { INotification } from '../../models/implementations/notificationModel';

export class NotificationRepository implements INotificationRepository {
  async createNotification(notification: Partial<INotification>): Promise<INotification> {
    return await Notification.create(notification);
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    return await Notification.find({ user: userId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  }
} 