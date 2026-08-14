// ==============================
// Complaints — ComplaintTimeline Component
// العمود الجانبي: أحدث النشاطات (Timeline)
// ==============================

import React from 'react';
import { Clock, MessageCircle, CheckCircle, User, Info } from 'lucide-react';
import { ComplaintItem } from '../../../../domain/entities/Complaint';

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
    case 'new': return 'جديدة';
    case 'in_progress':
    case 'review': return 'قيد المعالجة';
    case 'resolved': return 'تم الحل';
    case 'canceled':
    case 'closed': return 'مغلقة';
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

interface ComplaintTimelineProps {
  complaints: ComplaintItem[];
}

export function ComplaintTimeline({ complaints }: ComplaintTimelineProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">أحدث النشاطات</h3>
        <span className="text-xs font-bold text-primary">مباشر</span>
      </div>

      <div className="space-y-6">
        {complaints.slice(0, 4).map((item, idx) => (
          <div key={item.id} className="flex gap-4 relative">
            {idx !== Math.min(4, complaints.length) - 1 && (
              <div className="absolute right-4 top-10 bottom-[-20px] w-px bg-border" />
            )}

            <div className="relative z-10 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-card ${
                item.status === 'pending' ? 'bg-blue-500 text-white' :
                item.status === 'resolved' ? 'bg-emerald-500 text-white' :
                item.status === 'in_progress' ? 'bg-amber-500 text-white' :
                'bg-primary text-white'
              }`}>
                {item.status === 'pending' && <MessageCircle className="w-4 h-4" />}
                {item.status === 'resolved' && <CheckCircle className="w-4 h-4" />}
                {item.status === 'in_progress' && <User className="w-4 h-4" />}
                {item.status === 'canceled' && <Info className="w-4 h-4" />}
              </div>
            </div>

            <div className="pt-1.5 pb-2">
              <p className="text-sm font-bold text-foreground leading-snug">
                {item.title || item.description || 'تحديث شكوى'}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(item.created_at)} ({getStatusLabel(item.status)})
              </p>
            </div>
          </div>
        ))}

        {complaints.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">لا توجد نشاطات حالياً</p>
        )}
      </div>
    </div>
  );
}
