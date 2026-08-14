// ==============================
// Presentation — Hook
// useMaintenance: يتولى جلب الإحصائيات وطلبات الصيانة باستخدام حالات الاستخدام (Use Cases) والـ Debug
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { MaintenanceRepositoryImpl, MaintenanceOperationDebugResponse } from '../../data/repositories/MaintenanceRepositoryImpl';
import { MaintenanceRequestItem, MaintenanceStats } from '../../domain/entities/Maintenance';
import { GetMaintenanceStatsUseCase } from '../../domain/usecases/maintenance/GetMaintenanceStatsUseCase';
import { GetMaintenanceRequestsUseCase } from '../../domain/usecases/maintenance/GetMaintenanceRequestsUseCase';
import { SearchMaintenanceRequestsUseCase } from '../../domain/usecases/maintenance/SearchMaintenanceRequestsUseCase';
import { UpdateMaintenanceRequestUseCase } from '../../domain/usecases/maintenance/UpdateMaintenanceRequestUseCase';
import { DeleteMaintenanceRequestUseCase } from '../../domain/usecases/maintenance/DeleteMaintenanceRequestUseCase';
import { useToast } from '../../app/components/ui/Toast';

const maintenanceRepo = new MaintenanceRepositoryImpl();
const getStatsUseCase = new GetMaintenanceStatsUseCase(maintenanceRepo);
const getRequestsUseCase = new GetMaintenanceRequestsUseCase(maintenanceRepo);
const searchRequestsUseCase = new SearchMaintenanceRequestsUseCase(maintenanceRepo);
const updateRequestUseCase = new UpdateMaintenanceRequestUseCase(maintenanceRepo);
const deleteRequestUseCase = new DeleteMaintenanceRequestUseCase(maintenanceRepo);

export interface MaintenanceFilters {
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  categoryFilter: string;
}

export function useMaintenance() {
  const { showToast } = useToast();

  const [filters, setFilters] = useState<MaintenanceFilters>({
    searchQuery: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    categoryFilter: 'all',
  });

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more?: boolean;
  }>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    has_more: false,
  });

  const [stats, setStats] = useState<MaintenanceStats>({
    open_requests: 0,
    in_progress: 0,
    completed_this_month: 0,
    critical: 0,
  });

  const [requests, setRequests] = useState<MaintenanceRequestItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit / Delete State
  const [editingItem, setEditingItem] = useState<MaintenanceRequestItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Debug Inspector State
  const [operationDebug, setOperationDebug] = useState<MaintenanceOperationDebugResponse | null>(null);
  const [showDebugBox, setShowDebugBox] = useState(false);
  const [copiedDebug, setCopiedDebug] = useState(false);

  // 1. Load Stats via GetMaintenanceStatsUseCase
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await getStatsUseCase.execute();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading maintenance stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Load Requests via GetMaintenanceRequestsUseCase (حالة الاستخدام الرسمية)
  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    setError(null);
    try {
      const params = {
        q: filters.searchQuery,
        status: filters.statusFilter,
        priority: filters.priorityFilter,
        category: filters.categoryFilter,
        page,
        per_page: 15,
      };

      // استخدام حالة الاستخدام الرسمية حسب وجود بحث (Search vs Index)
      const isSearchMode = Boolean(filters.searchQuery && filters.searchQuery.trim().length > 0);
      const paginatedResult = isSearchMode
        ? await searchRequestsUseCase.execute(params)
        : await getRequestsUseCase.execute(params);

      setRequests(paginatedResult.data || []);
      if (paginatedResult.pagination) {
        setPagination(paginatedResult.pagination);
      }

      // جلب بيانات المعاينة والـ Debug من الـ Repository للعرض
      const resDebug = await maintenanceRepo.getMaintenanceRequestsWithDebug(params);
      setOperationDebug(resDebug.debug);

      const items = paginatedResult.data || [];
      console.log('================================================');
      console.log(`🛠️ [حالة الاستخدام: ${isSearchMode ? 'SearchMaintenanceRequestsUseCase' : 'GetMaintenanceRequestsUseCase'}] تم جلب نتائج ${isSearchMode ? 'البحث عن' : 'قائمة'} طلبات الصيانة بنجاح من السيرفر`);
      console.log(`📊 العدد الإجمالي: ${items.length} طلب (صفحة ${page} من ${paginatedResult.pagination?.last_page || 1})`);
      console.log('📋 قائمة الطلبات:', items.map(req => ({
        ID: req.id,
        رقم_الطلب: req.maintenance_number || `MR-${req.id}`,
        العنوان: req.title,
        التصنيف: req.category,
        الأولوية: req.priority,
        الحالة: req.status,
        المسجد: req.mosque?.name || 'غير محدد',
      })));
      console.log('================================================');
    } catch (err: any) {
      console.error('Error loading maintenance requests:', err);
      setError(err.message || 'حدث خطأ أثناء جلب طلبات الصيانة');
    } finally {
      setLoadingRequests(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRequests();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadRequests]);

  const refresh = useCallback(() => {
    loadStats();
    loadRequests();
  }, [loadStats, loadRequests]);

  const resetFilters = useCallback(() => {
    setFilters({ searchQuery: '', statusFilter: 'all', priorityFilter: 'all', categoryFilter: 'all' });
    setPage(1);
  }, []);

  const setSearchQuery = (v: string) => { setFilters(f => ({ ...f, searchQuery: v })); setPage(1); };
  const setStatusFilter = (v: string) => { setFilters(f => ({ ...f, statusFilter: v })); setPage(1); };
  const setPriorityFilter = (v: string) => { setFilters(f => ({ ...f, priorityFilter: v })); setPage(1); };
  const setCategoryFilter = (v: string) => { setFilters(f => ({ ...f, categoryFilter: v })); setPage(1); };

  // 3. Delete Request via DeleteMaintenanceRequestUseCase
  const handleDeleteRequest = useCallback(async (id: string | number) => {
    setIsSubmittingAction(true);
    try {
      // استخدام حالة الاستخدام الرسمية DeleteMaintenanceRequestUseCase
      await deleteRequestUseCase.execute(id);

      const resDebug = await maintenanceRepo.deleteMaintenanceRequestWithDebug(id);
      setOperationDebug(resDebug.debug);
      setShowDebugBox(true);

      console.log(`🗑️ [حالة الاستخدام: DeleteMaintenanceRequestUseCase] تم حذف الطلب بنجاح عبر UseCase: ${id}`);
      setRequests(prev => prev.filter(r => String(r.id) !== String(id)));
      setDeletingId(null);
      showToast('تم حذف طلب الصيانة بنجاح 🗑️', 'success');
      refresh();
    } catch (err: any) {
      console.error('Error deleting maintenance request:', err);
      showToast(err.message || 'حدث خطأ أثناء حذف طلب الصيانة', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  }, [refresh, showToast]);

  // 4. Update Request via UpdateMaintenanceRequestUseCase
  const handleEditRequest = useCallback(async (id: string | number, payload: any) => {
    setIsSubmittingAction(true);
    try {
      // استخدام حالة الاستخدام الرسمية UpdateMaintenanceRequestUseCase
      const updatedItem = await updateRequestUseCase.execute(id, payload);

      const resDebug = await maintenanceRepo.updateMaintenanceRequestWithDebug(id, payload);
      setOperationDebug(resDebug.debug);
      setShowDebugBox(true);

      console.log(`✏️ [حالة الاستخدام: UpdateMaintenanceRequestUseCase] تم تحديث الطلب بنجاح عبر UseCase: ${id}`, updatedItem);
      setRequests(prev => prev.map(r => (String(r.id) === String(id) ? { ...r, ...updatedItem } : r)));
      setEditingItem(null);
      showToast('تم تعديل بيانات طلب الصيانة بنجاح ✏️', 'success');
      refresh();
    } catch (err: any) {
      console.error('Error updating maintenance request:', err);
      showToast(err.message || 'حدث خطأ أثناء تحديث طلب الصيانة', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  }, [refresh, showToast]);

  const copyDebugJson = useCallback(() => {
    if (operationDebug) {
      navigator.clipboard.writeText(JSON.stringify(operationDebug.rawResponse, null, 2));
      setCopiedDebug(true);
      setTimeout(() => setCopiedDebug(false), 2000);
    }
  }, [operationDebug]);

  const hasActiveFilters =
    filters.statusFilter !== 'all' ||
    filters.priorityFilter !== 'all' ||
    filters.categoryFilter !== 'all' ||
    filters.searchQuery.trim() !== '';

  return {
    // Data
    stats,
    requests,
    pagination,
    page,
    setPage,
    // Loading states
    loadingStats,
    loadingRequests,
    error,
    // Filter state
    filters,
    hasActiveFilters,
    // Filter setters
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setCategoryFilter,
    resetFilters,
    // Edit / Delete state & actions
    editingItem,
    setEditingItem,
    deletingId,
    setDeletingId,
    isSubmittingAction,
    handleDeleteRequest,
    handleEditRequest,
    // Debug Inspector State
    operationDebug,
    showDebugBox,
    setShowDebugBox,
    copiedDebug,
    copyDebugJson,
    // Actions
    refresh,
  };
}
