'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  BookOpen, Sparkles, Plus, Search, RefreshCw, Terminal,
  Calendar, Clock, Award, CheckCircle2, AlertCircle, Trash2, Edit,
  ChevronRight, X, User, Tag, Layers, Star, Info, Mic, GraduationCap, Trophy
} from 'lucide-react';
import { DawahProgramRepositoryImpl } from "../../data/repositories/DawahProgramRepositoryImpl";
import {
  DawahProgram,
  ProgramSchedule,
  DawahProgramStats,
  DawahProgramType,
  DawahProgramLevel,
  DawahProgramStatus,
} from "../../domain/entities/DawahProgram";

const repository = new DawahProgramRepositoryImpl();

interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function DawahProgramsSection() {
  const [programs, setPrograms] = useState<DawahProgram[]>([]);
  const [stats, setStats] = useState<DawahProgramStats>({
    total_programs: 0,
    active_programs: 0,
    total_lectures: 0,
    total_courses: 0,
    total_competitions: 0,
    featured_count: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingProgram, setEditingProgram] = useState<DawahProgram | null>(null);
  const [managingSchedulesProgram, setManagingSchedulesProgram] = useState<DawahProgram | null>(null);
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  // Create/Edit Program Form State
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

  // New Schedule Form State
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

  const addDebugLog = (action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev.slice(0, 15),
    ]);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [programsData, statsData] = await Promise.all([
        repository.getDawahPrograms({ type: selectedType, q: searchQuery }),
        repository.getStats(),
      ]);
      setPrograms(programsData);
      setStats(statsData);
      addDebugLog(
        "GET /api/program/dawah_programs",
        "https://mms-backend-rose.vercel.app/api/program/dawah_programs",
        200,
        {
          status: true,
          message: "تم جلب البرامج بنجاح من السيرفر",
          data: programsData,
          total: programsData.length,
          stats: statsData,
        }
      );
    } catch (err: any) {
      setError(err.message || "تعذر تحميل البرامج الدعوية من السيرفر");
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    setShowCreateModal(true);
  };

  // Reset Program Form
  const handleOpenCreate = () => {
    setEditingProgram(null);
    setProgramForm({
      program_name: '',
      presenter: '',
      type: 'course',
      level: 'beginner',
      status: 'active',
      space_id: 1,
      description: '',
      is_featured: false,
    });
    setShowCreateModal(true);
  };

  // Submit Create / Edit Program
  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.program_name || !programForm.presenter) {
      alert("يرجى ملء اسم البرنامج واسم المحاضر.");
      return;
    }

    setSubmittingProgram(true);
    try {
      if (editingProgram) {
        const updated = await repository.updateDawahProgram(editingProgram.id, programForm);
        addDebugLog(
          `POST /api/program/mosques/1/dawah_programs/${editingProgram.id}`,
          `https://mms-backend-rose.vercel.app/api/program/mosques/1/dawah_programs/${editingProgram.id}`,
          200,
          { payload: programForm, response: updated }
        );
        alert("تم تحديث البرنامج الدعوي بنجاح!");
      } else {
        const created = await repository.createDawahProgram(programForm);
        addDebugLog(
          "POST /api/program/mosques/1/dawah_programs",
          "https://mms-backend-rose.vercel.app/api/program/mosques/1/dawah_programs",
          200,
          { payload: programForm, response: created }
        );
        alert("تم إنشاء البرنامج الدعوي بنجاح!");
      }

      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حفظ البرنامج الدعوي.");
    } finally {
      setSubmittingProgram(false);
    }
  };

  // Delete Program
  const handleDeleteProgram = async (id: number | string, name: string) => {
    if (!confirm(`هل أنت تأكد من حذف البرنامج الدعوي: "${name}"؟`)) return;
    try {
      await repository.deleteDawahProgram(id);
      addDebugLog(
        `DELETE /api/program/mosques/1/dawah_programs/${id}`,
        `https://mms-backend-rose.vercel.app/api/program/mosques/1/dawah_programs/${id}`,
        200,
        { deleted_id: id }
      );
      alert("تم حذف البرنامج الدعوي بنجاح.");
      loadData();
    } catch (err: any) {
      alert(err.message || "فشل حذف البرنامج.");
    }
  };

  // Add Session Schedule
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSchedulesProgram) return;

    setSubmittingSchedule(true);
    try {
      const newSchedule = await repository.addSchedule(managingSchedulesProgram.id, scheduleForm);
      addDebugLog(
        `POST /api/program/mosques/1/dawah_programs/${managingSchedulesProgram.id}/schedules`,
        `https://mms-backend-rose.vercel.app/api/program/mosques/1/dawah_programs/${managingSchedulesProgram.id}/schedules`,
        200,
        { payload: scheduleForm, response: newSchedule }
      );

      // Refresh local modal state
      const updatedProgram = await repository.getDawahProgramById(managingSchedulesProgram.id);
      if (updatedProgram) setManagingSchedulesProgram(updatedProgram);

      setScheduleForm({
        title: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '16:30',
        end_time: '18:00',
      });

      alert("تم إضافة الجلسة بنجاح!");
      loadData();
    } catch (err: any) {
      alert(err.message || "فشل إضافة الجلسة.");
    } finally {
      setSubmittingSchedule(false);
    }
  };

  // Delete Session Schedule
  const handleDeleteSchedule = async (scheduleId: number | string) => {
    if (!managingSchedulesProgram) return;
    if (!confirm("هل تريد حذف هذه الجلسة؟")) return;

    try {
      await repository.deleteSchedule(managingSchedulesProgram.id, scheduleId);
      addDebugLog(
        `DELETE /api/program/mosques/1/dawah_programs/${managingSchedulesProgram.id}/schedules/${scheduleId}`,
        `https://mms-backend-rose.vercel.app/api/program/mosques/1/dawah_programs/${managingSchedulesProgram.id}/schedules/${scheduleId}`,
        200,
        { deleted_schedule_id: scheduleId }
      );

      const updatedProgram = await repository.getDawahProgramById(managingSchedulesProgram.id);
      if (updatedProgram) setManagingSchedulesProgram(updatedProgram);
      alert("تم حذف الجلسة.");
      loadData();
    } catch (err: any) {
      alert(err.message || "فشل حذف الجلسة.");
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
              onClick={handleOpenCreate}
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
              <button onClick={() => setDebugLogs([])} className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
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

        {/* ── KPI Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي البرامج', value: stats.total_programs, Icon: BookOpen, iconStyle: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
            { label: 'المحاضرات والدروس', value: stats.total_lectures, Icon: Mic, iconStyle: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
            { label: 'الدورات العلمية', value: stats.total_courses, Icon: GraduationCap, iconStyle: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
            { label: 'المسابقات والأنشطة', value: stats.total_competitions, Icon: Trophy, iconStyle: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
          ].map(({ label, value, Icon, iconStyle }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-muted-foreground">{label}</span>
                <h3 className="text-xl font-black text-foreground">{value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${iconStyle}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar: Filter & Search ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: 'all', label: `الكل (${programs.length})` },
                { value: 'lecture', label: 'المحاضرات' },
                { value: 'course', label: 'الدورات العلمية' },
                { value: 'compition', label: 'المسابقات' },
                { value: 'other', label: 'أنشطة أخرى' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedType(value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedType === value
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم البرنامج أو المحاضر..."
                className="w-full pl-4 pr-10 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
              />
            </div>
          </div>
        </div>

        {/* ── Main Content: Dawah Programs Cards Grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-bold">جاري تحميل البرامج الدعوية من السيرفر...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <h3 className="text-sm font-bold text-foreground">{error}</h3>
            <button onClick={loadData} className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
              إعادة المحاولة
            </button>
          </div>
        ) : programs.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
            <BookOpen className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="text-base font-bold text-foreground">لا توجد برامج دعوية مطابقة</h3>
              <p className="text-xs text-muted-foreground mt-1">قم بإضافة أول برنامج دعوي للمسجد الآن.</p>
            </div>
            <button onClick={handleOpenCreate} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold">
              <Plus className="w-4 h-4" /> <span>إضافة برنامج دعوي</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(program.type)}
                      {program.is_featured && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold rounded-md">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> مُميز
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
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
                    onClick={() => setManagingSchedulesProgram(program)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-bold rounded-xl transition-all border border-border"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>إدارة الجلسات</span>
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

      {/* ── MODAL: Create / Edit Dawah Program ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="text-base">
                  {editingProgram ? 'تعديل البرنامج الدعوي' : 'إضافة برنامج دعوي جديد'}
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)}>
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
                  placeholder="مثال: دورة أحكام التلاوة والتجويد"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">اسم المحاضر / الشيخ *</label>
                <input
                  type="text" required
                  value={programForm.presenter}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, presenter: e.target.value }))}
                  placeholder="مثال: فضيلة الشيخ د. عبد الله العتيبي"
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
                    <option value="compition">مسابقة</option>
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
                <label className="block text-xs font-bold text-muted-foreground mb-1">وصف البرنامج الدعوي</label>
                <textarea
                  rows={2}
                  value={programForm.description}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="أدخل وصفاً موجزاً للبرنامج الدعوي والهدف منه..."
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
                  <span className="text-xs font-bold text-foreground">تمييز البرنامج في اللوحة الرئيسية</span>
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
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingProgram}
                  className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {submittingProgram ? 'جاري الحفظ...' : (editingProgram ? 'تحديث البرنامج' : 'حفظ البرنامج')}
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
                  المحاضر: {managingSchedulesProgram.presenter}
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
                    <div key={schedule.id} className="bg-muted/40 border border-border p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{schedule.title || 'جلسة جديدة'}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-card border border-border rounded text-muted-foreground">
                            {schedule.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>من {schedule.start_time} إلى {schedule.end_time}</span>
                          {schedule.notes && <span>• {schedule.notes}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-card border border-transparent hover:border-border transition-all"
                        title="حذف الجلسة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form to Add New Session */}
            <div className="pt-4 border-t border-border space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" />
                <span>إضافة جلسة جديدة للبرنامج</span>
              </h4>

              <form onSubmit={handleAddSchedule} className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">عنوان الجلسة / الموضوع</label>
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
                      className="w-full px-2.5 py-1.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">وقت النهاية *</label>
                    <input
                      type="time" required
                      value={scheduleForm.end_time}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, end_time: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">ملاحظات للجلسة</label>
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
                    {submittingSchedule ? 'جاري الإضافة...' : <><Plus className="w-3.5 h-3.5" /><span>إضافة الجلسة</span></>}
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
