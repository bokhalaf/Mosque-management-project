// ==============================
// Sermons — PendingModal Component
// Modal: الخطب قيد الانتظار والمراجعة بتصميم أخضر إسلامي متناسق وحجم مدمج ومثالي (3 خطب بالصفحة)
// ==============================

import React, { useState } from 'react';
import { Clock, X, User, Trash2, RefreshCw } from 'lucide-react';
import { Sermon, SermonPagination } from '../../../../domain/entities/Sermon';
import { DeleteConfirmModal } from '../../../../app/components/ui/DeleteConfirmModal';

interface PendingModalProps {
  pendingSermons: Sermon[];
  pendingPagination: SermonPagination;
  deletingSermonId?: string | number | null;
  onPageChange: (page: number) => void;
  onDeleteSermon?: (id: string | number) => void;
  onApproveSermon?: (id: string | number) => void;
  onRejectSermon?: (id: string | number) => void;
  onClose: () => void;
}

export function PendingModal({
  pendingSermons,
  pendingPagination,
  deletingSermonId,
  onPageChange,
  onDeleteSermon,
  onApproveSermon,
  onRejectSermon,
  onClose,
}: PendingModalProps) {
  const [sermonToDelete, setSermonToDelete] = useState<Sermon | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const totalItems = pendingPagination.totalItems || pendingSermons.length;
  const currentPage = pendingPagination.currentPage || 1;
  const itemsPerPage = pendingPagination.itemsPerPage || 3;
  const totalPages = Math.max(1, pendingPagination.totalPages || Math.ceil(totalItems / itemsPerPage));

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleConfirmDelete = async () => {
    if (!sermonToDelete || !onDeleteSermon) return;
    setIsDeleting(true);
    try {
      await onDeleteSermon(sermonToDelete.id);
      setSermonToDelete(null);
    } catch (e) {
      console.error('Delete sermon failed:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in font-['Cairo']">
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5 text-primary font-black">
              <div className="p-1.5 rounded-xl bg-primary/10 border border-primary/20">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-base text-foreground font-black">
                  سجل الخطب قيد الانتظار ({totalItems})
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  مراجعة الخطب المرسلة قبل الاعتماد النهائي
                </p>
              </div>
            </div>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" onClick={onClose} />
          </div>

          {/* Content List */}
          {pendingSermons.length === 0 ? (
            <div className="text-center py-8 space-y-1">
              <p className="text-xs text-muted-foreground font-bold">لا توجد خطب قيد الانتظار حالياً.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSermons.map((sermon) => (
                <div
                  key={sermon.id}
                  className="p-4 bg-card border border-border hover:border-primary/30 rounded-2xl space-y-3 relative group transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-foreground">{sermon.title}</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        قيد المراجعة
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onApproveSermon && (
                        <button
                          onClick={() => onApproveSermon(sermon.id)}
                          className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-all"
                        >
                          قبول
                        </button>
                      )}
                      {onRejectSermon && (
                        <button
                          onClick={() => onRejectSermon(sermon.id)}
                          className="px-2.5 py-1 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-lg text-[10px] font-bold transition-all"
                        >
                          رفض
                        </button>
                      )}
                      {onDeleteSermon && (
                        <button
                          onClick={() => setSermonToDelete(sermon)}
                          disabled={deletingSermonId === sermon.id}
                          className="p-1.5 bg-muted text-muted-foreground hover:text-red-500 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                          title="حذف طلب الخطبة"
                        >
                          {deletingSermonId === sermon.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3 h-3 text-primary" /> {sermon.speaker_name || sermon.preacher || 'الشيخ الخطيب'}
                  </p>

                  <p className="text-[11px] text-muted-foreground/90 leading-relaxed line-clamp-2">
                    {sermon.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border border-border bg-muted/15 rounded-2xl">
            <div className="text-[11px] text-muted-foreground font-bold">
              عرض <span className="text-foreground font-black">{startItem} - {endItem}</span> من إجمالي <span className="text-foreground font-black">{totalItems}</span> خطبة
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                السابق
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={`w-7 h-7 text-xs font-bold rounded-lg transition-all ${
                      p === currentPage
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                التالي
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Sermon Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!sermonToDelete}
        title="تأكيد حذف الخطبة قيد الانتظار"
        description="هل أنت متأكد من رغبتك في حذف هذه الخطبة؟ لا يمكن التراجع عن هذه العملية بعد التأكيد وسوف يتم إرسال طلب الحذف إلى السيرفر."
        itemName={sermonToDelete?.title}
        confirmButtonText="نعم، حذف الخطبة"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setSermonToDelete(null)}
      />
    </>
  );
}
