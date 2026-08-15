// ==============================
// Presentation — Hook
// useSermons: يتولى جلب بيانات الخطب، البحث والتصفية بالتصنيف وكلمات البحث، والاعتمادات
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { SermonRepositoryImpl, BASE_URL } from '../../data/repositories/SermonRepositoryImpl';
import { Sermon, SermonSelection, SermonPagination } from '../../domain/entities/Sermon';
import { GetSermonsUseCase } from '../../domain/usecases/sermons/GetSermonsUseCase';
import { SelectFridaySermonUseCase } from '../../domain/usecases/sermons/SelectFridaySermonUseCase';
import { DeleteSermonUseCase } from '../../domain/usecases/sermons/DeleteSermonUseCase';
import { useToast } from '../../app/components/ui/Toast';

const sermonRepo = new SermonRepositoryImpl();
const getSermonsUseCase = new GetSermonsUseCase(sermonRepo);
const selectFridayUseCase = new SelectFridaySermonUseCase(sermonRepo);
const deleteSermonUseCase = new DeleteSermonUseCase(sermonRepo);

export interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

const DEFAULT_ARCHIVED_PAGINATION: SermonPagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 6,
};

const DEFAULT_PENDING_PAGINATION: SermonPagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 3,
};

export function useSermons() {
  const { showToast } = useToast();
  const [archivedSermons, setArchivedSermons] = useState<Sermon[]>([]);
  const [pendingSermons, setPendingSermons] = useState<Sermon[]>([]);
  const [upcomingSelection, setUpcomingSelection] = useState<SermonSelection | null>(null);
  const [selectionsHistory, setSelectionsHistory] = useState<SermonSelection[]>([]);

  // Pagination states (Archived = 6 per page, Pending = 3 per page)
  const [archivedPage, setArchivedPage] = useState<number>(1);
  const [archivedPagination, setArchivedPagination] = useState<SermonPagination>(DEFAULT_ARCHIVED_PAGINATION);

  const [pendingPage, setPendingPage] = useState<number>(1);
  const [pendingPagination, setPendingPagination] = useState<SermonPagination>(DEFAULT_PENDING_PAGINATION);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingSermonId, setDeletingSermonId] = useState<string | number | null>(null);

  // Debug inspector state
  const [showDebugTerminal, setShowDebugTerminal] = useState(true);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const addDebugLog = useCallback((action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev.slice(0, 15),
    ]);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSermonsUseCase.execute(1, 1, 6, 3);

      addDebugLog(
        'GET /api/sermon-selections/my',
        `${BASE_URL}/sermon-selections/my`,
        200,
        data.selectionsHistory
      );
      addDebugLog(
        'GET /api/sermon-selections/upcoming',
        `${BASE_URL}/sermon-selections/upcoming`,
        200,
        data.upcomingSelection
      );
      addDebugLog(
        'GET /api/sermons/archived?page=1&per_page=6',
        `${BASE_URL}/sermons/archived?page=1&per_page=6`,
        200,
        data.archivedRes
      );
      addDebugLog(
        'GET /api/sermons/pending?page=1&per_page=3',
        `${BASE_URL}/sermons/pending?page=1&per_page=3`,
        200,
        data.pendingRes
      );

      setArchivedSermons(data.archivedRes.data);
      setArchivedPagination(data.archivedRes.pagination);

      setPendingSermons(data.pendingRes.data);
      setPendingPagination(data.pendingRes.pagination);

      setSelectionsHistory(data.selectionsHistory);
      setUpcomingSelection(data.upcomingSelection);
    } catch (err: any) {
      console.error('Error fetching sermons list:', err);
      setError(err.message || 'تعذر تحميل بيانات خطب المسجد من السيرفر');
    } finally {
      setLoading(false);
    }
  }, [addDebugLog]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle archived page change directly
  const handleArchivedPageChange = useCallback(async (p: number) => {
    setArchivedPage(p);
    setLoading(true);
    try {
      const hasQuery = searchQuery.trim().length > 0;
      const hasCategory = selectedCategory !== 'all';

      let res: any;
      if (hasQuery || hasCategory) {
        res = await sermonRepo.searchSermons(
          hasQuery ? searchQuery : undefined,
          p,
          6,
          hasCategory ? selectedCategory : undefined
        );
        addDebugLog(
          `GET /api/sermons/search?page=${p}&per_page=6&cat=${selectedCategory}`,
          `${BASE_URL}/sermons/search?page=${p}&per_page=6&category=${encodeURIComponent(selectedCategory)}`,
          200,
          res
        );
      } else {
        res = await sermonRepo.getArchivedSermons(p, 6);
        addDebugLog(
          `GET /api/sermons/archived?page=${p}&per_page=6`,
          `${BASE_URL}/sermons/archived?page=${p}&per_page=6`,
          200,
          res
        );
      }

      setArchivedSermons(res.data);
      setArchivedPagination(res.pagination);
    } catch (e) {
      console.warn('Failed loading archived page:', e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, addDebugLog]);

  // Handle pending page change directly (3 per page)
  const handlePendingPageChange = useCallback(async (p: number) => {
    setPendingPage(p);
    try {
      const res = await sermonRepo.getPendingSermons(p, 3);
      addDebugLog(
        `GET /api/sermons/pending?page=${p}&per_page=3`,
        `${BASE_URL}/sermons/pending?page=${p}&per_page=3`,
        200,
        res
      );
      setPendingSermons(res.data);
      setPendingPagination(res.pagination);
    } catch (e) {
      console.warn('Failed loading pending page:', e);
    }
  }, [addDebugLog]);

  // Handle Delete/Cancel Pending Sermon (DELETE /api/sermons/{id})
  const handleDeletePendingSermon = useCallback(async (id: string | number) => {
    setDeletingSermonId(id);
    try {
      await deleteSermonUseCase.execute(id);
      addDebugLog(
        `DELETE /api/sermons/${id}`,
        `${BASE_URL}/sermons/${id}`,
        200,
        { status: 'deleted', id }
      );
      showToast('تم إلغاء وحذف الخطبة بنجاح', 'success');

      // Refresh pending page list
      try {
        const res = await sermonRepo.getPendingSermons(pendingPage, 3);
        if (res.data.length === 0 && pendingPage > 1) {
          const prevPage = pendingPage - 1;
          const prevRes = await sermonRepo.getPendingSermons(prevPage, 3);
          setPendingPage(prevPage);
          setPendingSermons(prevRes.data);
          setPendingPagination(prevRes.pagination);
        } else {
          setPendingSermons(res.data);
          setPendingPagination(res.pagination);
        }
      } catch (err) {
        setPendingSermons(prev => prev.filter(s => String(s.id) !== String(id)));
        setPendingPagination(prev => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
      }
    } catch (e: any) {
      console.error('Error deleting sermon:', e);
      showToast(e.message || 'حدث خطأ أثناء محاولة إلغاء الخطبة', 'error');
    } finally {
      setDeletingSermonId(null);
    }
  }, [pendingPage, addDebugLog, showToast]);

  // Search & Category Filter with API integration & debounce
  useEffect(() => {
    const hasQuery = searchQuery.trim().length > 0;
    const hasCategory = selectedCategory !== 'all';

    if (!hasQuery && !hasCategory) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setArchivedPage(1);
        const results = await sermonRepo.searchSermons(
          hasQuery ? searchQuery : undefined,
          1,
          6,
          hasCategory ? selectedCategory : undefined
        );
        const queryParams = new URLSearchParams();
        queryParams.append('page', '1');
        queryParams.append('per_page', '6');
        if (hasQuery) queryParams.append('keyword', searchQuery.trim());
        if (hasCategory) queryParams.append('category', selectedCategory);

        addDebugLog(
          `GET /api/sermons/search?${queryParams.toString()}`,
          `${BASE_URL}/sermons/search?${queryParams.toString()}`,
          200,
          results
        );
        setArchivedSermons(results.data);
        setArchivedPagination(results.pagination);
      } catch (e) {
        console.warn('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, addDebugLog]);

  const handleSetCategory = useCallback((cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'all' && !searchQuery.trim()) {
      handleArchivedPageChange(1);
    }
  }, [searchQuery, handleArchivedPageChange]);

  const [selectingSermonId, setSelectingSermonId] = useState<string | number | null>(null);

  const handleSelectForFriday = useCallback(async (sermon: Sermon) => {
    setSelectingSermonId(sermon.id);
    try {
      const newSelection = await selectFridayUseCase.select(sermon);
      addDebugLog(
        'POST /api/sermon-selections',
        `${BASE_URL}/sermon-selections`,
        201,
        newSelection
      );
      setUpcomingSelection(newSelection);
      showToast('تم اعتماد خطبة الجمعة القادمة بنجاح', 'success');
    } catch (e: any) {
      console.error('Error setting Friday sermon:', e);
      showToast(e.message || 'تعذر اختيار خطبة الجمعة', 'error');
    } finally {
      setSelectingSermonId(null);
    }
  }, [addDebugLog, showToast]);

  const handleCancelFridaySelection = useCallback(async (selectionId: string | number) => {
    try {
      await selectFridayUseCase.cancel(selectionId);
      addDebugLog(
        `DELETE /api/sermon-selections/${selectionId}`,
        `${BASE_URL}/sermon-selections/${selectionId}`,
        200,
        { status: 'deleted' }
      );
      setUpcomingSelection(null);
      showToast('تم إلغاء اعتماد خطبة الجمعة بنجاح', 'success');
      loadData();
    } catch (e: any) {
      console.error('Error canceling selection:', e);
      showToast(e.message || 'حدث خطأ أثناء إلغاء الاعتماد', 'error');
    }
  }, [addDebugLog, loadData, showToast]);

  const filteredSermons = archivedSermons.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    const speaker = s.speaker_name || s.preacher || '';
    if (searchQuery && !s.title.includes(searchQuery) && !speaker.includes(searchQuery)) return false;
    return true;
  });

  const clearDebugLogs = useCallback(() => setDebugLogs([]), []);

  return {
    // Data
    archivedSermons,
    pendingSermons,
    upcomingSelection,
    selectionsHistory,
    filteredSermons,
    // Pagination
    archivedPage,
    setArchivedPage: handleArchivedPageChange,
    archivedPagination,
    pendingPage,
    setPendingPage: handlePendingPageChange,
    pendingPagination,
    // Filters
    selectedCategory,
    setSelectedCategory: handleSetCategory,
    searchQuery,
    setSearchQuery,
    // Loading & Actions
    loading,
    selectingSermonId,
    deletingSermonId,
    error,
    loadData,
    handleSelectForFriday,
    handleCancelFridaySelection,
    handleDeletePendingSermon,
    // Debug
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  };
}
