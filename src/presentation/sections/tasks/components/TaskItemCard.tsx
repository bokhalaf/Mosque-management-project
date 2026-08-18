'use client';

// ==============================
// Presentation Component — TaskItemCard
// ==============================

import React from 'react';
import { CheckSquare, Square, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { MosqueTask } from '../../../../domain/entities/MosqueTask';
import { CATEGORY_CONFIG } from './TaskDaySelector';

interface TaskItemCardProps {
  task: MosqueTask;
  onToggle: (id: number | string) => void;
  onEdit: (task: MosqueTask) => void;
  onDelete: (task: MosqueTask) => void;
}

export function TaskItemCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: TaskItemCardProps) {
  const cfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.prayer;
  const Icon = cfg.icon;
  const isDone = task.status === 'done' || task.is_completed;

  return (
    <div
      className={`bg-card border rounded-2xl p-4 transition-all hover:shadow-md flex items-center justify-between gap-4 font-['Cairo'] group ${
        isDone ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-border/80'
      }`}
    >
      {/* Right Side: Checkbox & Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={() => onToggle(task.id)}
          className={`p-1 rounded-lg transition-all shrink-0 ${
            isDone
              ? 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20'
              : 'text-muted-foreground hover:text-primary hover:bg-muted'
          }`}
          title={isDone ? 'تحديد كغير مكتملة' : 'تحديد كمكتملة'}
        >
          {isDone ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-muted-foreground" />}
        </button>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              onClick={() => onToggle(task.id)}
              className={`text-sm font-bold cursor-pointer transition-colors truncate ${
                isDone ? 'line-through text-muted-foreground' : 'text-foreground hover:text-primary'
              }`}
            >
              {task.task_name || task.title}
            </h4>

            {/* Badges */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <Icon className="w-3 h-3" />
              <span>{cfg.label}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground dir-ltr">
              <Clock className="w-3 h-3 text-primary" />
              <span>{task.time || task.due_time || '10:00'}</span>
            </span>

            {task.priority && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  task.priority === 'high'
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    : task.priority === 'low'
                    ? 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                }`}
              >
                {task.priority === 'high' ? 'عالية' : task.priority === 'low' ? 'منخفضة' : 'متوسطة'}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
              {task.description}
            </p>
          )}

          {task.assigned_to && (
            <span className="text-[11px] font-bold text-muted-foreground inline-flex items-center gap-1">
              <Users className="w-3 h-3 text-primary shrink-0" />
              <span>المسؤول: {task.assigned_to}</span>
            </span>
          )}
        </div>
      </div>

      {/* Left Side: Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all border border-transparent hover:border-border"
          title="تعديل المهمة"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(task)}
          className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
          title="حذف المهمة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
