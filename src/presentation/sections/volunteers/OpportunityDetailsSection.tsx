'use client';

// ==============================
// Presentation Section — OpportunityDetailsSection
// صفحة تفاصيل الفرصة التطوعية الشاملة
// ==============================

import React, { useState } from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  ListTodo, Users, RefreshCw, AlertCircle
} from 'lucide-react';
import { useOpportunityDetails } from '../../hooks/useOpportunityDetails';
import { DeleteConfirmModal } from '../../../app/components/ui/DeleteConfirmModal';
import {
  OpportunityHeader,
  OpportunityTasksTab,
  OpportunityVolunteersTab,
} from './components/details/index';
import {
  AssignTaskModal,
  LogHoursModal,
  EditOpportunityModal,
  VolunteerDebugTerminal,
} from './components';
import { Terminal } from 'lucide-react';

interface OpportunityDetailsSectionProps {
  opportunityId: number | string;
}

export function OpportunityDetailsSection({
  opportunityId,
}: OpportunityDetailsSectionProps) {
  const {
    opportunity,
    tasks,
    applications,
    stats,
    loading,
    error,
    activeTab,
    setActiveTab,
    selectedAppForTask,
    setSelectedAppForTask,
    selectedAppForHours,
    setSelectedAppForHours,
    handleCreateTask,
    handleAssignTask,
    handleApproveApplication,
    handleRejectApplication,
    handleLogHours,
    handleIssueCertificate,
    handleCloseOpportunity,
    handleUpdateOpportunity,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
    router,
  } = useOpportunityDetails(opportunityId);

  const isSuperAdmin = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const rawUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      const userRole = localStorage.getItem('user_role') || rawUser.role || '';
      const roles = rawUser.roles || [];
      return (
        userRole === 'super_admin' ||
        userRole === 'admin' ||
        roles.includes('super_admin') ||
        roles.includes('admin') ||
        Boolean(rawUser.is_super_admin)
      );
    } catch {
      return false;
    }
  }, []);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const handleConfirmClose = async () => {
    setIsClosing(true);
    try {
      await handleCloseOpportunity();
      setShowCloseModal(false);
    } catch {
      // Error handled in hook toast
    } finally {
      setIsClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
        <PageHeader
          title="جاري جلب تفاصيل الفرصة..."
          breadcrumbs={[
            { label: 'إدارة المسجد' },
            { label: 'إدارة المتطوعين' },
            { label: 'تفاصيل الفرصة', active: true },
          ]}
          onBack={() => router.push('/volunteers')}
        />
        <div className="px-4 md:px-8 max-w-7xl w-full mx-auto space-y-6 py-4">
          {/* Header Card Skeleton */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-7 w-28 bg-muted rounded-xl" />
              <div className="h-9 w-24 bg-muted rounded-xl" />
            </div>
            <div className="h-8 w-2/3 bg-muted rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-5/6 bg-muted/70 rounded-lg" />
              <div className="h-4 w-4/6 bg-muted/70 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Tabs Navigation Skeleton */}
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <div className="h-10 w-36 bg-muted rounded-2xl animate-pulse" />
            <div className="h-10 w-44 bg-muted rounded-2xl animate-pulse" />
          </div>

          {/* Tasks Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm animate-pulse">
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-muted rounded-lg" />
                  <div className="h-5 w-16 bg-muted rounded-lg" />
                </div>
                <div className="h-5 w-full bg-muted/70 rounded-lg" />
                <div className="h-4 w-3/4 bg-muted/70 rounded-lg" />
                <div className="pt-3 border-t border-border h-6 w-1/2 bg-muted/50 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
        <PageHeader
          title="تفاصيل الفرصة التطوعية"
          breadcrumbs={[
            { label: 'إدارة المسجد' },
            { label: 'إدارة المتطوعين' },
            { label: 'تفاصيل الفرصة', active: true },
          ]}
          onBack={() => router.push('/volunteers')}
        />
        <div className="px-4 md:px-8 max-w-7xl w-full mx-auto py-12">
          <div className="bg-card border border-rose-500/30 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-foreground">تعذر عرض تفاصيل الفرصة</h3>
            <p className="text-xs text-muted-foreground">{error || 'الفرصة المطلوبة غير متوفرة بالسيرفر'}</p>
            <button
              onClick={() => router.push('/volunteers')}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl"
            >
              العودة لقائمة المتطوعين
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title={opportunity.title}
        description="إدارة شاملة لمهام الفرصة التطوعية، المتطوعين المعتمدين، الساعات المنجزة، وإصدار الشهادات."
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'إدارة المتطوعين' },
          { label: opportunity.title, active: true },
        ]}
        onBack={() => router.push('/volunteers')}
      />

      <div className="px-4 md:px-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Debug Terminal Toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowDebugTerminal(!showDebugTerminal)}
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
        </div>

        {/* Debug Terminal */}
        <VolunteerDebugTerminal
          show={showDebugTerminal}
          onClose={() => setShowDebugTerminal(false)}
          logs={debugLogs}
          onClear={clearDebugLogs}
        />

        {/* Opportunity Header & KPI Stats */}
        <OpportunityHeader
          opportunity={opportunity}
          stats={stats}
          onCloseOpportunity={!isSuperAdmin ? () => setShowCloseModal(true) : undefined}
          onOpenEdit={!isSuperAdmin ? () => setShowEditModal(true) : undefined}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-3">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'tasks'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/80'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>مهام الفرصة ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('volunteers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'volunteers'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المتطوعون والطلبات ({applications.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'tasks' ? (
          <OpportunityTasksTab
            tasks={tasks}
            applications={applications}
            onOpenAssignTask={(app) => setSelectedAppForTask(app)}
          />
        ) : (
          <OpportunityVolunteersTab
            applications={applications}
            onApprove={handleApproveApplication}
            onReject={handleRejectApplication}
            onOpenAssignTask={(app) => setSelectedAppForTask(app)}
            onOpenLogHours={(app) => setSelectedAppForHours(app)}
            onIssueCertificate={handleIssueCertificate}
          />
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditOpportunityModal
          opportunity={opportunity}
          onClose={() => setShowEditModal(false)}
          onUpdateOpportunity={async (_, payload) => {
            const res = await handleUpdateOpportunity(payload);
            return res;
          }}
        />
      )}

      {showCloseModal && (
        <DeleteConfirmModal
          isOpen={showCloseModal}
          title="إغلاق التقديم على الفرصة التطوعية"
          description="هل أنت متأكد من إغلاق استقبال الطلبات لهذه الفرصة التطوعية؟ لن يتمكن المتطوعون الجدد من التقديم عليها."
          itemName={opportunity.title}
          confirmButtonText="تأكيد الإغلاق"
          isDeleting={isClosing}
          onConfirm={handleConfirmClose}
          onClose={() => setShowCloseModal(false)}
        />
      )}

      {selectedAppForTask && (
        <AssignTaskModal
          application={selectedAppForTask}
          onClose={() => setSelectedAppForTask(null)}
          onAssignTask={handleAssignTask}
        />
      )}

      {selectedAppForHours && (
        <LogHoursModal
          application={selectedAppForHours}
          onClose={() => setSelectedAppForHours(null)}
          onLogHours={handleLogHours}
        />
      )}
    </div>
  );
}
