'use client';

import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  BookOpen, Sparkles, Plus, Search, RefreshCw, Terminal,
  Calendar, Clock, Trash2, Edit, X, User, Tag, Layers, Star, Info, Mic, GraduationCap, Trophy, Check
} from 'lucide-react';
import {
  DawahProgram,
  ProgramSchedule,
  DawahProgramType,
  DawahProgramLevel,
  DawahProgramStatus,
} from "../../domain/entities/DawahProgram";
import { useDawahPrograms } from "../hooks/useDawahPrograms";
import { useToast } from "../../app/components/ui/Toast";
import { CreateDawahProgramSection } from "./CreateDawahProgramSection";

interface DawahProgramsSectionProps {
  onNavigateToAdd?: () => void;
}

export function DawahProgramsSection({ onNavigateToAdd }: DawahProgramsSectionProps = {}) {
  const {
    programs,
    stats,
    loading,
    error,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    loadData,
    updateProgram,
    deleteProgram,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedules,
    myMosque,
    spaces,
    debugLogs,
    clearDebugLogs,
    showDebugTerminal,
    setShowDebugTerminal,
  } = useDawahPrograms();

  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Modals & Drawers
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingProgram, setEditingProgram] = useState<DawahProgram | null>(null);
  const [managingSchedulesProgram, setManagingSchedulesProgram] = useState<DawahProgram | null>(null);

  // Edit Program Form State
  const [programForm, setProgramForm] = useState<{
    program_name: string;
    presenter: string;
    type: DawahProgramType;
    level: DawahProgramLevel;
    status: DawahProgramStatus;
    space_id: number;
    description: string;
    is_featured: boolean;
  }>({
    program_name: '',
    presenter: '',
    type: 'course',
    level: 'beginner',
    status: 'active',
    space_id: 1,
    description: '',
    is_featured: false,
  });

  const [submittingProgram, setSubmittingProgram] = useState<boolean>(false);

  // Schedule Form State
  const [editingScheduleId, setEditingScheduleId] = useState<number | string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<{
    title: string;
    notes: string;
    date: string;
    start_time: string;
    end_time: string;
  }>({
    title: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '16:30',
    end_time: '18:00',
  });

  const [submittingSchedule, setSubmittingSchedule] = useState<boolean>(false);

  // Open Edit Modal
  const handleOpenEdit = (program: DawahProgram) => {
    setEditingProgram(program);
    setProgramForm({
      program_name: program.program_name,
      presenter: program.presenter,
      type: program.type,
      level: program.level,
      status: program.status,
      space_id: program.space_id || 1,
      description: program.description || '',
      is_featured: program.is_featured,
    });
    setShowEditModal(true);
  };

  // Submit Edit Program
  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    if (!programForm.program_name.trim() || !programForm.presenter.trim()) {
      showToast("يرجى ملء اسم البرنامج واسم المحاضر.", "error");
      return;
    }

    setSubmittingProgram(true);
    try {
      await updateProgram(editingProgram.id, {
        ...programForm,
        program_name: programForm.program_name.trim(),
        presenter: programForm.presenter.trim(),
        description: programForm.description.trim(),
      });
      showToast("تم تحديث البرنامج الدعوي بنجاح! 🕌", "success");
      setShowEditModal(false);
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء حفظ البرنامج الدعوي.", "error");
    } finally {
      setSubmittingProgram(false);
    }
  };

  // Delete Program
  const handleDeleteProgram = async (id: number | string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف البرنامج الدعوي: "${name}"؟`)) return;
    try {
      await deleteProgram(id);
      showToast("تم حذف البرنامج الدعوي بنجاح.", "success");
    } catch (err: any) {
      showToast(err.message || "فشل حذف البرنامج.", "error");
    }
  };

  // Open Schedules Modal & Fetch fresh sessions
  const handleOpenManageSchedules = async (program: DawahProgram) => {
    setManagingSchedulesProgram(program);
    setEditingScheduleId(null);
    setScheduleForm({
      title: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '16:30',
      end_time: '18:00',
    });

    try {
      const freshSchedules = await getSchedules(program.id);
      if (freshSchedules) {
        setManagingSchedulesProgram(prev => prev ? { ...prev, schedules: freshSchedules } : null);
      }
    } catch (e) {}
  };

  // Submit Add or Update Session Schedule
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSchedulesProgram) return;

    setSubmittingSchedule(true);
    try {
      if (editingScheduleId) {
        // Update existing schedule
        const updated = await updateSchedule(managingSchedulesProgram.id, editingScheduleId, scheduleForm);
        showToast("تم تحديث موعد الجلسة بنجاح!", "success");
        setManagingSchedulesProgram(prev => {
          if (!prev) return null;
          return {
            ...prev,
            schedules: (prev.schedules || []).map(s => String(s.id) === String(editingScheduleId) ? updated : s),
          };
        });
        setEditingScheduleId(null);
      } else {
        // Add new schedule
        const newSchedule = await addSchedule(managingSchedulesProgram.id, scheduleForm);
        showToast("تم إضافة الجلسة بنجاح!", "success");
        setManagingSchedulesProgram(prev => {
          if (!prev) return null;
          return {
            ...prev,
            schedules: [...(prev.schedules || []), newSchedule],
          };
        });
      }

      setScheduleForm({
        title: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '16:30',
        end_time: '18:00',
      });
    } catch (err: any) {
      showToast(err.message || "فشل حفظ الجلسة.", "error");
    } finally {
      setSubmittingSchedule(false);
    }
  };

  // Start Editing a single session
  const handleStartEditSchedule = (schedule: ProgramSchedule) => {
    setEditingScheduleId(schedule.id);
    setScheduleForm({
      title: schedule.title || '',
      notes: schedule.notes || '',
      date: schedule.date,
      start_time: schedule.start_time.substring(0, 5),
      end_time: schedule.end_time.substring(0, 5),
    });
  };

  // Delete Session Schedule
  const handleDeleteSchedule = async (scheduleId: number | string) => {
    if (!managingSchedulesProgram) return;
    if (!confirm("هل تريد حذف هذه الجلسة من البرنامج؟")) return;

    try {
      await deleteSchedule(managingSchedulesProgram.id, scheduleId);
      setManagingSchedulesProgram(prev => {
        if (!prev) return null;
        return {
          ...prev,
          schedules: (prev.schedules || []).filter(s => String(s.id) !== String(scheduleId)),
        };
      });
      showToast("تم حذف الجلسة بنجاح.", "success");
    } catch (err: any) {
      showToast(err.message || "فشل حذف الجلسة.", "error");
    }
  };

  // Helper Badge Renderers
  const getTypeBadge = (type: DawahProgramType) => {
    switch (type) {
      case 'lecture':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-muted text-foreground border border-border">محاضرة</span>;
      case 'course':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-muted text-foreground border border-border">دورة علمية</span>;
      case 'compition':
      case 'competition':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-muted text-foreground border border-border">مسابقة</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-muted text-muted-foreground border border-border">نشاط آخر</span>;
    }
  };

  const getLevelBadge = (level: DawahProgramLevel) => {
    switch (level) {
      case 'beginner':
        return <span className="text-[11px] font-bold text-muted-foreground">مستوى: مبتدئ</span>;
      case 'intermediate':
        return <span className="text-[11px] font-bold text-muted-foreground">مستوى: متوسط</span>;
      case 'advanced':
        return <span className="text-[11px] font-bold text-muted-foreground">مستوى: متقدم</span>;
      default:
        return null;
    }
  };

  if (isCreating) {
    return (
      <CreateDawahProgramSection
        onBack={() => {
          setIsCreating(false);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="البرامج والأنشطة الدعوية"
        description="دليل موحد لإدارة المحاضرات، والدورات العلمية، والمسابقات بالمسجد مع جدول الجلسات المباشرة."
        breadcrumbs={[
          { label: "الأنشطة والدعوة" },
          { label: "البرامج الدعوية", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-mono font-bold transition-all"
            >
              <Terminal className="w-4 h-4" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            <button
              onClick={loadData}
              className="p-2 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (onNavigateToAdd) onNavigateToAdd();
                else setIsCreating(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة برنامج دعوي</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-6">

        {/* ── LIVE API DEBUG TERMINAL ── */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-200 font-mono text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">مراقب الـ API المباشر (Dawah Programs API Inspector)</span>
              </div>
              <button onClick={clearDebugLogs} className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
                مسح السجل
              </button>
            </div>
            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic text-[11px]">لا توجد طلبات معالجة حالياً.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto ltr text-left">
                {debugLogs.map((log, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                      <span>[{log.time}] {log.action}</span>
                      <span>HTTP {log.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{log.url}</p>
                    <pre className="text-[10px] bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── KPI Stats Grid (Unified Design System) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-[1.5rem] p-5 shadow-sm overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
                </div>
                <div className="space-y-2.5">
                  <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
                  <div className="h-4 w-28 rounded-lg bg-muted animate-pulse opacity-70" />
                </div>
              </div>
            ))
          ) : (
            [
              {
                title: 'إجمالي البرامج',
                value: stats.total_programs,
                icon: BookOpen,
                colorStyle: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                subtitle: 'كافة الأنشطة والدورات',
              },
              {
                title: 'المحاضرات والدروس',
                value: stats.total_lectures,
                icon: Mic,
                colorStyle: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                subtitle: 'دروس ولقاءات إيمانية',
              },
              {
                title: 'الدورات العلمية',
                value: stats.total_courses,
                icon: GraduationCap,
                colorStyle: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
                subtitle: 'برامج شرعية وأكاديمية',
              },
              {
                title: 'المسابقات والأنشطة',
                value: stats.total_competitions,
                icon: Trophy,
                colorStyle: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                subtitle: 'منافسات حفظ وتجويد',
              },
            ].map(({ title, value, icon: Icon, colorStyle, subtitle }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl border ${colorStyle} transition-transform duration-300 group-hover:scale-105`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                    {subtitle}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-black text-foreground tracking-tight font-mono">
                    {value}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    {title}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── FILTER & SEARCH BAR ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'course', label: 'الدورات العلمية' },
              { id: 'lecture', label: 'المحاضرات' },
              { id: 'competition', label: 'المسابقات' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedType === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن برنامج أو محاضر..."
              className="w-full pl-3 pr-10 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        {/* ── PROGRAMS GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-6 w-3/4 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h3 className="text-base font-bold text-foreground">لا توجد برامج دعوية مطابقة</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              لم يتم العثور على برامج أو أنشطة دعوية مسجلة بهذا التصنيف. يمكنك البدء بإضافة برنامج دعوي جديد.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة برنامج الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map(program => (
              <div
                key={program.id}
                className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Type & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {getTypeBadge(program.type)}
                      {program.is_featured && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>مميز</span>
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      program.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {program.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {program.program_name}
                    </h3>
                    {program.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {program.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Presenter & Level Info */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold text-foreground">{program.presenter}</span>
                    </div>
                    {getLevelBadge(program.level)}
                  </div>

                  {/* Sessions count info */}
                  <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold">عدد الجلسات:</span>
                    </div>
                    <span className="font-black text-foreground">{program.schedules?.length || 0} جلسة</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => handleOpenManageSchedules(program)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-bold rounded-xl transition-all border border-border"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>إدارة الجلسات ({program.schedules?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(program)}
                    className="p-2 bg-muted hover:bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
                    title="تعديل البرنامج"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteProgram(program.id, program.program_name)}
                    className="p-2 bg-muted hover:bg-destructive/10 border border-border text-muted-foreground hover:text-destructive rounded-xl transition-all"
                    title="حذف البرنامج"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── MODAL: Edit Dawah Program ── */}
      {showEditModal && editingProgram && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="text-base">تعديل البرنامج الدعوي</h3>
              </div>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">اسم البرنامج الدعوي *</label>
                <input
                  type="text" required
                  value={programForm.program_name}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, program_name: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">اسم المحاضر / الشيخ *</label>
                <input
                  type="text" required
                  value={programForm.presenter}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, presenter: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">نوع النشاط *</label>
                  <select
                    value={programForm.type}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, type: e.target.value as DawahProgramType }))}
                    className="w-full px-3 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  >
                    <option value="course">دورة علمية</option>
                    <option value="lecture">محاضرة</option>
                    <option value="competition">مسابقة</option>
                    <option value="other">نشاط آخر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">المستوى الفقهي/العلمي</label>
                  <select
                    value={programForm.level}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, level: e.target.value as DawahProgramLevel }))}
                    className="w-full px-3 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  >
                    <option value="beginner">مبتدئ</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">القاعة أو المصلى بالمسجد</label>
                <select
                  value={programForm.space_id}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, space_id: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                >
                  {spaces && spaces.length > 0 ? (
                    spaces.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.capacity ? `(${s.capacity} شخص)` : ''}
                      </option>
                    ))
                  ) : (
                    <option value={1}>المصلى الرئيسي</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">وصف البرنامج الدعوي</label>
                <textarea
                  rows={2}
                  value={programForm.description}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={programForm.is_featured}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-xs font-bold text-foreground">تمييز البرنامج في اللوحة الرئيسية ⭐</span>
                </label>

                <select
                  value={programForm.status}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, status: e.target.value as DawahProgramStatus }))}
                  className="px-2.5 py-1 bg-card border border-border rounded-lg text-xs font-bold outline-none text-foreground"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingProgram}
                  className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {submittingProgram ? 'جاري الحفظ...' : 'تحديث البرنامج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Manage Program Schedules ── */}
      {managingSchedulesProgram && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full shadow-xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  جدول جلسات: {managingSchedulesProgram.program_name}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  المحاضر: {managingSchedulesProgram.presenter} {myMosque?.name ? `• ${myMosque.name}` : ''}
                </p>
              </div>
              <button onClick={() => setManagingSchedulesProgram(null)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {/* List of Existing Sessions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground">الجلسات المجدولة حالياً</h4>
              {(!managingSchedulesProgram.schedules || managingSchedulesProgram.schedules.length === 0) ? (
                <div className="bg-muted/40 border border-border rounded-xl p-4 text-center text-xs text-muted-foreground">
                  لا توجد جلسات مجدولة حتى الآن. استخدم النموذج أدناه لإضافة أول جلسة.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {managingSchedulesProgram.schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-muted/40 border border-border p-3 rounded-xl flex items-center justify-between text-xs hover:border-border/80 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{schedule.title || 'جلسة تدريبية'}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-card border border-border rounded text-muted-foreground font-mono">
                            {schedule.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                          <Clock className="w-3 h-3 text-primary" />
                          <span className="font-mono">من {schedule.start_time.substring(0, 5)} إلى {schedule.end_time.substring(0, 5)}</span>
                          {schedule.notes && <span>• {schedule.notes}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditSchedule(schedule)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-card border border-transparent hover:border-border transition-all"
                          title="تعديل موعد الجلسة"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-card border border-transparent hover:border-border transition-all"
                          title="حذف الجلسة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form to Add or Edit Session */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  {editingScheduleId ? <Edit className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
                  <span>{editingScheduleId ? 'تعديل موعد الجلسة المحددة' : 'إضافة جلسة جديدة للبرنامج'}</span>
                </h4>
                {editingScheduleId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingScheduleId(null);
                      setScheduleForm({
                        title: '',
                        notes: '',
                        date: new Date().toISOString().split('T')[0],
                        start_time: '16:30',
                        end_time: '18:00',
                      });
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveSchedule} className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">عنوان الجلسة / الموضوع (اختياري)</label>
                  <input
                    type="text"
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="مثال: الجلسة الأولى - مقدمة التجويد"
                    className="w-full px-3 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">التاريخ *</label>
                    <input
                      type="date" required
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">وقت البداية *</label>
                    <input
                      type="time" required
                      value={scheduleForm.start_time}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, start_time: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">وقت النهاية *</label>
                    <input
                      type="time" required
                      value={scheduleForm.end_time}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, end_time: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">ملاحظات للجلسة (اختياري)</label>
                  <input
                    type="text"
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="مثال: يرجى إحضار مصحف التجويد"
                    className="w-full px-3 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={submittingSchedule}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {submittingSchedule
                      ? 'جاري المعالجة...'
                      : editingScheduleId
                      ? <><Check className="w-3.5 h-3.5" /><span>تحديث الجلسة</span></>
                      : <><Plus className="w-3.5 h-3.5" /><span>إضافة الجلسة</span></>}
                  </button>
                </div>
              </form>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setManagingSchedulesProgram(null)}
                className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
