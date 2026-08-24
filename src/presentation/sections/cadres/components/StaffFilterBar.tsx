'use client';

// ==============================
// StaffFilterBar Component
// شريط الفلاتر للكوادر والطلاب: مطابقة 100% لتصميم وهيكلية شريط فلاتر الصيانة
// ==============================

import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Check, RefreshCw } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'teacher': return 'معلم / مقرئ';
    case 'halaqa_supervisor': return 'مشرف حلقة';
    case 'student': return 'طالب';
    default: return 'كافة الكوادر والطلاب';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'نشط';
    case 'inactive': return 'غير نشط';
    case 'pending_invitation': return 'دعوة معلقة';
    default: return 'جميع الحالات';
  }
};

// ── Filter Dropdown Panel Component ──────────────────────────────────────────

interface FilterOption { id: string; label: string; }

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
}

function FilterGroup({ title, options, value, onChange }: FilterGroupProps) {
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
                ? 'bg-primary/10 text-primary border-primary/30'
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

// ── Main Component ───────────────────────────────────────────────────────────

interface StaffFilterBarProps {
  selectedRole: string;
  onSelectRole: (role: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  loading: boolean;
  showDebugTerminal?: boolean;
  onToggleDebugTerminal?: () => void;
}

export function StaffFilterBar({
  selectedRole,
  onSelectRole,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
}: StaffFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync local search if parent resets filters
  useEffect(() => {
    if (searchQuery === '') setLocalSearch('');
  }, [searchQuery]);

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
    onSearchChange(localSearch.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setLocalSearch('');
      onSearchChange('');
    }
  };

  const statusTabs = [
    { id: 'all', label: 'الجميع' },
    { id: 'active', label: 'نشط' },
    { id: 'inactive', label: 'غير نشط' },
    { id: 'pending_invitation', label: 'دعوات معلقة' },
  ];

  const roleOptions: FilterOption[] = [
    { id: 'all', label: 'الجميع' },
    { id: 'teacher', label: 'المعلمون والمقرئون' },
    { id: 'halaqa_supervisor', label: 'مشرفو الحلقات' },
    { id: 'student', label: 'الطلاب' },
  ];

  const statusOptions: FilterOption[] = [
    { id: 'all', label: 'الجميع' },
    { id: 'active', label: 'نشط' },
    { id: 'inactive', label: 'غير نشط' },
    { id: 'pending_invitation', label: 'دعوة معلقة' },
  ];

  const activeFiltersCount = [
    selectedRole !== 'all',
    selectedStatus !== 'all',
  ].filter(Boolean).length;

  const hasActiveFilters = selectedRole !== 'all' || selectedStatus !== 'all' || searchQuery !== '';

  const handleResetAll = () => {
    onSelectRole('all');
    onSelectStatus('all');
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 mb-6 font-['Cairo']">

      {/* Row 1: Search + Filters Dropdown + API & Refresh Controls */}
      <div className="flex gap-3 items-center">

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد، الجوال... ثم اضغط Enter أو زر البحث"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-24 pr-11 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground"
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); onSearchChange(''); }}
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

        {/* Filters Dropdown Button (Matching MaintenanceFilterBar 100%) */}
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
                    onClick={() => { onSelectRole('all'); onSelectStatus('all'); }}
                    className="text-[11px] font-bold text-red-500 hover:underline"
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>

              <FilterGroup
                title="الدور الوظيفي"
                options={roleOptions}
                value={selectedRole}
                onChange={(v) => onSelectRole(v)}
              />

              <div className="border-t border-border/60" />

              <FilterGroup
                title="حالة الحساب"
                options={statusOptions}
                value={selectedStatus}
                onChange={(v) => onSelectStatus(v)}
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

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all shrink-0"
          title="تحديث البيانات من السيرفر"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Row 3: Active Filter Chips (Matching MaintenanceFilterBar) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 animate-in fade-in">
          <span className="text-[11px] font-bold text-muted-foreground">الفلاتر النشطة:</span>

          {selectedRole !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              الدور: {getRoleLabel(selectedRole)}
              <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => onSelectRole('all')} />
            </span>
          )}

          {selectedStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
              الحالة: {getStatusLabel(selectedStatus)}
              <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => onSelectStatus('all')} />
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-bold border border-border">
              بحث: "{searchQuery}"
              <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => { setLocalSearch(''); onSearchChange(''); }} />
            </span>
          )}

          <button
            onClick={handleResetAll}
            className="text-xs font-bold text-red-500 hover:underline mr-auto flex items-center gap-1"
          >
            إعادة ضبط الكل
          </button>
        </div>
      )}
    </div>
  );
}
