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
  activeTab: VolunteerTabType;
  onSelectTab: (tab: VolunteerTabType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  loading: boolean;
  showDebugTerminal: boolean;
  onToggleDebugTerminal: () => void;
  counts: {
    opportunities: number;
    applications: number;
    approved_volunteers: number;
    tasks: number;
    logs: number;
    certificates: number;
  };
}

export function VolunteerTabsNavigation({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
  showDebugTerminal,
  onToggleDebugTerminal,
  counts,
}: VolunteerTabsNavigationProps) {
  const tabs: Array<{
    key: VolunteerTabType;
    label: string;
    icon: any;
    count: number;
  }> = [
    { key: 'opportunities', label: 'الفرص التطوعية', icon: HeartHandshake, count: counts.opportunities },
    { key: 'applications', label: 'طلبات الانضمام', icon: Users, count: counts.applications },
    { key: 'approved_volunteers', label: 'المتطوعون المعتمدون', icon: CheckCircle2, count: counts.approved_volunteers },
    { key: 'tasks', label: 'إسناد ومتابعة المهام', icon: Briefcase, count: counts.tasks },
    { key: 'logs', label: 'سجلات الساعات والتقييم', icon: Clock, count: counts.logs },
    { key: 'certificates', label: 'الشهادات المعتمدة', icon: Award, count: counts.certificates },
  ];

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 mb-6 shadow-sm flex flex-col gap-4 font-['Cairo']">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input - Aligned with Maintenance filter bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالاسم، عنوان الفرصة، وصف المهمة أو السجلات..."
            className="w-full pr-10 pl-9 py-2.5 bg-muted/40 border border-input rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/70"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls (Debug & Refresh — Create button removed as requested) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onToggleDebugTerminal}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-mono font-bold transition-all shadow-sm ${
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            title="تحديث البيانات من السيرفر"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-border/50 pt-3 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
