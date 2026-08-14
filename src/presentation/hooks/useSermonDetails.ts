// ==============================
// Presentation — Hook
// useSermonDetails: جلب تفاصيل خطبة + اعتماد / إلغاء اعتماد الجمعة + TTS + نسخ المحتوى
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { SermonRepositoryImpl } from '../../data/repositories/SermonRepositoryImpl';
import { Sermon, SermonSelection } from '../../domain/entities/Sermon';
import { GetSermonByIdUseCase } from '../../domain/usecases/sermons/GetSermonByIdUseCase';
import { GetUpcomingSermonSelectionUseCase } from '../../domain/usecases/sermons/GetUpcomingSermonSelectionUseCase';
import { StoreSermonSelectionUseCase } from '../../domain/usecases/sermons/StoreSermonSelectionUseCase';
import { DeleteSermonSelectionUseCase } from '../../domain/usecases/sermons/DeleteSermonSelectionUseCase';
import { ArabicTTSPlayer } from '../utils/arabicTTS';

import { useToast } from '../../app/components/ui/Toast';

const sermonRepo = new SermonRepositoryImpl();
const getSermonByIdUseCase = new GetSermonByIdUseCase(sermonRepo);
const getUpcomingUseCase = new GetUpcomingSermonSelectionUseCase(sermonRepo);
const storeSelectionUseCase = new StoreSermonSelectionUseCase(sermonRepo);
const deleteSelectionUseCase = new DeleteSermonSelectionUseCase(sermonRepo);

const ttsPlayer = ArabicTTSPlayer.getInstance();

export function useSermonDetails(sermonId: string | number) {
  const { showToast } = useToast();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [upcomingSelection, setUpcomingSelection] = useState<SermonSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // TTS states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSermonByIdUseCase.execute(sermonId);
      setSermon(data);

      const upcoming = await getUpcomingUseCase.execute();
      setUpcomingSelection(upcoming);
    } catch (err: any) {
      console.error('Error fetching sermon details:', err);
      setError(err.message || 'تعذر تحميل تفاصيل الخطبة');
    } finally {
      setLoading(false);
    }
  }, [sermonId]);

  useEffect(() => {
    fetchDetails();
    return () => {
      ttsPlayer.stop();
    };
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
      setUpcomingSelection(selection);
      setSermon(prev => prev ? { ...prev, status: 'Scheduled' } : null);
      showToast('تم اعتماد خطبة الجمعة القادمة بنجاح', 'success');
    } catch (err: any) {
      console.error('Error selecting sermon for Friday:', err);
      showToast(err.message || 'فشل اعتماد الخطبة للجمعة', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [sermon, showToast]);

  const handleCancelFridaySelection = useCallback(async () => {
    setActionLoading(true);
    try {
      const targetId = upcomingSelection?.id || sermonId;
      await deleteSelectionUseCase.execute(targetId);
      setUpcomingSelection(null);
      setSermon(prev => prev ? { ...prev, status: 'archived' } : null);
      showToast('تم إلغاء اعتماد خطبة الجمعة بنجاح', 'success');
    } catch (err: any) {
      console.error('Error canceling Friday selection:', err);
      showToast(err.message || 'حدث خطأ أثناء إلغاء الاعتماد', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [upcomingSelection, sermonId, showToast]);

  const toggleSermonSpeech = useCallback(() => {
    const textToRead = (
      sermon?.content ||
      (sermon as any)?.description ||
      sermon?.notes ||
      sermon?.title ||
      ''
    ).trim();

    if (!textToRead) {
      alert('لا يوجد نص مكتوب لقراءته في هذه الخطبة.');
      return;
    }

    if (isSpeaking) {
      if (isSpeechPaused) {
        ttsPlayer.resume();
        setIsSpeechPaused(false);
      } else {
        ttsPlayer.pause();
        setIsSpeechPaused(true);
      }
    } else {
      ttsPlayer.speak(textToRead, (speaking, paused) => {
        setIsSpeaking(speaking);
        setIsSpeechPaused(paused ?? false);
      });
    }
  }, [sermon, isSpeaking, isSpeechPaused]);

  const stopSpeech = useCallback(() => {
    ttsPlayer.stop();
    setIsSpeaking(false);
    setIsSpeechPaused(false);
  }, []);

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
    isSpeaking,
    isSpeechPaused,
    isScheduledForFriday,
    fetchDetails,
    toggleSermonSpeech,
    stopSpeech,
    copyContent,
    handleSelectForFriday,
    handleCancelFridaySelection,
  };
}
