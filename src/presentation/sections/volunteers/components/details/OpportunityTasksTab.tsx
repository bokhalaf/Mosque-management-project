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
              const isAssigned = task.status === 'assigned' || Boolean(task.application_id) || (task.volunteer_name && task.volunteer_name !== 'غير مسند');
              const hasVolunteer = Boolean(task.volunteer_name && task.volunteer_name !== 'غير مسند');

              return (
                <div
                  key={task.id || idx}
                  className="bg-card border border-border/80 hover:border-primary/40 rounded-2xl p-5 shadow-sm space-y-3.5 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : isAssigned
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : isAssigned ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <ListTodo className="w-3 h-3" />
                        )}
                        <span>{isCompleted ? 'مكتملة' : isAssigned ? 'مسندة / جارية' : 'غير مسندة'}</span>
                      </span>
                    </div>

                    <p className="text-xs font-bold text-foreground leading-relaxed">
                      {task.task_description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    {hasVolunteer ? (
                      <div className="flex items-center gap-2 text-muted-foreground w-full">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                          <User className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] text-muted-foreground font-medium">المتطوع المسند:</span>
                          <span className="font-bold text-foreground text-xs truncate">
                            {task.volunteer_name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] text-muted-foreground font-medium">لم يتم إسنادها لمتطوع بعد</span>
                      </div>
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
