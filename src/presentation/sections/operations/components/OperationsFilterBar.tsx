'use client';

// ==============================
// Component — OperationsFilterBar
// شريط البحث وفلترة سجل العمليات بالتاريخ والوحدة
// ==============================

import React from 'react';
import { Search, Calendar, Filter, X, RotateCcw } from 'lucide-react';

interface OperationsFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedModule: string;
  onSelectModule: (m: string) => void;
  dateFrom: string;
  onDateFromChange: (d: string) => void;
  dateTo: string;
  onDateToChange: (d: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function OperationsFilterBar({
  searchQuery,
  onSearchChange,
  selectedModule,
  onSelectModule,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onReset,
  hasActiveFilters,
}: OperationsFilterBarProps) {
  const modules = [
    { id: 'all', label: 'كافة الوحدات' },
    { id: 'donations', label: 'التبرعات' },
    { id: 'maintenance', label: 'الصيانة' },
    { id: 'complaints', label: 'الشكاوى' },
    { id: 'sermons', label: 'الخطب' },
    { id: 'mosques', label: 'المساجد' },
  ];

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-4 md:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث في العمليات (العنوان، اسم المسجد، اسم الموظف، التفاصيل)..."
            className="w-full pr-10 pl-9 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border rounded-2xl text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Filter Inputs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-2xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">من:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="bg-transparent border-0 text-xs text-foreground outline-none font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-2xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">إلى:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="bg-transparent border-0 text-xs text-foreground outline-none font-sans"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-2xl transition-all"
              title="إعادة تعيين الفلاتر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلغاء الفلاتر</span>
            </button>
          )}
        </div>
      </div>

      {/* Module Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-border/50">
        <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground pl-2 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>الوحدة:</span>
        </div>
        {modules.map((m) => {
          const isActive = selectedModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectModule(m.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/60'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
