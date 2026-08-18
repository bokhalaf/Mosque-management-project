// ==============================
// Presentation Hook — useMosques (Super Admin)
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { MosqueRepositoryImpl } from '../../data/repositories/MosqueRepositoryImpl';
import { MosqueDetail, UpdateMosquePayload } from '../../domain/entities/Mosque';
import { CreateMosquePayload } from '../../domain/repositories/IMosqueRepository';
import { useToast } from '../../app/components/ui/Toast';

const mosqueRepo = new MosqueRepositoryImpl();

export interface DebugLog {
  time: string;
  action: string;
  url: string;
  status: number;
  response: any;
}

export function useMosques() {
  const { showToast } = useToast();
  const [mosques, setMosques] = useState<MosqueDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [geoCatalog, setGeoCatalog] = useState<import('../../domain/entities/Mosque').GeoGovernorate[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);

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

  const loadGeoCatalog = useCallback(async () => {
    setGeoLoading(true);
    try {
      const data = await mosqueRepo.getGeoCatalog();
      setGeoCatalog(data);
      addDebugLog('GET /api/geo', 'https://mms-backend-rose.vercel.app/api/geo', 200, { count: data.length });
    } catch (e) {
      console.warn("Failed to load geo catalog:", e);
    } finally {
      setGeoLoading(false);
    }
  }, [addDebugLog]);

  useEffect(() => {
    loadGeoCatalog();
  }, [loadGeoCatalog]);

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
        }
      } catch (e) {}
    }
  }, []);

  const loadMosques = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await mosqueRepo.getMosques(1, 50);
      setMosques(result.data || []);
      addDebugLog('GET /api/mosques', 'https://mms-backend-rose.vercel.app/api/mosques', 200, result);
    } catch (err: any) {
      console.error('Error loading mosques:', err);
      setError(err.message || 'تعذر تحميل قائمة المساجد من السيرفر');
    } finally {
      setLoading(false);
    }
  }, [addDebugLog]);

  useEffect(() => {
    loadMosques();
  }, [loadMosques]);

  // Handle Search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadMosques();
      return;
    }
    setLoading(true);
    try {
      const result = await mosqueRepo.searchMosques(query);
      setMosques(result.data || []);
      addDebugLog(`GET /api/mosques/search?q=${query}`, `https://mms-backend-rose.vercel.app/api/mosques/search?q=${query}`, 200, result);
    } catch (err: any) {
      console.error('Error searching mosques:', err);
    } finally {
      setLoading(false);
    }
  }, [loadMosques, addDebugLog]);

  // Handle Toggle Featured Status
  const handleToggleFeatured = useCallback(async (id: string | number) => {
    setActionLoadingId(id);
    try {
      const isFeatured = await mosqueRepo.toggleMosqueFeatured(id);
      addDebugLog(`POST /api/mosques/${id}/featured`, `https://mms-backend-rose.vercel.app/api/mosques/${id}/featured`, 200, { is_featured: isFeatured });
      showToast(isFeatured ? 'تم تمييز المسجد في القائمة الرئيسية' : 'تم إلغاء تمييز المسجد', 'success');
      await loadMosques();
    } catch (err: any) {
      console.error('Error toggling featured status:', err);
      showToast(err.message || 'فشل تغيير حالة التمييز', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }, [loadMosques, showToast, addDebugLog]);

  // Handle Update Status (active | maintenance | inactive | closed)
  const handleUpdateStatus = useCallback(async (id: string | number, newStatus: 'active' | 'inactive' | 'maintenance' | 'closed') => {
    setActionLoadingId(id);
    try {
      await mosqueRepo.updateMosqueStatus(id, newStatus);
      addDebugLog(`PATCH /api/mosques/${id}/status`, `https://mms-backend-rose.vercel.app/api/mosques/${id}/status`, 200, { status: newStatus });
      showToast('تم تحديث حالة المسجد بنجاح', 'success');
      await loadMosques();
    } catch (err: any) {
      console.error('Error updating mosque status:', err);
      showToast(err.message || 'فشل تحديث حالة المسجد', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }, [loadMosques, showToast, addDebugLog]);

  // Handle Create Mosque
  const handleCreateMosque = useCallback(async (payload: CreateMosquePayload) => {
    try {
      const created = await mosqueRepo.createMosque(payload);
      addDebugLog('POST /api/mosques', 'https://mms-backend-rose.vercel.app/api/mosques', 200, created);
      showToast('تم إشهار وإضافة المسجد بنجاح!', 'success');
      await loadMosques();
      return created;
    } catch (err: any) {
      console.error('Error creating mosque:', err);
      showToast(err.message || 'فشل إضافة المسجد', 'error');
      throw err;
    }
  }, [loadMosques, showToast, addDebugLog]);

  // Handle Update Mosque
  const handleUpdateMosque = useCallback(async (id: string | number, payload: UpdateMosquePayload) => {
    try {
      const updated = await mosqueRepo.updateMosque(id, payload);
      addDebugLog(`PUT /api/mosques/${id}`, `https://mms-backend-rose.vercel.app/api/mosques/${id}`, 200, updated);
      showToast('تم تعديل بيانات المسجد بنجاح', 'success');
      await loadMosques();
      return updated;
    } catch (err: any) {
      console.error('Error updating mosque:', err);
      showToast(err.message || 'فشل تعديل بيانات المسجد', 'error');
      throw err;
    }
  }, [loadMosques, showToast, addDebugLog]);

  // Handle Delete Mosque
  const handleDeleteMosque = useCallback(async (id: string | number) => {
    setActionLoadingId(id);
    try {
      await mosqueRepo.deleteMosque(id);
      addDebugLog(`DELETE /api/mosques/${id}`, `https://mms-backend-rose.vercel.app/api/mosques/${id}`, 200, { deleted: id });
      showToast('تم حذف المسجد من السيرفر بنجاح', 'success');
      await loadMosques();
    } catch (err: any) {
      console.error('Error deleting mosque:', err);
      showToast(err.message || 'فشل حذف المسجد من السيرفر', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }, [loadMosques, showToast, addDebugLog]);

  const filteredMosques = mosques.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (featuredFilter === 'featured' && !m.is_featured) return false;
    if (featuredFilter === 'normal' && m.is_featured) return false;
    return true;
  });

  const stats = {
    totalMosques: mosques.length,
    activeMosques: mosques.filter(m => m.status === 'active').length,
    maintenanceMosques: mosques.filter(m => m.status === 'maintenance').length,
    featuredMosques: mosques.filter(m => m.is_featured).length,
  };

  return {
    mosques,
    filteredMosques,
    stats,
    loading,
    error,
    isSuperAdmin,
    actionLoadingId,
    searchQuery,
    setSearchQuery: handleSearch,
    statusFilter,
    setStatusFilter,
    featuredFilter,
    setFeaturedFilter,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
    loadMosques,
    handleSearch,
    handleToggleFeatured,
    handleUpdateStatus,
    handleCreateMosque,
    handleUpdateMosque,
    handleDeleteMosque,
    geoCatalog,
    geoLoading,
    loadGeoCatalog,
  };
}

