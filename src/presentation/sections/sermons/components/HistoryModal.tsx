// ==============================
// Sermons — HistoryModal Component
// Modal: سجل خطب الجمعة المختارة
// ==============================

import React from 'react';
import { History, X } from 'lucide-react';
import { SermonSelection } from '../../../../domain/entities/Sermon';

interface HistoryModalProps {
  selectionsHistory: SermonSelection[];
  onClose: () => void;
}

export function HistoryModal({ selectionsHistory, onClose }: HistoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 text-primary font-black">
            <History className="w-5 h-5" />
            <h3 className="text-lg text-foreground">سجل خطب الجمعة المختارة ({selectionsHistory.length})</h3>
          </div>
          <X className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" onClick={onClose} />
        </div>

        {selectionsHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">لا يوجد سجل سابق للخطب المختارة.</p>
        ) : (
          <div className="space-y-3">
            {selectionsHistory.map((sel) => (
              <div key={sel.id} className="p-4 bg-muted/50 border border-border rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md">
                      تاريخ الاعتماد: {sel.selection_date}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-foreground">{sel.sermon?.title || `خطبة مختارة #${sel.sermon_id}`}</h4>
                  {sel.notes && <p className="text-[11px] text-muted-foreground">{sel.notes}</p>}
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
