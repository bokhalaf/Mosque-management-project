// ==============================
// Sermons — HistoryModal Component
// Modal: سجل خطب الجمعة المختارة مع فلترة مدمجة وأنيقة وتحديث فوري مع Skeleton Scan
// ==============================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { History, X, Calendar, Filter, RotateCcw, Clock, Check } from 'lucide-react';
import { SermonSelection } from '../../../../domain/entities/Sermon';
import { SermonRepositoryImpl } from '../../../../data/repositories/SermonRepositoryImpl';
import { GetSermonSelectionsUseCase } from '../../../../domain/usecases/sermons/GetSermonSelectionsUseCase';

const sermonRepo = new SermonRepositoryImpl();
const getSelectionsUseCase = new GetSermonSelectionsUseCase(sermonRepo);

interface HistoryModalProps {
  selectionsHistory: SermonSelection[];
  onClose: () => void;
  onDebugLog?: (action: string, url: string, status: number | string, response: any) => void;
}

type DatePreset = 'all' | 'this_month' | 'last_30_days' | 'this_year' | 'custom';

export function HistoryModal({ selectionsHistory: initialHistory, onClose, onDebugLog }: HistoryModalProps) {
  const [activePreset, setActivePreset] = useState<DatePreset>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  
  const [selections, setSelections] = useState<SermonSelection[]>(initialHistory);
  const [loading, setLoading] = useState<boolean>(false);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // Fetch / filter selections when dates change
  const fetchFilteredSelections = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const results = await getSelectionsUseCase.execute({
        from_date: from || undefined,
        to_date: to || undefined,
      });
      setSelections(results);
      if (onDebugLog) {
        const queryParams = new URLSearchParams();
        if (from) queryParams.append('from_date', from);
        if (to) queryParams.append('to_date', to);
        const qStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
        onDebugLog('GET /api/sermon-selections/my', `https://mms-backend-rose.vercel.app/api/sermon-selections/my${qStr}`, 200, results);
      }
    } catch (e) {
      console.warn("Failed fetching filtered selections:", e);
      setSelections(
        initialHistory.filter((item) => {
          const itemDate = item.selection_date;
          if (!itemDate) return true;
          if (from && itemDate < from) return false;
          if (to && itemDate > to) return false;
          return true;
        })
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 250);
    }
  }, [initialHistory, onDebugLog]);

  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    setActivePreset('custom');
    fetchFilteredSelections(val, toDate);
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    setActivePreset('custom');
    fetchFilteredSelections(fromDate, val);
  };

  const handlePresetClick = (preset: DatePreset) => {
    setActivePreset(preset);
    const today = new Date();
    let fDate = '';
    let tDate = '';

    if (preset === 'this_month') {
      fDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      tDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (preset === 'last_30_days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      fDate = past.toISOString().split('T')[0];
      tDate = getTodayStr();
    } else if (preset === 'this_year') {
      fDate = `${new Date().getFullYear()}-01-01`;
      tDate = `${new Date().getFullYear()}-12-31`;
    }

    setFromDate(fDate);
    setToDate(tDate);
    fetchFilteredSelections(fDate, tDate);
  };

  const resetFilters = () => {
    setActivePreset('all');
    setFromDate('');
    setToDate('');
    fetchFilteredSelections('', '');
  };

  const hasActiveFilter = Boolean(fromDate || toDate || activePreset !== 'all');

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl p-5 md:p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">
                سجل الخطب المختارة للجمعة ({selections.length})
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact UI/UX Filter Control Box */}
        <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-primary" /> تصفية:
              </span>
              <button
                onClick={() => handlePresetClick('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  activePreset === 'all'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                الكل ({initialHistory.length})
              </button>
              <button
                onClick={() => handlePresetClick('this_month')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  activePreset === 'this_month'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                هذا الشهر
              </button>
              <button
                onClick={() => handlePresetClick('last_30_days')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  activePreset === 'last_30_days'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                آخر 30 يوم
              </button>
              <button
                onClick={() => handlePresetClick('this_year')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  activePreset === 'this_year'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                هذه السنة
              </button>
            </div>

            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg text-[11px] font-bold transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط</span>
              </button>
            )}
          </div>

          {/* Date Range Inputs Inline */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-border/40">
            <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1 w-full sm:flex-1">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-[11px] font-bold text-muted-foreground shrink-0">من:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-foreground w-full focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1 w-full sm:flex-1">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-[11px] font-bold text-muted-foreground shrink-0">إلى:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-foreground w-full focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="space-y-2.5 py-1">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-3 bg-card border border-border rounded-xl animate-pulse space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-28 bg-muted rounded-md" />
                  <div className="h-3.5 w-20 bg-muted rounded-md" />
                </div>
                <div className="h-4 w-2/3 bg-muted rounded-md" />
              </div>
            ))}
          </div>
        ) : selections.length === 0 ? (
          <div className="py-8 text-center space-y-2 bg-muted/20 border border-dashed border-border rounded-xl">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-bold">
              {hasActiveFilter ? 'لا توجد خطب معتمدة مطابقة للنطاق الزمني.' : 'لا يوجد سجل سابق للخطب المختارة.'}
            </p>
            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
              >
                إعادة ضبط التصفية
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
            {selections.map((sel) => (
              <div key={sel.id} className="p-3 bg-card border border-border rounded-xl flex items-center justify-between gap-3 hover:border-primary/40 transition-all group shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      تاريخ الاعتماد: {sel.selection_date}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
                    {sel.sermon?.title || `خطبة جمعة معتمدة #${sel.sermon_id}`}
                  </h4>
                  {sel.notes && <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{sel.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-muted text-foreground hover:bg-muted/80 text-xs font-bold rounded-xl transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
