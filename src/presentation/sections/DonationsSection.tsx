import React, { useState } from 'react';
import { Plus, RefreshCw, FileDown } from 'lucide-react';
import { PageHeader } from '../../app/components/PageHeader';
import { useDonations } from '../hooks/useDonations';
import { DonationStatCards } from './donations/components/DonationStatCards';
import { DonationFilterBar } from './donations/components/DonationFilterBar';
import { DonationTable } from './donations/components/DonationTable';
import { DonationDailySummaryPanel } from './donations/components/DonationDailySummaryPanel';
import { DownloadReportModal } from '../../app/components/ui/DownloadReportModal';

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

  const [downloadingReport, setDownloadingReport] = useState(false);

  const isSuperAdmin = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
      const role = String(user.role || user.user_type || user.role_name || '').toLowerCase();
      const roles = user.roles || [];
      return (
        role === 'super_admin' ||
        role === 'admin' ||
        role === 'administrator' ||
        user.is_super_admin === true ||
        roles.includes('super_admin') ||
        roles.includes('admin') ||
        localStorage.getItem("user_role") === "super_admin"
      );
    } catch (e) {
      return false;
    }
  }, []);

  const [showReportModal, setShowReportModal] = useState(false);

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
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground hover:bg-muted font-bold text-xs rounded-xl shadow-sm transition-all"
              title="تنزيل تقرير التبرعات PDF"
            >
              <FileDown className="w-4 h-4 text-primary" />
              <span>تقرير التبرعات PDF</span>
            </button>

            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-sm"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            {!isSuperAdmin && (
              <button
                onClick={onAddDonation}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> <span>إضافة تبرع</span>
              </button>
            )}
          </div>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-8">
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

      {/* Download Report Modal with Date Range and Mosque filters */}
      <DownloadReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="تصدير تقرير التبرعات PDF"
        reportType="donations"
      />
    </div>
  );
}
