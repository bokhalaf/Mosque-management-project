'use client';

// ==============================
// UI Component — OpportunityTasksTab
// عرض مهام الفرصة التطوعية المسجلة بالسيرفر
// ==============================

import React from 'react';
import {
  ListTodo, CheckCircle2, Clock, User
} from 'lucide-react';
import { VolunteerTask, VolunteerApplication } from '../../../../../domain/entities/Volunteer';

interface OpportunityTasksTabProps {
  tasks: VolunteerTask[];
  applications: VolunteerApplication[];
  onOpenAssignTask: (app: VolunteerApplication) => void;
}

export function OpportunityTasksTab({
  tasks,
  applications,
  onOpenAssignTask,
}: OpportunityTasksTabProps) {
  return (
    <div className="space-y-6 font-['Cairo']">
      {/* Tasks Grid Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" />
            <span>مهام الفرصة المسجلة ({tasks.length})</span>
          </h3>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center text-xs text-muted-foreground space-y-2">
            <ListTodo className="w-8 h-8 mx-auto text-muted-foreground/50" />
            <div>لا توجد مهام مسجلة لهذه الفرصة حالياً. يمكن إضافة مهام عند تعديل الفرصة التطوعية.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task, idx) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id || idx}
                  className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold font-mono">
                        مهمة #{task.id || idx + 1}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{isCompleted ? 'مكتملة' : 'مسندة / جارية'}</span>
                      </span>
                    </div>

                    <p className="text-xs font-bold text-foreground leading-relaxed">
                      {task.task_description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    {task.volunteer_name ? (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[11px]">المتطوع:</span>
                        <span className="font-bold text-foreground text-[11px] truncate max-w-[120px]">
                          {task.volunteer_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">غير مسندة لمتطوع محدد</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
