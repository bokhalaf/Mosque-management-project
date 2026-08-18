'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import { UserPlus, Users, RefreshCw, AlertCircle, Mail, ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuranPeople } from '../../hooks/useQuranPeople';
import { useToast } from '../../../app/components/ui/Toast';
import { QuranPerson } from '../../../domain/entities/QuranPeople';
import {
  StaffStatsBanner,
  StaffFilterBar,
  StaffTableRow,
  InviteStaffModal,
  StaffDetailsModal,
  StaffDebugTerminal,
  StaffInvitationsModal,
} from './components';

export function QuranPeopleManagementSection() {
  const {
    people,
    stats,
    loading,
    error,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    lastPage,
    totalCount,
    loadData,
    sendInvitation,
    resendInvitation,
    changeUserStatus,
    deletePerson,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
  } = useQuranPeople();

  const { showToast } = useToast();
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState<boolean>(false);
  const [selectedPerson, setSelectedPerson] = useState<QuranPerson | null>(null);

  const handleChangeStatus = async (id: string | number, newStatus: 'active' | 'inactive') => {
    try {
      const res = await changeUserStatus(id, newStatus);
      showToast(res.message || (newStatus === 'active' ? 'تم تفعيل الحساب بنجاح ✅' : 'تم تجميد الحساب بنجاح 🔒'), 'success');
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء تغيير حالة الحساب', 'error');
    }
  };

  const handleResend = async (id: string | number) => {
    try {
      await resendInvitation(id);
      showToast('تمت إعادة إرسال الدعوة بنجاح عبر السيرفر', 'success');
    } catch (err: any) {
      showToast(err.message || 'تعذر إعادة إرسال الدعوة', 'error');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    try {
      await deletePerson(id);
      showToast('تم حذف السجل بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message || 'تعذر حذف السجل', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title="إدارة الكوادر والطلاب وحلقات القرآن"
        description="دليل موحد لإدارة المعلمين ومديري الحلقات والطلاب ومتابعة الدعوات وسجلات الحفظ."
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'الكوادر والحلقات القرآنية', active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInvitationsModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl border border-border transition-all shadow-sm"
              title="عرض سجل الدعوات والمرسلة (GET /api/invitations)"
            >
              <Mail className="w-4 h-4 text-primary" />
              <span>سجل الدعوات</span>
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>إرسال دعوة انضمام</span>
            </button>
          </div>
        }
      />

      {/* Stats Banner */}
      <StaffStatsBanner stats={stats} loading={loading} />

      {/* Debug Terminal */}
      <StaffDebugTerminal
        show={showDebugTerminal}
        onClose={() => setShowDebugTerminal(false)}
        logs={debugLogs}
        onClear={clearDebugLogs}
      />

      {/* Filter and Search Bar */}
      <StaffFilterBar
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadData}
        loading={loading}
        showDebugTerminal={showDebugTerminal}
        onToggleDebugTerminal={() => setShowDebugTerminal(!showDebugTerminal)}
      />

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* People Table View */}
      <div className="bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/70 text-muted-foreground text-xs font-bold">
                <th className="p-4">الاسم والحلقة</th>
                <th className="p-4">الصفة / الدور</th>
                <th className="p-4">بيانات التواصل</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/70 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-muted animate-pulse shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-40 rounded-lg bg-muted animate-pulse" />
                          <div className="h-3 w-28 rounded-lg bg-muted animate-pulse opacity-60" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-24 rounded-xl bg-muted animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 rounded-lg bg-muted animate-pulse" />
                        <div className="h-3 w-24 rounded-lg bg-muted animate-pulse opacity-60" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-20 rounded-xl bg-muted animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-8 w-8 rounded-xl bg-muted animate-pulse" />
                        <div className="h-8 w-8 rounded-xl bg-muted animate-pulse opacity-70" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : people.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Users className="w-8 h-8 text-muted-foreground/50" />
                      <span className="text-xs font-bold">لا يوجد كوادر أو طلاب مطابقين للبحث</span>
                    </div>
                  </td>
                </tr>
              ) : (
                people.map((person) => (
                  <StaffTableRow
                    key={person.id}
                    person={person}
                    onViewDetails={(p) => setSelectedPerson(p)}
                    onChangeStatus={handleChangeStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalCount > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-card border border-border rounded-2xl shadow-sm font-['Cairo']">
          <p className="text-xs text-muted-foreground font-medium">
            عرض الصفحة <span className="font-bold text-foreground">{page}</span> من <span className="font-bold text-foreground">{lastPage}</span> (إجمالي {totalCount} مستخدم)
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(Math.max(1, page - 1))}
              className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    page === pageNum
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 hover:bg-muted text-foreground'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              disabled={page >= lastPage || loading}
              onClick={() => setPage(Math.min(lastPage, page + 1))}
              className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      {showInviteModal && (
        <InviteStaffModal
          onClose={() => setShowInviteModal(false)}
          onSendInvitation={async (payload) => {
            const res = await sendInvitation(payload);
            showToast(res.message || 'تم إرسال الدعوة بنجاح عبر السيرفر', 'success');
            return res;
          }}
        />
      )}

      {/* Staff Invitations List Modal */}
      <StaffInvitationsModal
        isOpen={showInvitationsModal}
        onClose={() => setShowInvitationsModal(false)}
      />

      {/* Staff Details Modal */}
      {selectedPerson && (
        <StaffDetailsModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
}
