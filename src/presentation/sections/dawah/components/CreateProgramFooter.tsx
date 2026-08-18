'use client';

import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface CreateProgramFooterProps {
  onBack: () => void;
  isSubmitting: boolean;
}

export function CreateProgramFooter({
  onBack,
  isSubmitting,
}: CreateProgramFooterProps) {
  return (
    <div className="mt-8 pt-6 border-t border-border flex items-center justify-end gap-3 font-['Cairo']">
      <button
        type="button"
        onClick={onBack}
        disabled={isSubmitting}
        className="px-6 py-3 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50"
      >
        إلغاء
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري الحفظ والنشر...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>حفظ ونشر البرنامج الدعوي</span>
          </>
        )}
      </button>
    </div>
  );
}
