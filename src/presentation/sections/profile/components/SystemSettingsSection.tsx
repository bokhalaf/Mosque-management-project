'use client';

// ==============================
// UI Component — SystemSettingsSection
// إدارة سعر صرف العملات الرسمية (الدولار الأمريكي مقابل الليرة السورية)
// متصل بنقاط النهاية الرسمية /api/settings و /api/settings/exchange-rate
// ==============================

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, RefreshCw, AlertCircle, HelpCircle, Save, Sparkles
} from 'lucide-react';
import { SettingsRepositoryImpl } from '../../../../data/repositories/SettingsRepositoryImpl';
import { useToast } from '../../../../app/components/ui/Toast';

const settingsRepo = new SettingsRepositoryImpl();

interface SystemSettingsSectionProps {
  onAddDebugLog?: (action: string, url: string, status: number, response: any) => void;
}

export function SystemSettingsSection({ onAddDebugLog }: SystemSettingsSectionProps) {
  const { showToast } = useToast();

  const [rate, setRate] = useState<number | string>(14500);
  const [currentRateNumber, setCurrentRateNumber] = useState<number>(14500);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingRate, setSavingRate] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load Settings
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsRepo.getSettings();
      if (onAddDebugLog) {
        onAddDebugLog(
          'GET /api/settings',
          'https://mms-backend-rose.vercel.app/api/settings',
          200,
          data
        );
      }

      // Extract current rate if present
      const rateSetting = data.find(s => s.key === 'usd_to_syp_rate');
      if (rateSetting && rateSetting.value) {
        const parsed = parseFloat(rateSetting.value);
        if (!isNaN(parsed) && parsed > 0) {
          setRate(parsed);
          setCurrentRateNumber(parsed);
        }
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setError(err.message || 'تعذر جلب بيانات سعر الصرف من السيرفر');
    } finally {
      setLoading(false);
    }
  }, [onAddDebugLog]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle Update Exchange Rate (PUT /api/settings/exchange-rate)
  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = Number(rate);
    if (isNaN(rateNum) || rateNum < 1) {
      showToast('يرجى إدخال سعر صرف صحيح أكبر من الصفر', 'error');
      return;
    }

    setSavingRate(true);
    try {
      const res = await settingsRepo.updateExchangeRate(rateNum);
      const updatedNum = Number(res.new_rate || rateNum);
      setCurrentRateNumber(updatedNum);
      setRate(updatedNum);
      if (onAddDebugLog) {
        onAddDebugLog(
          'PUT /api/settings/exchange-rate',
          'https://mms-backend-rose.vercel.app/api/settings/exchange-rate',
          200,
          res
        );
      }
      showToast(res.message || 'تم تحديث سعر الصرف وتفريغ الكاش بنجاح ✅', 'success');
    } catch (err: any) {
      console.error('Update Exchange Rate Error:', err);
      showToast(err.message || 'فشل تحديث سعر الصرف بالسيرفر', 'error');
    } finally {
      setSavingRate(false);
    }
  };

  const quickRatePresets = [14000, 14500, 15000, 15500, 16000];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 font-['Cairo'] animate-in fade-in" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-foreground">سعر الصرف</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة سعر تحويل التبرعات الإلكترونية للعملة المحلية المعتمدة.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all disabled:opacity-50 shrink-0 self-start sm:self-auto"
          title="تحديث البيانات من السيرفر"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadSettings} className="font-bold underline hover:no-underline text-xs">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Primary Hero Card: USD to SYP Exchange Rate */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-primary/5 to-card border border-emerald-500/30 rounded-3xl p-6 md:p-7 shadow-sm space-y-6 relative overflow-hidden">
        {/* Decorative Background Icon */}
        <DollarSign className="w-48 h-48 text-emerald-500/5 absolute -left-10 -bottom-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold inline-block mb-1">
              التحويل الإلكتروني المعتمد
            </span>
            <h4 className="text-lg font-black text-foreground">سعر صرف الدولار مقابل الليرة السورية</h4>
          </div>

          <div className="bg-card/80 backdrop-blur-sm border border-border p-3.5 rounded-2xl shrink-0 text-right">
            <span className="text-[11px] font-bold text-muted-foreground block mb-0.5">السعر المعتمد حالياً:</span>
            <div className="flex items-center gap-1.5 text-base md:text-lg font-black text-emerald-600 dark:text-emerald-400">
              <span>1 دولار أمريكي</span>
              <span className="text-muted-foreground font-normal">=</span>
              <span className="font-mono">{currentRateNumber.toLocaleString('ar-EG')}</span>
              <span>ل.س</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-card/70 border border-border/80 rounded-2xl text-xs text-muted-foreground space-y-1.5 leading-relaxed">
          <p className="flex items-center gap-1.5 font-bold text-foreground">
            <HelpCircle className="w-4 h-4 text-primary shrink-0" />
            <span>كيف يعمل سعر الصرف في النظام؟</span>
          </p>
          <p>
            يُستخدم هذا السعر لتحويل مبالغ التبرعات الإلكترونية الدولية بالدولار إلى <strong>الليرة السورية</strong> فورياً قبل إيداعها وتحديث مؤشرات حملات واحتياجات المساجد.
            عند تحديث السعر يتم تفريغ الكاش المباشر فوراً لتبدأ كافة التبرعات اللاحقة باستخدام السعر الجديد.
          </p>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdateRate} className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                القيمة الجديدة لسعر الصرف (1 دولار = كم ليرة سورية؟) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max="10000000"
                  step="any"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="مثال: 14500"
                  className="w-full pl-20 pr-4 py-3 bg-card border border-border focus:border-primary rounded-2xl text-sm font-black font-mono outline-none text-foreground shadow-inner text-right"
                  dir="ltr"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  ليرة سورية
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingRate || !rate}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 shrink-0"
            >
              {savingRate ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ وتحديث سعر الصرف</span>
            </button>
          </div>

          {/* Quick Rate Adjustments */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-bold text-muted-foreground ml-1">قيم سريعة:</span>
            {quickRatePresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setRate(val)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  Number(rate) === val
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-card border-border hover:bg-muted text-foreground'
                }`}
              >
                {val.toLocaleString('ar-EG')} ل.س
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
