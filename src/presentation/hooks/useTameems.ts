// ==============================
// Presentation Hook — useTameems
// إدارة قائمة التعاميم + إصدار تعميم عام (سوبر أدمن) + إصدار تعميم للمسجد (مدير مسجد)
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { TameemRepositoryImpl } from '../../data/repositories/TameemRepositoryImpl';
import { 
  Tameem, 
  CreateTameemPayload, 
  CreateTameemForMosquePayload, 
  UpdateTameemPayload 
} from '../../domain/entities/Tameem';
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
  // Two tabs for non-superadmin: 'my' (الواردة إليك) as default, 'sent' (الصادرة منك)
  const [tabFilter, setTabFilter] = useState<'my' | 'sent'>('my');

  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
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
          const uid = user.id || user.user_id;
          setCurrentUserId(uid);

          const rawRoles: any[] = Array.isArray(user.roles)
            ? user.roles
            : (user.role ? [user.role] : []);

          const normalizedRoles = rawRoles.map((r: any) => {
            if (typeof r === 'string') return r.toLowerCase();
            if (r && typeof r === 'object') return (r.name || r.slug || r.role || '').toLowerCase();
            return '';
          });

          const isSuper = normalizedRoles.some(r => 
            r.includes('admin') || 
            r.includes('super') || 
            r.includes('region')
          ) || Boolean(user.is_super_admin);

          const isManager = normalizedRoles.some(r => 
            r.includes('mosque_manager') || 
            r === 'manager'
          );

          if (isSuper) {
            setIsSuperAdmin(true);
          } else if (isManager) {
            setIsMosqueManager(true);
          }
        }
      } catch (e) {
        console.warn("Error parsing auth_user in useTameems:", e);
      }
    }
  }, []);

  const loadTameems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (isSuperAdmin) {
        // Super Admin gets all circulars from GET /api/tameems (listTameems)
        result = await tameemRepo.getTameems(1, 50);
        addDebugLog('GET /api/tameems', 'https://mms-backend-rose.vercel.app/api/tameems', 200, result);
      } else if (tabFilter === 'sent') {
        result = await tameemRepo.getSentTameems(1, 50);
        addDebugLog('GET /api/tameems/sent', 'https://mms-backend-rose.vercel.app/api/tameems/sent', 200, result);
      } else {
        result = await tameemRepo.getMyTameems(1, 50);
        addDebugLog('GET /api/tameems/my-tameems', 'https://mms-backend-rose.vercel.app/api/tameems/my-tameems', 200, result);
      }
      setTameems(result.data || []);
    } catch (err: any) {
      console.error('Error loading tameems:', err);
      setError(err.message || 'تعذر تحميل قائمة التعاميم من السيرفر');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, tabFilter, addDebugLog]);

  useEffect(() => {
    loadTameems();
  }, [loadTameems]);

  // Handle Mark as Read (Only for incoming tameems by non-admin)
  const handleMarkAsRead = useCallback(async (id: string | number) => {
    setActionLoadingId(id);
    try {
      await tameemRepo.markTameemAsRead(id);
      addDebugLog(`PATCH /api/tameems/${id}/read`, `https://mms-backend-rose.vercel.app/api/tameems/${id}/read`, 200, { status: 'read', id });
      
      // Optimistically update local tameems state
      setTameems(prev => prev.map(t => {
        if (String(t.id) === String(id)) {
          const now = new Date().toISOString();
          const updatedRecipients = t.recipients?.map(r => ({ ...r, is_read: true, read_at: r.read_at || now })) || [];
          return {
            ...t,
            is_read: true,
            read_at: now,
            recipients: updatedRecipients,
          };
        }
        return t;
      }));

      showToast('تم تأكيد الاطلاع والقراءة بنجاح', 'success');
      await loadTameems();
    } catch (err: any) {
      console.error('Error marking tameem as read:', err);
      showToast(err.message || 'فشل تعيين التعميم كمقروء', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }, [loadTameems, showToast, addDebugLog]);

  // Handle Create General Tameem (Super Admin)
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

  // Handle Create Mosque Tameem (Mosque Manager)
  const handleCreateTameemForMosque = useCallback(async (payload: CreateTameemForMosquePayload) => {
    try {
      const created = await tameemRepo.createTameemForMosque(payload);
      addDebugLog('POST /api/tameems/for-mosque', 'https://mms-backend-rose.vercel.app/api/tameems/for-mosque', 200, created);
      showToast('تم إرسال التعميم لمنسوبي المسجد بنجاح!', 'success');
      await loadTameems();
      return created;
    } catch (err: any) {
      console.error('Error creating tameem for mosque:', err);
      showToast(err.message || 'فشل إرسال التعميم للمسجد', 'error');
      throw err;
    }
  }, [loadTameems, showToast, addDebugLog]);

  // Handle Edit Tameem (Super admin or sender)
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

  // Handle Delete Tameem (Super admin or sender)
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
    currentUserId,
    isSuperAdmin,
    isMosqueManager,
    actionLoadingId,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    readFilter,
    setReadFilter,
    tabFilter,
    setTabFilter,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
    loadTameems,
    handleMarkAsRead,
    handleCreateTameem,
    handleCreateTameemForMosque,
    handleUpdateTameem,
    handleDeleteTameem,
  };
}
