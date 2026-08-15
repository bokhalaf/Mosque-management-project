// ==============================
// Campaigns — DeleteCampaignModal Component
// نافذة تأكيد حذف الحملة المتوافقة مع (DELETE /api/campaigns/{id})
// ==============================

import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Campaign } from '../../../../domain/entities/Donation';

interface DeleteCampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string | number) => Promise<any>;
}

export function DeleteCampaignModal({
  campaign,
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteCampaignModalProps) {
  if (!isOpen || !campaign) return null;

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirmDelete(campaign.id);
      onClose();
    } catch (err: any) {
      console.error("Failed to delete campaign:", err);
      setErrorMsg(err.message || 'فشل حذف الحملة من السيرفر');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 space-y-6 text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-black text-foreground">هل أنت متأكد من حذف هذه الحملة؟</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            سيتم حذف الحملة <strong className="text-foreground">"{campaign.title}"</strong> نهائياً من السيرفر. لن يمكنك التراجع عن هذا الإجراء.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
