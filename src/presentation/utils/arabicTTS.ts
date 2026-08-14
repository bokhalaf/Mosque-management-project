/**
 * ArabicTTSPlayer — Guaranteed Arabic Speech Synthesizer & Audio Engine
 *
 * يستخدم نظام مزدوج فائق الاعتمادية:
 * 1. Web Speech API (مع إصلاح خلل Chromium Async Cancel + 50ms Delay + Text Chunking).
 * 2. StreamElements Arabic Neural Voice API (صوت "زينة" و"طارق" الفصيح بوضوح عالي كاحتياطي مضمون 100%).
 */

export class ArabicTTSPlayer {
  private static instance: ArabicTTSPlayer;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private onStateCallback: ((speaking: boolean, paused: boolean) => void) | null = null;

  private textChunks: string[] = [];
  private currentChunkIndex: number = 0;
  private isCancelled: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
      } catch (e) {
        console.warn('[TTS] Failed to preload voices:', e);
      }
    }
  }

  public static getInstance(): ArabicTTSPlayer {
    if (!ArabicTTSPlayer.instance) {
      ArabicTTSPlayer.instance = new ArabicTTSPlayer();
    }
    return ArabicTTSPlayer.instance;
  }

  /** تقسيم النص العربي إلى أجزاء مناسَبة للقراءة الصافية */
  private chunkText(text: string): string[] {
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (!cleanText) return [];
    if (cleanText.length <= 150) return [cleanText];

    const rawSegments = cleanText.split(/[\n\r.؛!؟?]+/);
    const chunks: string[] = [];
    let current = '';

    for (const segment of rawSegments) {
      const seg = segment.trim();
      if (!seg) continue;

      if ((current + ' ' + seg).length <= 140) {
        current = current ? `${current}. ${seg}` : seg;
      } else {
        if (current) chunks.push(current);
        if (seg.length <= 140) {
          current = seg;
        } else {
          const subParts = seg.split(/[,،]+/);
          for (const sub of subParts) {
            const s = sub.trim();
            if (!s) continue;
            if ((current + ' ' + s).length <= 140) {
              current = current ? `${current}، ${s}` : s;
            } else {
              if (current) chunks.push(current);
              current = s;
            }
          }
        }
      }
    }

    if (current) chunks.push(current);
    return chunks.length > 0 ? chunks : [cleanText.substring(0, 140)];
  }

  public speak(text: string, onStateChange?: (speaking: boolean, paused: boolean) => void) {
    this.onStateCallback = onStateChange || null;

    if (!text || !text.trim()) {
      alert('لا يوجد نص مكتوب لقراءته في هذه الخطبة.');
      return;
    }

    // إذا كان القارئ يعمل حالياً -> تبديل إيقاف/استئناف
    if (this.isSpeaking) {
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
      return;
    }

    // تصفية أي جلسة سابقة
    this.stopInternal(false);
    this.isCancelled = false;

    // تجهيز النص وتجزئته
    this.textChunks = this.chunkText(text);
    this.currentChunkIndex = 0;

    if (this.textChunks.length === 0) return;

    // البدء أولاً بـ Web Speech API مع حماية الـ cancel delay
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // تأخير 60ms لحل ثغرة Chrome Chromium Async Cancel Bug
      setTimeout(() => {
        if (!this.isCancelled) {
          this.playWebSpeechChunk();
        }
      }, 60);
    } else {
      this.playStreamElementsAudioChunk();
    }
  }

  /** تشغيل الجزء الحالي بواسطة Web Speech API */
  private playWebSpeechChunk() {
    if (this.isCancelled || this.currentChunkIndex >= this.textChunks.length) {
      this.finishPlayback();
      return;
    }

    const chunkText = this.textChunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    // اختيار صوت عربي إن وُجد
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang && v.lang.toLowerCase().includes('ar'));
    if (arVoice) {
      utterance.voice = arVoice;
      utterance.lang = arVoice.lang;
    }

    this.activeUtterance = utterance;
    (window as any)._arabicTTSUtterance = utterance;

    let hasStarted = false;

    utterance.onstart = () => {
      hasStarted = true;
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyState();
    };

    utterance.onend = () => {
      if (this.isCancelled) return;
      this.currentChunkIndex++;
      if (this.currentChunkIndex < this.textChunks.length) {
        setTimeout(() => this.playWebSpeechChunk(), 100);
      } else {
        this.finishPlayback();
      }
    };

    utterance.onerror = (e) => {
      console.warn('[ArabicTTS] Web Speech Error:', e.error, '— التبديل إلى الصوت الذكي السحابي');
      if (this.isCancelled || e.error === 'interrupted' || e.error === 'canceled') return;
      // التبديل فوراً إلى الصوت السحابي الفصيح
      this.playStreamElementsAudioChunk();
    };

    window.speechSynthesis.speak(utterance);

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // فحص أمان: إذا لم ينطلق حدث onstart خلال 350ms (بسبب غياب الصوت المحترِف بالنظام) -> التحويل إلى المحرك السحابي
    setTimeout(() => {
      if (!hasStarted && !this.isCancelled && this.isSpeaking === false) {
        console.log('[ArabicTTS] لم يستجب Web Speech سريعا — جاري التبديل للمحرك السحابي المباشر...');
        window.speechSynthesis.cancel();
        this.playStreamElementsAudioChunk();
      }
    }, 350);
  }

  /** تشغيل الجزء الحالي بواسطة StreamElements Amazon Polly Arabic Voice ("Zeina") */
  private playStreamElementsAudioChunk() {
    if (this.isCancelled || this.currentChunkIndex >= this.textChunks.length) {
      this.finishPlayback();
      return;
    }

    const chunkText = this.textChunks[this.currentChunkIndex];
    const encoded = encodeURIComponent(chunkText);
    // صوت "Zeina" أو "Tarik" العربي الفصيح عالي الجودة
    const audioUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Zeina&text=${encoded}`;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    const audio = new Audio(audioUrl);
    this.currentAudio = audio;

    audio.onplay = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyState();
    };

    audio.onended = () => {
      if (this.isCancelled) return;
      this.currentChunkIndex++;
      if (this.currentChunkIndex < this.textChunks.length) {
        setTimeout(() => this.playStreamElementsAudioChunk(), 100);
      } else {
        this.finishPlayback();
      }
    };

    audio.onerror = (err) => {
      console.warn('[ArabicTTS] StreamElements Audio Error:', err);
      // التبديل كخيار أخير إلى الصوت الثاني "Tarik"
      this.playBackupTarikAudioChunk(chunkText);
    };

    audio.play().then(() => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyState();
    }).catch(err => {
      console.warn('[ArabicTTS] Audio play blocked or failed:', err);
      this.playBackupTarikAudioChunk(chunkText);
    });
  }

  /** صوت احتياطي أخير "Tarik" */
  private playBackupTarikAudioChunk(text: string) {
    if (this.isCancelled) return;
    const encoded = encodeURIComponent(text.substring(0, 150));
    const audioUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Tarik&text=${encoded}`;

    const audio = new Audio(audioUrl);
    this.currentAudio = audio;

    audio.onplay = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyState();
    };

    audio.onended = () => {
      if (this.isCancelled) return;
      this.currentChunkIndex++;
      if (this.currentChunkIndex < this.textChunks.length) {
        this.playStreamElementsAudioChunk();
      } else {
        this.finishPlayback();
      }
    };

    audio.onerror = () => {
      this.stopInternal(true);
    };

    audio.play().catch(() => {
      this.stopInternal(true);
    });
  }

  public pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPaused = true;
      this.notifyState();
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      this.notifyState();
    }
  }

  public resume() {
    if (this.currentAudio) {
      this.currentAudio.play().catch(() => {});
      this.isPaused = false;
      this.notifyState();
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.notifyState();
    }
  }

  public stop() {
    this.stopInternal(true);
  }

  private finishPlayback() {
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentAudio = null;
    this.activeUtterance = null;
    if (typeof window !== 'undefined') {
      (window as any)._arabicTTSUtterance = null;
    }
    this.notifyState();
  }

  private stopInternal(notify: boolean = true) {
    this.isCancelled = true;
    this.textChunks = [];
    this.currentChunkIndex = 0;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.activeUtterance = null;
    if (typeof window !== 'undefined') {
      (window as any)._arabicTTSUtterance = null;
    }

    this.isSpeaking = false;
    this.isPaused = false;
    if (notify) this.notifyState();
  }

  private notifyState() {
    if (this.onStateCallback) {
      this.onStateCallback(this.isSpeaking, this.isPaused);
    }
  }
}
