'use client';
import React, { useState, useMemo } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  CheckCircle2, Clock, Plus, Calendar, Filter,
  Sparkles, Wrench, Users, BookOpen, Star, 
  AlertCircle, ChevronLeft, ChevronRight, CheckSquare, Circle,
  X, Trash2, Send, Check, LayoutGrid, ListTodo
} from 'lucide-react';

// --- Types ---
type TaskCategory = 'prayer' | 'cleaning' | 'maintenance' | 'event' | 'admin';
type TaskStatus   = 'todo' | 'done' | 'overdue';

interface Task {
  id: string;
  title: string;
  time?: string;
  category: TaskCategory;
  status: TaskStatus;
  dayOffset: number; // 0 = today, 1 = tomorrow, etc.
}

// --- Initial Mock Data ---
const INITIAL_TASKS: Task[] = [
  { id: '1',  title: 'تأكيد جاهزية المسجد وصلاة الفجر',      time: '04:15', category: 'prayer',      status: 'done',    dayOffset: 0 },
  { id: '2',  title: 'تنظيف السجاد وتعطير المصلى الرئيسي',     time: '06:00', category: 'cleaning',    status: 'done',    dayOffset: 0 },
  { id: '3',  title: 'فتح المكتبة الإسلامية وتأمين المراجع',     time: '09:00', category: 'admin',       status: 'todo',    dayOffset: 0 },
  { id: '4',  title: 'متابعة إصلاح تسريب دورات المياه',         time: '10:00', category: 'maintenance', status: 'todo',    dayOffset: 0 },
  { id: '5',  title: 'استقبال الشيخ الضيف وتجهيز درس الظهر',    time: '12:00', category: 'event',       status: 'todo',    dayOffset: 0 },
  { id: '6',  title: 'تحضير وطباعة ملخص خطبة الجمعة',          time: '13:30', category: 'admin',       status: 'todo',    dayOffset: 0 },
  { id: '7',  title: 'مراجعة تقارير التبرعات وصندوق الصدقات',   time: '15:00', category: 'admin',       status: 'overdue', dayOffset: 0 },
  { id: '8',  title: 'إعداد المسجد لحلقات تحفيظ القرآن الكريم', time: '16:00', category: 'prayer',      status: 'todo',    dayOffset: 0 },

  { id: '9',  title: 'صيانة دورية لشاشات وأجهزة الصوت',       time: '09:00', category: 'maintenance', status: 'todo',    dayOffset: 1 },
  { id: '10', title: 'اجتماع مجلس إدارة المسجد',              time: '11:00', category: 'event',       status: 'todo',    dayOffset: 1 },
  { id: '11', title: 'استلام دفعة مصاحف جديدة',              time: '14:00', category: 'admin',       status: 'todo',    dayOffset: 1 },

  { id: '12', title: 'حفل ختم القرآن الكريم',                  time: '20:00', category: 'event',       status: 'todo',    dayOffset: 2 },
  { id: '13', title: 'تنظيف عام للمواقف والساحة الخارجية',      time: '08:00', category: 'cleaning',    status: 'todo',    dayOffset: 2 },
];

const DAYS_LABELS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_LABELS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  prayer:      { label: 'صلاة وعبادة',  icon: Star,        bg: 'bg-emerald-500/10',  text: 'text-emerald-600', border: 'border-emerald-500/20' },
  cleaning:    { label: 'نظافة',        icon: Sparkles,    bg: 'bg-blue-500/10',     text: 'text-blue-500',    border: 'border-blue-500/20'    },
  maintenance: { label: 'صيانة',        icon: Wrench,      bg: 'bg-amber-500/10',    text: 'text-amber-500',   border: 'border-amber-500/20'   },
  event:       { label: 'فعالية',       icon: Users,       bg: 'bg-violet-500/10',   text: 'text-violet-500',  border: 'border-violet-500/20'  },
  admin:       { label: 'إداري',        icon: BookOpen,    bg: 'bg-slate-500/10',    text: 'text-slate-500',   border: 'border-slate-500/20'   },
};

const DAY_LABEL = (offset: number) => {
  if (offset === 0) return 'اليوم';
  if (offset === 1) return 'غداً';
  const now = new Date();
  now.setDate(now.getDate() + offset);
  return `${DAYS_LABELS[now.getDay()]} ${now.getDate()} ${MONTHS_LABELS[now.getMonth()]}`;
};

export function MosqueTasksSection() {
  const today = useMemo(() => new Date(), []);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeDayOffset, setActiveDayOffset] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'done'>('all');
  
  // Quick inline add task inputs
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<TaskCategory>('prayer');
  const [quickTime, setQuickTime] = useState('10:00');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick Add Function
  const handleAddQuickTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask: Task = {
      id: String(Date.now()),
      title: quickTitle.trim(),
      time: quickTime,
      category: quickCategory,
      status: 'todo',
      dayOffset: activeDayOffset,
    };

    setTasks(prev => [newTask, ...prev]);
    setQuickTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Filter tasks for active view
  const currentDayTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.dayOffset !== activeDayOffset) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (statusFilter === 'todo' && t.status === 'done') return false;
      if (statusFilter === 'done' && t.status !== 'done') return false;
      return true;
    });
  }, [tasks, activeDayOffset, categoryFilter, statusFilter]);

  // Today Stats
  const todayTasks = tasks.filter(t => t.dayOffset === activeDayOffset);
  const doneCount = todayTasks.filter(t => t.status === 'done').length;
  const totalCount = todayTasks.length;
  const progressPercent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="مهام المسجد"
        description="صفحة بسيطة وسلسة لمدير المسجد لمتابعة وتنفيذ المهام اليومية بسهولة."
        breadcrumbs={[
          { label: "الإدارة التشغيلية" },
          { label: "مهام المسجد", active: true }
        ]}
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> إضافة مهمة مفصلة
          </button>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-6">

        {/* ── SECTION 1: Clean Day Selector & Stats Card ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Day Navigation Tabs */}
          <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-primary" /> اختر اليوم للمتابعة
              </h3>
              <span className="text-xs font-bold text-muted-foreground">
                {DAYS_LABELS[today.getDay()]} {today.getDate()} {MONTHS_LABELS[today.getMonth()]}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {[
                { offset: 0, label: 'اليوم' },
                { offset: 1, label: 'غداً' },
                { offset: 2, label: 'بعد غد' },
                { offset: 3, label: 'الجمعة' },
                { offset: 4, label: 'الأسبوع القادم' },
              ].map(d => {
                const isSelected = activeDayOffset === d.offset;
                const count = tasks.filter(t => t.dayOffset === d.offset).length;
                return (
                  <button
                    key={d.offset}
                    onClick={() => setActiveDayOffset(d.offset)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 ring-2 ring-primary/20'
                        : 'bg-muted/60 border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-xs font-black">{d.label}</span>
                    <span className={`text-[10px] mt-1 font-bold px-2 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-card text-muted-foreground border border-border'
                    }`}>
                      {count} مهام
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean Progress Summary */}
          <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-muted-foreground">إنجاز مهام {DAY_LABEL(activeDayOffset)}</p>
                <h4 className="text-2xl font-black text-foreground mt-0.5">{doneCount} من {totalCount} مكتملة</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-black text-sm">
                {progressPercent}%
              </div>
            </div>

            <div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-l from-emerald-500 to-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── SECTION 2: Simple Inline Task Add Bar ── */}
        <form onSubmit={handleAddQuickTask} className="bg-card border border-primary/30 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="اكتب اسم المهمة الجديدة هنا واضغط Enter (مثال: تأكيد تعقيم المصلى، تشغيل المكيفات)..." 
              className="w-full px-4 py-3 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs font-bold outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value as TaskCategory)}
              className="px-3 py-3 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground outline-none cursor-pointer"
            >
              {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map(catKey => (
                <option key={catKey} value={catKey}>
                  {CATEGORY_CONFIG[catKey].label}
                </option>
              ))}
            </select>

            <button 
              type="submit"
              disabled={!quickTitle.trim()}
              className="flex items-center gap-1.5 px-5 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فورية</span>
            </button>
          </div>
        </form>

        {/* ── SECTION 3: Filter Pills Bar & Task Cards ── */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  categoryFilter === 'all' ? 'bg-primary text-white border-transparent shadow-sm' : 'bg-muted/60 border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                الكل ({todayTasks.length})
              </button>
              {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map(catKey => {
                const c = CATEGORY_CONFIG[catKey];
                const count = todayTasks.filter(t => t.category === catKey).length;
                const isSelected = categoryFilter === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => setCategoryFilter(catKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected ? `${c.bg} ${c.text} ${c.border}` : 'bg-muted/60 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {c.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
              {[
                { id: 'all', label: 'الجميع' },
                { id: 'todo', label: 'المتبقية' },
                { id: 'done', label: 'المكتملة' },
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

          </div>

          {/* Task Items List */}
          <div className="space-y-2.5">
            {currentDayTasks.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-xs font-bold">لا توجد مهام مسجلة لهذا اليوم بنفس التصنيف المحدد.</p>
              </div>
            ) : (
              currentDayTasks.map(task => {
                const cat = CATEGORY_CONFIG[task.category];
                const CatIcon = cat.icon;
                const isDone = task.status === 'done';

                return (
                  <div 
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all group ${
                      isDone 
                        ? 'bg-muted/30 border-transparent opacity-60' 
                        : 'bg-card border-border hover:border-primary/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Checkbox Toggle */}
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="shrink-0 text-muted-foreground hover:text-emerald-500 transition-colors focus:outline-none"
                      >
                        {isDone ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg border-2 border-border hover:border-emerald-500 transition-colors" />
                        )}
                      </button>

                      {/* Category Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cat.bg} ${cat.border}`}>
                        <CatIcon className={`w-4 h-4 ${cat.text}`} />
                      </div>

                      {/* Title & Time */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs md:text-sm font-bold truncate ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        {task.time && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {task.time}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border ${cat.bg} ${cat.text} ${cat.border} hidden sm:inline`}>
                        {cat.label}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="حذف المهمة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Lightweight Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground">إضافة مهمة جديدة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddQuickTask(); setIsModalOpen(false); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">اسم المهمة</label>
                <input 
                  type="text" 
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="مثال: فحص التكييف، تجهيز الكتب..." 
                  required
                  className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">التصنيف</label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground"
                >
                  {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map(catKey => (
                    <option key={catKey} value={catKey}>
                      {CATEGORY_CONFIG[catKey].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-muted rounded-xl text-xs font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
