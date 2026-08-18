import React, { useState } from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  CheckCircle2, Clock, AlertTriangle, Printer, Archive,
  MapPin, User, Activity, MessageSquare, Send, Paperclip, Wrench,
  Calendar, FileText, RefreshCw, AlertCircle, Zap, Droplets, Hammer, Sparkles, ShieldCheck,
  Pencil, Trash2, X
} from 'lucide-react';
import { useMaintenanceTaskDetails, MaintenanceStatusKey } from '../../hooks/useMaintenanceTaskDetails';

// ── Helpers ──────────────────────────────────────────────────────────────────

const PIPELINE: { value: MaintenanceStatusKey; label: string; glow: string; ring: string; color: string }[] = [
  { value: 'pending', label: 'قيد الانتظار', color: 'text-blue-500', glow: 'bg-blue-500', ring: 'ring-blue-500/40' },
  { value: 'in_progress', label: 'قيد التنفيذ', color: 'text-amber-500', glow: 'bg-amber-500', ring: 'ring-amber-500/40' },
  { value: 'completed', label: 'مكتملة', color: 'text-emerald-500', glow: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
];
const PIPELINE_IDX = (s: MaintenanceStatusKey) => PIPELINE.findIndex(p => p.value === s);

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'critical': case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20 font-black';
    case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'low': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'critical': case 'urgent': return 'حرجة (عاجلة جداً)';
    case 'high': return 'أولوية عالية';
    case 'medium': return 'أولوية متوسطة';
    case 'low': return 'أولوية عادية';
    default: return priority || 'عادية';
  }
};

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'قيد الانتظار';
    case 'in_progress': return 'جاري التنفيذ';
    case 'completed': return 'مكتملة';
    case 'cancelled': return 'ملغاة';
    default: return status;
  }
};

const getCategoryInfo = (cat?: string) => {
  switch (cat) {
    case 'electrical': return { label: 'أعطال كهربائية', Icon: Zap };
    case 'plumbing': return { label: 'سباكة وتمديدات', Icon: Droplets };
    case 'carpentry': return { label: 'نجارة وأثاث', Icon: Hammer };
    case 'cleaning': return { label: 'نظافة وعناية', Icon: Sparkles };
    default: return { label: cat || 'عام', Icon: Wrench };
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

interface MaintenanceTaskDetailsSectionProps {
  taskId: string;
  onBack: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string | number) => void;
  refreshKey?: number;
}

export function MaintenanceTaskDetailsSection({ taskId, onBack, onEdit, onDelete, refreshKey }: MaintenanceTaskDetailsSectionProps) {

  const {
    task,
    trackingInfo,
    loading,
    error,
    currentStatus,
    fetchDetails,
    newNote,
    setNewNote,
    submitNote,
    handleProcessAdminStatus,
    updatingStatus,
    isSuperAdmin,
  } = useMaintenanceTaskDetails(taskId, refreshKey);

  // Status Change Dialog State (معالجة طلب الصيانة - admin.maintenance.process)
  const [targetStatusModal, setTargetStatusModal] = useState<MaintenanceStatusKey | null>(null);
  const [modalActionNote, setModalActionNote] = useState('');

  const openStatusModal = (status: MaintenanceStatusKey) => {
    setTargetStatusModal(status);
    setModalActionNote('');
  };

  const confirmStatusUpdate = async () => {
    if (!targetStatusModal) return;
    if (targetStatusModal === 'cancelled' && !modalActionNote.trim()) {
      alert('ملاحظة الإلغاء إلزامية عند إلغاء طلب الصيانة.');
      return;
    }
    await handleProcessAdminStatus(targetStatusModal as any, modalActionNote);
    setTargetStatusModal(null);
    setModalActionNote('');
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`طلب صيانة #${taskId}`} onBack={onBack} />
        <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
              <div className="h-8 w-2/3 rounded-xl bg-muted animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="h-7 w-24 rounded-lg bg-muted animate-pulse" />
                <div className="h-7 w-24 rounded-lg bg-muted animate-pulse" />
                <div className="h-5 w-32 rounded-lg bg-muted animate-pulse opacity-70" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="h-14 rounded-xl bg-muted animate-pulse" />
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

  if (error || !task) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`طلب الصيانة ${taskId}`} onBack={onBack} />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className="text-lg font-bold text-foreground">{error || 'الطلب غير موجود'}</h3>
          <button onClick={fetchDetails} className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  const { label: catLabel, Icon: CatIcon } = getCategoryInfo(task.category);
  const taskNumber = task.maintenance_number || `MR-${task.id}`;

  // Extract requested_by name safely
  const requestedByName = typeof task.requested_by === 'object' && (task.requested_by as any)?.name
    ? (task.requested_by as any).name
    : (typeof task.requested_by === 'string' && task.requested_by ? task.requested_by : 'Ahmed Hassan');

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title={`طلب صيانة: ${taskNumber}`}
        description="عرض تفاصيل طلب الصيانة وتتبع حالته من قبل إدارة المنطقة."
        onBack={onBack}
        breadcrumbs={[{ label: 'مهام الصيانة' }, { label: 'تفاصيل الطلب', active: true }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm"
              title="طباعة تفاصيل الطلب"
            >
              <Printer className="w-4 h-4 text-muted-foreground" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {!isSuperAdmin && onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                title="تعديل طلب الصيانة"
              >
                <Pencil className="w-4 h-4" />
                <span>تعديل الطلب</span>
              </button>
            )}

            {!isSuperAdmin && onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                title="حذف طلب الصيانة"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الطلب</span>
              </button>
            )}
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Main Column */}
        <div className="xl:col-span-8 space-y-6">

          {/* Task Header */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">{task.title}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg font-bold border text-sm ${getStatusBadgeStyles(currentStatus)}`}>{getStatusLabel(currentStatus)}</span>
                  <span className={`px-3 py-1 rounded-lg font-bold border text-sm ${getPriorityStyles(task.priority)}`}>{getPriorityLabel(task.priority)}</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(task.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20"><CatIcon className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">التصنيف</p>
                  <p className="text-sm font-bold text-foreground">{catLabel}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border"><MapPin className="w-5 h-5 text-muted-foreground" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">الموقع / المسجد</p>
                  <p className="text-sm font-bold text-foreground">{task.mosque?.name || 'المسجد الرئيسي'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border"><User className="w-5 h-5 text-muted-foreground" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">مقدم الطلب</p>
                  <p className="text-sm font-bold text-foreground">{requestedByName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Task Description */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> وصف المشكلة والتفاصيل</h3>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <p className="text-sm text-foreground leading-loose whitespace-pre-wrap">{task.description || 'لا يوجد وصف مفصل.'}</p>
            </div>
            {task.files && task.files.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">المرفقات ({task.files.length})</p>
                <div className="flex flex-wrap gap-3">
                  {task.files.map((file: any) => (
                    <a key={file.id} href={file.file_path} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg hover:border-primary/50 transition-all group">
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

          {/* Enhanced Status Logs & Notes Thread (سجل_التحديثات كما في الشكاوي) */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> سجل التحديثات والملاحظات
            </h3>

            <div className="space-y-4">
              {/* Admin / Initial Notes if present */}
              {task.notes && task.notes.trim() && (
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/20 mt-1">م</div>
                  <div className="flex-1 bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-1">
                    <p className="text-xs font-bold text-amber-600">ملاحظات الطلب الأولية</p>
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </div>
              )}

              {/* Status Logs List */}
              {(() => {
                const rawTask: any = task;
                const logsList = (rawTask.status_logs && rawTask.status_logs.length > 0)
                  ? rawTask.status_logs
                  : (rawTask.logs || rawTask.history || trackingInfo?.status_logs || trackingInfo?.logs || trackingInfo?.history || []);

                if (logsList.length === 0 && (!task.notes || !task.notes.trim())) {
                  return (
                    <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
                      لا توجد تحديثات مسجلة على طلب الصيانة هذا بعد.
                    </p>
                  );
                }

                return logsList.map((log: any, idx: number) => {
                  const logStatusKey = log.new_status || log.status || log.old_status || 'pending';
                  const statusText = getStatusLabel(logStatusKey);
                  const userName = log.user?.name || log.created_by || 'إدارة الصيانة';
                  const logNote = log.note || log.notes || log.comment || log.description;

                  return (
                    <div key={log.id || idx} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20 mt-1">
                        {userName[0] || 'م'}
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
                            {logNote && logNote.trim() ? logNote : <span className="text-muted-foreground italic">لا توجد ملاحظة مدخلة في هذا التحديث</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Quick Add Note Input */}
            <div className="flex gap-3 items-end pt-4 border-t border-border">
              <div className="flex-1">
                <textarea rows={2} value={newNote} onChange={(e) => setNewNote(e.target.value)}
                  placeholder="أضف استفساراً أو ملاحظة سريعة حول طلب الصيانة..."
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs resize-none text-foreground placeholder:text-muted-foreground" />
              </div>
              <button onClick={submitNote} disabled={updatingStatus}
                className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0 h-11 flex items-center justify-center disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Column — Pure Tracking View (maintenance.track) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-base font-black text-foreground">تتبع الطلب </h3>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusBadgeStyles(currentStatus)}`}>{getStatusLabel(currentStatus)}</span>
            </div>


            {/* Read-Only Pipeline Tracking */}
            <div className="space-y-4 pt-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">الخط الزمني لمعالجة التذكرة</p>
              <div className="relative mb-6">
                <div className="absolute top-4 right-4 left-4 h-0.5 bg-border" />
                <div className="absolute top-4 right-4 h-0.5 bg-gradient-to-l from-emerald-500 to-primary transition-all duration-500"
                  style={{ width: `${PIPELINE_IDX(currentStatus) >= 0 ? (PIPELINE_IDX(currentStatus) / (PIPELINE.length - 1)) * 100 : 0}%` }} />
                <div className="relative flex justify-between">
                  {PIPELINE.map((step, idx) => {
                    const currentIdx = PIPELINE_IDX(currentStatus);
                    const isDone = currentIdx > idx;
                    const isActive = currentIdx === idx;
                    return (
                      <div key={step.value} className="flex flex-col items-center gap-2">
                        <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isActive ? `${step.glow} border-transparent text-white shadow-lg ring-4 ${step.ring} scale-110`
                          : isDone ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-card border-border text-muted-foreground'
                          }`}>
                          {isDone ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <span className={`text-[10px] font-black ${isActive ? 'text-white' : 'text-muted-foreground'}`}>{idx + 1}</span>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold text-center leading-tight max-w-[52px] ${isActive ? step.color : isDone ? 'text-primary' : 'text-muted-foreground'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Track Info Data */}
            {trackingInfo && (
              <div className="p-4 bg-muted/60 rounded-xl border border-border space-y-2 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">معرّف التتبع:</span>
                  <span className="text-foreground">{trackingInfo.tracking_id || trackingInfo.id || taskNumber}</span>
                </div>
                {trackingInfo.assigned_to && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الفني المكلف:</span>
                    <span className="text-foreground">{trackingInfo.assigned_to.name || trackingInfo.assigned_to}</span>
                  </div>
                )}
                {trackingInfo.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">آخر تحديث للمعالجة:</span>
                    <span className="text-foreground">{formatDate(trackingInfo.updated_at)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Action Buttons for Admin Status Update — (admin.maintenance.process) */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">معالجة الطلب (إدارة النظام / Super Admin)</p>
              </div>

              {/* Case 1: Pending (قيد الانتظار) */}
              {currentStatus === 'pending' && (
                <div className="space-y-2.5">
                  <button
                    onClick={() => openStatusModal('in_progress')}
                    disabled={updatingStatus}
                    className="w-full flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>تحويل إلى (قيد التنفيذ)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => openStatusModal('cancelled')}
                    disabled={updatingStatus}
                    className="w-full flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-red-500" />
                      <span>إلغاء طلب الصيانة</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Case 2: In Progress (قيد التنفيذ) */}
              {currentStatus === 'in_progress' && (
                <div className="space-y-2.5">
                  <button
                    onClick={() => openStatusModal('completed')}
                    disabled={updatingStatus}
                    className="w-full flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>تحديد الطلب كـ (مكتملة)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => openStatusModal('cancelled')}
                    disabled={updatingStatus}
                    className="w-full flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-red-500" />
                      <span>إلغاء طلب الصيانة</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Case 3: Terminal Status (مكتملة / ملغاة) */}
              {(currentStatus === 'completed' || currentStatus === 'cancelled') && (
                <div className={`p-4 rounded-xl border text-xs font-bold space-y-1.5 ${currentStatus === 'completed'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
                  }`}>
                  <div className="flex items-center gap-2">
                    {currentStatus === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Archive className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span>
                      {currentStatus === 'completed'
                        ? 'تم إكمال أعمال الصيانة بنجاح (حالة نهائية).'
                        : 'تم إلغاء هذا الطلب (حالة نهائية).'}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-80 leading-relaxed font-normal">
                    يمكن الاطلاع على السجل والملاحظات من قائمة التحديثات.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Interactive Process Maintenance Request Modal (مربع معالجة طلب صيانة كما في الشكاوي) */}
      {targetStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 text-right space-y-4 font-['Cairo']">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                معالجة طلب الصيانة
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
                  ملاحظات أو تفاصيل الإجراء المتخذ {targetStatusModal === 'cancelled' && <span className="text-red-500">* (مطلوبة للإلغاء)</span>}
                </label>
                <textarea
                  rows={4}
                  value={modalActionNote}
                  onChange={(e) => setModalActionNote(e.target.value)}
                  placeholder="أدخل التفاصيل والإجراءات المتخذة لمعالجة الطلب..."
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
                <span>تأكيد ومعالجة الطلب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

