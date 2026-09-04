'use client';

// ==============================
// Presentation Section — MosqueTasksSection
// ==============================

import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import { DeleteConfirmModal } from "../../app/components/ui/DeleteConfirmModal";
import { useToast } from "../../app/components/ui/Toast";
import { Plus, Terminal, CheckSquare } from 'lucide-react';

import { MosqueTask } from '../../domain/entities/MosqueTask';
import { useMosqueTasks } from '../hooks/useMosqueTasks';

import { TaskDaySelector } from './tasks/components/TaskDaySelector';
import { TaskStatsCard } from './tasks/components/TaskStatsCard';
import { TaskQuickAddBar } from './tasks/components/TaskQuickAddBar';
import { TaskItemCard } from './tasks/components/TaskItemCard';
import { CreateMosqueTaskModal } from './tasks/components/CreateMosqueTaskModal';
import { EditMosqueTaskModal } from './tasks/components/EditMosqueTaskModal';
import { MosqueTaskDebugTerminal } from './tasks/components/MosqueTaskDebugTerminal';

export function MosqueTasksSection() {
  const { showToast } = useToast();
  const {
    tasks,
    currentDayTasks,
    stats,
    loading,
    error,
    activeDayOffset,
    setActiveDayOffset,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    showDebugTerminal,
    setShowDebugTerminal,
    dateTabs,
    debugLogs,
    clearDebugLogs,
    getDateForOffset,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    togglingTaskIds,
  } = useMosqueTasks();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<MosqueTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<MosqueTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTaskCountForDay = (offset: number) => {
    if (offset === activeDayOffset) {
      return tasks.length;
    }
    const tabMatch = dateTabs.find(t => 
      t.day_offset === offset || 
      (offset === 0 && t.key === 'today') || 
      (offset === 1 && t.key === 'tomorrow') || 
      (offset === 2 && t.key === 'day_after') ||
      (offset === 98 && t.key === 'friday') ||
      (offset === 99 && t.key === 'next_week')
    );
    if (tabMatch && tabMatch.count !== undefined) {
      return tabMatch.count;
    }
    return tasks.filter(t => (t.day_offset ?? 0) === offset).length;
  };

  const handleToggleTask = async (id: number | string) => {
    try {
      await toggleTask(id);
      showToast('تم تحديث حالة المهمة بالسيرفر بنجاح ✅', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة المهمة من السيرفر', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title="مهام المسجد"
        description="صفحة بسيطة وسلسة لمدير المسجد لمتابعة وتنفيذ المهام اليومية بسهولة مع ربط مباشر بالسيرفر."
        breadcrumbs={[
          { label: "الإدارة التشغيلية" },
          { label: "مهام المسجد", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مهمة مفصلة</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-6">
        {/* ── SECTION 1: Clean Day Selector & Stats Ring Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Day Selector & Filters) */}
          <div className="lg:col-span-8">
            <TaskDaySelector
              activeDayOffset={activeDayOffset}
              onSelectDay={setActiveDayOffset}
              getTaskCountForDay={getTaskCountForDay}
              loading={loading}
            />
          </div>

          {/* Right Column (Today Progress Card) */}
          <div className="lg:col-span-4">
            <TaskStatsCard stats={stats} />
          </div>
        </div>

        {/* ── SECTION 2: Inline Quick Add Task Bar ── */}
        <TaskQuickAddBar
          onAdd={async ({ title, category, time }) => {
            try {
              const targetDate = getDateForOffset(activeDayOffset < 50 ? activeDayOffset : 0);
              await createTask({
                task_name: title,
                title,
                category,
                due_time: time,
                due_date: targetDate,
              });
              showToast('تم إضافة المهمة بنجاح ✅', 'success');
            } catch (err: any) {
              showToast(err.message || 'فشل إضافة المهمة من السيرفر', 'error');
              throw err;
            }
          }}
        />

        {/* ── SECTION 3: Tasks List with Scanning Skeleton Loader ── */}
        {loading ? (
          /* Scanning Skeleton Shimmer Loading Grid during tab transition */
          <div className="space-y-3 animate-in fade-in duration-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2.5 overflow-hidden animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-48 bg-muted rounded-xl" />
                  <div className="h-5 w-20 bg-muted rounded-xl" />
                </div>
                <div className="h-4 w-32 bg-muted/60 rounded-lg" />
              </div>
            ))}
          </div>
        ) : currentDayTasks.length === 0 ? (
          /* Empty State */
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <CheckSquare className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-base font-bold text-foreground mb-1">لا توجد مهام مطابقة لليوم المحدد</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                يمكنك إضافة مهمة جديدة سريعة أو مفصلة بجدول المهام التشغيلية للمسجد.
              </p>
            </div>
          </div>
        ) : (
          /* Tasks List */
          <div className="space-y-3">
            {currentDayTasks.map((t) => (
              <TaskItemCard
                key={t.id}
                task={t}
                isToggling={Boolean(togglingTaskIds[String(t.id)])}
                onToggle={handleToggleTask}
                onEdit={(target) => setTaskToEdit(target)}
                onDelete={(target) => setTaskToDelete(target)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Modals */}
      <CreateMosqueTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createTask}
      />

      <EditMosqueTaskModal
        task={taskToEdit}
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        onSubmit={updateTask}
      />

      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        title="حذف مهمة المسجد"
        description="هل أنت أصلًا متأكد من رغبتك في حذف هذه المهمة من السيرفر؟ لن تتمكن من استعادتها لاحقًا."
        itemName={taskToDelete?.task_name || taskToDelete?.title}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setTaskToDelete(null)}
      />
    </div>
  );
}
