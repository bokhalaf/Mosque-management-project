// ==============================
// Presentation — Hook
// useSermonDetails: جلب تفاصيل خطبة + TTS + نسخ المحتوى
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { SermonRepositoryImpl } from '../../data/repositories/SermonRepositoryImpl';
import { Sermon } from '../../domain/entities/Sermon';
import { ArabicTTSPlayer } from '../utils/arabicTTS';

const sermonRepo = new SermonRepositoryImpl();
const ttsPlayer = ArabicTTSPlayer.getInstance();

export function useSermonDetails(sermonId: string | number) {
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // TTS states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sermonRepo.getSermonById(sermonId);
      setSermon(data);
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

    console.log('[TTS] سيتم قراءة النص (أول 100 حرف):', textToRead.substring(0, 100));

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
    error,
    copied,
    isSpeaking,
    isSpeechPaused,
    fetchDetails,
    toggleSermonSpeech,
    stopSpeech,
    copyContent,
  };
}
