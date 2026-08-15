'use client';
// ==============================
// KhutbahsListSection — Wrapper (Clean & Design System Aligned)
// ==============================

import React, { useState } from 'react';
import { Plus, Terminal, Clock, History, RefreshCw, BookOpen, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { PageHeader } from '../../../app/components/PageHeader';
import { useSermons } from '../../hooks/useSermons';
import { FridaySermonBanner } from './components/FridaySermonBanner';
import { SermonFilterBar } from './components/SermonFilterBar';
import { SermonCard } from './components/SermonCard';
import { PendingModal } from './components/PendingModal';
import { HistoryModal } from './components/HistoryModal';

interface KhutbahsListSectionProps {
  onNavigateToAdd?: () => void;
  onViewDetails?: (id: string | number) => void;
}

export function KhutbahsListSection({ onNavigateToAdd, onViewDetails }: KhutbahsListSectionProps) {
  const {
    pendingSermons,
    upcomingSelection,
    selectionsHistory,
    filteredSermons,
    archivedPagination,
    setArchivedPage,
    pendingPagination,
    setPendingPage,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    selectingSermonId,
    error,
    loadData,
    handleSelectForFriday,
    handleCancelFridaySelection,
    handleDeletePendingSermon,
    deletingSermonId,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  } = useSermons();

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const totalItems = archivedPagination.totalItems || filteredSermons.length;
  const currentPage = archivedPagination.currentPage || 1;
  const itemsPerPage = archivedPagination.itemsPerPage || 6;
  const totalPages = Math.max(1, archivedPagination.totalPages || Math.ceil(totalItems / itemsPerPage));

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="مكتبة وإدارة خطب المسجد"
        description="استعراض المكتبة والخطب المؤرشفة للإعتماد، مع استعراض الخطبة المختارة للجمعة القادمة والسجلات."
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'خطب المسجد', active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="معاينة سجل استجابة الـ API المباشرة"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            <button
              onClick={() => setShowPendingModal(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 rounded-xl text-xs font-bold transition-all shadow-sm relative"
              title="عرض الخطب المنتظرة للاعتماد"
            >
              <Clock className="w-4 h-4 text-primary" />
              <span>قيد الانتظار</span>
              {pendingPagination.totalItems > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary text-primary-foreground font-black">
                  {pendingPagination.totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm"
              title="عرض سجل الخطب المختارة للجمعة"
            >
              <History className="w-4 h-4 text-primary" />
              <span>السجل ({selectionsHistory.length})</span>
            </button>

            <button
              onClick={loadData}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات من السيرفر"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onNavigateToAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> إضافة خطبة جديدة
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-8">

        {/* Debug Terminal */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">مراقب الـ API المباشر لخدمة الخطب والاعتمادات (Sermons API Live Inspector)</h3>
              </div>
              <button
                onClick={clearDebugLogs}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg"
              >
                مسح السجل
              </button>
            </div>

            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic">لا توجد طلبات معالجة حالياً. قم بالنقر على زر الاعتماد أو التحديث لرؤية النتائج المباشرة.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto ltr text-left">
                {debugLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="font-bold">[{log.time}] {log.action}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                        HTTP {log.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{log.url}</p>
                    <pre className="text-[10px] bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friday Sermon Hero Banner */}
        {upcomingSelection && (
          <FridaySermonBanner
            upcomingSelection={upcomingSelection}
            onViewDetails={onViewDetails}
            onCancelSelection={handleCancelFridaySelection}
          />
        )}

        {/* Search & Filter */}
        <SermonFilterBar
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSetSearchQuery={setSearchQuery}
          onSetCategory={setSelectedCategory}
        />

        {/* Sermons Grid / Skeleton Scan */}
        {loading ? (
          <div className="space-y-6">
            {/* Banner Skeleton Scan */}
            <div className="bg-card border border-border rounded-3xl p-8 animate-pulse space-y-4 shadow-sm">
              <div className="h-5 w-48 bg-muted rounded-md" />
              <div className="h-8 w-2/3 bg-muted rounded-md" />
              <div className="h-4 w-1/3 bg-muted rounded-md" />
            </div>

            {/* Grid Cards Skeleton Scan */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="bg-card border border-border rounded-2xl p-6 animate-pulse space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-muted rounded-md" />
                    <div className="h-6 w-20 bg-muted rounded-full" />
                  </div>
                  <div className="h-6 w-5/6 bg-muted rounded-md" />
                  <div className="h-4 w-full bg-muted rounded-md" />
                  <div className="h-4 w-2/3 bg-muted rounded-md" />
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <div className="h-9 w-24 bg-muted rounded-xl" />
                    <div className="h-9 w-28 bg-muted rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-bold text-foreground">{error}</h3>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredSermons.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground mb-1">لا توجد خطب مؤرشفة مطابقة للبحث حالياً</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto font-medium">
                قم بإضافة خطبة جديدة أو تغيير كلمة البحث لتأكيد استعراض المكتبة.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grid of Sermon Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSermons.map(sermon => (
                <SermonCard
                  key={sermon.id}
                  sermon={sermon}
                  upcomingSelection={upcomingSelection}
                  isSelecting={selectingSermonId === sermon.id}
                  onViewDetails={onViewDetails}
                  onSelectForFriday={handleSelectForFriday}
                />
              ))}
            </div>

            {/* Pagination Controls Bar — Aligned 100% with Maintenance & Donations Design System */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-border bg-card rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-muted-foreground">
                عرض {startItem} - {endItem} من أصل {totalItems} خطبة مؤرشفة
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setArchivedPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3.5 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  السابق
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setArchivedPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === p
                          ? 'bg-primary text-primary-foreground font-black shadow-md shadow-primary/20'
                          : 'bg-card border border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setArchivedPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3.5 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {showPendingModal && (
        <PendingModal
          pendingSermons={pendingSermons}
          pendingPagination={pendingPagination}
          deletingSermonId={deletingSermonId}
          onPageChange={setPendingPage}
          onDeleteSermon={handleDeletePendingSermon}
          onClose={() => setShowPendingModal(false)}
        />
      )}

      {showHistoryModal && (
        <HistoryModal
          selectionsHistory={selectionsHistory}
          onClose={() => setShowHistoryModal(false)}
          onDebugLog={addDebugLog}
        />
      )}
    </div>
  );
}
