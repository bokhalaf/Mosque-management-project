import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import { 
  CheckCircle2, Clock, AlertTriangle, Printer, Archive, 
  MapPin, User, Activity, MessageSquare, Send, Paperclip, Wrench,
  Calendar, FileText, CheckCircle, Info, RefreshCw, AlertCircle, Zap, Droplets, Hammer, Sparkles, ShieldCheck
} from 'lucide-react';
import { MaintenanceRepositoryImpl } from "../../data/repositories/MaintenanceRepositoryImpl";
import { MaintenanceRequestItem } from "../../domain/entities/Maintenance";

const maintenanceRepo = new MaintenanceRepositoryImpl();

interface MaintenanceTaskDetailsProps {
  taskId: string;
  onBack: () => void;
}

type StatusKey = 'pending' | 'in_progress' | 'completed' | 'cancelled';

const PIPELINE: { value: StatusKey; label: string; icon: string; color: string; glow: string; ring: string }[] = [
  { value: 'pending',     label: 'قيد الانتظار', icon: '✦', color: 'text-blue-500',    glow: 'bg-blue-500',    ring: 'ring-blue-500/40' },
  { value: 'in_progress', label: 'قيد التنفيذ', icon: '⟳', color: 'text-amber-500',   glow: 'bg-amber-500',   ring: 'ring-amber-500/40' },
  { value: 'completed',   label: 'مكتملة',       icon: '✓', color: 'text-emerald-500', glow: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
];

const PIPELINE_IDX = (s: StatusKey) => PIPELINE.findIndex(p => p.value === s);

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'critical':
    case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20 font-black';
    case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'low': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'critical':
    case 'urgent': return 'حرجة (عاجلة جداً)';
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
    case 'in_progress': return 'قيد التنفيذ';
    case 'completed': return 'مكتملة ومُنجزة';
    case 'cancelled': return 'ملغاة';
    default: return status;
  }
};

const getCategoryBadge = (cat?: string) => {
  switch (cat) {
    case 'electrical': return { label: 'أعطال كهربائية', icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    case 'plumbing': return { label: 'سباكة ومياه', icon: Droplets, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    case 'carpentry': return { label: 'نجارة وأثاث', icon: Hammer, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
    case 'cleaning': return { label: 'نظافة وعناية', icon: Sparkles, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    default: return { label: cat || 'عام', icon: Wrench, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
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

export function MaintenanceTaskDetailsSection({ taskId, onBack }: MaintenanceTaskDetailsProps) {
  const [task, setTask] = useState<MaintenanceRequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceRepo.getMaintenanceDetails(taskId);
      setTask(data);
    } catch (err: any) {
      console.error("Error fetching maintenance details:", err);
      setError(err.message || "تعذر تحميل تفاصيل طلب الصيانة");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleUpdateStatus = async (newStatus: StatusKey, noteMsg?: string) => {
    setUpdating(true);
    try {
      const updated = await maintenanceRepo.updateMaintenanceRequest(taskId, {
        status: newStatus,
        notes: noteMsg || newNote || task?.notes || undefined,
      });
      setTask(updated);
      setNewNote('');
      setResolutionNote('');
    } catch (err: any) {
      console.error("Error updating maintenance task:", err);
      alert(err.message || "حدث خطأ أثناء تحديث طلب الصيانة");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`طلب صيانة ${taskId}`} onBack={onBack} />
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-bold">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`طلب صيانة ${taskId}`} onBack={onBack} />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className="text-lg font-bold text-foreground">{error || "طلب الصيانة غير موجود"}</h3>
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

  const mNumber = task.maintenance_number || `MR-${task.id}`;
  const catBadge = getCategoryBadge(task.category);
  const CategoryIcon = catBadge.icon;
  const currentStatus = (task.status as StatusKey) || 'pending';

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title={`مهمة الصيانة ${mNumber}`}
        description="عرض تفاصيل العطل الفني، متابعة سريعة للحالة، وتوثيق سجل الصيانة."
        onBack={onBack}
        breadcrumbs={[
          { label: "العمليات التشغيلية" },
          { label: "مهام الصيانة" },
          { label: "تفاصيل المهمة", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchDetails} 
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all" 
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all" title="طباعة التقرير">
              <Printer className="w-4 h-4" />
            </button>
            {task.status !== 'completed' && (
              <button 
                onClick={() => handleUpdateStatus('completed')}
                disabled={updating}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إنجاز الصيانة</span>
              </button>
            )}
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* SECTION 1: Header Info & Badges */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-3">{task.title}</h2>
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className={`px-3 py-1 rounded-lg font-bold border ${getStatusBadgeStyles(currentStatus)}`}>
                    {getStatusLabel(currentStatus)}
                  </span>
                  <span className={`px-3 py-1 rounded-lg font-bold border ${getPriorityStyles(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                  <span className={`px-3 py-1 rounded-lg font-bold border flex items-center gap-1.5 ${catBadge.color}`}>
                    <CategoryIcon className="w-3.5 h-3.5" />
                    {catBadge.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">الموقع والمسجد</p>
                  <p className="text-sm font-bold text-foreground">{task.mosque?.name || 'المسجد الرئيسي'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">تاريخ الطلب وطالبه</p>
                  <p className="text-sm font-bold text-foreground">{task.requested_by?.name || 'مسؤول المسجد'}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(task.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Issue Description */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-primary" /> التفاصيل الفنية ووصف المشكلة
            </h3>
            <div className="p-6 bg-muted/60 rounded-xl border border-border">
              <p className="text-sm text-foreground leading-loose whitespace-pre-wrap font-medium">
                {task.description || "لا يوجد وصف مفصل."}
              </p>
            </div>
            
            {task.files && task.files.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">الملفات المرفقة ({task.files.length})</p>
                <div className="flex flex-wrap gap-3">
                  {task.files.map((file) => (
                    <a 
                      key={file.id} 
                      href={file.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-muted/60 border border-border rounded-xl group cursor-pointer hover:border-primary/50 transition-all"
                    >
                      <div className="p-2 bg-card rounded-md border border-border group-hover:text-primary transition-colors">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{file.file_name || `ملف_${file.id}`}</p>
                        <p className="text-[10px] text-muted-foreground">{file.file_type || "ملف"}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Technical Notes & Status Logs */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-primary" /> السجل الفني وتحديثات الصيانة
            </h3>
            
            <div className="space-y-4">
              {task.notes && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20">
                    م
                  </div>
                  <div className="flex-1 bg-muted/60 p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-foreground">ملاحظات الإدارة</p>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium">{task.notes}</p>
                  </div>
                </div>
              )}

              {task.status_logs && task.status_logs.length > 0 ? (
                task.status_logs.map(log => (
                  <div key={log.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0 border border-border">
                      {log.user?.name ? log.user.name[0] : 'ف'}
                    </div>
                    <div className="flex-1 bg-muted/60 p-4 rounded-xl border border-border">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold text-foreground">{log.user?.name || "فني الصيانة"}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(log.created_at)}</p>
                      </div>
                      <p className="text-xs font-bold text-primary mb-1">تحديث الحالة: {getStatusLabel(log.status)}</p>
                      {log.note && <p className="text-xs text-foreground/90 leading-relaxed font-medium">{log.note}</p>}
                    </div>
                  </div>
                ))
              ) : !task.notes && (
                <p className="text-xs text-muted-foreground text-center py-4">لا توجد ملاحظات أو تحديثات سابقة.</p>
              )}
            </div>

            {/* Add Technical Note Input */}
            <div className="flex gap-3 items-end pt-2">
              <div className="flex-1">
                <textarea 
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="أضف ملاحظة تقنية جديدة أو توثيق للصيانة..."
                  className="w-full px-4 py-3 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button 
                onClick={() => {
                  if (newNote.trim()) {
                    handleUpdateStatus(currentStatus, newNote);
                  }
                }}
                disabled={updating || !newNote.trim()}
                className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0 h-11 flex items-center justify-center disabled:opacity-50"
                title="إرسال الملاحظة"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Side Column: Interactive Pipeline & Status Widget */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Workflow Status Widget */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-foreground">حالة المهمة</h3>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusBadgeStyles(currentStatus)}`}>
                {getStatusLabel(currentStatus)}
              </span>
            </div>

            {/* Pipeline Visual Stepper */}
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
                      disabled={updating}
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
                        {isActive && (
                          <span className={`absolute inset-0 rounded-full ${step.glow} opacity-30 animate-ping`} />
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

            {/* Quick Action Status Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">تحديث سريع للحالة</p>

              <button
                disabled={updating}
                onClick={() => handleUpdateStatus('in_progress')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 ${
                  currentStatus === 'in_progress' 
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20' 
                    : 'bg-muted/60 border-border hover:border-amber-500/40 text-foreground'
                }`}
              >
                <span>بدء تنفيذ الصيانة (In Progress)</span>
                <Activity className="w-4 h-4" />
              </button>

              <button
                disabled={updating}
                onClick={() => handleUpdateStatus('completed')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 ${
                  currentStatus === 'completed' 
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20' 
                    : 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-600'
                }`}
              >
                <span>إنجاز المهمة وإغلاقها (Completed)</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                disabled={updating}
                onClick={() => handleUpdateStatus('cancelled')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 ${
                  currentStatus === 'cancelled' 
                    ? 'bg-red-500 text-white border-red-600 shadow-md shadow-red-500/20' 
                    : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10 text-red-500'
                }`}
              >
                <span>إلغاء الطلب (Cancelled)</span>
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* SLA & Governance Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>جودة واعتماد الصيانة</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
              يتم متابعة هذا الطلب آلياً عبر نظام إدارة المساجد لضمان سلامة المرافق وراحة المصلين.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
