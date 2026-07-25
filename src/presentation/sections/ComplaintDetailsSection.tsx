import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  CheckCircle2, Clock, AlertTriangle, Printer,
  Archive, FileText, Send, User, Paperclip, MessageSquare,
  Calendar, AlertCircle, Eye, RefreshCw
} from 'lucide-react';
import { ComplaintRepositoryImpl } from "../../data/repositories/ComplaintRepositoryImpl";
import { ComplaintItem } from "../../domain/entities/Complaint";

const complaintRepo = new ComplaintRepositoryImpl();

interface ComplaintDetailsSectionProps {
  complaintId: string;
  onBack: () => void;
}

// --- Status Type ---
type StatusKey = 'pending' | 'in_progress' | 'resolved' | 'canceled';

// --- Workflow Pipeline Statuses ---
const PIPELINE: { value: StatusKey; label: string; icon: string; color: string; glow: string; ring: string }[] = [
  { value: 'pending',     label: 'جديدة',        icon: '✦', color: 'text-blue-500',    glow: 'bg-blue-500',    ring: 'ring-blue-500/40' },
  { value: 'in_progress', label: 'قيد المعالجة', icon: '⟳', color: 'text-violet-500', glow: 'bg-violet-500',  ring: 'ring-violet-500/40' },
  { value: 'resolved',    label: 'تم الحل',       icon: '✓', color: 'text-emerald-500', glow: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
];

const PIPELINE_IDX = (s: StatusKey) => PIPELINE.findIndex(p => p.value === s);

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'pending':
    case 'new':         return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'in_progress':
    case 'review':      return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
    case 'resolved':    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'canceled':
    case 'closed':      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    default:            return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
    case 'new':         return 'جديدة';
    case 'in_progress':
    case 'review':      return 'قيد المعالجة';
    case 'resolved':    return 'مكتملة / تم الحل';
    case 'canceled':
    case 'closed':      return 'مغلقة';
    default:            return status;
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
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
    default: return 'عام';
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
};

export function ComplaintDetailsSection({ complaintId, onBack }: ComplaintDetailsSectionProps) {
  const [complaint, setComplaint] = useState<ComplaintItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentStatus, setCurrentStatus] = useState<StatusKey>('pending');
  const [resolutionNote, setResolutionNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Fetch Complaint Details
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintRepo.getComplaintDetails(complaintId);
      setComplaint(data);
      setCurrentStatus((data.status as StatusKey) || 'pending');
    } catch (err: any) {
      console.error("Error fetching complaint details:", err);
      setError(err.message || "تعذر تحميل تفاصيل الشكوى");
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Update Status API call
  const handleUpdateStatus = async (targetStatus: StatusKey, note?: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await complaintRepo.updateComplaintStatus(complaintId, targetStatus, note || resolutionNote);
      setComplaint(updated);
      setCurrentStatus((updated.status as StatusKey) || targetStatus);
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(err.message || "حدث خطأ أثناء تحديث حالة الشكوى");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`الشكوى ${complaintId}`} onBack={onBack} />
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-bold">جاري تحميل تفاصيل الشكوى من الـ API...</p>
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
          <h3 className="text-lg font-bold text-foreground">{error || "الشكوى غير موجودة"}</h3>
          <button 
            onClick={fetchDetails}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const senderName = complaint.is_anonymous ? 'فاعل خير (مجهول)' : (complaint.user?.name || complaint.email || 'مصلي / زائر');
  const complaintNumber = complaint.complaint_number || `CMP-${complaint.id}`;

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title={`الشكوى ${complaintNumber}`}
        description="عرض تفاصيل الشكوى، السجل الزمني، وتعديل حالتها."
        onBack={onBack}
        breadcrumbs={[
          { label: "الشكاوى والاقتراحات" },
          { label: "تفاصيل الشكوى", active: true }
        ]}
        actions={
          <div className="flex gap-2">
            <button className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:bg-muted transition-all" title="طباعة التذكرة">
              <Printer className="w-5 h-5" />
            </button>
            <button className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:bg-muted transition-all" title="أرشفة">
              <Archive className="w-5 h-5" />
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-6">

          {/* SECTION 1: Complaint Header Info */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">{complaint.title || complaint.description || "بدون عنوان"}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className={`px-3 py-1 rounded-lg font-bold border ${getStatusBadgeStyles(currentStatus)}`}>
                    {getStatusLabel(currentStatus)}
                  </span>
                  <span className={`px-3 py-1 rounded-lg font-bold border ${getPriorityStyles(complaint.priority)}`}>
                    {getPriorityLabel(complaint.priority)}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {formatDate(complaint.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Info row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {senderName[0] || '؟'}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">المرسل</p>
                  <p className="text-sm font-bold text-foreground">{senderName}</p>
                  <p className="text-xs text-muted-foreground">{complaint.user?.email || complaint.email || 'لا يوجد بريد'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">نوع الشكوى والمسجد</p>
                  <p className="text-sm font-bold text-foreground">{getComplaintTypeLabel(complaint.complaint_type)}</p>
                  <p className="text-xs text-muted-foreground">{complaint.mosque?.name || 'المسجد التابع'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Complaint Content */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> تفاصيل الشكوى
            </h3>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <p className="text-sm text-foreground leading-loose whitespace-pre-wrap">
                {complaint.description || "لا يوجد وصف مفصل."}
              </p>
            </div>

            {complaint.files && complaint.files.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">المرفقات</p>
                <div className="flex flex-wrap gap-3">
                  {complaint.files.map((file) => (
                    <a 
                      key={file.id} 
                      href={file.file_path} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg group cursor-pointer hover:border-primary/50 transition-all"
                    >
                      <div className="p-2 bg-card rounded-md border border-border group-hover:text-primary transition-colors">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {file.file_name || `مرفق_${file.id}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{file.file_type || "ملف"}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Internal / Status Logs */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> الملاحظات والتعليقات
            </h3>

            <div className="space-y-6 mb-6">
              {complaint.admin_notes && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20">
                    م
                  </div>
                  <div className="flex-1 bg-muted p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold text-foreground">ملاحظات الإدارة</p>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{complaint.admin_notes}</p>
                  </div>
                </div>
              )}

              {complaint.status_logs && complaint.status_logs.length > 0 ? (
                complaint.status_logs.map(log => (
                  <div key={log.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0 border border-border">
                      {log.user?.name ? log.user.name[0] : 'إ'}
                    </div>
                    <div className="flex-1 bg-muted p-4 rounded-xl border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-foreground">{log.user?.name || "الإدارة"}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(log.created_at)}</p>
                      </div>
                      <p className="text-xs font-bold text-primary mb-1">الحالة: {getStatusLabel(log.status)}</p>
                      {log.note && <p className="text-sm text-foreground/90 leading-relaxed">{log.note}</p>}
                    </div>
                  </div>
                ))
              ) : !complaint.admin_notes && (
                <p className="text-xs text-muted-foreground text-center py-4">لا توجد ملاحظات سابقة.</p>
              )}
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="أضف ملاحظة إضافية للشكوى..."
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button 
                onClick={() => {
                  if (newNote.trim()) {
                    handleUpdateStatus(currentStatus, newNote);
                    setNewNote('');
                  }
                }}
                disabled={updatingStatus}
                className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0 h-11 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Side Column */}
        <div className="xl:col-span-4 space-y-6">

          {/* Change Status Widget */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-foreground">حالة الشكوى</h3>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusBadgeStyles(currentStatus)}`}>
                {getStatusLabel(currentStatus)}
              </span>
            </div>

            {/* Pipeline Steps */}
            <div className="relative mb-6">
              <div className="absolute top-4 right-4 left-4 h-0.5 bg-border" />
              <div
                className="absolute top-4 right-4 h-0.5 bg-gradient-to-l from-emerald-500 to-primary transition-all duration-500"
                style={{ width: `${ PIPELINE_IDX(currentStatus) >= 0 ? (PIPELINE_IDX(currentStatus) / (PIPELINE.length - 1)) * 100 : 0 }%` }}
              />
              <div className="relative flex justify-between">
                {PIPELINE.map((step, idx) => {
                  const currentIdx = PIPELINE_IDX(currentStatus);
                  const isDone    = currentIdx > idx;
                  const isActive  = currentIdx === idx;
                  return (
                    <button
                      key={step.value}
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(step.value)}
                      className="flex flex-col items-center gap-2 group focus:outline-none disabled:opacity-50"
                    >
                      <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? `${step.glow} border-transparent text-white shadow-lg ring-4 ${step.ring} scale-110`
                          : isDone
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-card border-border text-muted-foreground group-hover:border-primary/50'
                      }`}>
                        {isDone ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className={`text-[10px] font-black transition-all ${
                            isActive ? 'text-white' : 'text-muted-foreground'
                          }`}>{idx + 1}</span>
                        )}
                      </div>
                      <span className={`text-[9px] font-bold text-center leading-tight transition-colors max-w-[52px] ${
                        isActive ? step.color : isDone ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution Note panel */}
            {currentStatus === 'resolved' && (
              <div className="mt-2 mb-4 space-y-3">
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-xs font-bold text-emerald-600">تم تحديد الشكوى كمحلولة!</p>
                </div>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  placeholder="صف الإجراء الذي تم اتخاذه لحل المشكلة..."
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm resize-none text-foreground placeholder:text-muted-foreground"
                />
                <button 
                  onClick={() => handleUpdateStatus('resolved', resolutionNote)}
                  disabled={updatingStatus}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> حفظ وإغلاق الشكوى
                </button>
              </div>
            )}

            {/* Special Actions */}
            <div className="border-t border-border pt-4 mt-2 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">إجراءات خاصة</p>

              <button
                disabled={updatingStatus}
                onClick={() => handleUpdateStatus('canceled')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-bold transition-all disabled:opacity-50 ${
                  currentStatus === 'canceled'
                    ? 'bg-slate-500 text-white border-slate-600 shadow-lg shadow-slate-500/20'
                    : 'bg-slate-500/5 border-slate-500/20 text-slate-500 hover:bg-slate-500/10'
                }`}
              >
                <Archive className="w-4 h-4" />
                <span>إغلاق / إلغاء الشكوى</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
