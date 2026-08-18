'use client';

import React from 'react';
import { Search, RefreshCw, Terminal, Layers, Mic, GraduationCap, Trophy } from 'lucide-react';

interface DawahFilterBarProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  loading: boolean;
  showDebugTerminal: boolean;
  onToggleDebugTerminal: () => void;
}

export function DawahFilterBar({
  selectedType,
  onSelectType,
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
  showDebugTerminal,
  onToggleDebugTerminal,
}: DawahFilterBarProps) {
  const typeTabs = [
    { key: 'all', label: 'كافة البرامج', icon: Layers },
    { key: 'lecture', label: 'المحاضرات والدروس', icon: Mic },
    { key: 'course', label: 'الدورات العلمية', icon: GraduationCap },
    { key: 'competition', label: 'المسابقات والفعاليات', icon: Trophy },
  ];

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 mb-6 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="البحث باسم البرنامج، المحاضر، أو الوصف..."
            className="w-full pr-10 pl-4 py-2.5 bg-muted/40 border border-input rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Action buttons (Terminal & Refresh) */}
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
            className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all"
            title="تحديث البيانات من السيرفر"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-border/50 pt-3">
        {typeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectType(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
