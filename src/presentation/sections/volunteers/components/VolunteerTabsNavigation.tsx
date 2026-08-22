'use client';

// ==============================
// UI Component — VolunteerTabsNavigation
// شريط البحث والتبويبات الموحد (مطابق لأسلوب شريط الفلاتر في الصيانة)
// ==============================

import React from 'react';
import {
  HeartHandshake, Users, CheckCircle2, Briefcase, Award, Clock,
  Search, RefreshCw, Terminal, X
} from 'lucide-react';
import { VolunteerTabType } from '../../../hooks/useVolunteers';

interface VolunteerTabsNavigationProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  loading: boolean;
  showDebugTerminal: boolean;
  onToggleDebugTerminal: () => void;
  // optional backward compatibility
  activeTab?: VolunteerTabType;
  onSelectTab?: (tab: VolunteerTabType) => void;
  counts?: any;
}

export function VolunteerTabsNavigation({
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
  showDebugTerminal,
  onToggleDebugTerminal,
}: VolunteerTabsNavigationProps) {
  return (
    <div className="bg-card border border-border/80 rounded-3xl p-4 md:p-5 mb-6 shadow-sm font-['Cairo']">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالاسم، عنوان الفرصة، وصف المهمة أو السجلات..."
            className="w-full pr-10 pl-9 py-2.5 bg-muted/40 border border-input rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/70 text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls (Debug & Refresh) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleDebugTerminal}
            className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-2xl text-xs font-mono font-bold transition-all shadow-sm ${
              showDebugTerminal
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-slate-900 text-emerald-400 border-slate-700 hover:bg-slate-800'
            }`}
            title="فحص استجابة الـ API المباشرة"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
            title="تحديث البيانات من السيرفر"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>
    </div>
  );
}
