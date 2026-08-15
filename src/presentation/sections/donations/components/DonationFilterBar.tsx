// ==============================
// Donations — DonationFilterBar Component
// شريط الفلاتر: حقل البحث الرئيسي + قائمة الفلاتر الجانبية (الحالة والنوع)
// ==============================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';

interface DonationFilterBarProps {
  searchQuery: string;
  typeFilter: string;
  statusFilter: string;
  hasActiveFilters: boolean;
  onSetSearchQuery: (v: string) => void;
  onSetTypeFilter: (v: string) => void;
  onSetStatusFilter: (v: string) => void;
  onResetFilters: () => void;
}

export function DonationFilterBar({
  searchQuery,
  typeFilter,
  statusFilter,
  hasActiveFilters,
  onSetSearchQuery,
  onSetTypeFilter,
  onSetStatusFilter,
  onResetFilters,
}: DonationFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery === '') setLocalSearch('');
  }, [searchQuery]);

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

  const statusOptions = [
    { id: '', label: 'الجميع' },
    { id: 'completed', label: 'مكتملة (Completed)' },
    { id: 'pending', label: 'قيد المعالجة (Pending)' },
  ];

  const typeOptions = [
    { id: '', label: 'الجميع' },
    { id: 'cash', label: 'نقدي (Cash)' },
    { id: 'in_kind', label: 'عيني (In Kind)' },
  ];

  const activeFiltersCount = [
    typeFilter !== '',
    statusFilter !== '',
  ].filter(Boolean).length;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      {/* Search Bar + Filters Dropdown Button */}
      <div className="flex gap-3 items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث باسم المتبرع، المبلغ، أو رقم الإيصال..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-24 pr-11 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground"
            dir="rtl"
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); onSetSearchQuery(''); }}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
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

        {/* Filters Dropdown Button */}
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

          {/* Filters Dropdown Panel */}
          {filtersOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-sm font-black text-foreground">خيارات التصفية</span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => { onSetTypeFilter(''); onSetStatusFilter(''); }}
                    className="text-[11px] font-bold text-red-500 hover:underline"
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>

              {/* Status Section */}
              <div>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-2">حالة التبرع</p>
                <div className="flex flex-wrap gap-1.5">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onSetStatusFilter(opt.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        statusFilter === opt.id
                          ? 'bg-primary/10 text-primary border-primary/30 font-black'
                          : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {statusFilter === opt.id && <Check className="w-3 h-3" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Section */}
              <div>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-2">نوع التبرع</p>
                <div className="flex flex-wrap gap-1.5">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onSetTypeFilter(opt.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        typeFilter === opt.id
                          ? 'bg-primary/10 text-primary border-primary/30 font-black'
                          : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {typeFilter === opt.id && <Check className="w-3 h-3" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => { onResetFilters(); setFiltersOpen(false); }}
                  className="w-full py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-all text-center border border-red-500/20"
                >
                  إعادة ضبط الكل
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
