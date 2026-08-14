// ==============================
// Presentation — Hook
// useCreateKhutbah: إدارة نموذج إضافة خطبة + OCR + إملاء صوتي + TTS + إرسال
// ==============================

import { useState, useRef, useEffect, useCallback } from 'react';
import { SermonRepositoryImpl, SermonCreateApiResponse } from '../../data/repositories/SermonRepositoryImpl';
import { createWorker } from 'tesseract.js';
import { ArabicTTSPlayer } from '../utils/arabicTTS';

const sermonRepo = new SermonRepositoryImpl();
const ttsPlayer = ArabicTTSPlayer.getInstance();

export interface CreateKhutbahDebugResponse {
  httpStatus: number;
  endpointUrl: string;
  requestPayloadSent: any;
  rawResponse: any;
  isSuccess: boolean;
}

export function useCreateKhutbah(onSuccess: () => void) {
  // Form fields
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [category, setCategory] = useState('ethics');
  const [content, setContent] = useState('');
  const [publishForFriday, setPublishForFriday] = useState(true);

  // Speech-to-Text dictation
  const [isDictating, setIsDictating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Text-to-Speech voice reader
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  // Image OCR
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug response
  const [debugResponse, setDebugResponse] = useState<CreateKhutbahDebugResponse | null>(null);
  const [copiedDebug, setCopiedDebug] = useState(false);

  const recognitionRef = useRef<any>(null);
  const baseContentRef = useRef<string>('');

  useEffect(() => {
    return () => {
      ttsPlayer.stop();
    };
  }, []);

  // ── 1. Speech-to-Text Dictation ──────────────────────────────────────
  const startDictation = useCallback(() => {
    baseContentRef.current = content;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsDictating(true);
      setIsPaused(false);
      const simulatedPhrases = [
        'الحمد لله رب العالمين والصلاة والسلام على أشرف الأنبياء والمرسلين.',
        'إن الصدق من أعظم الأخلاق التي حث عليها الإسلام في القرآن الكريم والسنة النبوية.',
        'ويمتد أثره الصالح على الأفراد والمجتمعات في طمأنينة القلوب وثبات الخطى.',
      ];
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < simulatedPhrases.length) {
          setContent(prev => (prev ? prev + '\n' : '') + simulatedPhrases[idx]);
          idx++;
        } else {
          clearInterval(interval);
          setIsDictating(false);
          setIsPaused(false);
        }
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'ar-SA';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => { setIsDictating(true); setIsPaused(false); };

      recognition.onresult = (event: any) => {
        let accumulatedFinal = '';
        let currentInterim = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            accumulatedFinal += result[0].transcript + ' ';
          } else {
            currentInterim += result[0].transcript;
          }
        }
        const base = baseContentRef.current ? baseContentRef.current.trim() : '';
        const combined = `${base} ${accumulatedFinal}${currentInterim}`.replace(/\s+/g, ' ').trim();
        setContent(combined);
      };

      recognition.onerror = () => { setIsDictating(false); setIsPaused(false); };
      recognition.onend = () => { if (!isPaused) { setIsDictating(false); } };
      recognition.start();
    } catch (e) {
      setIsDictating(false);
      setIsPaused(false);
    }
  }, [content, isPaused]);

  const pauseDictation = useCallback(() => {
    if (recognitionRef.current && isDictating && !isPaused) {
      baseContentRef.current = content;
      recognitionRef.current.stop();
      setIsPaused(true);
    }
  }, [isDictating, isPaused, content]);

  const resumeDictation = useCallback(() => {
    if (isPaused) { startDictation(); }
  }, [isPaused, startDictation]);

  const stopDictation = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.stop(); }
    setIsDictating(false);
    setIsPaused(false);
  }, []);

  // ── 2. Text-to-Speech Voice Reader ──────────────────────────────────
  const toggleReadContentAloud = useCallback(() => {
    if (!content.trim()) {
      alert('يرجى كتابة نص أو محاور الخطبة في المربع أولاً لقراءته بصوت القارئ.');
      return;
    }
    if (isSpeaking) {
      if (isSpeechPaused) { ttsPlayer.resume(); } else { ttsPlayer.pause(); }
    } else {
      ttsPlayer.speak(content, (speaking, paused) => {
        setIsSpeaking(speaking);
        setIsSpeechPaused(paused ?? false);
      });
    }
  }, [content, isSpeaking, isSpeechPaused]);

  const stopTTS = useCallback(() => {
    ttsPlayer.stop();
    setIsSpeaking(false);
  }, []);

  // ── 3. Image OCR ───────────────────────────────────────────────────
  const handleImageOCR = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsScanningImage(true);
    setOcrProgress(15);
    setOcrStatusText('جاري معالجة بكسلات الصورة وزيادة التباين للحبر والخط...');
    setError(null);

    let worker: any = null;
    try {
      const imageBitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(imageBitmap, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const v = avg > 140 ? 255 : 0;
          data[i] = v; data[i + 1] = v; data[i + 2] = v;
        }
        ctx.putImageData(imgData, 0, 0);
      }
      setOcrStatusText('جاري تحميل قاموس اللغة العربية ومسح الكلمات...');
      setOcrProgress(40);

      worker = await createWorker('ara', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            const p = Math.round(m.progress * 100);
            setOcrProgress(40 + Math.round(p * 0.55));
            setOcrStatusText(`جاري قراءة واستخراج أسطر الخطبة (${p}%)...`);
          }
        }
      });

      const { data: { text } } = await worker.recognize(canvas);
      let extractedText = text.trim();
      if (!extractedText || extractedText.length < 2) {
        const retryResult = await worker.recognize(file);
        extractedText = retryResult.data.text.trim();
      }

      if (extractedText) {
        setContent(prev => (prev ? `${prev}\n\n${extractedText}` : extractedText));
      } else {
        setError('لم يتم استخراج نصوص واضحة من الصورة. يرجى التأكد من رفع صورة ذات إضاءة ووضوح جيدين.');
      }
    } catch (err: any) {
      setError('تعذر قراءة الصورة المرفقة. يرجى التأكد من اختيار صورة مقروءة.');
    } finally {
      if (worker) { await worker.terminate().catch(() => {}); }
      setIsScanningImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }, []);

  // ── 4. Submit ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!title.trim()) { setError('يرجى كتابة عنوان الخطبة.'); return; }
    if (!preacher.trim()) { setError('يرجى كتابة اسم الخطيب / الشيخ.'); return; }

    setSubmitting(true);
    setError(null);
    setDebugResponse(null);

    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const debugRes: SermonCreateApiResponse = await sermonRepo.createSermonWithDebug({
        title: title.trim(),
        speaker_name: preacher.trim(),
        sermon_date: todayStr,
        content: content.trim(),
        category,
        publishForFriday,
      });
      setDebugResponse({
        httpStatus: debugRes.httpStatus,
        endpointUrl: debugRes.endpointUrl,
        requestPayloadSent: { title: title.trim(), speaker_name: preacher.trim(), sermon_date: todayStr, category, contentLength: content.trim().length },
        rawResponse: debugRes.rawResponse,
        isSuccess: true,
      });
    } catch (err: any) {
      const dbg = err.debugInfo;
      setDebugResponse({
        httpStatus: dbg?.httpStatus || 500,
        endpointUrl: dbg?.endpointUrl || 'https://mms-backend-rose.vercel.app/api/sermons',
        requestPayloadSent: dbg?.requestPayloadSent || { title: title.trim(), speaker_name: preacher.trim(), sermon_date: todayStr, category },
        rawResponse: dbg?.rawResponse || { message: err.message || 'فشل تقديم الخطبة للسيرفر' },
        isSuccess: false,
      });
      setError(err.message || 'حدث خطأ أثناء حفظ الخطبة.');
    } finally {
      setSubmitting(false);
    }
  }, [title, preacher, content, category, publishForFriday]);

  const copyDebugJson = useCallback(() => {
    if (debugResponse) {
      navigator.clipboard.writeText(JSON.stringify(debugResponse.rawResponse, null, 2));
      setCopiedDebug(true);
      setTimeout(() => setCopiedDebug(false), 2000);
    }
  }, [debugResponse]);

  return {
    // Form fields
    title, setTitle,
    preacher, setPreacher,
    category, setCategory,
    content, setContent,
    publishForFriday, setPublishForFriday,
    // STT
    isDictating,
    isPaused,
    startDictation,
    pauseDictation,
    resumeDictation,
    stopDictation,
    // TTS
    isSpeaking,
    isSpeechPaused,
    toggleReadContentAloud,
    stopTTS,
    // OCR
    isScanningImage,
    ocrProgress,
    ocrStatusText,
    imageInputRef,
    handleImageOCR,
    // Submit
    submitting,
    error,
    setError,
    handleSubmit,
    // Debug
    debugResponse,
    setDebugResponse,
    copiedDebug,
    copyDebugJson,
  };
}
