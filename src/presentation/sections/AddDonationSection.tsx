// ==============================
// Donations — AddDonationSection Component
// صفحة إضافة تبرع جديد (حذف المعاينة، الملاحظات، ورقم الهاتف)
// ==============================

import React, { useState } from 'react';
import { 
  Upload, X, Info, Wallet, Tag, Target,
  CheckCircle2, Loader2, User, Package
} from "lucide-react";
import { PageHeader } from "../../app/components/PageHeader";
import { useDonations } from "../hooks/useDonations";
import { useToast } from "../../app/components/ui/Toast";

interface AddDonationSectionProps {
  onBack: () => void;
}

export function AddDonationSection({ onBack }: AddDonationSectionProps) {
  const { addCashDonation, campaigns, loading: campaignsLoading } = useDonations();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    donorName: '',
    amount: '',
    type: 'cash' as 'cash' | 'in_kind',
    campaignId: '',
    itemDescription: '',
    receiptFile: null as File | null,
    receiptPreview: null as string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        receiptFile: file,
        receiptPreview: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => {
    setFormData(prev => ({
      ...prev,
      receiptFile: null,
      receiptPreview: null,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.donorName.trim()) newErrors.donorName = 'اسم المتبرع مطلوب';
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'المبلغ مطلوب ويجب أن يكون أكبر من صفر';
    if (formData.type === 'in_kind' && !formData.itemDescription.trim()) {
      newErrors.itemDescription = 'يرجى كتابة نوع أو وصف التبرع العيني';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      showToast('الرجاء تعبئة جميع الحقول المطلوبة', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCashDonation({
        donor_name: formData.donorName.trim(),
        amount: Number(formData.amount),
        type: formData.type,
        campaign_id: formData.type === 'cash' && formData.campaignId ? formData.campaignId : undefined,
        item_description: formData.type === 'in_kind' ? formData.itemDescription.trim() : undefined,
        receipt_file: formData.receiptFile || undefined,
      });
      showToast('✅ تم تسجيل التبرع بنجاح!', 'success');
      onBack();
    } catch (err: any) {
      console.error('Add Donation Error:', err);
      showToast('❌ حدث خطأ أثناء تسجيل التبرع: ' + (err.message || 'تأكد من صحة البيانات'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      {/* Page Header with Top Action Buttons */}
      <PageHeader 
        title="إضافة تبرع جديد"
        description="تسجيل تبرع نقدي أو عيني جديد للمسجد بدقة وشفافية."
        onBack={onBack}
        breadcrumbs={[
          { label: "إدارة المسجد" },
          { label: "إدارة التبرعات" },
          { label: "إضافة تبرع", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التسجيل...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تسجيل التبرع</span>
                </>
              )}
            </button>
          </div>
        }
      />

      <main className="px-4 md:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-6 bg-primary rounded-full inline-block" />
                  <h3 className="text-base font-bold text-foreground">بيانات التبرع</h3>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">الحقول المميزة بـ (*) مطلوبة</span>
              </div>

              {/* Row 1: Donor Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  اسم المتبرع *
                </label>
                <input
                  type="text"
                  required
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  placeholder="مثال: فاعل خير، أحمد محمد..."
                  className={`w-full px-4 py-2.5 bg-muted border rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground ${
                    errors.donorName ? 'border-red-500 bg-red-50/10' : 'border-transparent focus:border-primary'
                  }`}
                  dir="rtl"
                />
                {errors.donorName && <p className="text-[11px] text-red-500 font-bold">{errors.donorName}</p>}
              </div>

              {/* Row 2: Type (نقدي / عيني فقط) & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    نوع التبرع *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'cash' | 'in_kind' })}
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground font-bold"
                    dir="rtl"
                  >
                    <option value="cash">تبرع نقدي (Cash)</option>
                    <option value="in_kind">تبرع عيني (In-Kind)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-primary" />
                    {formData.type === 'in_kind' ? 'العدد أو الكمية *' : 'مبلغ التبرع (ل.س) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder={formData.type === 'in_kind' ? 'مثال: 5، 10، 50...' : 'مثال: 10000'}
                    className={`w-full px-4 py-2.5 bg-muted border rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground ${
                      errors.amount ? 'border-red-500 bg-red-50/10' : 'border-transparent focus:border-primary'
                    }`}
                    dir="rtl"
                  />
                  {errors.amount && <p className="text-[11px] text-red-500 font-bold">{errors.amount}</p>}
                </div>
              </div>

              {/* Row 3: Conditional (Cash: الحملة المرتبطة | In-Kind: نوع أو وصف التبرع العيني item_description) */}
              {formData.type === 'cash' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    الحملة المرتبطة (اختياري)
                  </label>
                  <select
                    value={formData.campaignId}
                    onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                    dir="rtl"
                    disabled={campaignsLoading}
                  >
                    <option value="">لا يوجد حملة محددة (تبرع عام للمسجد)</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    نوع أو وصف التبرع العيني (item_description) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemDescription}
                    onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                    placeholder="مثال: 5 مكيفات هواء سبليت، 100 مصحف شريف، سجاد فاخر لصحن المسجد..."
                    className={`w-full px-4 py-2.5 bg-muted border rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground ${
                      errors.itemDescription ? 'border-red-500 bg-red-50/10' : 'border-transparent focus:border-primary'
                    }`}
                    dir="rtl"
                  />
                  {errors.itemDescription && (
                    <p className="text-[11px] text-red-500 font-bold">{errors.itemDescription}</p>
                  )}
                </div>
              )}

              {/* Receipt File Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">صورة الإيصال أو وثيقة الاستلام (اختياري)</label>
                <div className="flex items-center gap-4">
                  {formData.receiptPreview ? (
                    <div className="relative w-24 h-20 rounded-xl overflow-hidden border border-border shrink-0 bg-muted">
                      <img src={formData.receiptPreview} alt="Receipt" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-md"
                        title="إزالة الإيصال"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}

                  <label className="flex-1 border-2 border-dashed border-border hover:border-primary rounded-2xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-muted/30 hover:bg-muted/60 transition-all text-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-bold text-foreground">
                      {formData.receiptFile ? formData.receiptFile.name : 'انقر لرفع صورة الإيصال أو الوثيقة'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG, PDF حتى 10MB</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onBack}
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
                      <span>جاري تسجيل التبرع...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تسجيل التبرع</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Area (4 Cols) — Clean Guidelines */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                إرشادات تسجيل التبرعات
              </h4>
              <ul className="space-y-3">
                {[
                  "حدد نوع التبرع بدقة (نقدي للإيداعات النقدية، أو عيني للمواد والتجهيزات)",
                  "عند اختيار تبرع عيني، يرجى كتابة وصف دقيق للمادة وقيمتها التقديرية",
                  "تأكد من مطابقة المبلغ للمستلم الفعلي أو إيصال الإيداع",
                  "يتم توثيق كل عملية برقم مرجعي تلقائي مع إمكانية طباعة إيصال رسمي"
                ].map((text, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
