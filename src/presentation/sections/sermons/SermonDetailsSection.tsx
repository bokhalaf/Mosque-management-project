'use client';
// ==============================
// Presentation — SermonDetailsSection Component
// عرض تفاصيل خطبة مع النص الكامل، اعتماد السوبر أدمن المباشر (قبول / رفض مع السبب)، ومراقب السيرفر
// ==============================

import React, { useState } from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  BookOpen, Calendar, User, CheckCircle2,
  Printer, Copy, Paperclip,
  FileText, RefreshCw, AlertCircle, Send, Check, X, Terminal, ShieldCheck, XCircle, ArrowRight
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

const getStatusBadge = (status?: string, isScheduledForFriday?: boolean, isPendingFlag?: boolean) => {
  const s = (status || '').toLowerCase();
  if (isPendingFlag || s === 'pending' || s === 'draft' || s === 'under_review') {
    return {
      label: 'قيد الانتظار',
      style: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-black'
    };
  }
  if (isScheduledForFriday || s === 'scheduled' || s === 'scheduled_for_friday') {
    return {
      label: 'معتمدة للجمعة القادمة',
      style: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-black'
    };
  }
  switch (s) {
    case 'approved':
      return { label: 'معتمدة في المكتبة', style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold' };
    case 'rejected':
      return { label: 'مرفوضة من الإدارة', style: 'bg-red-500/10 text-red-600 border-red-500/20 font-bold' };
    case 'completed':
      return { label: 'تمت إلقاؤها', style: 'bg-slate-500/10 text-slate-500 border-slate-500/20 font-bold' };
    case 'archived':
      return { label: 'مؤرشفة في المكتبة', style: 'bg-muted text-muted-foreground border-border font-bold' };
    default:
      return { label: 'خطبة في المكتبة', style: 'bg-muted text-muted-foreground border-border font-bold' };
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

const REJECT_REASONS_PRESETS = [
  'يرجى مراجعة وتدقيق الأحاديث الواردة في الخطبة',
  'موضوع الخطبة تم تناوله مؤخراً في الجمعة الماضية',
  'يرجى توسيع المحور الثاني وإضافة شواهد أكثر',
  'يرجى الالتزام بالوقت المقترح ومراعاة الاختصار',
  'النص يحتاج إلى مراجعة لغوية ونحوية إضافية',
];

// ── Component ─────────────────────────────────────────────────────────────────

interface SermonDetailsSectionProps {
  sermonId: string | number;
  onBack: () => void;
  onSelectForFriday?: (id: string | number) => void;
  onCancelFridaySelection?: (id: string | number) => void;
}

export function SermonDetailsSection({
  sermonId,
  onBack,
  onSelectForFriday,
  onCancelFridaySelection,
}: SermonDetailsSectionProps) {
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
    handleApproveSermon,
    handleRejectSermon,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
  } = useSermonDetails(sermonId);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('يرجى مراجعة وتدقيق الأحاديث الواردة في الخطبة');

  const handleOpenRejectModal = () => {
    setRejectionReason('يرجى مراجعة وتدقيق الأحاديث الواردة في الخطبة');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) return;
    setShowRejectModal(false);
    await handleRejectSermon(rejectionReason.trim());
  };

  const isSuperAdmin = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
      const role = String(user.role || user.user_type || user.role_name || '').toLowerCase();
      const roles = user.roles || [];
      return (
        role === 'super_admin' ||
        role === 'admin' ||
        role === 'administrator' ||
        user.is_super_admin === true ||
        roles.includes('super_admin') ||
        roles.includes('admin') ||
        localStorage.getItem("user_role") === "super_admin"
      );
    } catch (e) {
      return false;
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`تفاصيل الخطبة #${sermonId}`} onBack={onBack} />
        <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">
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

  // Detect pending state — case-insensitive to handle API variants like "Pending"
  const statusLower = (sermon.status || '').toLowerCase();
  const isPending =
    statusLower === 'pending' ||
    statusLower === 'draft' ||
    statusLower === 'under_review' ||
    (sermon as any).is_pending === true ||
    (sermon as any).is_approved === false;

  const badge = getStatusBadge(sermon.status, isScheduledForFriday, isPending);
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
        description="استعراض النص الكامل للخطبة، بيانات الخطيب، واتخاذ قرار القبول أو الرفض أو الاعتماد للجمعة."
        onBack={onBack}
        breadcrumbs={[{ label: 'دليل الخطب' }, { label: 'تفاصيل الخطبة', active: true }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live API Inspector Button */}
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="معاينة سجل استجابة الـ API المباشرة"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            {/* Copy Text */}
            <button
              onClick={copyContent}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all"
              title="نسخ نص الخطبة"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>

            {/* Print */}
            <button
              onClick={() => window.print()}
              className="p-2 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="طباعة"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* DIRECT ACTION BUTTONS (للخطب المعتمدة أو المختارة للجمعة) */}
            {isPending ? null : isScheduledForFriday ? (
              <button
                onClick={onCancelClick}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                title="إلغاء اعتماد هذه الخطبة للجمعة القادمة"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                <span>إلغاء اعتماد الجمعة</span>
              </button>
            ) : (
              <button
                onClick={onAdoptClick}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
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
                <h3 className="font-bold text-white text-sm">مراقب الـ API المباشر لتفاصيل الخطبة والقرارات</h3>
              </div>
              <button
                onClick={clearDebugLogs}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg"
              >
                مسح السجل
              </button>
            </div>

            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic">لا توجد طلبات مسجلة حالياً.</p>
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
          {/* Main Column */}
          <div className="xl:col-span-8 space-y-6">
            {/* Rejection Alert ONLY when status is rejected */}
            {statusLower === 'rejected' && sermon.notes && (
              <div className="p-4 bg-red-500/10 border-2 border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-black text-red-600">ملاحظات وسبب الرفض المسجل من الإدارة:</h5>
                  <p className="text-xs text-foreground font-bold">{sermon.notes}</p>
                </div>
              </div>
            )}

            {/* Header Info Card */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block mb-3 ${badge.style}`}>
                    {badge.label}
                  </span>
                  <h2 className="text-2xl font-black text-foreground leading-relaxed">{sermon.title}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">الشيخ الخطيب</p>
                    <p className="text-sm font-bold text-foreground">{speakerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">تاريخ الخطبة</p>
                    <p className="text-sm font-bold text-foreground">{formatDate(sermon.sermon_date || sermon.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">تصنيف الخطبة</p>
                    <p className="text-sm font-bold text-foreground">{getCategoryLabel(sermon.category)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Text */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  النص الكامل للخطبة
                </h3>
                <button
                  onClick={copyContent}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-bold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
              </div>

              <div className="p-6 md:p-8 bg-muted/40 rounded-2xl border border-border">
                <p className="text-sm md:text-base text-foreground leading-loose whitespace-pre-wrap font-medium">
                  {sermonTextContent}
                </p>
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-primary" /> الملفات والمرفقات
              </h3>
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

          {/* Sidebar: Primary Decision Action Card */}
          <div className="xl:col-span-4 space-y-6">
            {/* Dedicated Decision Card for Pending Sermons — ONLY FOR SUPER ADMIN */}
            {isPending && isSuperAdmin && (
              <div className="bg-card border-2 border-primary/40 rounded-3xl p-6 shadow-md space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-black text-foreground">معالجة طلب الخطبة</h3>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    قيد المراجعة والانتظار
                  </span>
                </div>

                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  بصفتك مسؤول النظام، يرجى مراجعة محتوى الخطبة ثم اتخاذ قرار القبول لإضافتها للأرشيف، أو الرفض مع تدوين السبب.
                </p>

                {/* The Two Primary Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleApproveSermon}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>قبول واعتماد الخطبة</span>
                  </button>

                  <button
                    onClick={handleOpenRejectModal}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/30 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    <span>رفض الخطبة مع تحديد السبب</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Status Info Card */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-foreground border-b border-border pb-3">معلومات الاعتماد الإداري</h3>
              <div className="space-y-3 text-xs font-bold">
                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border">
                  <span className="text-muted-foreground">حالة الخطبة الحالية:</span>
                  <span className={`px-2.5 py-0.5 rounded-md ${badge.style}`}>{badge.label}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border">
                  <span className="text-muted-foreground">تاريخ الإضافة:</span>
                  <span className="font-mono text-foreground">{formatDate(sermon.created_at || sermon.sermon_date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Reason Modal (نافذة كتابة سبب الرفض) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in font-['Cairo']">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl p-6 text-right space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">رفض طلب الخطبة وإشعار الخطيب</h3>
                  <p className="text-xs text-muted-foreground font-medium">حدد سبب الرفض ليتم إرساله للشيخ الخطيب لتصحيحه</p>
                </div>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground block">اختيار سريع لسبب الرفض الشائع:</label>
              <div className="flex flex-wrap gap-1.5">
                {REJECT_REASONS_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className={`text-[11px] px-3 py-1.5 rounded-xl font-bold transition-all border ${
                      rejectionReason === preset
                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                        : 'bg-muted/60 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-foreground block">نص سبب الرفض والملاحظات بالتفصيل *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اكتب التوجيهات أو الملاحظات الواجب تصحيحها..."
                  rows={4}
                  className="w-full p-3 bg-muted border border-border focus:border-red-500 rounded-xl text-xs outline-none transition-all text-foreground resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2.5 bg-card border border-border text-foreground hover:bg-muted font-bold text-xs rounded-xl transition-all"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                <span>تأكيد رفض الخطبة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
