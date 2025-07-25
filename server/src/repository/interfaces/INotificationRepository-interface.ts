import { INotification } from '../../models/interfaces/INotification-interface';

export interface INotificationRepository {
  createNotification(notification: Partial<INotification>): Promise<INotification>;
  getUserNotifications(userId: string): Promise<INotification[]>;
  markAsRead(notificationId: string): Promise<INotification | null>;
} 