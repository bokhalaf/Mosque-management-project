'use client';

import React from 'react';
import { Briefcase, Plus, Trash2, CheckCircle2, ListTodo } from 'lucide-react';

interface CreateOpportunityTasksCardProps {
  tasks: string[];
  newTaskInput: string;
  onNewTaskInputChange: (val: string) => void;
  onAddTask: () => void;
  onRemoveTask: (index: number) => void;
  onUpdateTask: (index: number, val: string) => void;
}

export function CreateOpportunityTasksCard({
  tasks,
  newTaskInput,
  onNewTaskInputChange,
  onAddTask,
  onRemoveTask,
  onUpdateTask,
}: CreateOpportunityTasksCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddTask();
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">مهام الفرصة التطوعية</h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                {tasks.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">حدد المهام التفصيلية المحددة لهذه الفرصة لإسنادها للمتطوعين لاحقاً</p>
          </div>
        </div>
      </div>

      {/* Add Task Input Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => onNewTaskInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب وصف المهمة واضغط إضافة (مثال: توجيه كبار السن للمصلى المخصص)..."
            className="w-full px-3.5 py-2.5 bg-muted/20 border border-input rounded-xl text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onAddTask}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة</span>
        </button>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="p-8 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground bg-muted/10">
          لم تقم بإضافة مهام للفرصة بعد. يمكنك إضافة مهام محددة الآن أو إضافتها لاحقاً من صفحة تفاصيل الفرصة.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 border border-border/70 rounded-2xl transition-all group"
            >
              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs font-mono shrink-0">
                {idx + 1}
              </div>

              <input
                type="text"
                value={task}
                onChange={(e) => onUpdateTask(idx, e.target.value)}
                className="flex-1 bg-transparent border-none text-xs font-medium text-foreground focus:outline-none focus:ring-0"
              />

              <button
                type="button"
                onClick={() => onRemoveTask(idx)}
                className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-70 group-hover:opacity-100"
                title="حذف المهمة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
