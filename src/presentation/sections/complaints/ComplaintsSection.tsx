import React, { useState } from 'react';
import { RefreshCw, FileDown } from 'lucide-react';
import { PageHeader } from '../../../app/components/PageHeader';
import { useComplaints } from '../../hooks/useComplaints';
import { ComplaintStatCards } from './components/ComplaintStatCards';
import { ComplaintFilterBar } from './components/ComplaintFilterBar';
import { ComplaintTable } from './components/ComplaintTable';
import { ComplaintTimeline } from './components/ComplaintTimeline';
import { ComplaintDebugBox } from './components/ComplaintDebugBox';
import { DownloadReportModal } from '../../../app/components/ui/DownloadReportModal';

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

  const [showReportModal, setShowReportModal] = useState(false);

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground hover:bg-muted font-bold text-xs rounded-xl shadow-sm transition-all"
              title="تنزيل تقرير الشكاوى PDF"
            >
              <FileDown className="w-4 h-4 text-primary" />
              <span>تقرير الشكاوى PDF</span>
            </button>

            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-sm"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${(loadingStats || loadingComplaints) ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
          </div>
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
          </div>

          {/* Side Column */}
          <div className="xl:col-span-3 space-y-6">
            <ComplaintTimeline complaints={complaints} />
          </div>

        </div>
      </div>

      {/* Download Report Modal with Date Range and Mosque filters */}
      <DownloadReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="تصدير تقرير الشكاوى PDF"
        reportType="complaints"
      />
    </div>
  );
}
