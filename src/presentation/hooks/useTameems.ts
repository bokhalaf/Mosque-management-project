// ==============================
// Presentation Hook — useTameems
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { TameemRepositoryImpl } from '../../data/repositories/TameemRepositoryImpl';
import { Tameem, CreateTameemPayload, UpdateTameemPayload } from '../../domain/entities/Tameem';
import { useToast } from '../../app/components/ui/Toast';

const tameemRepo = new TameemRepositoryImpl();

export interface DebugLog {
  time: string;
  action: string;
  url: string;
  status: number;
  response: any;
}

export function useTameems() {
  const { showToast } = useToast();
  const [tameems, setTameems] = useState<Tameem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMosqueManager, setIsMosqueManager] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);

  // Debug Terminal Box State
  const [showDebugTerminal, setShowDebugTerminal] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  const addDebugLog = useCallback((action: string, url: string, status: number, response: any) => {
    const newLog: DebugLog = {
      time: new Date().toLocaleTimeString('ar-EG'),
      action,
      url,
      status,
      response,
    };
    setDebugLogs(prev => [newLog, ...prev.slice(0, 19)]);
  }, []);

  const clearDebugLogs = useCallback(() => setDebugLogs([]), []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
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

  const loadTameems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await tameemRepo.getTameems(1, 50);
      setTameems(result.data || []);
      addDebugLog('GET /api/tameems', 'https://mms-backend-rose.vercel.app/api/tameems', 200, result);
    } catch (err: any) {
      console.error('Error loading tameems:', err);
      setError(err.message || 'تعذر تحميل قائمة التعاميم من السيرفر');
    } finally {
      setLoading(false);
    }
  }, [addDebugLog]);

  useEffect(() => {
    loadTameems();
  }, [loadTameems]);

  // Handle Mark as Read (Mosque Manager)
  const handleMarkAsRead = useCallback(async (id: string | number) => {
    setActionLoadingId(id);
    try {
      await tameemRepo.markTameemAsRead(id);
      addDebugLog(`POST /api/tameems/${id}/read`, `https://mms-backend-rose.vercel.app/api/tameems/${id}/read`, 200, { status: 'read', id });
      showToast('تم تعيين التعميم كمقروء بنجاح', 'success');
      await loadTameems();
    } catch (err: any) {
      console.error('Error marking tameem as read:', err);
      showToast(err.message || 'فشل تعيين التعميم كمقروء', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }, [loadTameems, showToast, addDebugLog]);

  // Handle Create Tameem (Super Admin)
  const handleCreateTameem = useCallback(async (payload: CreateTameemPayload) => {
    try {
      const created = await tameemRepo.createTameem(payload);
      addDebugLog('POST /api/tameems', 'https://mms-backend-rose.vercel.app/api/tameems', 200, created);
      showToast('تم إصدار التعميم ونشره بنجاح!', 'success');
      await loadTameems();
      return created;
    } catch (err: any) {
      console.error('Error creating tameem:', err);
      showToast(err.message || 'فشل إصدار التعميم', 'error');
      throw err;
    }
  }, [loadTameems, showToast, addDebugLog]);

  // Handle Edit Tameem (Super Admin)
  const handleUpdateTameem = useCallback(async (id: string | number, payload: UpdateTameemPayload) => {
    try {
      const updated = await tameemRepo.updateTameem(id, payload);
      addDebugLog(`PUT /api/tameems/${id}`, `https://mms-backend-rose.vercel.app/api/tameems/${id}`, 200, updated);
      showToast('تم تعديل بيانات التعميم بنجاح', 'success');
      await loadTameems();
      return updated;
    } catch (err: any) {
      console.error('Error updating tameem:', err);
      showToast(err.message || 'فشل تعديل التعميم', 'error');
      throw err;
    }
  }, [loadTameems, showToast, addDebugLog]);

  // Handle Delete Tameem (Super Admin)
  const handleDeleteTameem = useCallback(async (id: string | number) => {
    setActionLoadingId(id);
    try {
      await tameemRepo.deleteTameem(id);
      addDebugLog(`DELETE /api/tameems/${id}`, `https://mms-backend-rose.vercel.app/api/tameems/${id}`, 200, { deleted: id });
      showToast('تم حذف التعميم من السيرفر بنجاح', 'success');
      await loadTameems();
    } catch (err: any) {
      console.error('Error deleting tameem:', err);
      showToast(err.message || 'فشل حذف التعميم من السيرفر', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }, [loadTameems, showToast, addDebugLog]);

  const filteredTameems = tameems.filter(t => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchContent = t.content.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (readFilter === 'read' && !t.is_read) return false;
    if (readFilter === 'unread' && t.is_read) return false;
    return true;
  });

  return {
    tameems,
    filteredTameems,
    loading,
    error,
    isSuperAdmin,
    isMosqueManager,
    actionLoadingId,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    readFilter,
    setReadFilter,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
    loadTameems,
    handleMarkAsRead,
    handleCreateTameem,
    handleUpdateTameem,
    handleDeleteTameem,
  };
}
