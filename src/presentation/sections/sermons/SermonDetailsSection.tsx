// ==============================
// Presentation — SermonDetailsSection Component
// عرض تفاصيل خطبة مع زر اعتماد للجمعة / إلغاء الاعتماد في الهيدر العلوي، القارئ الصوتي المتقدم، والمرفقات
// ==============================

import React from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  BookOpen, Calendar, User, Clock, CheckCircle2,
  Printer, Copy, Volume2, Paperclip,
  FileText, RefreshCw, AlertCircle, Send, Check, ShieldCheck, X
} from 'lucide-react';
import { useSermonDetails } from '../../hooks/useSermonDetails';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getStatusBadge = (status?: string, isScheduledForFriday?: boolean) => {
  if (isScheduledForFriday || status === 'Scheduled' || status === 'scheduled_for_friday') {
    return { label: 'معتمدة للجمعة القادمة', style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black' };
  }
  switch (status) {
    case 'approved':
      return { label: 'معتمدة في المكتبة', style: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    case 'pending':
      return { label: 'قيد المراجعة', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    case 'rejected':
      return { label: 'مرفوضة', style: 'bg-red-500/10 text-red-500 border-red-500/20' };
    case 'completed':
      return { label: 'تمت إلقاؤها', style: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
    default:
      return { label: 'مؤرشفة في المكتبة', style: 'bg-muted text-muted-foreground border-border' };
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'غير محدد';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
};

// ── Component ─────────────────────────────────────────────────────────────────

interface SermonDetailsSectionProps {
  sermonId: string | number;
  onBack: () => void;
  onSelectForFriday?: (id: string | number) => void;
  onCancelFridaySelection?: (id: string | number) => void;
}

export function SermonDetailsSection({ sermonId, onBack, onSelectForFriday, onCancelFridaySelection }: SermonDetailsSectionProps) {
  const {
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
  } = useSermonDetails(sermonId);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`تفاصيل الخطبة #${sermonId}`} onBack={onBack} />
        
        <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Skeleton */}
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-pulse">
              <div className="h-6 w-32 bg-muted rounded-full" />
              <div className="h-8 w-3/4 bg-muted rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="h-12 bg-muted rounded-xl" />
                <div className="h-12 bg-muted rounded-xl" />
                <div className="h-12 bg-muted rounded-xl" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4 animate-pulse">
              <div className="h-6 w-40 bg-muted rounded-md" />
              <div className="h-40 bg-muted/60 rounded-2xl" />
            </div>
          </div>

          {/* Side Skeleton */}
          <div className="xl:col-span-4">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-pulse">
              <div className="h-6 w-32 bg-muted rounded-md" />
              <div className="h-16 bg-muted/60 rounded-xl" />
              <div className="h-12 bg-muted/60 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`تفاصيل الخطبة #${sermonId}`} onBack={onBack} />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className="text-lg font-bold text-foreground">{error || 'الخطبة غير موجودة'}</h3>
          <button onClick={fetchDetails} className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(sermon.status, isScheduledForFriday);
  const speakerName = sermon.speaker_name || sermon.preacher || 'الشيخ الخطيب';
  const sermonTextContent = sermon.content || (sermon as any).description || sermon.notes || 'لا يوجد نص مكتوب مسجل لهذه الخطبة.';

  const onCancelClick = async () => {
    await handleCancelFridaySelection();
    if (onCancelFridaySelection) {
      onCancelFridaySelection(sermon.id);
    }
  };

  const onAdoptClick = async () => {
    await handleSelectForFriday();
    if (onSelectForFriday) {
      onSelectForFriday(sermon.id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title={`تفاصيل خطبة: ${sermon.title}`}
        description="استعراض النص الكامل وعناصر الخطبة والقارئ الصوتي وإدارة الاعتماد للجمعة القادمة."
        onBack={onBack}
        breadcrumbs={[{ label: 'إدارة المسجد' }, { label: 'خطب المسجد' }, { label: 'تفاصيل الخطبة', active: true }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={toggleSermonSpeech}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                isSpeaking ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-card border-border text-foreground hover:bg-muted'
              }`} title="القارئ الصوتي">
              <Volume2 className={`w-4 h-4 ${isSpeaking && !isSpeechPaused ? 'animate-bounce text-white' : 'text-primary'}`} />
              <span>{isSpeaking ? (isSpeechPaused ? 'استكمال القارئ' : 'إيقاف مؤقت') : 'القارئ الصوتي'}</span>
            </button>

            <button onClick={copyContent}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all" title="نسخ نص الخطبة">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>

            <button onClick={() => window.print()} className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all" title="طباعة">
              <Printer className="w-4 h-4" />
            </button>

            {/* Adopt vs Cancel Selection Action Button (Header Only) */}
            {isScheduledForFriday ? (
              <button
                onClick={onCancelClick}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                title="إلغاء اعتماد هذه الخطبة للجمعة القادمة"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                <span>إلغاء الاعتماد</span>
              </button>
            ) : (
              <button
                onClick={onAdoptClick}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                title="اعتماد هذه الخطبة للجمعة القادمة"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>اعتماد للجمعة القادمة</span>
              </button>
            )}
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Main Content */}
        <div className="xl:col-span-8 space-y-6">

          {/* Header */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block mb-3 ${badge.style}`}>{badge.label}</span>
                <h2 className="text-2xl font-black text-foreground leading-relaxed">{sermon.title}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20"><User className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">الشيخ الخطيب</p>
                  <p className="text-sm font-bold text-foreground">{speakerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border"><Calendar className="w-4 h-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">تاريخ الخطبة</p>
                  <p className="text-sm font-bold text-foreground">{formatDate(sermon.sermon_date || sermon.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-500/20"><Clock className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">المدة المتوقعة</p>
                  <p className="text-sm font-bold text-foreground">{sermon.duration || '20 - 25 دقيقة'}</p>
                </div>
              </div>
            </div>

            {/* Voice reader active banner */}
            {isSpeaking && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-emerald-600 animate-bounce" />
                  <span className="text-xs font-bold text-emerald-600">القارئ الصوتي يقرأ نص ومحاور الخطبة الآن...</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={toggleSermonSpeech} className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm">
                    {isSpeechPaused ? 'استكمال' : 'إيقاف مؤقت'}
                  </button>
                  <button onClick={stopSpeech} className="px-3.5 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold shadow-sm">إنهاء</button>
                </div>
              </div>
            )}
          </div>

          {/* Full Text */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> نص ومحاور الخطبة</h3>
              <button onClick={toggleSermonSpeech}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all border border-primary/20">
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? (isSpeechPaused ? 'استكمال القراءة' : 'إيقاف مؤقت') : 'قراءة بصوت القارئ'}</span>
              </button>
            </div>
            <div className="p-6 bg-muted/50 rounded-2xl border border-border">
              <p className="text-sm text-foreground leading-loose whitespace-pre-wrap font-medium">{sermonTextContent}</p>
            </div>
          </div>

          {/* Attachments */}
          {sermon.attachments && sermon.attachments.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2 border-b border-border pb-4">
                <Paperclip className="w-4 h-4 text-primary" /> المرفقات والمستندات ({sermon.attachments.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {sermon.attachments.map((att: any, idx: number) => {
                  const url = typeof att === 'string' ? att : att.url;
                  const name = typeof att === 'string' ? `مرفق_${idx + 1}` : (att.file_name || `مرفق_${idx + 1}`);
                  return (
                    <a key={idx} href={url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3.5 bg-muted/60 border border-border rounded-xl hover:border-primary/50 transition-all group">
                      <div className="p-2 bg-card rounded-lg border border-border group-hover:text-primary transition-colors"><Paperclip className="w-4 h-4" /></div>
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{name}</p>
                        <p className="text-[10px] text-muted-foreground">عرض الملف المرفق</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Side Column */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
            <div className="border-b border-border pb-4"><h3 className="text-base font-black text-foreground">معلومات الخطبة</h3></div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">الجامع / المسجد</span>
                <p className="text-sm font-bold text-foreground">المسجد الرئيسي</p>
              </div>
              {sermon.notes && (
                <div className="pt-2 border-t border-border/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">ملاحظات الاعتماد</span>
                  <p className="text-xs text-foreground/90 font-medium leading-relaxed bg-muted/60 p-3 rounded-xl border border-border">{sermon.notes}</p>
                </div>
              )}
            </div>

            {/* Side Verification Badge */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>مراجعة ومعتمدة من إدارة المساجد</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
