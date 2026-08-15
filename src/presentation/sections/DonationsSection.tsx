// ==============================
// Donations — DonationsSection Component (Clean & Modular)
// استخدام useDonations وترتيب المكونات الفرعية بمطابقة 100% مع الصيانة
// ==============================

import React from 'react';
import { Plus, Download, RefreshCw, Terminal } from 'lucide-react';
import { PageHeader } from '../../app/components/PageHeader';
import { useDonations } from '../hooks/useDonations';
import { DonationStatCards } from './donations/components/DonationStatCards';
import { DonationFilterBar } from './donations/components/DonationFilterBar';
import { DonationTable } from './donations/components/DonationTable';
import { DonationDebugBox } from './donations/components/DonationDebugBox';
import { DonationDailySummaryPanel } from './donations/components/DonationDailySummaryPanel';

interface DonationsSectionProps {
  onAddDonation?: () => void;
  onViewDonationDetails?: (id: string) => void;
}

export function DonationsSection({ onAddDonation, onViewDonationDetails }: DonationsSectionProps) {
  const {
    donations,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    filter,
    setFilter,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
    stats,
    dailySummary,
    loading,
    refresh,
    handlePrintReceipt,
    printingReceiptId,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
  } = useDonations();

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      {/* Page Header */}
      <PageHeader
        title="إدارة التبرعات"
        description="تتبع وتحليل الموارد المالية والحملات التكافلية للمسجد بدقة وشفافية."
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'إدارة التبرعات', active: true },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 border border-slate-700 text-emerald-400 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
              title="مراقب السيرفر"
            >
              <Terminal className="w-4 h-4" />
              <span>{showDebugTerminal ? 'إخفاء رد السيرفر' : 'طباعة رد السيرفر'}</span>
            </button>

            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-sm"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              onClick={onAddDonation}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> <span>إضافة تبرع</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-sm">
              <Download className="w-4 h-4 text-muted-foreground" />
              <span>تصدير التقرير</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-8">
        {/* Live API Debug Box */}
        {showDebugTerminal && (
          <DonationDebugBox
            debugLogs={debugLogs}
            onClear={clearDebugLogs}
            onClose={() => setShowDebugTerminal(false)}
          />
        )}

        {/* KPI Cards (Matching Maintenance) */}
        <DonationStatCards
          stats={stats}
          loading={loading}
          statusFilter={statusFilter}
          onSetStatusFilter={setStatusFilter}
        />

        {/* Main Grid: Table (xl:col-span-9) + Daily Summary Panel (xl:col-span-3) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Column */}
          <div className="xl:col-span-9 space-y-6">
            {/* Filter Bar (Matching Maintenance) */}
            <DonationFilterBar
              searchQuery={search}
              typeFilter={filter}
              statusFilter={statusFilter}
              hasActiveFilters={hasActiveFilters}
              onSetSearchQuery={setSearch}
              onSetTypeFilter={setFilter}
              onSetStatusFilter={setStatusFilter}
              onResetFilters={resetFilters}
            />

            {/* Donations Table (Matching Maintenance) */}
            <DonationTable
              donations={donations}
              loading={loading}
              hasActiveFilters={hasActiveFilters}
              pagination={pagination}
              page={page}
              onPageChange={setPage}
              onViewDetails={onViewDonationDetails}
              onPrintReceipt={handlePrintReceipt}
              printingId={printingReceiptId}
              onResetFilters={resetFilters}
            />
          </div>

          {/* Side Column: Daily Summary (Matching Maintenance Timeline) */}
          <div className="xl:col-span-3 space-y-6">
            <DonationDailySummaryPanel dailySummary={dailySummary} loading={loading} />
          </div>

        </div>
      </div>
    </div>
  );
}
