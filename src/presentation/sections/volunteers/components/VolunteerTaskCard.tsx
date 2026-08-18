'use client';

import React from 'react';
import { Briefcase, User, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { VolunteerTask } from '../../../../domain/entities/Volunteer';

interface VolunteerTaskCardProps {
  task: VolunteerTask;
}

export function VolunteerTaskCard({ task }: VolunteerTaskCardProps) {
  const isCompleted = task.status === 'completed';

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all font-['Cairo'] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            <span>{isCompleted ? 'مكتملة' : 'مسندة وجارية'}</span>
          </span>

          <span className="text-[11px] text-muted-foreground font-mono">
            {task.created_at?.split('T')[0] || ''}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">
              المتطوع: {task.volunteer_name}
            </h3>
            {task.opportunity_title && (
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {task.opportunity_title}
              </p>
            )}
          </div>
        </div>

        <div className="bg-muted/40 rounded-xl p-3 text-xs leading-relaxed text-foreground">
          {task.task_description}
        </div>
      </div>
    </div>
  );
}
