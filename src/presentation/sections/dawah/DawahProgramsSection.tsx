'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import { Plus, BookOpen, RefreshCw, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useDawahPrograms } from '../../hooks/useDawahPrograms';
import { useToast } from '../../../app/components/ui/Toast';
import { DeleteConfirmModal } from '../../../app/components/ui/DeleteConfirmModal';
import { DawahProgram } from '../../../domain/entities/DawahProgram';
import {
  DawahFilterBar,
  DawahProgramCard,
  ScheduleManagementModal,
  EditDawahProgramModal,
  DawahDebugTerminal,
} from './components';
import { CreateDawahProgramSection } from './CreateDawahProgramSection';

interface DawahProgramsSectionProps {
  onNavigateToAdd?: () => void;
}

export function DawahProgramsSection({ onNavigateToAdd }: DawahProgramsSectionProps = {}) {
  const {
    programs,
    loading,
    error,
    page,
    setPage,
    lastPage,
    totalCount,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    loadData,
    updateProgram,
    deleteProgram,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedules,
    myMosque,
    spaces,
    debugLogs,
    clearDebugLogs,
    showDebugTerminal,
    setShowDebugTerminal,
  } = useDawahPrograms();

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

  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingProgram, setEditingProgram] = useState<DawahProgram | null>(null);
  const [managingSchedulesProgram, setManagingSchedulesProgram] = useState<DawahProgram | null>(null);
  const [programToDelete, setProgramToDelete] = useState<DawahProgram | null>(null);
  const [isDeletingProgram, setIsDeletingProgram] = useState<boolean>(false);

  const handleConfirmDelete = async () => {
    if (!programToDelete) return;
    setIsDeletingProgram(true);
    try {
      await deleteProgram(programToDelete.id);
      showToast('تم حذف البرنامج الدعوي بنجاح', 'success');
      setProgramToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'فشل حذف البرنامج من السيرفر', 'error');
    } finally {
      setIsDeletingProgram(false);
    }
  };

  const handleCreateNew = () => {
    if (onNavigateToAdd) {
      onNavigateToAdd();
    } else {
      setIsCreating(true);
    }
  };

  if (isCreating) {
    return (
      <CreateDawahProgramSection
        onBack={() => {
          setIsCreating(false);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title="دليل وإدارة البرامج والأنشطة الدعوية"
        description="استعراض المحاضرات والدروس والدورات العلمية مع الجدولة الزمنية وحفظ البيانات مباشرة في السيرفر."
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'البرامج والأنشطة الدعوية', active: true },
        ]}
        actions={
          !isSuperAdmin ? (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة برنامج دعوي جديد</span>
            </button>
          ) : undefined
        }
      />

      {/* Filter and Search Bar without Add Button */}
      <DawahFilterBar
        selectedType={selectedType}
        onSelectType={setSelectedType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadData}
        loading={loading}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1 text-xs font-bold underline hover:no-underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && programs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 overflow-hidden animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 bg-muted rounded-xl" />
                <div className="h-6 w-20 bg-muted rounded-xl" />
              </div>
              <div className="h-6 w-3/4 bg-muted rounded-xl" />
              <div className="h-4 w-1/2 bg-muted rounded-lg" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-muted/70 rounded-lg" />
                <div className="h-4 w-4/5 bg-muted/70 rounded-lg" />
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="h-8 w-28 bg-muted rounded-xl" />
                <div className="h-8 w-20 bg-muted rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : programs.length === 0 ? (
        /* Empty State */
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-bold text-foreground mb-1">لا توجد برامج دعوية مسجلة</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              لم يتم العثور على أي نشاط أو درس دعوي مطابق لمعايير البحث الحالية في السيرفر.
            </p>
          </div>
          {!isSuperAdmin && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء أول برنامج دعوي</span>
            </button>
          )}
        </div>
      ) : (
        /* Programs Grid & Pagination */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map((program) => (
              <DawahProgramCard
                key={program.id}
                program={program}
                spaces={spaces}
                onOpenSchedules={(p) => setManagingSchedulesProgram(p)}
                onOpenEdit={(p) => setEditingProgram(p)}
                onDelete={() => setProgramToDelete(program)}
                deletingId={programToDelete?.id || null}
              />
            ))}
          </div>

          {/* Pagination Footer - Matching CampaignsSection & VolunteerManagementSection */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-card border border-border rounded-2xl shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">
                عرض الصفحة <span className="font-bold text-foreground">{page}</span> من <span className="font-bold text-foreground">{lastPage}</span> (إجمالي {totalCount} برنامج)
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
                  disabled={page >= lastPage || loading}
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
      )}

      {/* Delete Program Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!programToDelete}
        title="تأكيد حذف البرنامج الدعوي"
        description="هل أنت متأكد من رغبتك في حذف هذا البرنامج الدعوي؟ لا يمكن التراجع عن هذه العملية بعد التأكيد وسوف يتم إرسال طلب الحذف إلى السيرفر."
        itemName={programToDelete?.program_name}
        confirmButtonText="نعم، حذف البرنامج"
        isDeleting={isDeletingProgram}
        onConfirm={handleConfirmDelete}
        onClose={() => setProgramToDelete(null)}
      />

      {/* Schedule Management Modal */}
      {managingSchedulesProgram && (
        <ScheduleManagementModal
          program={managingSchedulesProgram}
          onClose={() => setManagingSchedulesProgram(null)}
          getSchedules={getSchedules}
          onAddSchedule={async (pid, payload) => {
            const res = await addSchedule(pid, payload);
            showToast('تمت إضافة الجلسة بنجاح', 'success');
            return res;
          }}
          onUpdateSchedule={async (pid, sid, payload) => {
            const res = await updateSchedule(pid, sid, payload);
            showToast('تم تحديث الجلسة بنجاح', 'success');
            return res;
          }}
          onDeleteSchedule={async (pid, sid) => {
            const res = await deleteSchedule(pid, sid);
            showToast('تم حذف الجلسة بنجاح', 'success');
            return res;
          }}
        />
      )}

      {/* Edit Program Modal */}
      {editingProgram && (
        <EditDawahProgramModal
          program={editingProgram}
          spaces={spaces}
          onClose={() => setEditingProgram(null)}
          onUpdateProgram={async (id, payload) => {
            const res = await updateProgram(id, payload);
            showToast('تم تحديث بيانات البرنامج بنجاح', 'success');
            return res;
          }}
        />
      )}
    </div>
  );
}
