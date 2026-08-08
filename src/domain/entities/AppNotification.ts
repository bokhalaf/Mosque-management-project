// ==============================
// Domain Entity — AppNotification
// ==============================

export type NotificationType = 'system' | 'maintenance' | 'invitation' | 'donation' | 'sermon' | 'general';

export interface AppNotification {
  id: number | string;
  title: string;
  message: string;
  type: NotificationType;
  read_at: string | null;
  created_at: string;
  action_url?: string;
}

export interface NotificationStats {
  unread_count: number;
  total_count: number;
}
