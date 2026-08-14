// ==============================
// Presentation — Hook
// useSermons: يتولى جلب بيانات الخطب والاعتمادات وعمليات الجمعة
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { SermonRepositoryImpl, BASE_URL } from '../../data/repositories/SermonRepositoryImpl';
import { Sermon, SermonSelection } from '../../domain/entities/Sermon';
import { GetSermonsUseCase } from '../../domain/usecases/sermons/GetSermonsUseCase';
import { SelectFridaySermonUseCase } from '../../domain/usecases/sermons/SelectFridaySermonUseCase';
import { useToast } from '../../app/components/ui/Toast';

const sermonRepo = new SermonRepositoryImpl();
const getSermonsUseCase = new GetSermonsUseCase(sermonRepo);
const selectFridayUseCase = new SelectFridaySermonUseCase(sermonRepo);

export interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function useSermons() {
  const { showToast } = useToast();
  const [archivedSermons, setArchivedSermons] = useState<Sermon[]>([]);
  const [pendingSermons, setPendingSermons] = useState<Sermon[]>([]);
  const [upcomingSelection, setUpcomingSelection] = useState<SermonSelection | null>(null);
  const [selectionsHistory, setSelectionsHistory] = useState<SermonSelection[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const data = await getSermonsUseCase.execute();

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
        'GET /api/sermons/archived',
        `${BASE_URL}/sermons/archived`,
        200,
        data.archived
      );
      addDebugLog(
        'GET /api/sermons/pending',
        `${BASE_URL}/sermons/pending`,
        200,
        data.pending
      );

      setArchivedSermons(data.archived);
      setPendingSermons(data.pending);
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
    return () => {
      // cleanup: stop TTS if playing
    };
  }, [loadData]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(async () => {
      try {
        const results = await sermonRepo.searchSermons(searchQuery);
        addDebugLog(
          `GET /api/sermons/search?q=${searchQuery}`,
          `${BASE_URL}/sermons/search?q=${encodeURIComponent(searchQuery)}`,
          200,
          results
        );
        setArchivedSermons(results);
      } catch (e) {
        console.warn('Search error:', e);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, addDebugLog]);

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
    // Filters
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    // Loading
    loading,
    selectingSermonId,
    error,
    // Actions
    loadData,
    handleSelectForFriday,
    handleCancelFridaySelection,
    // Debug
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  };
}
