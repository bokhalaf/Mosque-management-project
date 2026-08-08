// ==============================
// Presentation Hook — useNotifications
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { AppNotification } from "../../domain/entities/AppNotification";
import { NotificationRepositoryImpl } from "../../data/repositories/NotificationRepositoryImpl";

const repository = new NotificationRepositoryImpl();

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.getNotifications();
      setNotifications(data);
      const unread = data.filter(n => !n.read_at).length;
      setUnreadCount(unread);
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: number | string) => {
    try {
      await repository.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => String(n.id) === String(id) ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("markAsRead error:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await repository.markAllAsRead();
      const now = new Date().toISOString();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || now })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error("markAllAsRead error:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number | string) => {
    try {
      await repository.deleteNotification(id);
      setNotifications(prev => {
        const item = prev.find(n => String(n.id) === String(id));
        if (item && !item.read_at) {
          setUnreadCount(cnt => Math.max(0, cnt - 1));
        }
        return prev.filter(n => String(n.id) !== String(id));
      });
    } catch (err: any) {
      console.error("deleteNotification error:", err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
