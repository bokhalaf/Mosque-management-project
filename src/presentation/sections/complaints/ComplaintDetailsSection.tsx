// ==============================
// Presentation — ComplaintDetailsSection Component
// عرض تفاصيل الشكوى مع لودينغ الهيكلي (Skeleton)، الألوان المتناسقة، حوار تحديث الحالة التفاعلي، وسجل الملاحظات المحسّن
// ==============================

import React, { useState } from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  CheckCircle2, Archive, FileText, Send, Paperclip, MessageSquare,
  Calendar, AlertCircle, RefreshCw, Printer, Clock, AlertTriangle, ShieldCheck, X, UserPlus, ArrowUpRight, Building2
} from 'lucide-react';
import { useComplaintDetails, ComplaintStatusKey } from '../../hooks/useComplaintDetails';

// ── Helpers & Design System Palette ──────────────────────────────────────────

const PIPELINE: { value: ComplaintStatusKey; label: string; glow: string; ring: string; color: string }[] = [
  { value: 'pending',     label: 'جديدة',        color: 'text-blue-500',    glow: 'bg-blue-500',    ring: 'ring-blue-500/40' },
  { value: 'in_progress', label: 'قيد المعالجة', color: 'text-amber-500',   glow: 'bg-amber-500',   ring: 'ring-amber-500/40' },
  { value: 'resolved',    label: 'تم الحل',       color: 'text-emerald-500', glow: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
];

const PIPELINE_IDX = (s: ComplaintStatusKey) => PIPELINE.findIndex(p => p.value === s);

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'pending':
    case 'new':         return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'in_progress':
    case 'review':      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'resolved':    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'canceled':
    case 'closed':      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    default:            return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
    case 'new':         return 'جديدة';
    case 'in_progress':
    case 'review':      return 'قيد المعالجة';
    case 'resolved':    return 'تم الحل';
    case 'canceled':
    case 'closed':      return 'مغلقة';
    default:            return status;
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20 font-black';
    case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high': return 'أولوية عالية';
    case 'medium': return 'أولوية متوسطة';
    case 'low': return 'أولوية منخفضة';
    default: return 'غير محدد';
  }
};

const getComplaintTypeLabel = (type?: string) => {
  switch (type) {
    case 'service_missing': return 'خدمة مفقودة';
    case 'power_outage': return 'انقطاع كهرباء/تكييف';
    case 'corruption': return 'بلاغ إداري';
    case 'employee_misconduct': return 'سلوك موظف';
    case 'technical_issue': return 'مشكلة تقنية';
    case 'other': return 'أخرى';
    default: return 'عام';
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
};

// ── Component ─────────────────────────────────────────────────────────────────

interface ComplaintDetailsSectionProps {
  complaintId: string;
  onBack: () => void;
}

export function ComplaintDetailsSection({ complaintId, onBack }: ComplaintDetailsSectionProps) {
  const {
    complaint,
    loading,
    error,
    currentStatus,
    updatingStatus,
    newNote,
    setNewNote,
    fetchDetails,
    handleUpdateStatus,
    handleAssignToAdmin,
    isMosqueManager,
    submitNote,
  } = useComplaintDetails(complaintId);

  // Status Change Dialog State
  const [targetStatusModal, setTargetStatusModal] = useState<ComplaintStatusKey | null>(null);
  const [modalActionNote, setModalActionNote] = useState('');

  // Assign to Super Admin Modal State (assignComplaintToAdmin)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignNote, setAssignNote] = useState('');

  // Trigger Status Update Confirmation
  const openStatusModal = (status: ComplaintStatusKey) => {
    setTargetStatusModal(status);
    setModalActionNote('');
  };

  const confirmStatusUpdate = async () => {
    if (!targetStatusModal) return;
    await handleUpdateStatus(targetStatusModal, modalActionNote);
    setTargetStatusModal(null);
    setModalActionNote('');
  };

  const confirmAssignToAdmin = async () => {
    await handleAssignToAdmin(assignNote);
    setShowAssignModal(false);
    setAssignNote('');
  };

  // Skeleton Scan Loading State (لودينغ المسح عند التحميل)
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`الشكوى ${complaintId}`} onBack={onBack} />
        <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
              <div className="h-8 w-2/3 rounded-xl bg-muted animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="h-7 w-24 rounded-lg bg-muted animate-pulse" />
                <div className="h-7 w-24 rounded-lg bg-muted animate-pulse" />
                <div className="h-5 w-32 rounded-lg bg-muted animate-pulse opacity-70" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
                <div className="h-14 rounded-xl bg-muted animate-pulse" />
                <div className="h-14 rounded-xl bg-muted animate-pulse" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-3">
              <div className="h-6 w-44 rounded-xl bg-muted animate-pulse" />
              <div className="h-28 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="h-6 w-32 rounded-xl bg-muted animate-pulse" />
              <div className="h-20 rounded-xl bg-muted animate-pulse" />
              <div className="h-12 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`الشكوى ${complaintId}`} onBack={onBack} />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className="text-lg font-bold text-foreground">{error || 'الشكوى غير موجودة'}</h3>
          <button onClick={fetchDetails} className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  const isAssignedToAdmin = Boolean(
    complaint.assigned_admin_id ||
    (complaint as any).admin_id ||
    (complaint as any).assigned_to_admin ||
    (complaint as any).is_assigned_to_admin ||
    (complaint as any).assigned_admin ||
    complaint.status === 'escalated' ||
    complaint.status === 'assigned_to_admin'
  );
  const canTakeAction = isMosqueManager ? !isAssignedToAdmin : isAssignedToAdmin;
  const senderName = complaint.is_anonymous ? 'فاعل خير (مجهول)' : (complaint.user?.name || complaint.email || 'مصلي / زائر');
  const complaintNumber = complaint.complaint_number || `CMP-${complaint.id}`;

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title={`الشكوى: ${complaintNumber}`}
        description="عرض تفاصيل الشكوى، السجل الزمني للتحديثات، وتعديل حالتها."
        onBack={onBack}
        breadcrumbs={[{ label: 'الشكاوى والاقتراحات' }, { label: 'تفاصيل الشكوى', active: true }]}
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Main Column */}
        <div className="xl:col-span-8 space-y-6">

          {/* Complaint Header */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">{complaint.title || complaint.description || 'بدون عنوان'}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className={`px-3 py-1 rounded-lg font-bold border ${getStatusBadgeStyles(currentStatus)}`}>{getStatusLabel(currentStatus)}</span>
                  <span className={`px-3 py-1 rounded-lg font-bold border ${getPriorityStyles(complaint.priority)}`}>{getPriorityLabel(complaint.priority)}</span>
                  {isAssignedToAdmin ? (
                    <span className="px-3 py-1 rounded-lg font-bold border bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>مسندة لمدير المنطقة</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg font-bold border bg-muted/80 text-muted-foreground border-border flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>قيد معالجة المسجد</span>
                    </span>
                  )}
                  <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(complaint.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">{senderName[0] || '؟'}</div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">المرسل</p>
                  <p className="text-sm font-bold text-foreground">{senderName}</p>
                  <p className="text-xs text-muted-foreground">{complaint.user?.email || complaint.email || 'لا يوجد بريد'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border"><AlertCircle className="w-4 h-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">نوع الشكوى والمسجد</p>
                  <p className="text-sm font-bold text-foreground">{getComplaintTypeLabel(complaint.complaint_type)}</p>
                  <p className="text-xs text-muted-foreground">{complaint.mosque?.name || 'المسجد التابع'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Complaint Description & Files */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> تفاصيل المشكلة والملاحظات</h3>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <p className="text-sm text-foreground leading-loose whitespace-pre-wrap">{complaint.description || 'لا يوجد وصف مفصل.'}</p>
            </div>

            {complaint.files && complaint.files.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">المرفقات ({complaint.files.length})</p>
                <div className="flex flex-wrap gap-3">
                  {complaint.files.map((file: any) => (
                    <a key={file.id} href={file.file_path} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg group cursor-pointer hover:border-primary/50 transition-all">
                      <div className="p-2 bg-card rounded-md border border-border group-hover:text-primary transition-colors"><Paperclip className="w-4 h-4" /></div>
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{file.file_name || `مرفق_${file.id}`}</p>
                        <p className="text-[10px] text-muted-foreground">{file.file_type || 'ملف'}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Status Logs Thread (سجل_الحالات) */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> سجل التحديثات والملاحظات
            </h3>

            <div className="space-y-4">
              {complaint.admin_notes && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20">م</div>
                  <div className="flex-1 bg-muted/60 p-4 rounded-xl border border-border">
                    <p className="text-xs font-bold text-foreground mb-1">ملاحظات الإدارة الرئيسية</p>
                    <p className="text-xs text-foreground/90 leading-relaxed">{complaint.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Status Logs List */}
              {complaint.status_logs && complaint.status_logs.length > 0 ? (
                complaint.status_logs.map((log: any, idx: number) => {
                  const logStatusKey = log.new_status || log.status || log.old_status || 'pending';
                  const statusText = getStatusLabel(logStatusKey);
                  const userName = log.user?.name || 'مدير النظام';

                  return (
                    <div key={log.id || idx} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20 mt-1">
                        {userName[0] || 'إ'}
                      </div>
                      <div className="flex-1 bg-muted/50 p-4 rounded-xl border border-border space-y-2">
                        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-border/50 pb-2">
                          <span className="text-xs font-bold text-foreground">{userName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{formatDate(log.created_at || log.updated_at)}</span>
                        </div>

                        {/* Explicit Status Display */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs font-bold text-muted-foreground">الحالة:</span>
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getStatusBadgeStyles(logStatusKey)}`}>
                            {statusText}
                          </span>
                        </div>

                        {/* Note Below Status */}
                        <div className="pt-1">
                          <span className="text-[11px] font-bold text-muted-foreground block mb-1">الملاحظة / الإجراء المتخذ:</span>
                          <div className="p-3 bg-card rounded-lg border border-border/70 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                            {log.note && log.note.trim() ? log.note : <span className="text-muted-foreground italic">لا توجد ملاحظة مدخلة في هذا التحديث</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : !complaint.admin_notes && (
                <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
                  لا توجد تحديثات سابقة مسجلة على هذه الشكوى بعد.
                </p>
              )}
            </div>

            {/* Quick Add Note Input */}
            <div className="flex gap-3 items-end pt-4 border-t border-border">
              <div className="flex-1">
                <textarea rows={2} value={newNote} onChange={(e) => setNewNote(e.target.value)}
                  placeholder="أضف استفساراً أو ملاحظة سريعة للإدارة حول الشكوى..."
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs resize-none text-foreground placeholder:text-muted-foreground" />
              </div>
              <button onClick={submitNote} disabled={updatingStatus}
                className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0 h-11 flex items-center justify-center disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Column — Status Management */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-black text-foreground">متابعة حالة الشكوى</h3>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusBadgeStyles(currentStatus)}`}>
                {getStatusLabel(currentStatus)}
              </span>
            </div>

            {/* Read-Only Timeline Pipeline */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">مراحل معالجة الشكوى</p>
              <div className="relative mb-6">
                <div className="absolute top-4 right-4 left-4 h-0.5 bg-border" />
                <div className="absolute top-4 right-4 h-0.5 bg-gradient-to-l from-emerald-500 via-amber-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${PIPELINE_IDX(currentStatus) >= 0 ? (PIPELINE_IDX(currentStatus) / (PIPELINE.length - 1)) * 100 : 0}%` }} />
                <div className="relative flex justify-between">
                  {PIPELINE.map((step, idx) => {
                    const currentIdx = PIPELINE_IDX(currentStatus);
                    const isDone = currentIdx > idx;
                    const isActive = currentIdx === idx;
                    return (
                      <div key={step.value} className="flex flex-col items-center gap-2">
                        <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isActive ? `${step.glow} border-transparent text-white shadow-lg ring-4 ${step.ring} scale-110`
                            : isDone ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                            : 'bg-card border-border text-muted-foreground'
                        }`}>
                          {isDone ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <span className={`text-[10px] font-black ${isActive ? 'text-white' : 'text-muted-foreground'}`}>{idx + 1}</span>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold text-center leading-tight max-w-[56px] ${isActive ? step.color : isDone ? 'text-emerald-500' : 'text-muted-foreground'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Interactive Action Buttons for Status Update */}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">إجراءات تغيير الحالة</p>

              {!canTakeAction ? (
                isMosqueManager && isAssignedToAdmin ? (
                  /* When complaint is assigned to Super Admin and viewer is Mosque Manager */
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center text-xs font-bold text-emerald-800 dark:text-emerald-200 space-y-1.5 font-['Cairo']">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-black">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>الشكوى مسندة لمدير المنطقة (السوبر أدمن)</span>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                      تم رفع هذه الشكوى وهي قيد المتابعة والمعالجة من قبل إدارة المنطقة.
                    </p>
                  </div>
                ) : (
                  /* When assigned_admin_id is null and user is Super Admin: Only handled by Mosque Manager */
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>تعالج عند مدير المسجد فقط (لم تُرفع للمنطقة)</span>
                  </div>
                )
              ) : (
                /* Active Status Update Pipeline when canTakeAction is true */
                <>
                  {/* Case 1: Pending (جديدة) */}
                  {(currentStatus === 'pending' || (currentStatus as string) === 'new') && (
                    <div className="space-y-2.5">
                      <button
                        onClick={() => openStatusModal('in_progress')}
                        disabled={updatingStatus}
                        className="w-full flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>تحويل إلى (قيد المعالجة)</span>
                        </div>
                      </button>

                      <button
                        onClick={() => openStatusModal('canceled')}
                        disabled={updatingStatus}
                        className="w-full flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Archive className="w-4 h-4 text-red-500" />
                          <span>إغلاق الشكوى</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Case 2: In Progress (قيد المعالجة) */}
                  {(currentStatus === 'in_progress' || (currentStatus as string) === 'review') && (
                    <div className="space-y-2.5">
                      <button
                        onClick={() => openStatusModal('resolved')}
                        disabled={updatingStatus}
                        className="w-full flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>تحديد الشكوى كـ (تم الحل)</span>
                        </div>
                      </button>

                      <button
                        onClick={() => openStatusModal('canceled')}
                        disabled={updatingStatus}
                        className="w-full flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Archive className="w-4 h-4 text-red-500" />
                          <span>إغلاق الشكوى</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Case 3: Terminal Status (تم الحل / مغلقة) */}
                  {(currentStatus === 'resolved' || currentStatus === 'canceled' || (currentStatus as string) === 'closed') && (
                    <div className={`p-4 rounded-xl border text-xs font-bold space-y-1.5 ${
                      currentStatus === 'resolved'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
                    }`}>
                      <div className="flex items-center gap-2">
                        {currentStatus === 'resolved' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Archive className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        <span>
                          {currentStatus === 'resolved'
                            ? 'تم إكمال الشكوى وتحديدها كمحلولة بنجاح (حالة نهائية).'
                            : 'تم إغلاق هذه الشكوى نهائياً (حالة نهائية).'}
                        </span>
                      </div>
                      <p className="text-[10px] opacity-80 leading-relaxed font-normal">
                        لا يمكن التراجع أو تغيير الحالة بعد اكتمال أو إغلاق الشكوى.
                      </p>
                    </div>
                  )}

                  {/* Assign to Super Admin (Mosque Manager Role Action) */}
                  {isMosqueManager && !isAssignedToAdmin && (
                    <div className="pt-2 border-t border-border/70">
                      <button
                        onClick={() => setShowAssignModal(true)}
                        disabled={updatingStatus}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        <span>رفع الشكوى لمدير المنطقة</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Status Update Modal */}
      {targetStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 text-right space-y-4 font-['Cairo']">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                تحديث حالة الشكوى
              </h3>
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => setTargetStatusModal(null)} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">الحالة الجديدة المطلوبة:</span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getStatusBadgeStyles(targetStatusModal)}`}>
                  {getStatusLabel(targetStatusModal)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  ما الإجراء أو الملاحظة التي تم اتخاذها؟ <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={modalActionNote}
                  onChange={(e) => setModalActionNote(e.target.value)}
                  placeholder="أدخل التفاصيل والإجراءات المتخذة لحل أو متابعة الشكوى..."
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setTargetStatusModal(null)}
                disabled={updatingStatus}
                className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl hover:bg-muted/80 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={updatingStatus}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
              >
                {updatingStatus && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>حفظ وتحديث الحالة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Assign Complaint to Super Admin Modal (assignComplaintToAdmin) */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 text-right space-y-4 font-['Cairo']">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                رفع الشكوى لمدير المنطقة
              </h3>
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => setShowAssignModal(false)} />
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 leading-relaxed">
                سيتم رفع الشكوى وإسنادها تلقائياً إلى مدير المنطقة (السوبر أدمن) للمتابعة والتدخل المباشر.
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  سبب الرفع أو ملاحظة موجهة لمدير المنطقة (اختياري)
                </label>
                <textarea
                  rows={3}
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="أدخل سبب تحويل الشكوى أو طلب المتابعة الخاصة..."
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setShowAssignModal(false)}
                disabled={updatingStatus}
                className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl hover:bg-muted/80 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmAssignToAdmin}
                disabled={updatingStatus}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
              >
                {updatingStatus && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>إرسال ورفع الشكوى</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
