// ==============================
// Campaigns — CampaignsSection Component
// مطابقة 100% لنظام تصميم صفحة نظرة عامة للتبرعات مع باجنيشن وبحث مطابقين للخط والتصميم
// ==============================

import React, { useState } from 'react';
import { Plus, Download, RefreshCw, Terminal, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { PageHeader } from '../../app/components/PageHeader';
import { useCampaigns } from '../hooks/useCampaigns';
import { CampaignStatCards } from './campaigns/components/CampaignStatCards';
import { CampaignFilterBar } from './campaigns/components/CampaignFilterBar';
import { CampaignCard } from './campaigns/components/CampaignCard';
import { EditCampaignModal } from './campaigns/components/EditCampaignModal';
import { DeleteCampaignModal } from './campaigns/components/DeleteCampaignModal';
import { CampaignDebugBox } from './campaigns/components/CampaignDebugBox';
import { CampaignDetailsSection } from './CampaignDetailsSection';

interface CampaignsSectionProps {
  onCreateCampaign?: () => void;
  onViewCampaignDetails?: (id: string) => void;
}

export function CampaignsSection({
  onCreateCampaign,
  onViewCampaignDetails,
}: CampaignsSectionProps) {
  const {
    campaigns,
    campaignStats,
    loading,
    page,
    setPage,
    pagination,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    hasActiveFilters,
    resetFilters,
    refresh,
    updateCampaign,
    deleteCampaign,
    editingCampaign,
    setEditingCampaign,
    deletingCampaign,
    setDeletingCampaign,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
  } = useCampaigns();

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

  // Local state to support viewing details inline or via prop
  const [activeDetailsId, setActiveDetailsId] = useState<string | null>(null);

  const handleViewDetails = (id: string) => {
    if (onViewCampaignDetails) {
      onViewCampaignDetails(id);
    } else {
      setActiveDetailsId(id);
    }
  };

  const lastPage = Math.max(1, pagination.last_page || 1);
  const totalCount = pagination.total || campaigns.length;

  if (activeDetailsId) {
    return (
      <CampaignDetailsSection
        campaignId={activeDetailsId}
        onBack={() => setActiveDetailsId(null)}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      {/* Page Header */}
      <PageHeader
        title="إدارة حملات التبرع"
        description="متابعة وإدارة الحملات الخيرية والتكافلية للمسجد بدقة وشفافية وقياس نسب الإنجاز."
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'إدارة التبرعات' },
          { label: 'حملات التبرع', active: true },
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

            {!isSuperAdmin && (
              <button
                onClick={onCreateCampaign}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> <span>إنشاء حملة جديدة</span>
              </button>
            )}

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
          <CampaignDebugBox
            debugLogs={debugLogs}
            onClear={clearDebugLogs}
            onClose={() => setShowDebugTerminal(false)}
          />
        )}

        {/* KPI Cards (Matching Donations 1:1) */}
        <CampaignStatCards
          stats={campaignStats}
          loading={loading}
        />

        {/* Filter Bar */}
        <CampaignFilterBar
          searchQuery={search}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          hasActiveFilters={hasActiveFilters}
          onSetSearchQuery={setSearch}
          onSetStatusFilter={setStatusFilter}
          onSetPriorityFilter={setPriorityFilter}
          onResetFilters={resetFilters}
        />

        {/* Campaigns Content Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-card border border-border rounded-2xl p-5 h-80 animate-pulse space-y-4">
                  <div className="h-40 bg-muted rounded-xl" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border space-y-4">
              <Search className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">لا توجد حملات تطابق خيارات البحث</p>
                <p className="text-xs text-muted-foreground">حاول تغيير معايير البحث أو تصفية الحالة</p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-colors"
                >
                  إعادة ضبط الفلاتر
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onViewDetails={handleViewDetails}
                  onEdit={setEditingCampaign}
                  onDelete={setDeletingCampaign}
                  isSuperAdmin={isSuperAdmin}
                />
              ))}

              {/* Add New Campaign Card Placeholder on page 1 for Mosque Manager only */}
              {!isSuperAdmin && page === 1 && campaigns.length < 4 && (
                <div
                  onClick={onCreateCampaign}
                  className="border-2 border-dashed border-border hover:border-primary rounded-2xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:text-primary transition-all cursor-pointer group bg-card/60 hover:bg-primary/5 min-h-[360px] space-y-3"
                >
                  <div className="w-14 h-14 bg-muted group-hover:bg-primary/10 rounded-2xl flex items-center justify-center transition-colors">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-bold text-sm text-foreground group-hover:text-primary">إضافة حملة جديدة</p>
                    <p className="text-xs text-muted-foreground">إنشاء حملة تبرع تكافلية للمسجد</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination Footer (Matching DonationTable & MaintenanceTable 100%) */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-card border border-border rounded-2xl shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">
                عرض الصفحة <span className="font-bold text-foreground">{page}</span> من <span className="font-bold text-foreground">{lastPage}</span> (إجمالي {totalCount} حملة)
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1 || loading}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <div className="flex items-center gap-1" dir="ltr">
                  {Array.from({ length: lastPage }, (_, i) => i + 1)
                    .filter((i) => i === 1 || i === lastPage || Math.abs(i - page) <= 1)
                    .map((i, index, array) => (
                      <React.Fragment key={i}>
                        {index > 0 && array[index - 1] !== i - 1 && (
                          <span className="px-1 text-muted-foreground text-xs">...</span>
                        )}
                        <button
                          onClick={() => setPage(i)}
                          disabled={loading}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            page === i
                              ? 'bg-primary text-primary-foreground shadow-sm font-black'
                              : 'bg-card border border-border text-foreground hover:bg-muted'
                          }`}
                        >
                          {i}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  disabled={page === lastPage || loading}
                  onClick={() => setPage(Math.min(lastPage, page + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        campaign={editingCampaign}
        isOpen={Boolean(editingCampaign)}
        onClose={() => setEditingCampaign(null)}
        onUpdate={updateCampaign}
      />

      {/* Delete Campaign Modal */}
      <DeleteCampaignModal
        campaign={deletingCampaign}
        isOpen={Boolean(deletingCampaign)}
        onClose={() => setDeletingCampaign(null)}
        onConfirmDelete={deleteCampaign}
      />
    </div>
  );
}
