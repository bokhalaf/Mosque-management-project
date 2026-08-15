// ==============================
// Campaigns — EditCampaignModal Component
// نافذة تعديل بيانات الحملة متوافقة مع الـ API (POST /api/campaigns/{id} with _method: PUT)
// ==============================

import React, { useState } from 'react';
import { X, Upload, Loader2, Edit3, Target, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Campaign, UpdateCampaignPayload } from '../../../../domain/entities/Donation';

interface EditCampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string | number, payload: UpdateCampaignPayload) => Promise<any>;
}

export function EditCampaignModal({
  campaign,
  isOpen,
  onClose,
  onUpdate,
}: EditCampaignModalProps) {
  if (!isOpen || !campaign) return null;

  const [title, setTitle] = useState(campaign.title || '');
  const [description, setDescription] = useState(campaign.description || '');
  const [targetAmount, setTargetAmount] = useState(campaign.target_amount || campaign.targetAmount || 0);
  const [startDate, setStartDate] = useState(campaign.start_date ? campaign.start_date.split('T')[0] : '');
  const [endDate, setEndDate] = useState(campaign.end_date ? campaign.end_date.split('T')[0] : '');
  const [priority, setPriority] = useState(campaign.priority || 'medium');
  const [status, setStatus] = useState(campaign.status || 'active');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(campaign.cover_image || campaign.image || null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('يرجى إدخال عنوان الحملة');
      return;
    }
    if (Number(targetAmount) <= 0) {
      setErrorMsg('يرجى إدخال مبلغ هدف صالح');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onUpdate(campaign.id, {
        title,
        description,
        target_amount: Number(targetAmount),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        priority,
        status,
        cover_image: coverImageFile,
      });
      onClose();
    } catch (err: any) {
      console.error("Failed to update campaign:", err);
      setErrorMsg(err.message || 'فشل تعديل الحملة، يرجى التحقق من المدخلات');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">تعديل بيانات الحملة</h3>
              <p className="text-xs text-muted-foreground">تحديث تفاصيل الحملة وأهدافها المالية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">عنوان الحملة *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: كسوة العيد للأيتام"
              required
              className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">وصف الحملة</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="وصف تفصيلي لأهداف الحملة..."
              className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground resize-none"
            />
          </div>

          {/* Target Amount & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                المبلغ المستهدف (ل.س) *
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                min="1"
                required
                className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                الأولوية
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground"
              >
                <option value="high">عاجلة / عالية (High)</option>
                <option value="medium">متوسطة (Medium)</option>
                <option value="low">عادية / منخفضة (Low)</option>
              </select>
            </div>
          </div>

          {/* Start Date & End Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                تاريخ البدء
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                تاريخ الانتهاء
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">حالة الحملة</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground"
            >
              <option value="active">نشطة (Active)</option>
              <option value="paused">متوقفة مؤقتاً (Paused)</option>
              <option value="completed">مكتملة (Completed)</option>
              <option value="cancelled">ملغاة (Cancelled)</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">صورة غلاف الحملة</label>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <div className="w-20 h-16 rounded-xl overflow-hidden border border-border shrink-0 bg-muted">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex-1 border-2 border-dashed border-border hover:border-primary rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-muted/40 hover:bg-muted transition-all">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-bold text-foreground">
                  {coverImageFile ? coverImageFile.name : 'اختر صورة جديدة لتغيير الغلاف'}
                </span>
                <span className="text-[10px] text-muted-foreground">PNG, JPG حتى 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>حفظ التعديلات</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
