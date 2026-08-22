'use client';
// ==============================
// Presentation Section — TameemsListSection
// إدارة واستعراض التعاميم + إصدار تعميم عام (سوبر أدمن) أو تعميم للمسجد (مدير مسجد)
// ==============================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Search, Plus, CheckCircle2, Clock, AlertCircle, 
  Trash2, Edit3, Eye, Terminal, RefreshCw, X, ShieldAlert, Sparkles, Filter,
  Users, UserCheck, Check, ChevronDown, ArrowRight, User, ShieldCheck, Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../app/components/PageHeader';
import { useTameems } from '../../hooks/useTameems';
import { Tameem } from '../../../domain/entities/Tameem';
import { QuranPeopleRepositoryImpl } from '../../../data/repositories/QuranPeopleRepositoryImpl';
import { QuranPerson } from '../../../domain/entities/QuranPeople';
import { DeleteConfirmModal } from '../../../app/components/ui/DeleteConfirmModal';

const cadresRepo = new QuranPeopleRepositoryImpl();

interface TameemsListSectionProps {
  onNavigateToAdd?: () => void;
  onViewDetails?: (id: string | number) => void;
  onNavigateToEdit?: (id: string | number) => void;
}

export function TameemsListSection({ 
  onNavigateToAdd, 
  onViewDetails, 
  onNavigateToEdit 
}: TameemsListSectionProps = {}) {
  const router = useRouter();
  const {
    tameems,
    filteredTameems,
    loading,
    error,
    isSuperAdmin,
    isMosqueManager,
    actionLoadingId,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    readFilter,
    setReadFilter,
    tabFilter,
    setTabFilter,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
    loadTameems,
    handleMarkAsRead,
    handleCreateTameem,
    handleCreateTameemForMosque,
    handleUpdateTameem,
    handleDeleteTameem,
  } = useTameems();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTameem, setEditingTameem] = useState<Tameem | null>(null);
  const [tameemToDelete, setTameemToDelete] = useState<Tameem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPriority, setFormPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [submitting, setSubmitting] = useState(false);

  // Super Admin: Recipient Selection State
  const [managersList, setManagersList] = useState<QuranPerson[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [recipientMode, setRecipientMode] = useState<'all' | 'specific'>('all');
  const [selectedManagerIds, setSelectedManagerIds] = useState<number[]>([]);
  const [managerSearchQuery, setManagerSearchQuery] = useState('');

  // Mosque Manager: Target Selection (Mutually Exclusive)
  const [mosqueTargetOption, setMosqueTargetOption] = useState<'all_staff' | 'all_teachers' | 'all_supervisors' | 'specific'>('all_staff');
  const [mosqueStaffList, setMosqueStaffList] = useState<QuranPerson[]>([]);
  const [loadingMosqueStaff, setLoadingMosqueStaff] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // Load Mosque Managers from Cadres API (for Super Admin custom selection)
  const loadMosqueManagers = async () => {
    setLoadingManagers(true);
    try {
      const res = await cadresRepo.getPeople({ role: 'mosque_manager', per_page: 50 });
      if (res && res.data) {
        setManagersList(res.data);
      }
    } catch (e) {
      console.warn('Failed to fetch mosque managers:', e);
    } finally {
      setLoadingManagers(false);
    }
  };

  // Load Mosque Staff (Teachers and Supervisors) for Mosque Manager
  const loadMosqueStaff = async () => {
    setLoadingMosqueStaff(true);
    try {
      const [teachersRes, supervisorsRes] = await Promise.allSettled([
        cadresRepo.getPeople({ role: 'teacher', per_page: 50 }),
        cadresRepo.getPeople({ role: 'halaqa_supervisor', per_page: 50 }),
      ]);
      const teachers = teachersRes.status === 'fulfilled' ? (teachersRes.value?.data || []) : [];
      const supervisors = supervisorsRes.status === 'fulfilled' ? (supervisorsRes.value?.data || []) : [];
      setMosqueStaffList([...teachers, ...supervisors]);
    } catch (e) {
      console.warn('Failed to fetch mosque staff:', e);
    } finally {
      setLoadingMosqueStaff(false);
    }
  };

  useEffect(() => {
    if (showCreateModal) {
      if (isSuperAdmin && managersList.length === 0) {
        loadMosqueManagers();
      }
      if (isMosqueManager && mosqueStaffList.length === 0) {
        loadMosqueStaff();
      }
    }
  }, [showCreateModal, isSuperAdmin, isMosqueManager]);

  const filteredManagers = useMemo(() => {
    if (!managerSearchQuery.trim()) return managersList;
    const q = managerSearchQuery.trim().toLowerCase();
    return managersList.filter(m => 
      m.name.toLowerCase().includes(q) || 
      (m.mosque_name && m.mosque_name.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q))
    );
  }, [managersList, managerSearchQuery]);

  const filteredMosqueStaff = useMemo(() => {
    if (!staffSearchQuery.trim()) return mosqueStaffList;
    const q = staffSearchQuery.trim().toLowerCase();
    return mosqueStaffList.filter(m => 
      m.name.toLowerCase().includes(q) || 
      (m.role && m.role.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q))
    );
  }, [mosqueStaffList, staffSearchQuery]);

  const toggleSelectManager = (id: number) => {
    setSelectedManagerIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectStaff = (id: number) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const openCreateModal = () => {
    if (onNavigateToAdd) {
      onNavigateToAdd();
      return;
    }
    setEditingTameem(null);
    setFormTitle('');
    setFormContent('');
    setFormPriority('normal');
    setRecipientMode('all');
    setSelectedManagerIds([]);
    setManagerSearchQuery('');
    setMosqueTargetOption('all_staff');
    setSelectedStaffIds([]);
    setStaffSearchQuery('');
    setShowCreateModal(true);
  };

  const openEditModal = (tameem: Tameem) => {
    if (onNavigateToEdit) {
      onNavigateToEdit(tameem.id);
      return;
    }
    setEditingTameem(tameem);
    setFormTitle(tameem.title);
    setFormContent(tameem.content);
    setFormPriority(tameem.priority || 'normal');
    setRecipientMode('all');
    setSelectedManagerIds([]);
    setShowCreateModal(true);
  };

  const handleViewClick = (tameem: Tameem) => {
    if (onViewDetails) {
      onViewDetails(tameem.id);
    } else {
      router.push(`/tameems/${tameem.id}`);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    setSubmitting(true);
    try {
      if (editingTameem) {
        // Update existing tameem (PUT /api/tameems/{id})
        await handleUpdateTameem(editingTameem.id, {
          title: formTitle.trim(),
          content: formContent.trim(),
          priority: formPriority,
          recipient_ids: recipientMode === 'specific' ? selectedManagerIds : undefined,
        });
      } else {
        if (isMosqueManager && !isSuperAdmin) {
          // Mosque Manager sends tameem for mosque (POST /api/tameems/for-mosque)
          // Exactly one of recipient_ids or the "all" flags must be provided:
          const payload: any = {
            title: formTitle.trim(),
            content: formContent.trim(),
            priority: formPriority,
          };
          if (mosqueTargetOption === 'all_staff') {
            payload.all_staff = true;
          } else if (mosqueTargetOption === 'all_teachers') {
            payload.all_teachers = true;
          } else if (mosqueTargetOption === 'all_supervisors') {
            payload.all_supervisors = true;
          } else if (mosqueTargetOption === 'specific') {
            if (selectedStaffIds.length === 0) {
              alert('يرجى اختيار معلم أو مشرف واحد على الأقل');
              setSubmitting(false);
              return;
            }
            payload.recipient_ids = selectedStaffIds;
          }

          await handleCreateTameemForMosque(payload);
        } else {
          // Super Admin sends general tameem (POST /api/tameems)
          await handleCreateTameem({
            title: formTitle.trim(),
            content: formContent.trim(),
            priority: formPriority,
            all_mosque_managers: recipientMode === 'all',
            recipient_ids: recipientMode === 'specific' ? selectedManagerIds : undefined,
          });
        }
      }
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!tameemToDelete) return;
    try {
      await handleDeleteTameem(tameemToDelete.id);
      setTameemToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="إدارة وتتبع التعاميم والقرارات الإدارية"
        description="استعراض وتتبع كافة التعاميم الإدارية الصادرة، وتأكيد الاطلاع عليها ومتابعة المستلمين."
        breadcrumbs={[
          { label: 'الإدارة التشغيلية' },
          { label: 'التعاميم والقرارات', active: true },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="فحص استجابة الـ API"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            <button
              onClick={loadTameems}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> 
              <span>{isMosqueManager && !isSuperAdmin ? 'إرسال تعميم للمسجد' : 'إصدار تعميم جديد'}</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-6">
        {/* Live Debug Inspector */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">مراقب الـ API المباشر لخدمة التعاميم (Tameems API Inspector)</h3>
              </div>
              <button
                onClick={clearDebugLogs}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg"
              >
                مسح السجل
              </button>
            </div>

            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic">لا توجد طلبات معالجة حالياً. قم بطلب تحديث أو إجراء لرؤية النتيجة.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto ltr text-left">
                {debugLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="font-bold">[{log.time}] {log.action}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                        HTTP {log.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{log.url}</p>
                    <pre className="text-[10px] bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab & Filter Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative w-full md:w-80 lg:w-96">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في عنوان أو نص التعميم..."
                className="w-full pl-4 pr-10 py-2 bg-muted/50 border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Tabs: ONLY for non-SuperAdmin (Mosque Manager etc.) */}
            {!isSuperAdmin && (
              <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border shrink-0">
                {[
                  { id: 'my', label: 'التعاميم الواردة إليك' },
                  { id: 'sent', label: 'التعاميم الصادرة منك' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTabFilter(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      tabFilter === tab.id
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority & Read Status Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pt-2 border-t border-border/60">
            <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground shrink-0">
              <Filter className="w-3.5 h-3.5" /> الأولوية:
            </div>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'urgent', label: 'عاجل جداً' },
              { id: 'high', label: 'هام' },
              { id: 'normal', label: 'اعتيادي' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriorityFilter(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  priorityFilter === p.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}

            {!isSuperAdmin && tabFilter === 'my' && (
              <>
                <div className="h-4 w-px bg-border my-auto mx-1 shrink-0" />

                <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground shrink-0">
                  حالة القراءة:
                </div>
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'unread', label: 'غير مقروءة' },
                  { id: 'read', label: 'مقروءة' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setReadFilter(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      readFilter === r.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-muted/50 border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Tameems Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-card border border-border rounded-3xl p-6 animate-pulse space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-muted rounded-full" />
                  <div className="h-4 w-16 bg-muted rounded-md" />
                </div>
                <div className="h-6 w-3/4 bg-muted rounded-md" />
                <div className="h-16 w-full bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-black text-foreground">{error}</h3>
            <button
              onClick={loadTameems}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredTameems.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm space-y-3">
            <FileText className="w-12 h-12 text-muted-foreground/40" />
            <h3 className="text-base font-black text-foreground">
              {isSuperAdmin
                ? 'لا توجد تعاميم إدارية مطابقة حالياً'
                : (tabFilter === 'my' ? 'لا توجد تعاميم واردة إليك حالياً' : 'لا توجد تعاميم صادرة منك حالياً')}
            </h3>
            <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto">
              {isSuperAdmin
                ? 'يمكنك إصدار تعميم إداري جديد ونشره لكافة مدراء المساجد.'
                : (tabFilter === 'my'
                  ? 'ستظهر هنا التعاميم والتوجيهات الإدارية الموجهة إليك فور صدورها.'
                  : 'يمكنك إصدار تعميم جديد لمتابعة استلامه واطلاع المنسوبين عليه.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTameems.map((tameem) => (
              <div
                key={tameem.id}
                className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Priority Badge & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {tameem.priority === 'urgent' && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 animate-pulse" /> عاجل جداً
                        </span>
                      )}
                      {tameem.priority === 'high' && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          هام
                        </span>
                      )}
                      {(!tameem.priority || tameem.priority === 'normal') && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          تعميم إداري
                        </span>
                      )}

                      <span className="text-[10px] text-muted-foreground font-mono">
                        #{tameem.id}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {tameem.created_at}
                    </span>
                  </div>

                  {/* Title & Preview */}
                  <div>
                    <h3
                      onClick={() => handleViewClick(tameem)}
                      className="text-base font-black text-foreground hover:text-primary cursor-pointer transition-colors line-clamp-2"
                    >
                      {tameem.title}
                    </h3>
                    <p 
                      onClick={() => handleViewClick(tameem)}
                      className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3 bg-muted/40 p-3 rounded-xl border border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
                    >
                      {tameem.content}
                    </p>
                  </div>

                  {/* Recipients Summary Badge (Super Admin or Sent Tameems) */}
                  {(isSuperAdmin || tabFilter === 'sent') && tameem.recipients && tameem.recipients.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>{tameem.recipients.length} مستلم</span>
                      <span className="text-emerald-600">({tameem.recipients.filter(r => r.is_read).length} قرأوا)</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewClick(tameem)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 hover:bg-muted text-foreground rounded-xl text-xs font-bold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض التفاصيل</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* SUPER ADMIN: Always has Edit & Delete on all circulars. NO mark as read */}
                    {isSuperAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(tameem)}
                          className="p-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl transition-all"
                          title="تعديل التعميم"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTameemToDelete(tameem)}
                          disabled={actionLoadingId === tameem.id}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all disabled:opacity-50"
                          title="حذف التعميم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* NON-SUPER ADMIN (e.g. Mosque Manager) */}
                    {!isSuperAdmin && tabFilter === 'my' && (
                      <>
                        {!tameem.is_read ? (
                          <button
                            onClick={() => handleMarkAsRead(tameem.id)}
                            disabled={actionLoadingId === tameem.id}
                            className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                          >
                            {actionLoadingId === tameem.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>تأكيد الاطلاع</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-[10px] font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> تمت القراءة
                          </span>
                        )}
                      </>
                    )}

                    {!isSuperAdmin && tabFilter === 'sent' && (
                      <>
                        <button
                          onClick={() => openEditModal(tameem)}
                          className="p-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl transition-all"
                          title="تعديل التعميم"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTameemToDelete(tameem)}
                          disabled={actionLoadingId === tameem.id}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all disabled:opacity-50"
                          title="حذف التعميم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Create / Edit Tameem Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black text-foreground">
                  {editingTameem ? `تعديل التعميم #${editingTameem.id}` : (isMosqueManager && !isSuperAdmin ? 'إرسال تعميم لمنسوبي المسجد' : 'إصدار تعميم إداري جديد')}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">عنوان التعميم *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: تعميم بشأن مواعيد الصلاة وجداول الحلقات..."
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">درجة الأهمية / الأولوية</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'normal', label: 'اعتيادي', desc: 'إشعار إداري عام' },
                    { id: 'high', label: 'هام', desc: 'يتطلب انتباه عاجل' },
                    { id: 'urgent', label: 'عاجل جداً', desc: 'تنفيذ فوري وإلزامي' },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setFormPriority(p.id as any)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all text-center space-y-1 ${
                        formPriority === p.id
                          ? 'bg-primary/10 border-primary text-primary shadow-sm font-black'
                          : 'bg-muted/30 border-border text-muted-foreground hover:border-border/80 font-bold'
                      }`}
                    >
                      <p className="text-xs">{p.label}</p>
                      <p className="text-[10px] opacity-75">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mosque Manager Target Flags (POST /api/tameems/for-mosque) */}
              {isMosqueManager && !isSuperAdmin && !editingTameem && (
                <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                  <label className="block text-xs font-black text-foreground">
                    تحديد المستلمين في المسجد (يجب اختيار خيار واحد فقط):
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'all_staff', label: 'كافة الكادر في المسجد', desc: 'المعلمون والمشرفون معاً' },
                      { id: 'all_teachers', label: 'جميع المعلمين فقط', desc: 'معلمو حلقات المسجد' },
                      { id: 'all_supervisors', label: 'جميع المشرفين فقط', desc: 'مشرفو الحلقات' },
                      { id: 'specific', label: 'تحديد أشخاص محددين بالاسم', desc: `مخصص (${selectedStaffIds.length})` },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setMosqueTargetOption(opt.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all space-y-0.5 ${
                          mosqueTargetOption === opt.id
                            ? 'bg-primary/10 border-primary text-primary shadow-sm font-black'
                            : 'bg-card border-border text-foreground hover:bg-muted font-bold'
                        }`}
                      >
                        <p className="text-xs">{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground font-normal">{opt.desc}</p>
                      </div>
                    ))}
                  </div>

                  {mosqueTargetOption === 'specific' && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={staffSearchQuery}
                          onChange={(e) => setStaffSearchQuery(e.target.value)}
                          placeholder="ابحث عن المعلم أو المشرف بالاسم..."
                          className="w-full pl-3 pr-9 py-2 bg-card border border-border rounded-xl text-xs font-bold text-foreground"
                        />
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-border/40 bg-card border border-border rounded-xl p-2">
                        {loadingMosqueStaff ? (
                          <p className="text-xs text-muted-foreground text-center py-2">جاري جلب قائمة الكادر...</p>
                        ) : filteredMosqueStaff.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">لا يوجد كوادر مسجلة</p>
                        ) : (
                          filteredMosqueStaff.map((m) => {
                            const isSelected = selectedStaffIds.includes(Number(m.id));
                            return (
                              <div
                                key={m.id}
                                onClick={() => toggleSelectStaff(Number(m.id))}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                                  isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'
                                }`}
                              >
                                <span>{m.name} ({m.role === 'teacher' ? 'معلم' : 'مشرف حلقات'})</span>
                                {isSelected && <Check className="w-4 h-4 text-primary" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Super Admin Target Selection (POST /api/tameems) */}
              {isSuperAdmin && !editingTameem && (
                <div className="space-y-3 p-4 bg-muted/30 border border-border rounded-2xl">
                  <label className="block text-xs font-black text-foreground">تحديد المستلمين:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setRecipientMode('all')}
                      className={`p-3 rounded-xl border cursor-pointer text-center font-bold text-xs transition-all ${
                        recipientMode === 'all'
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-card border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      جميع مدراء المساجد (All Managers)
                    </div>

                    <div
                      onClick={() => setRecipientMode('specific')}
                      className={`p-3 rounded-xl border cursor-pointer text-center font-bold text-xs transition-all ${
                        recipientMode === 'specific'
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-card border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      تخصيص مدراء محددين ({selectedManagerIds.length})
                    </div>
                  </div>

                  {recipientMode === 'specific' && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={managerSearchQuery}
                          onChange={(e) => setManagerSearchQuery(e.target.value)}
                          placeholder="ابحث عن مدير المسجد بالاسم أو المسجد..."
                          className="w-full pl-3 pr-9 py-2 bg-card border border-border rounded-xl text-xs font-bold text-foreground"
                        />
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-border/40 bg-card border border-border rounded-xl p-2">
                        {loadingManagers ? (
                          <p className="text-xs text-muted-foreground text-center py-2">جاري جلب قائمة المدراء...</p>
                        ) : filteredManagers.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">لا يوجد مدراء مطابقون</p>
                        ) : (
                          filteredManagers.map((m) => {
                            const isSelected = selectedManagerIds.includes(Number(m.id));
                            return (
                              <div
                                key={m.id}
                                onClick={() => toggleSelectManager(Number(m.id))}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                                  isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'
                                }`}
                              >
                                <span>{m.name} {m.mosque_name ? `(${m.mosque_name})` : ''}</span>
                                {isSelected && <Check className="w-4 h-4 text-primary" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">نص ومحتوى التعميم *</label>
                <textarea
                  required
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="اكتب التوجيهات أو التعليمات بالتفصيل..."
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground font-bold text-xs rounded-xl hover:bg-muted"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري النشر...</span>
                    </>
                  ) : (
                    <span>{editingTameem ? 'حفظ التعديلات' : 'إصدار ونشر التعميم'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(tameemToDelete)}
        title="حذف التعميم الإداري"
        description={`هل أنت متأكد من رغبتك في حذف التعميم #${tameemToDelete?.id} "${tameemToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isDeleting={Boolean(actionLoadingId)}
        onConfirm={handleConfirmDelete}
        onClose={() => setTameemToDelete(null)}
      />
    </div>
  );
}
