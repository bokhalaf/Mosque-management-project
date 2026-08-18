'use client';

import React from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { ScheduleItemState } from '../../../hooks/useCreateDawahProgram';

interface CreateProgramSchedulesCardProps {
  schedules: ScheduleItemState[];
  onAddSchedule: () => void;
  onRemoveSchedule: (id: string) => void;
  onUpdateSchedule: (id: string, field: keyof ScheduleItemState, value: string) => void;
}

export function CreateProgramSchedulesCard({
  schedules,
  onAddSchedule,
  onRemoveSchedule,
  onUpdateSchedule,
}: CreateProgramSchedulesCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 font-['Cairo']">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">جدولة الجلسات والمواعيد</h3>
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          (مطلوب جلسة واحدة على الأقل)
        </span>
      </div>

      {/* Schedules List */}
      <div className="space-y-3">
        {schedules.map((schedule, index) => (
          <div
            key={schedule.id}
            className="p-4 bg-muted/40 border border-border/80 rounded-2xl space-y-3 relative group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={schedule.title}
                  onChange={(e) => onUpdateSchedule(schedule.id, 'title', e.target.value)}
                  placeholder="عنوان الجلسة (مثال: الجلسة الأولى - المقدمة)"
                  className="bg-transparent border-b border-transparent focus:border-primary font-bold text-xs text-foreground outline-none px-1 py-0.5"
                />
              </div>

              {schedules.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveSchedule(schedule.id)}
                  className="p-1 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"
                  title="حذف هذه الجلسة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  تاريخ الجلسة <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={schedule.date}
                  onChange={(e) => onUpdateSchedule(schedule.id, 'date', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  وقت البدء <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={schedule.start_time}
                  onChange={(e) => onUpdateSchedule(schedule.id, 'start_time', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  وقت الانتهاء <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={schedule.end_time}
                  onChange={(e) => onUpdateSchedule(schedule.id, 'end_time', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                value={schedule.notes}
                onChange={(e) => onUpdateSchedule(schedule.id, 'notes', e.target.value)}
                placeholder="ملاحظات أو تنبيهات للحضور بهذه الجلسة (اختياري)..."
                className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-xl text-[11px] outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSchedule}
        className="w-full py-3 border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>إضافة جلسة أخرى للبرنامج الدعوي</span>
      </button>
    </div>
  );
}
