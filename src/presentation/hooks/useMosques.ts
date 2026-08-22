// ==============================
// Presentation Hook — useMosques (Super Admin)
// الفلترة والبحث والباجنيشن عبر الـ API بالكامل مع دعم كافة حالات المساجد والمميزة
// ==============================

import { useState, useEffect, useCallback, useRef } from 'react';
import { MosqueRepositoryImpl } from '../../data/repositories/MosqueRepositoryImpl';
import { MosqueDetail, UpdateMosquePayload, GeoGovernorate } from '../../domain/entities/Mosque';
import { CreateMosquePayload, MosqueFilterOptions } from '../../domain/repositories/IMosqueRepository';
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

  // Filter & Search & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string | number>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Server Pagination State (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [serverPagination, setServerPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6,
  });

  // KPI Overview Stats
  const [stats, setStats] = useState({
    totalMosques: 0,
    activeMosques: 0,
    maintenanceMosques: 0,
    featuredMosques: 0,
  });

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [geoCatalog, setGeoCatalog] = useState<GeoGovernorate[]>([]);
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

  // Load Geo Catalog
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

  // Auth Super Admin Check
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

  // Load KPI Stats from Server
  const loadStats = useCallback(async () => {
    try {
      const [allRes, activeRes, maintRes, featRes] = await Promise.allSettled([
        mosqueRepo.getMosques({ page: 1, limit: 1 }),
        mosqueRepo.getMosques({ status: 'active', page: 1, limit: 1 }),
        mosqueRepo.getMosques({ status: 'maintenance', page: 1, limit: 1 }),
        mosqueRepo.getFeaturedMosques(),
      ]);

      const total = allRes.status === 'fulfilled' ? (allRes.value.pagination?.totalItems ?? allRes.value.data.length) : 0;
      const active = activeRes.status === 'fulfilled' ? (activeRes.value.pagination?.totalItems ?? activeRes.value.data.length) : 0;
      const maintenance = maintRes.status === 'fulfilled' ? (maintRes.value.pagination?.totalItems ?? maintRes.value.data.length) : 0;
      const featured = featRes.status === 'fulfilled' ? featRes.value.length : 0;

      setStats({
        totalMosques: total,
        activeMosques: active,
        maintenanceMosques: maintenance,
        featuredMosques: featured,
      });
    } catch (e) {
      console.warn('Failed to load stats overview:', e);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Main API Loader with full server filtering & pagination
  const loadMosques = useCallback(async (overrides?: Partial<MosqueFilterOptions>) => {
    setLoading(true);
    setError(null);
    try {
      const pageToLoad = overrides?.page !== undefined ? overrides.page : currentPage;
      const searchToLoad = overrides?.search !== undefined ? overrides.search : searchQuery;
      const statusToLoad = overrides?.status !== undefined ? overrides.status : statusFilter;
      const featuredToLoad = overrides?.is_featured !== undefined ? overrides.is_featured : (featuredFilter === 'featured' ? true : undefined);
      const cityToLoad = overrides?.city_id !== undefined ? overrides.city_id : (cityFilter !== 'all' ? cityFilter : undefined);

      const filterPayload: MosqueFilterOptions = {
        page: pageToLoad,
        limit: itemsPerPage,
        search: searchToLoad ? searchToLoad.trim() : undefined,
        status: (statusToLoad !== 'all' ? statusToLoad : undefined) as any,
        is_featured: featuredToLoad,
        city_id: cityToLoad,
        sort_by: sortBy as any,
        sort_order: sortOrder,
      };

      const result = await mosqueRepo.getMosques(filterPayload);
      setMosques(result.data || []);

      if (result.pagination) {
        setServerPagination({
          currentPage: result.pagination.currentPage,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems,
          itemsPerPage: result.pagination.itemsPerPage,
        });
      }

      // Record in Live Debug Inspector
      let logTitle = `GET /api/mosques?page=${pageToLoad}&per_page=${itemsPerPage}`;
      if (statusToLoad !== 'all') logTitle += `&status=${statusToLoad}`;
      if (featuredToLoad) logTitle += `&featured=true`;
      if (searchToLoad) logTitle += `&q=${encodeURIComponent(searchToLoad)}`;
      if (cityToLoad) logTitle += `&city_id=${cityToLoad}`;

      addDebugLog(logTitle, `https://mms-backend-rose.vercel.app/api/mosques`, 200, result);
    } catch (err: any) {
      console.error('Error loading mosques:', err);
      setError(err.message || 'تعذر تحميل قائمة المساجد من السيرفر');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, featuredFilter, cityFilter, sortBy, sortOrder, itemsPerPage, addDebugLog]);

  // Trigger load when filters or pagination change
  useEffect(() => {
    loadMosques();
  }, [loadMosques]);

  // Debounced search handler
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      loadMosques({ page: 1, search: query });
    }, 350);
  }, [loadMosques]);

  // Change Status Filter
  const handleStatusFilterChange = useCallback((newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  }, []);

  // Change Featured Filter
  const handleFeaturedFilterChange = useCallback((newFeatured: string) => {
    setFeaturedFilter(newFeatured);
    setCurrentPage(1);
  }, []);

  // Change City Filter
  const handleCityFilterChange = useCallback((cityId: string | number) => {
    setCityFilter(cityId);
    setCurrentPage(1);
  }, []);

  // Change Page
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle Toggle Featured Status
  const handleToggleFeatured = useCallback(async (id: string | number) => {
    setActionLoadingId(id);
    try {
      const isFeatured = await mosqueRepo.toggleMosqueFeatured(id);
      addDebugLog(`POST /api/mosques/${id}/featured`, `https://mms-backend-rose.vercel.app/api/mosques/${id}/featured`, 200, { is_featured: isFeatured });
      showToast(isFeatured ? 'تم تمييز المسجد في القائمة الرئيسية' : 'تم إلغاء تمييز المسجد', 'success');
      await Promise.all([loadMosques(), loadStats()]);
    } catch (err: any) {
      console.error('Error toggling featured status:', err);
      showToast(err.message || 'فشل تغيير حالة التمييز', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }, [loadMosques, loadStats, showToast, addDebugLog]);

  // Handle Update Status (active | maintenance | inactive | closed)
  const handleUpdateStatus = useCallback(async (id: string | number, newStatus: 'active' | 'inactive' | 'maintenance' | 'closed') => {
    setActionLoadingId(id);
    try {
      await mosqueRepo.updateMosqueStatus(id, newStatus);
      addDebugLog(`PATCH /api/mosques/${id}/status`, `https://mms-backend-rose.vercel.app/api/mosques/${id}/status`, 200, { status: newStatus });
      showToast('تم تحديث حالة المسجد بنجاح', 'success');
      await Promise.all([loadMosques(), loadStats()]);
    } catch (err: any) {
      console.error('Error updating mosque status:', err);
      showToast(err.message || 'فشل تحديث حالة المسجد', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }, [loadMosques, loadStats, showToast, addDebugLog]);

  // Handle Create Mosque
  const handleCreateMosque = useCallback(async (payload: CreateMosquePayload) => {
    try {
      const created = await mosqueRepo.createMosque(payload);
      addDebugLog('POST /api/mosques ✅', 'https://mms-backend-rose.vercel.app/api/mosques', 200, created);
      showToast('تم إشهار وإضافة المسجد بنجاح!', 'success');
      await Promise.all([loadMosques(), loadStats()]);
      return created;
    } catch (err: any) {
      console.error('Error creating mosque:', err);
      const serverResp = err.serverResponse || { message: err.message };
      addDebugLog('POST /api/mosques ❌', 'https://mms-backend-rose.vercel.app/api/mosques', 422, serverResp);
      showToast(err.message || 'فشل إضافة المسجد', 'error');
      throw err;
    }
  }, [loadMosques, loadStats, showToast, addDebugLog]);

  // Handle Update Mosque
  const handleUpdateMosque = useCallback(async (id: string | number, payload: UpdateMosquePayload) => {
    try {
      const updated = await mosqueRepo.updateMosque(id, payload);
      addDebugLog(`PUT /api/mosques/${id}`, `https://mms-backend-rose.vercel.app/api/mosques/${id}`, 200, updated);
      showToast('تم تعديل بيانات المسجد بنجاح', 'success');
      await Promise.all([loadMosques(), loadStats()]);
      return updated;
    } catch (err: any) {
      console.error('Error updating mosque:', err);
      const serverResp = err.serverResponse || { message: err.message, errors: err.validationErrors };
      addDebugLog(`PUT /api/mosques/${id} ❌`, `https://mms-backend-rose.vercel.app/api/mosques/${id}`, 422, serverResp);
      showToast(err.message || 'فشل تعديل بيانات المسجد', 'error');
      throw err;
    }
  }, [loadMosques, loadStats, showToast, addDebugLog]);

  // Handle Delete Mosque
  const handleDeleteMosque = useCallback(async (id: string | number) => {
    setActionLoadingId(id);
    try {
      await mosqueRepo.deleteMosque(id);
      addDebugLog(`DELETE /api/mosques/${id}`, `https://mms-backend-rose.vercel.app/api/mosques/${id}`, 200, { status: true, message: `تم حذف المسجد #${id} بنجاح من قاعدة البيانات`, deleted_id: id });
      showToast('تم حذف المسجد من السيرفر بنجاح', 'success');
      await Promise.all([loadMosques(), loadStats()]);
    } catch (err: any) {
      console.error('Error deleting mosque:', err);
      addDebugLog(`DELETE /api/mosques/${id} [FAILED]`, `https://mms-backend-rose.vercel.app/api/mosques/${id}`, 400, { error: err.message });
      showToast(err.message || 'فشل حذف المسجد من السيرفر', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }, [loadMosques, loadStats, showToast, addDebugLog]);

  return {
    mosques,
    paginatedMosques: mosques, // Directly loaded from server page by page
    filteredMosques: mosques,
    currentPage,
    setCurrentPage: handlePageChange,
    totalPages: serverPagination.totalPages,
    totalItems: serverPagination.totalItems,
    itemsPerPage,
    stats,
    loading,
    error,
    isSuperAdmin,
    actionLoadingId,
    searchQuery,
    setSearchQuery: handleSearch,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    featuredFilter,
    setFeaturedFilter: handleFeaturedFilterChange,
    cityFilter,
    setCityFilter: handleCityFilterChange,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
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
