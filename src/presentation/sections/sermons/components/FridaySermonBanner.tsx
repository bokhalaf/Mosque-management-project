// ==============================
// Sermons — FridaySermonBanner Component
// البانر الرئيسي: الخطبة المختارة للجمعة القادمة
// ==============================

import React from 'react';
import { Radio, User, Eye, X } from 'lucide-react';
import { SermonSelection } from '../../../../domain/entities/Sermon';

interface FridaySermonBannerProps {
  upcomingSelection: SermonSelection;
  onViewDetails?: (id: string | number) => void;
  onCancelSelection: (id: string | number) => void;
}

export function FridaySermonBanner({
  upcomingSelection,
  onViewDetails,
  onCancelSelection,
}: FridaySermonBannerProps) {
  return (
    <div className="bg-gradient-to-l from-primary/15 via-card to-card border border-primary/30 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-black rounded-full flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
              الخطبة المختارة للجمعة القادمة
            </span>
            <span className="text-xs text-muted-foreground font-bold">
              تاريخ الاعتماد: {upcomingSelection.selection_date}
            </span>
          </div>

          <h2
            onClick={() => onViewDetails && upcomingSelection.sermon && onViewDetails(upcomingSelection.sermon.id)}
            className="text-xl md:text-2xl font-black text-foreground hover:text-primary cursor-pointer transition-colors"
          >
            {upcomingSelection.sermon?.title || `خطبة جمعة معتمدة #${upcomingSelection.sermon_id}`}
          </h2>

          <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-primary" />
            {upcomingSelection.sermon?.speaker_name || upcomingSelection.sermon?.preacher || 'الشيخ الخطيب'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onViewDetails && upcomingSelection.sermon && (
            <button
              onClick={() => onViewDetails(upcomingSelection.sermon!.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-2xl text-xs font-bold transition-all shadow-sm"
              title="عرض التفاصيل"
            >
              <Eye className="w-4 h-4" />
              <span>عرض التفاصيل</span>
            </button>
          )}

          <button
            onClick={() => onCancelSelection(upcomingSelection.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
            title="إلغاء اعتماد وتحديد الخطبة للجمعة القادمة"
          >
            <X className="w-4 h-4" />
            <span>إلغاء الاعتماد</span>
          </button>
        </div>
      </div>
    </div>
  );
}
