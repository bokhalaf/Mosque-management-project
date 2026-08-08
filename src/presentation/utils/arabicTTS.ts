/**
 * Guaranteed Arabic Speech Synthesizer (Zero-Cancel Safeguard)
 * Fixes React re-render garbage collection & Chrome instant cancellation bug.
 */

export class ArabicTTSPlayer {
  private static instance: ArabicTTSPlayer;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private onStateCallback: ((speaking: boolean, paused: boolean) => void) | null = null;

  private constructor() {}

  public static getInstance(): ArabicTTSPlayer {
    if (!ArabicTTSPlayer.instance) {
      ArabicTTSPlayer.instance = new ArabicTTSPlayer();
    }
    return ArabicTTSPlayer.instance;
  }

  public speak(text: string, onStateChange?: (speaking: boolean, paused: boolean) => void) {
    this.onStateCallback = onStateChange || null;

    if (!text || !text.trim()) {
      alert("لا يوجد نص مكتوب لقراءته في هذه الخطبة.");
      return;
    }

    const cleanText = text.replace(/\s+/g, ' ').trim();

    // If currently speaking, toggle pause/resume
    if (this.isSpeaking) {
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
      return;
    }

    // Safely stop previous instance without destroying new state
    this.stopInternal();

    // ── METHOD 1: Direct Web Speech API with GC & React Safeguard ──
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.volume = 1.0;
      utterance.rate = 0.88; // Clear natural pace
      utterance.pitch = 1.0;

      // Keep strong reference on window & class instance to prevent Chrome GC bug
      this.activeUtterance = utterance;
      (window as any)._arabicTTSUtterance = utterance;

      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(v => v.lang && v.lang.toLowerCase().includes('ar'));

      if (arabicVoice) {
        utterance.voice = arabicVoice;
        utterance.lang = arabicVoice.lang;
      } else if (voices.length > 0) {
        utterance.voice = voices[0];
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        this.notifyState();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.activeUtterance = null;
        (window as any)._arabicTTSUtterance = null;
        this.notifyState();
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error, switching to HTML5 audio fallback:", e);
        this.activeUtterance = null;
        (window as any)._arabicTTSUtterance = null;
        this.speakHTML5AudioStream(cleanText);
      };

      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyState();

      // Trigger Speech
      window.speechSynthesis.speak(utterance);

      // Force Chrome audio engine wake-up
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      return;
    }

    // ── METHOD 2: HTML5 Audio Stream Fallback ──
    this.speakHTML5AudioStream(cleanText);
  }

  private speakHTML5AudioStream(text: string) {
    const encoded = encodeURIComponent(text.substring(0, 200));
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ar&client=tw-ob`;

    const audio = new Audio(audioUrl);
    this.currentAudio = audio;

    audio.onplay = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyState();
    };

    audio.onended = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentAudio = null;
      this.notifyState();
    };

    audio.onerror = () => {
      this.stopInternal();
    };

    audio.play().then(() => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyState();
    }).catch(err => {
      console.warn("Audio stream playback failed:", err);
      this.stopInternal();
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
      this.currentAudio.play();
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
    this.stopInternal();
  }

  private stopInternal() {
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
    this.notifyState();
  }

  private notifyState() {
    if (this.onStateCallback) {
      this.onStateCallback(this.isSpeaking, this.isPaused);
    }
  }
}
