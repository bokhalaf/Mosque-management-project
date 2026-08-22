'use client';

// ==============================
// UI Component — MosqueSpacesSection
// إدارة واستعراض القاعات والمساحات التابعة للمسجد (متصل بنقاط النهاية الرسمية /api/mosques/{mosque}/spaces)
// ==============================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, Edit, Trash2, Users, AlertCircle,
  RefreshCw, CheckCircle2, X, Terminal, Sparkles
} from 'lucide-react';
import { MosqueSpace, CreateSpacePayload, UpdateSpacePayload } from '../../../../domain/entities/Space';
import { SpaceRepositoryImpl } from '../../../../data/repositories/SpaceRepositoryImpl';
import { useToast } from '../../../../app/components/ui/Toast';
import { DeleteConfirmModal } from '../../../../app/components/ui/DeleteConfirmModal';

const spaceRepo = new SpaceRepositoryImpl();

interface MosqueSpacesSectionProps {
  mosqueId: number | string;
  mosqueName?: string;
  onAddDebugLog?: (action: string, url: string, status: number, response: any) => void;
}

export function MosqueSpacesSection({
  mosqueId,
  mosqueName,
  onAddDebugLog,
}: MosqueSpacesSectionProps) {
  const { showToast } = useToast();

  const [spaces, setSpaces] = useState<MosqueSpace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [spaceToEdit, setSpaceToEdit] = useState<MosqueSpace | null>(null);
  const [spaceToDelete, setSpaceToDelete] = useState<MosqueSpace | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCapacity, setFormCapacity] = useState<number | string>(100);
  const [formError, setFormError] = useState<string | null>(null);

  // Load Spaces
  const loadSpaces = useCallback(async () => {
    if (!mosqueId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await spaceRepo.getMosqueSpaces(mosqueId);
      setSpaces(data);
      if (onAddDebugLog) {
        onAddDebugLog(
          `GET /api/mosques/${mosqueId}/spaces`,
          `https://mms-backend-rose.vercel.app/api/mosques/${mosqueId}/spaces`,
          200,
          data
        );
      }
    } catch (err: any) {
      console.error('Failed to load mosque spaces:', err);
      setError(err.message || 'تعذر تحميل قائمة القاعات');
    } finally {
      setLoading(false);
    }
  }, [mosqueId, onAddDebugLog]);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  // Open Create Modal
  const handleOpenAdd = () => {
    setFormName('');
    setFormCapacity(100);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (space: MosqueSpace) => {
    setSpaceToEdit(space);
    setFormName(space.name);
    setFormCapacity(space.capacity);
    setFormError(null);
  };

  // Handle Save (Create / Update)
  const handleSaveSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('يرجى إدخال اسم القاعة أو المساحة');
      return;
    }
    const capNum = Number(formCapacity);
    if (isNaN(capNum) || capNum <= 0) {
      setFormError('يرجى إدخال سعة استيعابية صحيحة أكبر من الصفر');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (spaceToEdit) {
        // PUT /api/mosques/{mosque}/spaces/{space}
        const updated = await spaceRepo.updateSpace(mosqueId, spaceToEdit.id, {
          name: formName.trim(),
          capacity: capNum,
        });
        setSpaces(prev => prev.map(s => s.id === spaceToEdit.id ? updated : s));
        if (onAddDebugLog) {
          onAddDebugLog(
            `PUT /api/mosques/${mosqueId}/spaces/${spaceToEdit.id}`,
            `https://mms-backend-rose.vercel.app/api/mosques/${mosqueId}/spaces/${spaceToEdit.id}`,
            200,
            updated
          );
        }
        showToast('تم تحديث بيانات القاعة بالسيرفر بنجاح', 'success');
        setSpaceToEdit(null);
      } else {
        // POST /api/mosques/{mosque}/spaces
        const created = await spaceRepo.createSpace(mosqueId, {
          name: formName.trim(),
          capacity: capNum,
        });
        setSpaces(prev => [...prev, created]);
        if (onAddDebugLog) {
          onAddDebugLog(
            `POST /api/mosques/${mosqueId}/spaces`,
            `https://mms-backend-rose.vercel.app/api/mosques/${mosqueId}/spaces`,
            201,
            created
          );
        }
        showToast('تمت إضافة القاعة الجديدة بالسيرفر بنجاح', 'success');
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      console.error('Save Space Error:', err);
      setFormError(err.message || 'فشلت العملية بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete (DELETE /api/mosques/{mosque}/spaces/{space})
  const handleConfirmDelete = async () => {
    if (!spaceToDelete) return;
    setIsDeleting(true);
    try {
      await spaceRepo.deleteSpace(mosqueId, spaceToDelete.id);
      setSpaces(prev => prev.filter(s => s.id !== spaceToDelete.id));
      if (onAddDebugLog) {
        onAddDebugLog(
          `DELETE /api/mosques/${mosqueId}/spaces/${spaceToDelete.id}`,
          `https://mms-backend-rose.vercel.app/api/mosques/${mosqueId}/spaces/${spaceToDelete.id}`,
          200,
          { status: true, message: 'Deleted successfully' }
        );
      }
      showToast('تم حذف القاعة بالسيرفر بنجاح', 'success');
      setSpaceToDelete(null);
    } catch (err: any) {
      console.error('Delete Space Error:', err);
      showToast(err.message || 'فشل حذف القاعة بالسيرفر', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalCapacity = spaces.reduce((sum, s) => sum + (Number(s.capacity) || 0), 0);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6 font-['Cairo']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-foreground">القاعات والمساحات التابعة للمسجد</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                {spaces.length} قاعات
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              إدارة القاعات، مصليات النساء، قاعات التحفيظ، والمساحات المخصصة بالمسجد (السعة الإجمالية: {totalCapacity.toLocaleString()} مصلي)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadSpaces}
            disabled={loading}
            className="p-2.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl transition-all border border-border"
            title="تحديث قائمة القاعات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة قاعة جديدة</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadSpaces}
            className="text-xs font-bold underline hover:no-underline"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && spaces.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted/40 border border-border rounded-2xl p-5 space-y-3">
              <div className="h-5 w-3/4 bg-muted rounded-lg" />
              <div className="h-4 w-1/2 bg-muted rounded-lg" />
              <div className="h-8 w-full bg-muted/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : spaces.length === 0 ? (
        /* Empty State */
        <div className="bg-muted/20 border border-dashed border-border rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="max-w-sm">
            <h4 className="text-sm font-bold text-foreground mb-1">لا توجد قاعات مسجلة بعد</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              يمكنك إضافة قاعات ومساحات المسجد كالمصليات، قاعات كبار السن، أو قاعات الأنشطة وتحديد سعتها.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-primary/90 transition-all mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة أول قاعة</span>
          </button>
        </div>
      ) : (
        /* Spaces Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space) => (
            <div
              key={space.id}
              className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground line-clamp-1">{space.name}</h4>
                      <span className="text-[10px] text-muted-foreground font-mono">ID: #{space.id}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    <Users className="w-3 h-3" />
                    <span>{space.capacity} مصلي</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground font-medium">
                  {space.created_at ? new Date(space.created_at).toLocaleDateString('ar-SA') : 'مساحة مخصصة'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(space)}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all border border-transparent hover:border-border"
                    title="تعديل القاعة"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpaceToDelete(space)}
                    className="p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 rounded-lg transition-all border border-transparent hover:border-rose-500/20"
                    title="حذف القاعة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add or Edit Space */}
      {(isAddModalOpen || spaceToEdit) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    {spaceToEdit ? 'تعديل بيانات القاعة' : 'إضافة قاعة / مساحة جديدة'}
                  </h3>
                  <p className="text-xs text-muted-foreground">{mosqueName || 'بيانات القاعة بالمسجد'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSpaceToEdit(null);
                }}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSpace} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  اسم القاعة أو المساحة *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: قاعة مصلى النساء، قاعة كبار السن، قاعة الفعاليات"
                  className="w-full px-3.5 py-2.5 bg-muted/50 border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  السعة الاستيعابية (عدد المصلين / المقاعد) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(e.target.value)}
                  placeholder="مثال: 120"
                  className="w-full px-3.5 py-2.5 bg-muted/50 border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setSpaceToEdit(null);
                  }}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formName.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{spaceToEdit ? 'حفظ التعديلات' : 'إضافة القاعة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(spaceToDelete)}
        title="حذف القاعة / المساحة"
        message={`هل أنت متأكد من رغبتك في حذف "${spaceToDelete?.name}" من المسجد؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، حذف القاعة"
        cancelText="إلغاء"
        onConfirm={handleConfirmDelete}
        onCancel={() => setSpaceToDelete(null)}
        loading={isDeleting}
      />
    </div>
  );
}
