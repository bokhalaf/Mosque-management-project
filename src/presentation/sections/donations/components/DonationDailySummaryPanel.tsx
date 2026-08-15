// ==============================
// Donations — DonationDailySummaryPanel Component
// العمود الجانبي: ملخص اليوم (إحصائيات فورية) بجانب جدول التبرعات بمطابقة مع نظام التصميم
// ==============================

import React from 'react';
import { Wallet, ArrowUpRight } from 'lucide-react';
import { DailySummary } from '../../../../domain/entities/Donation';

interface DonationDailySummaryPanelProps {
  dailySummary: DailySummary | null;
  loading?: boolean;
}

export function DonationDailySummaryPanel({ dailySummary }: DonationDailySummaryPanelProps) {
  const totalToday = Number(dailySummary?.totalToday || 0);
  const operationsCount = Number(dailySummary?.operationsCount || 0);
  const averageDonation = operationsCount > 0 ? Math.round(totalToday / operationsCount) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 font-['Cairo']">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground">ملخص اليوم</h3>
          <p className="text-[11px] font-medium text-muted-foreground">إحصائيات فورية للتبرعات اليومية</p>
        </div>
      </div>

      {/* Main Stat: Total Today */}
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-muted-foreground">إجمالي تبرعات اليوم</p>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            +5%
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-black text-primary">
            {totalToday.toLocaleString('ar-EG')}
          </span>
          <span className="text-xs font-bold text-muted-foreground">ل.س</span>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-muted/40 rounded-xl border border-border/80 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground">عدد العمليات</p>
          <p className="text-lg font-black text-foreground">{operationsCount}</p>
        </div>

        <div className="p-3.5 bg-muted/40 rounded-xl border border-border/80 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground">متوسط التبرع</p>
          <p className="text-lg font-black text-foreground">
            {averageDonation.toLocaleString('ar-EG')} <span className="text-[10px] font-bold text-muted-foreground">ل.س</span>
          </p>
        </div>
      </div>
    </div>
  );
}
