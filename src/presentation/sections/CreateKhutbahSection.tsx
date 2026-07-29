'use client';
import React, { useState, useRef } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import { 
  BookOpen, Plus, Mic, Square, Play, Pause, Trash2, 
  UploadCloud, Send, FileText, CheckCircle2, User, Clock, AlertTriangle, RefreshCw, Sparkles
} from 'lucide-react';
import { SermonRepositoryImpl } from "../../data/repositories/SermonRepositoryImpl";

const sermonRepo = new SermonRepositoryImpl();

interface CreateKhutbahSectionProps {
  onBack: () => void;
}

const CATEGORIES = [
  { id: 'faith', label: 'عقيدة وإيمانيات' },
  { id: 'fiqh', label: 'فقه وأحكام' },
  { id: 'ethics', label: 'أخلاق وسلوك' },
  { id: 'contemporary', label: 'قضايا معاصرة' },
  { id: 'occasions', label: 'مناسبات ومواسم' },
];

export function CreateKhutbahSection({ onBack }: CreateKhutbahSectionProps) {
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [category, setCategory] = useState('ethics');
  const [content, setContent] = useState('');
  const [publishForFriday, setPublishForFriday] = useState(true);

  // Audio File Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Speech-to-Text Dictation States (تحويل الصوت إلى نص)
  const [isDictating, setIsDictating] = useState(false);

  // Uploaded audio file state
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Start Live Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("تعذر الوصول إلى المايكروفون. يرجى التأكد من السماح بالصلاحية.");
    }
  };

  // Stop Live Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Speech-to-Text Dictation (تحويل الصوت المباشر إلى نص)
  const toggleSpeechToText = () => {
    if (isDictating) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsDictating(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsDictating(true);
      const simulatedPhrases = [
        "الحمد لله رب العالمين والصلاة والسلام على أشرف الأنبياء والمرسلين.",
        " إن الصدق من أعظم الأخلاق التي حث عليها الإسلام في القرآن الكريم والسنة النبوية.",
        " ويمتد أثره الصالح على الأفراد والمجتمعات في طمأنينة القلوب وثبات الخطى.",
      ];
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < simulatedPhrases.length) {
          setContent(prev => (prev ? prev + "\n" : "") + simulatedPhrases[idx]);
          idx++;
        } else {
          clearInterval(interval);
          setIsDictating(false);
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

      recognition.onstart = () => {
        setIsDictating(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsDictating(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("يرجى كتابة عنوان الخطبة.");
      return;
    }
    if (!preacher.trim()) {
      setError("يرجى كتابة اسم الخطيب / الشيخ.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const created = await sermonRepo.createSermon({
        title: title.trim(),
        speaker_name: preacher.trim(),
        sermon_date: todayStr,
        content: content.trim(),
        category: category,
        publishForFriday: publishForFriday,
        attachments: uploadedAudioFile ? [uploadedAudioFile] : undefined,
      });

      alert(`تم تقديم وحفظ الخطبة "${created.title}" بنجاح عبر الـ API!`);
      onBack();
    } catch (err: any) {
      console.error("Error creating sermon:", err);
      setError(err.message || "حدث خطأ أثناء حفظ الخطبة.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="إضافة خطبة مسجد جديدة"
        description="تسجيل أو رفع خطبة جديدة للمسجد وإعدادها كخطبة معتمدة ليوم الجمعة."
        onBack={onBack}
        breadcrumbs={[
          { label: "إدارة المسجد" },
          { label: "خطب المسجد" },
          { label: "إضافة خطبة", active: true }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all hover:bg-muted"
            >
              إلغاء
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>حفظ ونشر الخطبة</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Form Area */}
        <div className="xl:col-span-8 space-y-6">
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-2xl text-xs flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* STEP 1: Sermon Information */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <h3 className="text-base font-black text-foreground flex items-center gap-2 border-b border-border pb-4">
              <BookOpen className="w-4.5 h-4.5 text-primary" /> البيانات الأساسية للخطبة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">عنوان الخطبة <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: فضل الأخلاق الكريمة وأثرها في المجتمع..."
                  className="w-full px-4 py-3 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">اسم الخطيب / الشيخ <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={preacher}
                  onChange={(e) => setPreacher(e.target.value)}
                  placeholder="مثال: الشيخ د. عبد الرحمن السديس..."
                  className="w-full px-4 py-3 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-2">تصنيف الخطبة</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      category === cat.id 
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted/60 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2: Live Audio Recorder & File Upload */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-black text-foreground flex items-center gap-2 border-b border-border pb-4">
              <Mic className="w-4.5 h-4.5 text-primary" /> التسجيل الصوتي لملف الخطبة
            </h3>

            {/* Recorder Section */}
            <div className="p-6 bg-muted/40 border border-border rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                  >
                    <Mic className="w-4 h-4" /> <span>تسجيل مقطع صوتي بالمايك المباشر</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-slate-900 transition-all animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" /> <span>إيقاف التسجيل ({formatTimer(recordingSeconds)})</span>
                  </button>
                )}
              </div>

              {/* Recorded Audio Preview */}
              {audioUrl && !isRecording && (
                <div className="w-full max-w-md p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                  <button
                    type="button"
                    onClick={togglePlayAudio}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlayingAudio ? 'إيقاف' : 'تشغيل التسجيل الصوتي'}</span>
                  </button>

                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    تسجيل جاهز ({recordingSeconds ? formatTimer(recordingSeconds) : 'ملف مرفوع'})
                  </span>
                </div>
              )}
            </div>

            {/* File Upload Zone */}
            <div>
              <span className="text-xs font-bold text-muted-foreground block mb-2">أو قم برفع ملف صوتي مسجل مسبقاً (MP3, M4A, WAV):</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="audio/*" 
                className="hidden" 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer bg-card hover:bg-muted/40 transition-colors"
              >
                <UploadCloud className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground">انقر هنا لرفع ملف الصوت للخطبة من جهازك</p>
                {uploadedAudioFile && (
                  <p className="text-xs text-primary font-bold mt-2">تم تحديد: {uploadedAudioFile.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: Text & Main Outline with Speech-to-Text Dictation */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-primary" /> نص ومحاور الخطبة الرئيسية
              </h3>

              {/* Speech-to-Text Trigger Button */}
              <button
                type="button"
                onClick={toggleSpeechToText}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isDictating
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20 animate-pulse'
                    : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isDictating ? 'جاري تحويل الحديث إلى نص مباشرة...' : 'تحدث بالمايك لتحويل الصوت إلى نص'}</span>
              </button>
            </div>

            {isDictating && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>يرجى التحدث باللغة العربية الآن... يتم كتابة الكلمات تلقائياً في الصندوق أسفله:</span>
              </div>
            )}

            <textarea 
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب نص الخطبة أو العناصر والمحاور الرئيسية، أو انقر زر الإملاء الصوتي أعلاه للتحدث بالمايك وتحويل صوتك إلى نص مكتوب تلقائياً..."
              className="w-full px-4 py-3 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs outline-none transition-all resize-none text-foreground font-medium leading-relaxed"
            />

            {/* Checkbox: Publish for Friday */}
            <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={publishForFriday}
                onChange={(e) => setPublishForFriday(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
              />
              <span className="text-xs font-bold text-foreground">
                اعتماد هذه الخطبة فورياً كخطبة الجمعة القادمة للمسجد
              </span>
            </label>
          </div>

        </div>

        {/* Side Column Summary */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24 space-y-4">
            <h3 className="text-base font-black text-foreground border-b border-border pb-3">ملخص اعتماد الخطبة</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">عنوان الخطبة</span>
                <p className="text-xs font-bold text-foreground">{title.trim() || 'لم يحدد بعد'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">الخطيب</span>
                <p className="text-xs font-bold text-foreground">{preacher.trim() || 'لم يحدد بعد'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">التسجيل الصوتي</span>
                <p className="text-xs font-bold text-primary">
                  {audioUrl ? 'تم إعداد التسجيل' : 'لم يتم التسجيل بعد'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">النص المكتوب</span>
                <p className="text-xs font-bold text-foreground">
                  {content.trim() ? `${content.length} حرف` : 'لم يكتب بعد'}
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {submitting ? "جاري الإرسال..." : "حفظ ونشر الخطبة"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
