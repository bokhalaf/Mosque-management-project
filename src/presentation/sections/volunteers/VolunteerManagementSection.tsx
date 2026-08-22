'use client';

// ==============================
// Presentation Section — VolunteerManagementSection
// قسم إدارة العمل التطوعي الشامل
// ==============================

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  HeartHandshake, Plus, Users, Briefcase, Award, Clock,
  RefreshCw, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useVolunteers } from '../../hooks/useVolunteers';
import { useToast } from '../../../app/components/ui/Toast';
import { VolunteerApplication, VolunteerOpportunity } from '../../../domain/entities/Volunteer';
import { DeleteConfirmModal } from '../../../app/components/ui/DeleteConfirmModal';
import {
  VolunteerStatsBanner,
  VolunteerTabsNavigation,
  OpportunityCard,
  CreateOpportunityModal,
  EditOpportunityModal,
  VolunteerApplicationCard,
  VolunteerTaskCard,
  AssignTaskModal,
  LogHoursModal,
  VolunteerDebugTerminal,
  VolunteersListTab,
  MosqueVolunteerLoader,
} from './components';

export function VolunteerManagementSection() {
  const router = useRouter();
  const {
    mainTab,
    setMainTab,
    opportunities,
    applications,
    tasks,
    logs,
    certificates,
    stats,
    loading,
    error,
    page,
    setPage,
    pagination,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    fetchAllVolunteerData,
    createOpportunity,
    updateOpportunity,
    closeOpportunity,
    approveApplication,
    rejectApplication,
    assignTask,
    logHours,
    issueCertificate,
    volunteersList,
    volunteersLoading,
    volunteersError,
    volunteersPage,
    setVolunteersPage,
    volunteersSearch,
    setVolunteersSearch,
    volunteersStatus,
    setVolunteersStatus,
    volunteersPagination,
    fetchVolunteersList,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
  } = useVolunteers();

  const { showToast } = useToast();
  const isSuperAdmin = useMemo(() => {
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

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [opportunityToEdit, setOpportunityToEdit] = useState<VolunteerOpportunity | null>(null);
  const [opportunityToClose, setOpportunityToClose] = useState<VolunteerOpportunity | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const [selectedApplicationForTask, setSelectedApplicationForTask] = useState<VolunteerApplication | null>(null);
  const [selectedApplicationForHours, setSelectedApplicationForHours] = useState<VolunteerApplication | null>(null);

  // Filtered Lists by Search
  const filteredOpportunities = useMemo(() => {
    if (!searchQuery.trim()) return opportunities;
    const q = searchQuery.toLowerCase();
    return opportunities.filter(
      (o) => o.title.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)
    );
  }, [opportunities, searchQuery]);

  // Separate Pending Applications vs Approved Volunteers
  const pendingApplications = useMemo(() => {
    const list = applications.filter((a) => a.status === 'pending');
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) =>
        a.volunteer_name.toLowerCase().includes(q) ||
        a.opportunity_title?.toLowerCase().includes(q) ||
        a.phone.includes(q)
    );
  }, [applications, searchQuery]);

  const approvedVolunteers = useMemo(() => {
    const list = applications.filter((a) => a.status === 'approved');
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) =>
        a.volunteer_name.toLowerCase().includes(q) ||
        a.opportunity_title?.toLowerCase().includes(q) ||
        a.phone.includes(q)
    );
  }, [applications, searchQuery]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.volunteer_name.toLowerCase().includes(q) ||
        t.task_description.toLowerCase().includes(q) ||
        t.opportunity_title?.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (l) =>
        l.volunteer_name.toLowerCase().includes(q) ||
        l.opportunity_title?.toLowerCase().includes(q) ||
        l.manager_evaluation?.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  const filteredCertificates = useMemo(() => {
    if (!searchQuery.trim()) return certificates;
    const q = searchQuery.toLowerCase();
    return certificates.filter(
      (c) =>
        c.volunteer_name.toLowerCase().includes(q) ||
        c.opportunity_title?.toLowerCase().includes(q)
    );
  }, [certificates, searchQuery]);

  const handleConfirmClose = async () => {
    if (!opportunityToClose) return;
    setIsClosing(true);
    try {
      await closeOpportunity(opportunityToClose.id);
      showToast('تم إغلاق الفرصة التطوعية بالسيرفر بنجاح', 'success');
      setOpportunityToClose(null);
    } catch (err: any) {
      showToast(err.message || 'فشل إغلاق الفرصة', 'error');
    } finally {
      setIsClosing(false);
    }
  };

  const handleApprove = async (id: number | string) => {
    try {
      await approveApplication(id);
      showToast('تم قبول واعتماد المتطوع بنجاح بالسيرفر', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل قبول الطلب', 'error');
    }
  };

  const handleReject = async (id: number | string) => {
    try {
      await rejectApplication(id);
      showToast('تم رفض الطلب بالسيرفر', 'error');
    } catch (err: any) {
      showToast(err.message || 'فشل رفض الطلب', 'error');
    }
  };

  const handleIssueCertificate = async (app: VolunteerApplication) => {
    try {
      await issueCertificate(app.volunteer_id, app.opportunity_id);
      showToast(`تم إصدار شهادة التطوع للمتطوع ${app.volunteer_name} بنجاح`, 'success');
      setActiveTab('certificates');
    } catch (err: any) {
      showToast(err.message || 'فشل إصدار الشهادة بالسيرفر', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title="إدارة العمل التطوعي والمتطوعين"
        description="مسار عمل كامل لمدير المسجد لإنشاء الفرص التطوعية، قبول المتقدمين، إسناد المهام، وتسجيل الساعات والشهادات، واستعراض قائمة المتطوعين."
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'إدارة المتطوعين', active: true },
        ]}
        actions={
          !isSuperAdmin && mainTab === 'opportunities' ? (
            <button
              onClick={() => router.push('/volunteers/opportunities/create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>طرح فرصة تطوعية جديدة</span>
            </button>
          ) : undefined
        }
      />

      {/* Top Primary Tabs Switcher: الفرص التطوعية vs قائمة المتطوعين */}
      <div className="flex items-center gap-3 border-b border-border pb-3 mb-6">
        <button
          onClick={() => setMainTab('opportunities')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            mainTab === 'opportunities'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>الفرص التطوعية</span>
          {pagination.total > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              mainTab === 'opportunities' ? 'bg-white text-primary' : 'bg-primary/20 text-primary'
            }`}>
              {pagination.total}
            </span>
          )}
        </button>

        <button
          onClick={() => setMainTab('volunteers_list')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            mainTab === 'volunteers_list'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>قائمة المتطوعين</span>
          {volunteersPagination.total > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              mainTab === 'volunteers_list' ? 'bg-white text-primary' : 'bg-primary/20 text-primary'
            }`}>
              {volunteersPagination.total}
            </span>
          )}
        </button>
      </div>

      {/* View 1: Volunteers Users List */}
      {mainTab === 'volunteers_list' ? (
        <VolunteersListTab
          volunteers={volunteersList}
          loading={volunteersLoading}
          error={volunteersError}
          page={volunteersPage}
          setPage={setVolunteersPage}
          pagination={volunteersPagination}
          search={volunteersSearch}
          setSearch={setVolunteersSearch}
          status={volunteersStatus}
          setStatus={setVolunteersStatus}
          onRefresh={fetchVolunteersList}
        />
      ) : (
        /* View 2: Volunteer Opportunities Management Full Workflow */
        <>
          {/* Stats Banner */}
          <VolunteerStatsBanner stats={stats} loading={loading} />

          {/* Debug Terminal */}
          <VolunteerDebugTerminal
            show={showDebugTerminal}
            onClose={() => setShowDebugTerminal(false)}
            logs={debugLogs}
            onClear={clearDebugLogs}
          />

          {/* Tabs and Filter Bar */}
          <VolunteerTabsNavigation
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={fetchAllVolunteerData}
            loading={loading}
            showDebugTerminal={showDebugTerminal}
            onToggleDebugTerminal={() => setShowDebugTerminal(!showDebugTerminal)}
            counts={{
              opportunities: pagination.total || opportunities.length,
              applications: pendingApplications.length,
              approved_volunteers: approvedVolunteers.length,
              tasks: tasks.length,
              logs: logs.length,
              certificates: certificates.length,
            }}
          />

          {/* Error Alert */}
          {error && (
            <div className="p-4 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchAllVolunteerData}
                className="flex items-center gap-1 text-xs font-bold underline hover:no-underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          )}

          {/* Content By Active Tab */}
          {/* Initial loading with Mosque theme */}
          {loading && opportunities.length === 0 ? (
            <MosqueVolunteerLoader
              message="جاري جلب الفرص التطوعية وإحصائيات المسجد..."
              subMessage="يتم مزامنة بيانات الفرص والطلبات مباشرة من خادم إدارة المسجد"
            />
          ) : activeTab === 'opportunities' ? (
            /* 1. Opportunities Tab */
            <div className="space-y-6">
              {filteredOpportunities.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <HeartHandshake className="w-8 h-8" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-base font-bold text-foreground mb-1">لا توجد فرص تطوعية مسجلة</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      يمكنك طرح أول فرصة تطوعية بالمسجد لاستقطاب وتوزيع المتطوعين.
                    </p>
                  </div>
                  {!isSuperAdmin && (
                    <button
                      onClick={() => router.push('/volunteers/opportunities/create')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-primary/90 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>طرح فرصة تطوعية</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Cards grid with pagination loading overlay */
                <div className="relative">
                  {/* Pagination Loading Overlay */}
                  {loading && opportunities.length > 0 && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-3xl">
                      <MosqueVolunteerLoader
                        message="جاري تحديث قائمة الفرص التطوعية..."
                        subMessage="يرجى الانتظار لحظات"
                        minHeight="min-h-[220px]"
                      />
                    </div>
                  )}

              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity duration-300 ${loading && opportunities.length > 0 ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                {filteredOpportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onCloseOpportunity={!isSuperAdmin ? () => setOpportunityToClose(opp) : () => {}}
                    onOpenEdit={!isSuperAdmin ? (target) => setOpportunityToEdit(target) : undefined}
                    onNavigateToApplications={() => setActiveTab('applications')}
                    onNavigateToDetails={(id) => router.push(`/volunteers/opportunities/${id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pagination Footer - Matching CampaignsSection & MaintenanceTable */}
          {pagination.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-card border border-border rounded-2xl shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">
                عرض الصفحة <span className="font-bold text-foreground">{page}</span> من <span className="font-bold text-foreground">{pagination.lastPage}</span> (إجمالي {pagination.total} فرصة)
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
                  {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                    .filter((i) => i === 1 || i === pagination.lastPage || Math.abs(i - page) <= 1)
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
                  disabled={page >= pagination.lastPage || loading}
                  onClick={() => setPage(Math.min(pagination.lastPage, page + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'applications' ? (
        /* 2. Pending Applications Tab */
        pendingApplications.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center text-xs text-muted-foreground">
            لا توجد طلبات تطوع جديدة قيد المراجعة حالياً
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingApplications.map((app) => (
              <VolunteerApplicationCard
                key={app.id}
                application={app}
                isSuperAdmin={isSuperAdmin}
                onApprove={handleApprove}
                onReject={handleReject}
                onOpenAssignTask={(a) => setSelectedApplicationForTask(a)}
                onOpenLogHours={(a) => setSelectedApplicationForHours(a)}
                onIssueCertificate={handleIssueCertificate}
              />
            ))}
          </div>
        )
      ) : activeTab === 'approved_volunteers' ? (
        /* 3. Approved Volunteers Tab (Separated from Applications) */
        approvedVolunteers.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center text-xs text-muted-foreground">
            لا يوجد متطوعون معتمدون بعد. يمكنك إقرار اعتماد المتطوعين من تبويب طلبات الانضمام.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {approvedVolunteers.map((app) => (
              <VolunteerApplicationCard
                key={app.id}
                application={app}
                isSuperAdmin={isSuperAdmin}
                onApprove={handleApprove}
                onReject={handleReject}
                onOpenAssignTask={(a) => setSelectedApplicationForTask(a)}
                onOpenLogHours={(a) => setSelectedApplicationForHours(a)}
                onIssueCertificate={handleIssueCertificate}
              />
            ))}
          </div>
        )
      ) : activeTab === 'tasks' ? (
        /* 4. Tasks Tab */
        filteredTasks.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center text-xs text-muted-foreground">
            لا توجد مهام مسندة للمتطوعين حالياً. يمكنك إسناد مهام من تبويب المتطوعين المعتمدين.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => (
              <VolunteerTaskCard key={task.id} task={task} />
            ))}
          </div>
        )
      ) : activeTab === 'logs' ? (
        /* 5. Logs Tab */
        filteredLogs.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center text-xs text-muted-foreground">
            لا توجد ساعات مسجلة بعد
          </div>
        ) : (
          <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/70 text-muted-foreground font-bold">
                    <th className="p-4">اسم المتطوع</th>
                    <th className="p-4">الفرصة التطوعية</th>
                    <th className="p-4">الساعات المنجزة</th>
                    <th className="p-4">تقييم المدير</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-muted/20 transition-all">
                      <td className="p-4 font-bold text-foreground">{log.volunteer_name}</td>
                      <td className="p-4 text-muted-foreground">{log.opportunity_title}</td>
                      <td className="p-4 font-bold text-primary font-mono">{log.logged_hours} ساعة</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                          {log.manager_evaluation}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground font-mono">{log.created_at?.split('T')[0]}</td>
                      <td className="p-4 text-muted-foreground">{log.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* 6. Certificates Tab */
        filteredCertificates.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center text-xs text-muted-foreground">
            لا توجد شهادات تطوع مصدرة حالياً
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCertificates.map((cert) => (
              <div key={cert.id} className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{cert.volunteer_name}</h3>
                    <p className="text-xs text-muted-foreground">{cert.opportunity_title}</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl text-xs flex items-center justify-between font-mono">
                  <span>إجمالي الساعات:</span>
                  <span className="font-bold text-primary">{cert.total_hours} ساعة</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      </>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateOpportunityModal
          onClose={() => setShowCreateModal(false)}
          onCreateOpportunity={async (payload) => {
            const res = await createOpportunity(payload);
            showToast('تم طرح وحفظ الفرصة التطوعية بالسيرفر بنجاح', 'success');
            return res;
          }}
        />
      )}

      {opportunityToEdit && (
        <EditOpportunityModal
          opportunity={opportunityToEdit}
          onClose={() => setOpportunityToEdit(null)}
          onUpdateOpportunity={async (id, payload) => {
            const res = await updateOpportunity(id, payload);
            showToast('تم تعديل بيانات الفرصة والمهام بالسيرفر بنجاح', 'success');
            return res;
          }}
        />
      )}

      {opportunityToClose && (
        <DeleteConfirmModal
          isOpen={!!opportunityToClose}
          title="إغلاق التقديم على الفرصة التطوعية"
          description="هل أنت متأكد من إغلاق استقبال الطلبات لهذه الفرصة التطوعية؟ لن يتمكن المتطوعون الجدد من التقديم عليها."
          itemName={opportunityToClose.title}
          confirmButtonText="تأكيد الإغلاق"
          isDeleting={isClosing}
          onConfirm={handleConfirmClose}
          onClose={() => setOpportunityToClose(null)}
        />
      )}

      {selectedApplicationForTask && (
        <AssignTaskModal
          application={selectedApplicationForTask}
          onClose={() => setSelectedApplicationForTask(null)}
          onAssignTask={async (payload) => {
            const res = await assignTask(payload);
            showToast('تم إسناد المهمة للمتطوع بالسيرفر بنجاح', 'success');
            return res;
          }}
        />
      )}

      {selectedApplicationForHours && (
        <LogHoursModal
          application={selectedApplicationForHours}
          onClose={() => setSelectedApplicationForHours(null)}
          onLogHours={async (payload) => {
            const res = await logHours(payload);
            showToast('تم تسجيل واعتماد الساعات بالسيرفر بنجاح', 'success');
            return res;
          }}
        />
      )}
    </div>
  );
}
