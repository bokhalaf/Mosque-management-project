"use client";

import React, { useState } from 'react';
import { 
  Upload, 
  Wallet, Calendar, Users, 
  Info, CheckCircle2, Loader2
} from "lucide-react";
import { PageHeader } from "../../app/components/PageHeader";
import { useDonations } from "../hooks/useDonations";
import { useToast } from "../../app/components/ui/Toast";

interface AddDonationSectionProps {
  onBack: () => void;
}

export function AddDonationSection({ onBack }: AddDonationSectionProps) {
  const { addCashDonation, campaigns, loading: campaignsLoading, dailySummary } = useDonations();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    donorName: '',
    amount: '',
    type: '',
    campaignId: '',
    notes: '',
    receiptFile: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.donorName.trim()) newErrors.donorName = 'اسم المتبرع مطلوب';
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'مبلغ التبرع مطلوب ويجب أن يكون أكبر من صفر';
    if (!formData.type) newErrors.type = 'نوع التبرع مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        campaign_id: formData.campaignId ? formData.campaignId : undefined,
        notes: formData.notes.trim() || undefined,
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
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo']">
      <PageHeader 
        title="إضافة تبرع جديد"
        description="قم بإدخال تفاصيل التبرع الجديد لتسجيله في النظام بدقة."
        onBack={onBack}
        breadcrumbs={[
          { label: "إدارة التبرعات" },
          { label: "إضافة تبرع", active: true }
        ]}
      />

      <main className="px-4 md:px-8 pt-0 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload Section */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-foreground">صورة الإيصال (اختياري)</label>
                  <label className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {formData.receiptFile ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Upload className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">
                        {formData.receiptFile ? formData.receiptFile.name : 'اضغط لرفع الملف أو اسحبه هنا'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF حتى 10MB</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,.pdf"
                      onChange={(e) => setFormData({ ...formData, receiptFile: e.target.files?.[0] || null })}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1 text-foreground">
                      اسم المتبرع <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.donorName}
                      onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                      placeholder="أدخل اسم المتبرع كاملاً" 
                      className={`w-full h-12 px-4 bg-muted/30 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-right text-foreground placeholder:text-muted-foreground ${
                        errors.donorName ? 'border-red-500 bg-red-50/10' : 'border-border'
                      }`}
                    />
                    {errors.donorName && <p className="text-xs text-red-500 px-1">{errors.donorName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1 text-foreground">
                      مبلغ التبرع <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00" 
                        min="1"
                        className={`w-full h-12 pr-4 pl-14 bg-muted/30 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-right text-foreground placeholder:text-muted-foreground ${
                          errors.amount ? 'border-red-500 bg-red-50/10' : 'border-border'
                        }`}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">ل.س</span>
                    </div>
                    {errors.amount && <p className="text-xs text-red-500 px-1">{errors.amount}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1 text-foreground">
                      نوع التبرع <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className={`w-full h-12 px-4 bg-muted/30 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none text-right text-foreground ${
                        errors.type ? 'border-red-500 bg-red-50/10' : 'border-border'
                      }`}
                    >
                      <option value="">اختر النوع...</option>
                      <option value="تبرع عام">تبرع عام</option>
                      <option value="زكاة">زكاة</option>
                      <option value="صدقة">صدقة جارية</option>
                      <option value="كفارة">كفارة</option>
                    </select>
                    {errors.type && <p className="text-xs text-red-500 px-1">{errors.type}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1 text-foreground">الحملة المرتبطة (اختياري)</label>
                    <select 
                      value={formData.campaignId}
                      onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                      className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none text-right text-foreground"
                      disabled={campaignsLoading}
                    >
                      <option value="">لا يوجد حملة محددة</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold px-1 text-foreground">ملاحظات إضافية</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أدخل أي ملاحظات إضافية هنا..." 
                    className="w-full h-32 p-4 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none text-right text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري التسجيل...
                      </>
                    ) : (
                      'تسجيل التبرع'
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Stats & Info */}
          <div className="space-y-6">
            {/* Daily Summary Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary">ملخص اليوم</p>
                  <p className="text-sm font-medium text-primary/80">إحصائيات فورية</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-end border-b border-primary/10 pb-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">إجمالي تبرعات اليوم</p>
                    <p className="text-2xl font-black text-foreground tracking-tight">{Number(dailySummary?.totalToday || 0).toLocaleString('ar-EG')} <span className="text-xs font-bold text-muted-foreground">ل.س</span></p>
                  </div>
                  <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">+5%</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground">عدد العمليات</p>
                    <p className="text-lg font-bold text-foreground">{dailySummary?.operationsCount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground">متوسط التبرع</p>
                    <p className="text-lg font-bold text-foreground">{dailySummary?.operationsCount ? Math.round(dailySummary.totalToday / dailySummary.operationsCount).toLocaleString('ar-EG') : 0} ل.س</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h4 className="font-bold text-sm flex items-center gap-2 mb-4 text-foreground">
                <Info className="w-4 h-4 text-blue-500" />
                إرشادات هامة
              </h4>
              <ul className="space-y-3">
                {[
                  "تأكد من مطابقة المبلغ للمكتوب في الإيصال",
                  "اختر نوع التبرع بدقة لضمان صحة التقارير",
                  "يفضل رفع نسخة من الإيصال للشفافية المالية",
                  "سيصل تنبيه للمتبرع فور تأكيد العملية"
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-xs text-muted-foreground leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground">الأكثر تبرعاً</p>
                  <p className="text-xs font-bold text-foreground">الزكاة</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground">متبرعين جدد</p>
                  <p className="text-xs font-bold text-foreground">+12 اليوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
