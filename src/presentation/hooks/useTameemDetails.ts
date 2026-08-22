// ==============================
// Presentation Hook — useTameemDetails
// جلب تفاصيل تعميم كاملة + تحديث + حذف + تعيين كمقروء + مراقب الـ API
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { TameemRepositoryImpl, BASE_URL } from '../../data/repositories/TameemRepositoryImpl';
import { Tameem, UpdateTameemPayload } from '../../domain/entities/Tameem';
import { useToast } from '../../app/components/ui/Toast';

const tameemRepo = new TameemRepositoryImpl();

export interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function useTameemDetails(tameemId: string | number) {
  const { showToast } = useToast();
  const [tameem, setTameem] = useState<Tameem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMosqueManager, setIsMosqueManager] = useState(false);

  // Debug inspector state
  const [showDebugTerminal, setShowDebugTerminal] = useState(false);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const addDebugLog = useCallback((action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-EG') },
      ...prev.slice(0, 15),
    ]);
  }, []);

  const clearDebugLogs = useCallback(() => setDebugLogs([]), []);

  // Auth User check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const uid = user.id || user.user_id;
          setCurrentUserId(uid);
          const roles: string[] = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
          if (roles.includes('super_admin') || Boolean(user.is_super_admin)) {
            setIsSuperAdmin(true);
          }
          if (roles.includes('mosque_manager') || user.role === 'mosque_manager') {
            setIsMosqueManager(true);
          }
        }
      } catch (e) {}
    }
  }, []);

  // Fetch Tameem Details
  const fetchDetails = useCallback(async () => {
    if (!tameemId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await tameemRepo.getTameemById(tameemId);
      setTameem(data);
      addDebugLog(
        `GET /api/tameems/${tameemId}`,
        `${BASE_URL}/tameems/${tameemId}`,
        200,
        data
      );
    } catch (err: any) {
      console.error(`Failed to fetch tameem #${tameemId}:`, err);
      setError(err.message || 'تعذر تحميل تفاصيل التعميم');
      addDebugLog(
        `GET /api/tameems/${tameemId} [FAILED]`,
        `${BASE_URL}/tameems/${tameemId}`,
        404,
        { error: err.message }
      );
    } finally {
      setLoading(false);
    }
  }, [tameemId, addDebugLog]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Update Tameem
  const handleUpdateTameem = useCallback(async (payload: UpdateTameemPayload) => {
    setActionLoading(true);
    try {
      const updated = await tameemRepo.updateTameem(tameemId, payload);
      setTameem(updated);
      addDebugLog(
        `PUT /api/tameems/${tameemId}`,
        `${BASE_URL}/tameems/${tameemId}`,
        200,
        updated
      );
      showToast('تم تحديث بيانات التعميم بنجاح', 'success');
      return updated;
    } catch (err: any) {
      console.error('Error updating tameem:', err);
      addDebugLog(
        `PUT /api/tameems/${tameemId} [FAILED]`,
        `${BASE_URL}/tameems/${tameemId}`,
        422,
        { error: err.message }
      );
      showToast(err.message || 'فشل تحديث التعميم', 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [tameemId, showToast, addDebugLog]);

  // Delete Tameem
  const handleDeleteTameem = useCallback(async () => {
    setActionLoading(true);
    try {
      await tameemRepo.deleteTameem(tameemId);
      addDebugLog(
        `DELETE /api/tameems/${tameemId}`,
        `${BASE_URL}/tameems/${tameemId}`,
        200,
        { deleted: tameemId }
      );
      showToast('تم حذف التعميم بنجاح', 'success');
    } catch (err: any) {
      console.error('Error deleting tameem:', err);
      addDebugLog(
        `DELETE /api/tameems/${tameemId} [FAILED]`,
        `${BASE_URL}/tameems/${tameemId}`,
        400,
        { error: err.message }
      );
      showToast(err.message || 'فشل حذف التعميم', 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [tameemId, showToast, addDebugLog]);

  // Mark as Read
  const handleMarkAsRead = useCallback(async () => {
    setActionLoading(true);
    try {
      await tameemRepo.markTameemAsRead(tameemId);
      addDebugLog(
        `PATCH /api/tameems/${tameemId}/read`,
        `${BASE_URL}/tameems/${tameemId}/read`,
        200,
        { status: 'read', id: tameemId, message: 'تم تحديث حالة التعميم إلى مقروء' }
      );
      
      // Optimistically update local tameem state
      setTameem(prev => {
        if (!prev) return null;
        const now = new Date().toISOString();
        const updatedRecipients = prev.recipients?.map(r => ({ ...r, is_read: true, read_at: r.read_at || now })) || [];
        return {
          ...prev,
          is_read: true,
          read_at: now,
          recipients: updatedRecipients,
        };
      });

      showToast('تم تأكيد الاطلاع والقراءة بنجاح', 'success');
      await fetchDetails();
    } catch (err: any) {
      console.error('Error marking tameem as read:', err);
      addDebugLog(
        `PATCH /api/tameems/${tameemId}/read [FAILED]`,
        `${BASE_URL}/tameems/${tameemId}/read`,
        400,
        { error: err.message }
      );
      showToast(err.message || 'فشل تعيين التعميم كمقروء', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [tameemId, fetchDetails, showToast, addDebugLog]);

  // Determine if the current user is the sender / admin vs recipient
  const isSender = Boolean(
    isSuperAdmin ||
    (currentUserId && tameem?.sender_id && String(tameem.sender_id) === String(currentUserId))
  );
  const isIncoming = !isSender && !isSuperAdmin;

  return {
    tameem,
    loading,
    actionLoading,
    error,
    currentUserId,
    isSuperAdmin,
    isMosqueManager,
    isSender,
    isIncoming,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
    fetchDetails,
    handleUpdateTameem,
    handleDeleteTameem,
    handleMarkAsRead,
  };
}
