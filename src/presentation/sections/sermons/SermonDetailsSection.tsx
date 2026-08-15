// ==============================
// Presentation — SermonDetailsSection Component
// عرض تفاصيل خطبة مع تصنيف الخطبة، اعتماد إدارة المنطقة، ومراقب السيرفر المباشر
// ==============================

import React from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  BookOpen, Calendar, User, CheckCircle2,
  Printer, Copy, Paperclip,
  FileText, RefreshCw, AlertCircle, Send, Check, X, Terminal, ShieldCheck
} from 'lucide-react';
import { useSermonDetails } from '../../hooks/useSermonDetails';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getCategoryLabel = (category?: string) => {
  if (!category) return 'عامة';
  switch (category) {
    case 'creed_faith':
    case 'faith':
      return 'عقيدة وإيمانيات';
    case 'jurisprudence_rulings':
    case 'fiqh':
      return 'فقه وأحكام';
    case 'ethics_conduct':
    case 'ethics':
      return 'أخلاق وسلوك';
    case 'contemporary_issues':
    case 'contemporary':
      return 'قضايا معاصرة';
    case 'occasions_seasons':
    case 'occasions':
      return 'مناسبات ومواسم';
    case 'other':
      return 'غير ذلك';
    default:
      return category;
  }
};

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
    isScheduledForFriday,
    fetchDetails,
    copyContent,
    handleSelectForFriday,
    handleCancelFridaySelection,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
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

  const isApprovedByRegionManager = Boolean(
    sermon.region_manager_id ||
    sermon.status === 'approved' ||
    sermon.status === 'archived' ||
    isScheduledForFriday
  );

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
        description="استعراض النص الكامل وعناصر الخطبة وإدارة الاعتماد للجمعة القادمة مع معاينة استجابة السيرفر."
        onBack={onBack}
        breadcrumbs={[{ label: 'إدارة المسجد' }, { label: 'خطب المسجد' }, { label: 'تفاصيل الخطبة', active: true }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="معاينة سجل استجابة الـ API المباشرة"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
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

      <div className="px-4 md:px-8 py-4 space-y-6">

        {/* Debug Terminal */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">مراقب الـ API المباشر لتفاصيل الخطبة والاعتمادات (Sermon Details Live Inspector)</h3>
              </div>
              <button
                onClick={clearDebugLogs}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg"
              >
                مسح السجل
              </button>
            </div>

            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic">لا توجد طلبات معالجة حالياً.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto ltr text-left">
                {debugLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="font-bold">[{log.time}] {log.action}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                        HTTP {log.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{log.url}</p>
                    <pre className="text-[10px] bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
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
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20"><BookOpen className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">تصنيف الخطبة</p>
                    <p className="text-sm font-bold text-foreground">{getCategoryLabel(sermon.category)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Text */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-base font-black text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> نص ومحاور الخطبة</h3>
              </div>
              <div className="p-6 bg-muted/50 rounded-2xl border border-border">
                <p className="text-sm text-foreground leading-loose whitespace-pre-wrap font-medium">{sermonTextContent}</p>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2"><Paperclip className="w-4 h-4 text-primary" /> الملفات والمرفقات</h3>
              {sermon.attachments && sermon.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sermon.attachments.map((file, idx) => {
                    const fileName = typeof file === 'string' ? `مرفق #${idx + 1}` : (file as any).file_name || (file as any).name || `مرفق #${idx + 1}`;
                    const fileUrl = typeof file === 'string' ? file : file.url;
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-xs font-bold text-foreground">{fileName}</span>
                        </div>
                        {fileUrl && (
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline">تحميل</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">لا توجد ملفات مرفقة مع هذه الخطبة.</p>
              )}
            </div>
          </div>

          {/* Sidebar Status Info */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-base font-black text-foreground border-b border-border pb-3">بيانات الاعتماد</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/60">
                  <span className="text-xs font-bold text-muted-foreground">معتمد من قبل إدارة المنطقة</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    isApprovedByRegionManager
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold'
                  }`}>
                    {isApprovedByRegionManager ? 'نعم (معتمد)' : 'قيد المراجعة'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onBack}
                  className="w-full py-3 bg-muted text-foreground hover:bg-muted/80 rounded-xl text-xs font-bold transition-all text-center border border-border"
                >
                  العودة لقائمة الخطب
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
