'use client';

// ==============================
// UI Component — DeleteConfirmModal
// نافذة تأكيد الحذف الموحدة بتصميم راقٍ ومتناسق
// ==============================

import React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  itemName?: string;
  confirmButtonText?: string;
  isDeleting?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  description,
  itemName,
  confirmButtonText = 'نعم، حذف',
  isDeleting = false,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-['Cairo']">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 text-right space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Warning Icon and Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
            {itemName && (
              <p className="text-xs font-bold text-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border mt-2 inline-block">
                {itemName}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 bg-muted text-foreground font-bold text-xs rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white font-bold text-xs rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmButtonText}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
