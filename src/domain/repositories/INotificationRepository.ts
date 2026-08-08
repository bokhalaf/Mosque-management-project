// ==============================
// Domain Repository Interface — INotificationRepository
// ==============================

import { AppNotification, NotificationStats } from "../entities/AppNotification";

export interface INotificationRepository {
  getNotifications(): Promise<AppNotification[]>;
  markAsRead(id: number | string): Promise<boolean>;
  markAllAsRead(): Promise<boolean>;
  deleteNotification(id: number | string): Promise<boolean>;
  getStats(): Promise<NotificationStats>;
}
