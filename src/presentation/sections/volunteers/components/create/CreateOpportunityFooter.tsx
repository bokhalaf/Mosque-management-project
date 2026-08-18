'use client';

import React from 'react';
import { HeartHandshake, RefreshCw, X } from 'lucide-react';

interface CreateOpportunityFooterProps {
  submitting: boolean;
  onCancel: () => void;
}

export function CreateOpportunityFooter({
  submitting,
  onCancel,
}: CreateOpportunityFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/80">
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="px-6 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all"
      >
        إلغاء
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/20"
      >
        {submitting ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <HeartHandshake className="w-4 h-4" />
        )}
        <span>{submitting ? 'جاري طرح الفرصة والمهام...' : 'طرح وحفظ الفرصة التطوعية'}</span>
      </button>
    </div>
  );
}
