'use client';
import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  CheckCircle2, Clock, Plus, Calendar, Filter,
  Sparkles, Wrench, Users, BookOpen, Star, 
  AlertCircle, ChevronLeft, ChevronRight, CheckSquare, Circle
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

// --- Mock Data ---
const TASKS: Task[] = [
  { id: '1',  title: 'تأكيد جاهزية المسجد لصلاة الفجر',      time: '04:15', category: 'prayer',      status: 'done',    dayOffset: 0 },
  { id: '2',  title: 'تنظيف السجاد وتعطير المسجد',            time: '06:00', category: 'cleaning',    status: 'done',    dayOffset: 0 },
  { id: '3',  title: 'فتح المكتبة الإسلامية للمراجعين',        time: '09:00', category: 'admin',       status: 'todo',    dayOffset: 0 },
  { id: '4',  title: 'متابعة إصلاح تسريب دورات المياه',        time: '10:00', category: 'maintenance', status: 'todo',    dayOffset: 0 },
  { id: '5',  title: 'استقبال الشيخ الضيف وتجهيز درس الظهر',  time: '12:00', category: 'event',       status: 'todo',    dayOffset: 0 },
  { id: '6',  title: 'تحضير نشرة خطبة الجمعة',                time: '13:30', category: 'admin',       status: 'todo',    dayOffset: 0 },
  { id: '7',  title: 'مراجعة تقارير التبرعات الأسبوعية',       time: '15:00', category: 'admin',       status: 'overdue', dayOffset: 0 },
  { id: '8',  title: 'إعداد المسجد لحلقات تحفيظ القرآن',       time: '16:00', category: 'prayer',      status: 'todo',    dayOffset: 0 },

  { id: '9',  title: 'صيانة دورية للمكيفات المركزية',          time: '09:00', category: 'maintenance', status: 'todo',    dayOffset: 1 },
  { id: '10', title: 'اجتماع مجلس إدارة المسجد',               time: '11:00', category: 'event',       status: 'todo',    dayOffset: 1 },
  { id: '11', title: 'استلام دفعة مصاحف جديدة',               time: '14:00', category: 'admin',       status: 'todo',    dayOffset: 1 },

  { id: '12', title: 'حفل ختم القرآن الكريم',                 time: '20:00', category: 'event',       status: 'todo',    dayOffset: 2 },
  { id: '13', title: 'تنظيف عام لمواقف السيارات',              time: '08:00', category: 'cleaning',    status: 'todo',    dayOffset: 2 },

  { id: '14', title: 'خطبة الجمعة — الشيخ خالد النعيم',       time: '12:00', category: 'prayer',      status: 'todo',    dayOffset: 4 },
  { id: '15', title: 'تجديد عقد شركة الأمن والحراسة',          time: '10:00', category: 'admin',       status: 'todo',    dayOffset: 5 },
];

const DAYS_LABELS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_LABELS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

// --- Category Config ---
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

// --- Mini Calendar ---
const MiniCalendar = ({ today, taskDays, onSelectDay, selectedOffset }: {
  today: Date;
  taskDays: Set<number>;
  onSelectDay: (offset: number) => void;
  selectedOffset: number | null;
}) => {
  const [monthOffset, setMonthOffset] = useState(0);

  const refDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year    = refDate.getFullYear();
  const month   = refDate.getMonth();
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const dayDiff = (d: number) => {
    const t = new Date(year, month, d);
    t.setHours(0,0,0,0);
    const td = new Date(today); td.setHours(0,0,0,0);
    return Math.round((t.getTime() - td.getTime()) / 86400000);
  };

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonthOffset(m => m - 1)} className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-4 h-4" />
        </button>
        <h4 className="text-sm font-black text-foreground">{MONTHS_LABELS[month]} {year}</h4>
        <button onClick={() => setMonthOffset(m => m + 1)} className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_LABELS.map(d => (
          <div key={d} className="text-center text-[9px] font-bold text-muted-foreground py-1">{d.substring(0,1)}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const diff = dayDiff(day);
          const isToday   = diff === 0;
          const isPast    = diff < 0;
          const hasTask   = taskDays.has(diff);
          const isSelected = diff === selectedOffset;

          return (
            <button
              key={day}
              onClick={() => !isPast && onSelectDay(diff)}
              disabled={isPast}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-[11px] font-bold transition-all
                ${isSelected  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' :
                  isToday     ? 'bg-primary/10 text-primary border border-primary/30' :
                  isPast      ? 'text-muted-foreground/30 cursor-not-allowed' :
                                'hover:bg-muted text-foreground'}
              `}
            >
              {day}
              {hasTask && !isSelected && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isToday ? 'bg-primary' : 'bg-primary/60'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Task Row ---
const TaskRow = ({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) => {
  const cat = CATEGORY_CONFIG[task.category];
  const Icon = cat.icon;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all group
      ${task.status === 'done'    ? 'bg-muted/30 border-transparent opacity-60' :
        task.status === 'overdue' ? 'bg-red-500/5 border-red-500/10' :
                                    'bg-card border-border hover:border-primary/30 hover:shadow-sm'}
    `}>
      <button
        onClick={() => onToggle(task.id)}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {task.status === 'done'
          ? <CheckSquare className="w-5 h-5 text-emerald-500" />
          : <Circle className={`w-5 h-5 ${task.status === 'overdue' ? 'text-red-400' : ''}`} />
        }
      </button>

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cat.bg} ${cat.border} border`}>
        <Icon className={`w-4 h-4 ${cat.text}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </p>
        {task.time && (
          <p className={`text-[10px] flex items-center gap-1 mt-0.5 ${task.status === 'overdue' ? 'text-red-400' : 'text-muted-foreground'}`}>
            <Clock className="w-3 h-3" /> {task.time}
            {task.status === 'overdue' && <span className="font-bold mr-1">— متأخرة</span>}
          </p>
        )}
      </div>

      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border} shrink-0 hidden sm:inline`}>
        {cat.label}
      </span>
    </div>
  );
};

// --- Main Section ---
export function MosqueTasksSection() {
  const today = new Date();
  const [tasks, setTasks]              = useState<Task[]>(TASKS);
  const [selectedOffset, setSelected] = useState<number | null>(null);
  const [filterCat, setFilterCat]     = useState<TaskCategory | 'all'>('all');

  const activeOffset = selectedOffset ?? 0;

  const taskDays = new Set(tasks.map(t => t.dayOffset));

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
    ));
  };

  // Group tasks by day offset
  const dayOffsets = [...new Set(tasks.map(t => t.dayOffset))].sort((a, b) => a - b);

  const filteredTasks = tasks.filter(t =>
    t.dayOffset === activeOffset &&
    (filterCat === 'all' || t.category === filterCat)
  );

  const todayStats = {
    total: tasks.filter(t => t.dayOffset === 0).length,
    done:  tasks.filter(t => t.dayOffset === 0 && t.status === 'done').length,
    overdue: tasks.filter(t => t.dayOffset === 0 && t.status === 'overdue').length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="مهام المسجد"
        description="تنظيم وتتبع المهام اليومية والمجدولة لضمان كفاءة العمليات."
        breadcrumbs={[
          { label: "الإدارة التشغيلية" },
          { label: "مهام المسجد", active: true }
        ]}
        actions={
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> إضافة مهمة
          </button>
        }
      />

      <div className="px-4 md:px-8 pt-4 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ── SIDE: Calendar + Stats ── */}
        <div className="xl:col-span-4 space-y-6">

          {/* Today stats */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-foreground">إحصائيات اليوم</h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                {DAYS_LABELS[today.getDay()]} {today.getDate()} {MONTHS_LABELS[today.getMonth()]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted rounded-xl p-3 text-center border border-border">
                <p className="text-2xl font-black text-foreground">{todayStats.total}</p>
                <p className="text-[9px] font-bold text-muted-foreground mt-0.5">إجمالي</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                <p className="text-2xl font-black text-emerald-500">{todayStats.done}</p>
                <p className="text-[9px] font-bold text-emerald-600 mt-0.5">مكتملة</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
                <p className="text-2xl font-black text-red-500">{todayStats.overdue}</p>
                <p className="text-[9px] font-bold text-red-500 mt-0.5">متأخرة</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
                <span>التقدم</span>
                <span>{todayStats.total ? Math.round((todayStats.done / todayStats.total) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-emerald-500 to-primary rounded-full transition-all duration-700"
                  style={{ width: `${todayStats.total ? (todayStats.done / todayStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-base font-black text-foreground">جدول المهام</h3>
            </div>
            <MiniCalendar
              today={today}
              taskDays={taskDays}
              onSelectDay={setSelected}
              selectedOffset={selectedOffset}
            />
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary/60 inline-block" /> يوم بمهام
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" /> اليوم
              </div>
            </div>
          </div>

          {/* Upcoming days quick list */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-black text-foreground mb-3">المهام القادمة</h3>
            <div className="space-y-2">
              {dayOffsets.filter(d => d > 0).map(offset => {
                const count = tasks.filter(t => t.dayOffset === offset).length;
                return (
                  <button
                    key={offset}
                    onClick={() => setSelected(offset)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all
                      ${activeOffset === offset ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted border-border text-foreground hover:border-primary/30'}`}
                  >
                    <span>{DAY_LABEL(offset)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                      ${activeOffset === offset ? 'bg-primary text-white' : 'bg-border text-muted-foreground'}`}>
                      {count} مهام
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── MAIN: Task list for selected day ── */}
        <div className="xl:col-span-8 space-y-6">

          {/* Day header + filter */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-foreground">
                  {activeOffset === 0 ? 'مهام اليوم' : DAY_LABEL(activeOffset)}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredTasks.length} مهمة
                  {filterCat !== 'all' && ` في تصنيف "${CATEGORY_CONFIG[filterCat].label}"`}
                </p>
              </div>

              {/* Category filter pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCat('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                    ${filterCat === 'all' ? 'bg-primary text-white border-transparent shadow-md shadow-primary/20' : 'bg-muted border-border text-muted-foreground hover:border-primary/30'}`}
                >
                  الكل
                </button>
                {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map(cat => {
                  const c = CATEGORY_CONFIG[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilterCat(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                        ${filterCat === cat ? `${c.bg} ${c.text} ${c.border}` : 'bg-muted border-border text-muted-foreground hover:border-primary/30'}`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Task items */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">لا توجد مهام لهذا اليوم</p>
                <p className="text-xs text-muted-foreground">يمكنك إضافة مهمة جديدة من الزر أعلاه</p>
              </div>
            ) : (
              filteredTasks
                .sort((a, b) => {
                  // overdue first, then todo, then done; within same status sort by time
                  const statusOrder = { overdue: 0, todo: 1, done: 2 };
                  if (statusOrder[a.status] !== statusOrder[b.status])
                    return statusOrder[a.status] - statusOrder[b.status];
                  return (a.time || '').localeCompare(b.time || '');
                })
                .map(task => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} />
                ))
            )}
          </div>

          {/* Add quick task */}
          <div className="bg-card border border-dashed border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">إضافة مهمة جديدة لهذا اليوم...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
