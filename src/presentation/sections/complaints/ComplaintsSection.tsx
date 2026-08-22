// ==============================
// Complaints Section — Wrapper (Clean)
// يستخدم useComplaints hook ويرتّب الـ components الفرعية مع دعم مراقب السيرفر ولودينغ الكاردات
// ==============================

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../app/components/PageHeader';
import { useComplaints } from '../../hooks/useComplaints';
import { ComplaintStatCards } from './components/ComplaintStatCards';
import { ComplaintFilterBar } from './components/ComplaintFilterBar';
import { ComplaintTable } from './components/ComplaintTable';
import { ComplaintTimeline } from './components/ComplaintTimeline';
import { ComplaintDebugBox } from './components/ComplaintDebugBox';

interface ComplaintsSectionProps {
  onViewComplaintDetails?: (id: string) => void;
}

export function ComplaintsSection({ onViewComplaintDetails }: ComplaintsSectionProps) {
  const {
    stats,
    complaints,
    page,
    setPage,
    pagination,
    loadingStats,
    loadingComplaints,
    error,
    filters,
    hasActiveFilters,
    debugData,
    statsDebugData,
    copiedDebug,
    copyDebugToClipboard,
    closeDebugBox,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setTypeFilter,
    resetFilters,
    refresh,
  } = useComplaints();

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="الشكاوى والاقتراحات"
        description="إدارة ومتابعة شكاوى المصلين والمرافق لضمان تقديم أفضل تجربة للمسجد."
        breadcrumbs={[
          { label: 'الإدارة التشغيلية' },
          { label: 'الشكاوى والاقتراحات', active: true },
        ]}
        actions={
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl text-sm font-bold hover:bg-muted transition-all"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${(loadingStats || loadingComplaints) ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-8">

        {/* KPI Cards */}
        <ComplaintStatCards
          stats={stats}
          loadingStats={loadingStats}
          statusFilter={filters.statusFilter}
          priorityFilter={filters.priorityFilter}
          onResetFilters={resetFilters}
          onSetStatusFilter={setStatusFilter}
          onSetPriorityFilter={setPriorityFilter}
        />

        {/* Main Section Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Main Column */}
          <div className="xl:col-span-9 space-y-6">
            <ComplaintFilterBar
              filters={filters}
              stats={stats}
              hasActiveFilters={hasActiveFilters}
              onSetSearchQuery={setSearchQuery}
              onSetStatusFilter={setStatusFilter}
              onSetPriorityFilter={setPriorityFilter}
              onSetTypeFilter={setTypeFilter}
              onResetFilters={resetFilters}
            />

            <ComplaintTable
              complaints={complaints}
              totalCount={stats.total_complaints ?? complaints.length}
              loadingComplaints={loadingComplaints}
              error={error}
              hasActiveFilters={hasActiveFilters}
              pagination={pagination}
              onPageChange={setPage}
              onViewDetails={onViewComplaintDetails}
              onResetFilters={resetFilters}
            />

            {/* Server Debug Box Component (مراقب رد السيرفر) */}
            {(debugData || statsDebugData) && (
              <ComplaintDebugBox
                debugData={debugData}
                statsDebugData={statsDebugData}
                copiedDebug={copiedDebug}
                onCopy={copyDebugToClipboard}
                onClose={closeDebugBox}
              />
            )}
          </div>

          {/* Side Column */}
          <div className="xl:col-span-3 space-y-6">
            <ComplaintTimeline complaints={complaints} />
          </div>

        </div>
      </div>
    </div>
  );
}
