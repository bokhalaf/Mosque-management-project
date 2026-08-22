import React from 'react';
import { User, FileText, Send, RefreshCw } from 'lucide-react';
import { Sermon, SermonSelection } from '../../../../domain/entities/Sermon';

interface SermonCardProps {
  sermon: Sermon;
  upcomingSelection: SermonSelection | null;
  isSelecting?: boolean;
  onViewDetails?: (id: string | number) => void;
  onSelectForFriday?: (sermon: Sermon) => void;
}

export function SermonCard({
  sermon,
  upcomingSelection,
  isSelecting = false,
  onViewDetails,
  onSelectForFriday,
}: SermonCardProps) {
  const isSelectedFriday = upcomingSelection && String(upcomingSelection.sermon_id) === String(sermon.id);
  const speakerName = sermon.speaker_name || sermon.preacher || 'الشيخ الخطيب';

  return (
    <div
      className={`bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative group transition-all ${
        isSelectedFriday
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
          : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold border bg-muted text-muted-foreground border-border">
            مؤرشفة للمسجد
          </span>
          {isSelectedFriday && (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              مختارة للجمعة القادمة
            </span>
          )}
        </div>

        <h3
          onClick={() => onViewDetails && onViewDetails(sermon.id)}
          className="text-base font-black text-foreground line-clamp-2 leading-relaxed cursor-pointer hover:text-primary transition-colors"
        >
          {sermon.title}
        </h3>

        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-primary" />
          {speakerName}
        </p>

        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
          {sermon.content}
        </p>
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(sermon.id)}
            className="flex items-center gap-1.5 px-3 py-2 bg-muted text-foreground hover:bg-muted/80 rounded-xl text-xs font-bold transition-all"
            title="تفاصيل الخطبة"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>عرض التفاصيل</span>
          </button>
        )}

        {onSelectForFriday && !isSelectedFriday && (
          <button
            onClick={() => onSelectForFriday(sermon)}
            disabled={isSelecting}
            className="flex items-center gap-1 px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 mr-auto"
          >
            {isSelecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isSelecting ? 'جاري الاعتماد...' : 'اعتماد للجمعة'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
