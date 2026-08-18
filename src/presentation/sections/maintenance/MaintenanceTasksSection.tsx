// ==============================
// Maintenance Section — Wrapper (Clean)
// يستخدم useMaintenance hook ويرتّب الـ components الفرعية
// ==============================

import React from 'react';
import { Plus, Terminal, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../app/components/PageHeader';
import { useMaintenance } from '../../hooks/useMaintenance';
import { MaintenanceStatCards } from './components/MaintenanceStatCards';
import { MaintenanceFilterBar } from './components/MaintenanceFilterBar';
import { MaintenanceTable } from './components/MaintenanceTable';
import { MaintenanceTimeline } from './components/MaintenanceTimeline';
import { MaintenanceDebugBox } from './components/MaintenanceDebugBox';
import { EditMaintenanceModal } from './components/EditMaintenanceModal';
import { MaintenanceRequestItem } from '../../../domain/entities/Maintenance';

interface MaintenanceTasksSectionProps {
  onViewTaskDetails?: (id: string) => void;
  onCreateTask?: () => void;
}

export function MaintenanceTasksSection({ onViewTaskDetails, onCreateTask }: MaintenanceTasksSectionProps) {
  const {
    stats,
    requests,
    pagination,
    setPage,
    loadingStats,
    loadingRequests,
    error,
    filters,
    hasActiveFilters,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setCategoryFilter,
    resetFilters,
    refresh,
    handleDeleteRequest,
    handleEditRequest,
    editingItem,
    setEditingItem,
    deletingId,
    setDeletingId,
    isSubmittingAction,
    operationDebug,
    showDebugBox,
    setShowDebugBox,
    copiedDebug,
    copyDebugJson,
  } = useMaintenance();

  const [isAdmin, setIsAdmin] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const roles: string[] = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
          if (roles.includes('super_admin') || roles.includes('admin') || user.is_super_admin) {
            setIsAdmin(true);
          }
        }
      } catch (e) {}
    }
  }, []);

  const totalCount = stats.open_requests + stats.in_progress + stats.completed_this_month;

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await handleDeleteRequest(deletingId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="إدارة المهام والصيانة"
        description="تتبع طلبات الصيانة الدورية والطارئة مع معاينة استجابة السيرفر لأحدث الطلبات."
        breadcrumbs={[
          { label: 'الإدارة التشغيلية' },
          { label: 'مهام الصيانة', active: true },
        ]}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setShowDebugBox(!showDebugBox)}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 border border-slate-700 text-emerald-400 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
              title="عرض/إخفاء مربع رد السيرفر"
            >
              <Terminal className="w-4 h-4" />
              <span>{showDebugBox ? 'إخفاء رد السيرفر' : 'طباعة رد السيرفر'}</span>
            </button>

            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${(loadingStats || loadingRequests) ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            {!isAdmin && (
              <button
                onClick={onCreateTask}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> طلب صيانة جديد
              </button>
            )}
          </div>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-8">

        {/* Debug Box */}
        {showDebugBox && operationDebug && (
          <MaintenanceDebugBox
            debugData={operationDebug}
            copiedDebug={copiedDebug}
            onCopy={copyDebugJson}
            onClose={() => setShowDebugBox(false)}
          />
        )}

        {/* KPI Cards */}
        <MaintenanceStatCards
          stats={stats}
          loadingStats={loadingStats}
          statusFilter={filters.statusFilter}
          priorityFilter={filters.priorityFilter}
          onSetStatusFilter={setStatusFilter}
          onSetPriorityFilter={setPriorityFilter}
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Main Column */}
          <div className="xl:col-span-9 space-y-6">
            <MaintenanceFilterBar
              filters={filters}
              stats={stats}
              hasActiveFilters={hasActiveFilters}
              onSetSearchQuery={setSearchQuery}
              onSetStatusFilter={setStatusFilter}
              onSetPriorityFilter={setPriorityFilter}
              onSetCategoryFilter={setCategoryFilter}
              onResetFilters={resetFilters}
            />

            <MaintenanceTable
              requests={requests}
              totalCount={totalCount}
              loadingRequests={loadingRequests}
              error={error}
              hasActiveFilters={hasActiveFilters}
              pagination={pagination}
              onPageChange={setPage}
              onViewDetails={onViewTaskDetails}
              onEditItem={(item: MaintenanceRequestItem) => setEditingItem(item)}
              onDeleteItem={(id) => setDeletingId(id)}
              onResetFilters={resetFilters}
            />
          </div>

          {/* Side Column */}
          <div className="xl:col-span-3 space-y-6">
            <MaintenanceTimeline requests={requests} />
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      <EditMaintenanceModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        isSubmitting={isSubmittingAction}
        onClose={() => setEditingItem(null)}
        onSave={handleEditRequest}
      />

      {/* Delete Confirmation Dialog */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 text-right space-y-4 font-['Cairo']">
            <h3 className="text-base font-black text-foreground">تأكيد حذف طلب الصيانة</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              هل أنت تأكد من رغبتك في حذف طلب الصيانة هذا؟ لا يمكن التراجع عن هذه العملية بعد التأكيد وسوف يتم إرسال طلب DELETE إلى السيرفر (maintenance.destroy).
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isSubmittingAction}
                className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl hover:bg-muted/80 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmittingAction}
                className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white font-bold text-xs rounded-xl hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmittingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>نعم، حذف الطلب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
