// ==============================
// Maintenance — MaintenanceTimeline Component
// العمود الجانبي: أحدث طلبات الصيانة (Timeline)
// ==============================

import React from 'react';
import { Clock, Activity, CheckCircle2 } from 'lucide-react';
import { MaintenanceRequestItem } from '../../../../domain/entities/Maintenance';

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'قيد الانتظار';
    case 'in_progress': return 'جاري العمل';
    case 'completed': return 'مكتملة';
    case 'cancelled': return 'ملغاة';
    default: return status;
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

interface MaintenanceTimelineProps {
  requests: MaintenanceRequestItem[];
}

export function MaintenanceTimeline({ requests }: MaintenanceTimelineProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">أحدث طلبات الصيانة</h3>
      <div className="space-y-6">
        {requests.slice(0, 4).map((task, idx) => (
          <div key={task.id} className="flex gap-4 relative">
            {idx !== Math.min(4, requests.length) - 1 && (
              <div className="absolute right-4 top-10 bottom-[-20px] w-px bg-border" />
            )}
            <div className="relative z-10 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-card ${
                task.status === 'completed' ? 'bg-emerald-500 text-white' :
                task.status === 'in_progress' ? 'bg-amber-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                {task.status === 'in_progress' && <Activity className="w-4 h-4" />}
                {task.status === 'pending' && <Clock className="w-4 h-4" />}
              </div>
            </div>
            <div className="pt-1.5 pb-2">
              <p className="text-sm font-bold text-foreground leading-snug line-clamp-1">{task.title}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(task.created_at)} ({getStatusLabel(task.status)})
              </p>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">لا توجد طلبات صيانة حالياً.</p>
        )}
      </div>
    </div>
  );
}
