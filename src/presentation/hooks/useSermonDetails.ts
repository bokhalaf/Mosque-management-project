// ==============================
// Presentation — Hook
// useSermonDetails: جلب تفاصيل خطبة + اعتماد / إلغاء اعتماد الجمعة + مراقب السيرفر المباشر
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { SermonRepositoryImpl, BASE_URL } from '../../data/repositories/SermonRepositoryImpl';
import { Sermon, SermonSelection } from '../../domain/entities/Sermon';
import { GetSermonByIdUseCase } from '../../domain/usecases/sermons/GetSermonByIdUseCase';
import { GetUpcomingSermonSelectionUseCase } from '../../domain/usecases/sermons/GetUpcomingSermonSelectionUseCase';
import { StoreSermonSelectionUseCase } from '../../domain/usecases/sermons/StoreSermonSelectionUseCase';
import { DeleteSermonSelectionUseCase } from '../../domain/usecases/sermons/DeleteSermonSelectionUseCase';
import { useToast } from '../../app/components/ui/Toast';

const sermonRepo = new SermonRepositoryImpl();
const getSermonByIdUseCase = new GetSermonByIdUseCase(sermonRepo);
const getUpcomingUseCase = new GetUpcomingSermonSelectionUseCase(sermonRepo);
const storeSelectionUseCase = new StoreSermonSelectionUseCase(sermonRepo);
const deleteSelectionUseCase = new DeleteSermonSelectionUseCase(sermonRepo);

export interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function useSermonDetails(sermonId: string | number) {
  const { showToast } = useToast();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [upcomingSelection, setUpcomingSelection] = useState<SermonSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Debug inspector state
  const [showDebugTerminal, setShowDebugTerminal] = useState(true);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const addDebugLog = useCallback((action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev.slice(0, 15),
    ]);
  }, []);

  const clearDebugLogs = useCallback(() => setDebugLogs([]), []);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSermonByIdUseCase.execute(sermonId);
      addDebugLog(
        `GET /api/sermons/${sermonId}`,
        `${BASE_URL}/sermons/${sermonId}`,
        200,
        data
      );
      setSermon(data);

      const upcoming = await getUpcomingUseCase.execute();
      addDebugLog(
        'GET /api/sermon-selections/upcoming',
        `${BASE_URL}/sermon-selections/upcoming`,
        200,
        upcoming
      );
      setUpcomingSelection(upcoming);
    } catch (err: any) {
      console.error('Error fetching sermon details:', err);
      setError(err.message || 'تعذر تحميل تفاصيل الخطبة');
    } finally {
      setLoading(false);
    }
  }, [sermonId, addDebugLog]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const isScheduledForFriday = Boolean(
    (upcomingSelection && (String(upcomingSelection.sermon_id) === String(sermonId) || String(upcomingSelection.sermon?.id) === String(sermonId))) ||
    sermon?.status === 'Scheduled' ||
    sermon?.status === 'scheduled_for_friday'
  );

  const handleSelectForFriday = useCallback(async () => {
    if (!sermon) return;
    setActionLoading(true);
    try {
      const selection = await storeSelectionUseCase.execute({
        sermon_id: sermon.id,
        selection_date: new Date().toISOString().split('T')[0],
      });
      addDebugLog(
        'POST /api/sermon-selections',
        `${BASE_URL}/sermon-selections`,
        201,
        selection
      );
      setUpcomingSelection(selection);
      setSermon(prev => prev ? { ...prev, status: 'Scheduled' } : null);
      showToast('تم اعتماد خطبة الجمعة القادمة بنجاح', 'success');
    } catch (err: any) {
      console.error('Error selecting sermon for Friday:', err);
      showToast(err.message || 'فشل اعتماد الخطبة للجمعة', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [sermon, addDebugLog, showToast]);

  const handleCancelFridaySelection = useCallback(async () => {
    setActionLoading(true);
    try {
      const targetId = upcomingSelection?.id || sermonId;
      await deleteSelectionUseCase.execute(targetId);
      addDebugLog(
        `DELETE /api/sermon-selections/${targetId}`,
        `${BASE_URL}/sermon-selections/${targetId}`,
        200,
        { status: 'deleted', id: targetId }
      );
      setUpcomingSelection(null);
      setSermon(prev => prev ? { ...prev, status: 'archived' } : null);
      showToast('تم إلغاء اعتماد خطبة الجمعة بنجاح', 'success');
    } catch (err: any) {
      console.error('Error canceling Friday selection:', err);
      showToast(err.message || 'حدث خطأ أثناء إلغاء الاعتماد', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [upcomingSelection, sermonId, addDebugLog, showToast]);

  const handleApproveSermon = useCallback(async () => {
    if (!sermon) return;
    setActionLoading(true);
    try {
      const serverRes = await sermonRepo.approveSermon(sermon.id);
      addDebugLog(
        `PUT /api/sermons/${sermon.id}/approve`,
        `${BASE_URL}/sermons/${sermon.id}/approve`,
        200,
        serverRes
      );
      setSermon(prev => prev ? { ...prev, status: 'approved' } : null);
      showToast('تم قبول واعتماد الخطبة من السيرفر بنجاح!', 'success');
      await fetchDetails();
    } catch (err: any) {
      console.error('Error approving sermon:', err);
      addDebugLog(
        `PUT /api/sermons/${sermon.id}/approve`,
        `${BASE_URL}/sermons/${sermon.id}/approve`,
        'ERROR',
        { error: err.message }
      );
      showToast(err.message || 'فشل قبول الخطبة من السيرفر', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [sermon, addDebugLog, fetchDetails, showToast]);

  const handleRejectSermon = useCallback(async (reason?: string) => {
    if (!sermon) return;
    setActionLoading(true);
    const rejectionReason = reason || 'يرجى مراجعة الخطبة وتعديلها';
    try {
      const serverRes = await sermonRepo.rejectSermon(sermon.id, rejectionReason);
      addDebugLog(
        `PUT /api/sermons/${sermon.id}/reject`,
        `${BASE_URL}/sermons/${sermon.id}/reject`,
        200,
        serverRes
      );
      setSermon(prev => prev ? { ...prev, status: 'rejected', notes: rejectionReason } : null);
      showToast('تم تسجيل رفض الخطبة في السيرفر بنجاح', 'success');
      await fetchDetails();
    } catch (err: any) {
      console.error('Error rejecting sermon:', err);
      addDebugLog(
        `PUT /api/sermons/${sermon.id}/reject`,
        `${BASE_URL}/sermons/${sermon.id}/reject`,
        'ERROR',
        { error: err.message }
      );
      showToast(err.message || 'فشل رفض الخطبة من السيرفر', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [sermon, addDebugLog, fetchDetails, showToast]);


  const copyContent = useCallback(() => {
    if (sermon?.content) {
      navigator.clipboard.writeText(sermon.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [sermon]);

  return {
    sermon,
    loading,
    actionLoading,
    error,
    copied,
    isScheduledForFriday,
    fetchDetails,
    copyContent,
    handleSelectForFriday,
    handleCancelFridaySelection,
    handleApproveSermon,
    handleRejectSermon,
    // Debug Inspector
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  };
}

