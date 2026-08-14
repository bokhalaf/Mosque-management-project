// ==============================
// Complaints — ComplaintFilterBar Component
// شريط الفلاتر متكامل: تبويبات الحالة + بحث مفعل بـ Enter + Dropdown Panel للفلاتر + Chips
// ==============================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import { ComplaintStats } from '../../../../domain/entities/Complaint';
import { ComplaintFilters } from '../../../hooks/useComplaints';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
    case 'new': return 'جديدة';
    case 'in_progress':
    case 'review': return 'قيد المعالجة';
    case 'resolved': return 'تم الحل';
    case 'canceled':
    case 'closed': return 'مغلقة';
    default: return status;
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high': return 'عالية';
    case 'medium': return 'متوسطة';
    case 'low': return 'عادية';
    default: return priority || 'غير محدد';
  }
};

const getComplaintTypeLabel = (type?: string) => {
  switch (type) {
    case 'service_missing': return 'خدمة مفقودة';
    case 'power_outage': return 'انقطاع كهرباء / تكييف';
    case 'corruption': return 'بلاغ إداري';
    case 'employee_misconduct': return 'سلوك موظف';
    case 'technical_issue': return 'مشكلة تقنية';
    case 'other': return 'أخرى';
    default: return type || 'عام';
  }
};

// ── Filter Dropdown Panel Helper ─────────────────────────────────────────────

interface FilterOption { id: string; label: string; }

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
  accentColor?: string;
}

function FilterGroup({ title, options, value, onChange, accentColor = 'primary' }: FilterGroupProps) {
  return (
    <div>
      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              value === opt.id
                ? `bg-primary/10 text-primary border-primary/30`
                : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
            }`}
          >
            {value === opt.id && <Check className="w-3 h-3 text-primary" />}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ComplaintFilterBarProps {
  filters: ComplaintFilters;
  stats: ComplaintStats;
  hasActiveFilters: boolean;
  onSetSearchQuery: (v: string) => void;
  onSetStatusFilter: (v: string) => void;
  onSetPriorityFilter: (v: string) => void;
  onSetTypeFilter: (v: string) => void;
  onResetFilters: () => void;
}

export function ComplaintFilterBar({
  filters,
  stats,
  hasActiveFilters,
  onSetSearchQuery,
  onSetStatusFilter,
  onSetPriorityFilter,
  onSetTypeFilter,
  onResetFilters,
}: ComplaintFilterBarProps) {
  // Local search input state — البحث يُفعَّل عند Enter أو زر البحث
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync local search if parent resets filters
  useEffect(() => {
    if (filters.searchQuery === '') setLocalSearch('');
  }, [filters.searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = () => {
    onSetSearchQuery(localSearch.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setLocalSearch('');
      onSetSearchQuery('');
    }
  };

  const statusTabs = [
    { id: 'all', label: 'الجميع', count: stats.total_complaints },
    { id: 'pending', label: 'جديدة', count: stats.open_complaints },
    { id: 'in_progress', label: 'قيد المعالجة' },
    { id: 'resolved', label: 'تم الحل', count: stats.resolved_this_month },
    { id: 'canceled', label: 'مغلقة' },
  ];

  const priorityOptions: FilterOption[] = [
    { id: 'all', label: 'الجميع' },
    { id: 'high', label: 'عالية' },
    { id: 'medium', label: 'متوسطة' },
    { id: 'low', label: 'عادية' },
  ];

  const typeOptions: FilterOption[] = [
    { id: 'all', label: 'الجميع' },
    { id: 'service_missing', label: 'خدمة مفقودة' },
    { id: 'power_outage', label: 'انقطاع كهرباء/تكييف' },
    { id: 'corruption', label: 'بلاغ إداري' },
    { id: 'employee_misconduct', label: 'سلوك موظف' },
    { id: 'technical_issue', label: 'مشكلة تقنية' },
  ];

  const activeFiltersCount = [
    filters.priorityFilter !== 'all',
    filters.typeFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 font-['Cairo']">

      {/* Row 1: Status Segmented Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSetStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              filters.statusFilter === tab.id
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 text-[10px] rounded-md ${
                filters.statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-background text-foreground'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Row 2: Search + Dropdown Filters Button */}
      <div className="flex gap-3 items-center">

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث برقم الشكوى، العنوان، اسم المرسل... ثم اضغط Enter"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-24 pr-11 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground"
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); onSetSearchQuery(''); }}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="px-3 py-1 bg-primary text-primary-foreground text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              بحث
            </button>
          </div>
        </div>

        {/* Filters Dropdown Panel Button */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              filtersOpen || activeFiltersCount > 0
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-muted text-foreground border-border hover:bg-muted/80'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فلاتر</span>
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Panel */}
          {filtersOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-foreground">خيارات التصفية</span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => { onSetPriorityFilter('all'); onSetTypeFilter('all'); }}
                    className="text-[11px] font-bold text-red-500 hover:underline"
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>

              <FilterGroup
                title="الأولوية"
                options={priorityOptions}
                value={filters.priorityFilter}
                onChange={(v) => onSetPriorityFilter(v)}
              />

              <div className="border-t border-border/60" />

              <FilterGroup
                title="تصنيف الشكوى"
                options={typeOptions}
                value={filters.typeFilter}
                onChange={(v) => onSetTypeFilter(v)}
              />

              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                تطبيق
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 animate-in fade-in">
          <span className="text-[11px] font-bold text-muted-foreground">الفلاتر النشطة:</span>

          {filters.statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              الحالة: {getStatusLabel(filters.statusFilter)}
              <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => onSetStatusFilter('all')} />
            </span>
          )}

          {filters.priorityFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
              الأولوية: {getPriorityLabel(filters.priorityFilter)}
              <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => onSetPriorityFilter('all')} />
            </span>
          )}

          {filters.typeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
              التصنيف: {getComplaintTypeLabel(filters.typeFilter)}
              <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => onSetTypeFilter('all')} />
            </span>
          )}

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-bold border border-border">
              بحث: "{filters.searchQuery}"
              <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => { setLocalSearch(''); onSetSearchQuery(''); }} />
            </span>
          )}

          <button
            onClick={() => { onResetFilters(); setLocalSearch(''); }}
            className="text-xs font-bold text-red-500 hover:underline mr-auto flex items-center gap-1"
          >
            إعادة ضبط الكل
          </button>
        </div>
      )}
    </div>
  );
}
