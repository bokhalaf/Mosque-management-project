// ==============================
// Sermons — PendingModal Component
// Modal: سجل الخطب قيد الانتظار مع أزرار القبول الفوري، الرفض مع كتابة السبب، الحذف، والمعاينة
// ==============================

import React, { useState } from 'react';
import { 
  Clock, X, User, Trash2, RefreshCw, Eye, ArrowLeft, 
  BookOpen, Check, XCircle, AlertCircle, FileText, Send 
} from 'lucide-react';
import { Sermon, SermonPagination } from '../../../../domain/entities/Sermon';
import { DeleteConfirmModal } from '../../../../app/components/ui/DeleteConfirmModal';

interface PendingModalProps {
  pendingSermons: Sermon[];
  pendingPagination: SermonPagination;
  deletingSermonId?: string | number | null;
  processingSermonId?: string | number | null;
  isSuperAdmin?: boolean;
  onPageChange: (page: number) => void;
  onSelectSermon?: (id: string | number) => void;
  onApproveSermon?: (id: string | number) => void;
  onRejectSermon?: (id: string | number, reason: string) => void;
  onDeleteSermon?: (id: string | number) => void;
  onClose: () => void;
}

export function PendingModal({
  pendingSermons,
  pendingPagination,
  deletingSermonId,
  processingSermonId,
  isSuperAdmin = false,
  onPageChange,
  onSelectSermon,
  onApproveSermon,
  onRejectSermon,
  onDeleteSermon,
  onClose,
}: PendingModalProps) {
  const [sermonToDelete, setSermonToDelete] = useState<Sermon | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Reject with Reason Modal State
  const [sermonToReject, setSermonToReject] = useState<Sermon | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('يرجى مراجعة مقدمة الخطبة وتدقيق الأحاديث الواردة');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

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

  const handleOpenRejectModal = (sermon: Sermon) => {
    setSermonToReject(sermon);
    setRejectionReason('يرجى مراجعة مقدمة الخطبة وتدقيق الأحاديث الواردة');
  };

  const handleConfirmReject = async () => {
    if (!sermonToReject || !onRejectSermon || !rejectionReason.trim()) return;
    setIsRejecting(true);
    try {
      await onRejectSermon(sermonToReject.id, rejectionReason.trim());
      setSermonToReject(null);
    } catch (e) {
      console.error('Reject sermon failed:', e);
    } finally {
      setIsRejecting(false);
    }
  };

  const presetReasons = [
    'يرجى مراجعة مقدمة الخطبة وتدقيق الأحاديث الواردة',
    'الموضوع تم تناوله حديثاً في جمعة سابقة',
    'النص يحتاج إلى تلخيص وضبط الوقت بما يناسب الجمعة',
    'مخالفة لبعض التوجيهات الرسمية أو الضوابط المعتمدة',
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in font-['Cairo']">
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5 text-primary font-black">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base text-foreground font-black">
                  مراجعة الخطب قيد الانتظار ({totalItems})
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {isSuperAdmin
                    ? 'يمكنك اتخاذ قرار القبول المباشر، أو الرفض مع توضيح السبب للخطيب، أو معاينة النص بالكامل'
                    : 'استعراض ومتابعة الخطب المرفوعة قيد انتظار الاعتماد والموافقة من الإدارة العامة.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content List */}
          {pendingSermons.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground font-bold">لا توجد خطب قيد الانتظار حالياً.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSermons.map((sermon) => (
                <div
                  key={sermon.id}
                  className="p-4 md:p-5 bg-card border border-border hover:border-primary/40 rounded-2xl space-y-3 relative group transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-foreground">
                          {sermon.title}
                        </h4>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          قيد المراجعة والاعتماد
                        </span>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>{sermon.speaker_name || sermon.preacher || 'الشيخ الخطيب'}</span>
                      </p>
                    </div>

                    {/* Secondary Actions (View details & Delete) */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      {onSelectSermon && (
                        <button
                          onClick={() => onSelectSermon(sermon.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-muted/60 hover:bg-muted text-foreground border border-border rounded-xl text-xs font-bold transition-all"
                          title="استعراض نص الخطبة كاملاً ومحاورها"
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span>معاينة النص</span>
                        </button>
                      )}

                      {isSuperAdmin && onDeleteSermon && (
                        <button
                          onClick={() => setSermonToDelete(sermon)}
                          disabled={deletingSermonId === sermon.id}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
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

                  {/* Sermon Brief Preview */}
                  <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-2 bg-muted/30 p-2.5 rounded-xl border border-border/30 font-medium">
                    {sermon.content}
                  </p>

                  {/* Bottom Decision Toolbar: 1. Approve Button, 2. Reject Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <span className="text-[10px] text-muted-foreground font-bold">
                      تاريخ الطلب: {sermon.sermon_date || sermon.date || 'اليوم'}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* 1. Direct Approve Button (Super Admin only) */}
                      {isSuperAdmin && onApproveSermon && (
                        <button
                          type="button"
                          onClick={() => onApproveSermon(sermon.id)}
                          disabled={processingSermonId === sermon.id}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                          title="قبول واعتماد الخطبة وإضافتها للمكتبة المركزية"
                        >
                          {processingSermonId === sermon.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>قبول واعتماد</span>
                        </button>
                      )}

                      {/* 2. Reject with Reason Button (Super Admin only) */}
                      {isSuperAdmin && onRejectSermon && (
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(sermon)}
                          disabled={processingSermonId === sermon.id}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          title="رفض الخطبة مع كتابة سبب الرفض"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>رفض مع تحديد السبب</span>
                        </button>
                      )}
                    </div>
                  </div>
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

      {/* ── MODAL: Reject Sermon with Reason ── */}
      {sermonToReject && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in font-['Cairo']">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-red-500 font-black">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base text-foreground font-black">رفض طلب الخطبة وإرسال السبب</h3>
              </div>
              <X 
                className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" 
                onClick={() => setSermonToReject(null)} 
              />
            </div>

            <p className="text-xs text-muted-foreground font-medium">
              الخطبة: <span className="font-bold text-foreground">{sermonToReject.title}</span> للشيخ{' '}
              <span className="font-bold text-foreground">{sermonToReject.speaker_name || sermonToReject.preacher || 'الخطيب'}</span>
            </p>

            {/* Quick Preset Reasons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">أسباب شائعة للاختيار السريع:</label>
              <div className="flex flex-wrap gap-1.5">
                {presetReasons.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all text-right ${
                      rejectionReason === preset
                        ? 'bg-red-500/10 border-red-500/30 text-red-600'
                        : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">نص سبب الرفض والملاحظات للخطيب *</label>
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="اكتب سبب الرفض أو الملاحظات الواجب تعديلها بدقة..."
                className="w-full p-3 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-red-500 leading-relaxed resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSermonToReject(null)}
                className="px-4 py-2 bg-card border border-border text-foreground font-bold text-xs rounded-xl hover:bg-muted transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting || !rejectionReason.trim()}
                className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {isRejecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>تأكيد الرفض وإرسال السبب</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
