// ==============================
// Sermons — PendingModal Component
// Modal: الخطب قيد الانتظار والمراجعة
// ==============================

import React from 'react';
import { Clock, X, User, Volume2 } from 'lucide-react';
import { Sermon } from '../../../../domain/entities/Sermon';

interface PendingModalProps {
  pendingSermons: Sermon[];
  playingId: string | number | null;
  onToggleAudio: (id: string | number, content: string) => void;
  onClose: () => void;
}

export function PendingModal({ pendingSermons, playingId, onToggleAudio, onClose }: PendingModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 text-amber-500 font-black">
            <Clock className="w-5 h-5" />
            <h3 className="text-lg text-foreground">سجل الخطب قيد الانتظار والمراجعة ({pendingSermons.length})</h3>
          </div>
          <X className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" onClick={onClose} />
        </div>

        {pendingSermons.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">لا توجد خطب قيد الانتظار والمراجعة حالياً.</p>
        ) : (
          <div className="space-y-4">
            {pendingSermons.map((sermon) => (
              <div key={sermon.id} className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-foreground">{sermon.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    قيد المراجعة
                  </span>
                </div>

                <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" /> {sermon.speaker_name || sermon.preacher || 'الشيخ الخطيب'}
                </p>

                <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-2">
                  {sermon.content}
                </p>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => onToggleAudio(sermon.id, sermon.content)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-muted text-xs font-bold rounded-xl"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-primary" />
                    <span>القارئ الصوتي</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-muted text-foreground text-xs font-bold rounded-xl"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
