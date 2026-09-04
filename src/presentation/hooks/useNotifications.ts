// ==============================
// Presentation Hook — useNotifications
// ==============================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppNotification } from "../../domain/entities/AppNotification";
import { getNotificationRepository } from "../../data/factories/repositoryFactory";
import { GetNotificationsUseCase } from "../../domain/usecases/notifications/GetNotificationsUseCase";
import { MarkNotificationAsReadUseCase } from "../../domain/usecases/notifications/MarkNotificationAsReadUseCase";
import { MarkAllNotificationsAsReadUseCase } from "../../domain/usecases/notifications/MarkAllNotificationsAsReadUseCase";
import { DeleteNotificationUseCase } from "../../domain/usecases/notifications/DeleteNotificationUseCase";

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => getNotificationRepository(), []);
  const getNotificationsUC = useMemo(() => new GetNotificationsUseCase(repository), [repository]);
  const markNotificationAsReadUC = useMemo(() => new MarkNotificationAsReadUseCase(repository), [repository]);
  const markAllNotificationsAsReadUC = useMemo(() => new MarkAllNotificationsAsReadUseCase(repository), [repository]);
  const deleteNotificationUC = useMemo(() => new DeleteNotificationUseCase(repository), [repository]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotificationsUC.execute();
      setNotifications(data);
      const unread = data.filter(n => !n.read_at).length;
      setUnreadCount(unread);
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  }, [getNotificationsUC]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: number | string) => {
    try {
      await markNotificationAsReadUC.execute(id);
      setNotifications(prev =>
        prev.map(n => String(n.id) === String(id) ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("markAsRead error:", err);
    }
  }, [markNotificationAsReadUC]);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsReadUC.execute();
      const now = new Date().toISOString();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || now })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error("markAllAsRead error:", err);
    }
  }, [markAllNotificationsAsReadUC]);

  const deleteNotification = useCallback(async (id: number | string) => {
    try {
      await deleteNotificationUC.execute(id);
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
  }, [deleteNotificationUC]);

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
