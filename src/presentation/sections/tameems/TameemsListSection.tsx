'use client';
// ==============================
// Presentation Section — TameemsListSection
// ==============================

import React, { useState } from 'react';
import { 
  FileText, Search, Plus, CheckCircle2, Clock, AlertCircle, 
  Trash2, Edit3, Eye, Terminal, RefreshCw, X, ShieldAlert, Sparkles, Filter 
} from 'lucide-react';
import { PageHeader } from '../../../app/components/PageHeader';
import { useTameems } from '../../hooks/useTameems';
import { Tameem } from '../../../domain/entities/Tameem';

interface TameemsListSectionProps {
  onNavigateToAdd?: () => void;
}

export function TameemsListSection({ onNavigateToAdd }: TameemsListSectionProps) {
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
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
    loadTameems,
    handleMarkAsRead,
    handleCreateTameem,
    handleUpdateTameem,
    handleDeleteTameem,
  } = useTameems();

  const [selectedTameem, setSelectedTameem] = useState<Tameem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTameem, setEditingTameem] = useState<Tameem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPriority, setFormPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [formTargetRole, setFormTargetRole] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingTameem(null);
    setFormTitle('');
    setFormContent('');
    setFormPriority('normal');
    setFormTargetRole('all');
    setShowCreateModal(true);
  };

  const openEditModal = (tameem: Tameem) => {
    setEditingTameem(tameem);
    setFormTitle(tameem.title);
    setFormContent(tameem.content);
    setFormPriority(tameem.priority || 'normal');
    setFormTargetRole(tameem.target_role || 'all');
    setShowCreateModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;
    setSubmitting(true);
    try {
      if (editingTameem) {
        await handleUpdateTameem(editingTameem.id, {
          title: formTitle,
          content: formContent,
          priority: formPriority,
          target_role: formTargetRole,
        });
      } else {
        await handleCreateTameem({
          title: formTitle,
          content: formContent,
          priority: formPriority,
          target_role: formTargetRole,
        });
      }
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="إدارة وتتبع التعاميم والقرارات الإدارية"
        description="استعراض وتتبع كافة التعاميم الإدارية الصادرة، وتأكيد الاطلاع عليها من قبل مدراء المساجد."
        breadcrumbs={[
          { label: 'الإدارة التشغيلية' },
          { label: 'التعاميم والقرارات', active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
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

            {isSuperAdmin && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> إصدار تعميم جديد
              </button>
            )}
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-8">

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

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في عنوان أو نص التعميم الإداري..."
              className="w-full pl-4 pr-10 py-2 bg-muted/50 border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground shrink-0">
              <Filter className="w-3.5 h-3.5" /> الأولوية:
            </div>
            {['all', 'urgent', 'high', 'normal'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  priorityFilter === p
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {p === 'all' && 'الكل'}
                {p === 'urgent' && 'عاجل جداً'}
                {p === 'high' && 'هام'}
                {p === 'normal' && 'اعتيادي'}
              </button>
            ))}

            {isMosqueManager && (
              <>
                <div className="h-4 w-px bg-border my-auto mx-1" />
                {['all', 'unread', 'read'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setReadFilter(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      readFilter === r
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-muted/50 border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r === 'all' && 'كل الحالات'}
                    {r === 'unread' && 'غير مقروء 🔴'}
                    {r === 'read' && 'تمت القراءة 🟢'}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Tameems Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-card border border-border rounded-2xl p-6 animate-pulse space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-muted rounded-md" />
                  <div className="h-6 w-16 bg-muted rounded-full" />
                </div>
                <div className="h-6 w-5/6 bg-muted rounded-md" />
                <div className="h-4 w-full bg-muted rounded-md" />
                <div className="h-4 w-2/3 bg-muted rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 bg-card border border-border rounded-3xl">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-bold text-foreground">{error}</h3>
            <button
              onClick={loadTameems}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredTameems.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm space-y-3">
            <FileText className="w-12 h-12 text-muted-foreground/40" />
            <h3 className="text-base font-black text-foreground">لا توجد تعاميم إدارية مطابقة حالياً</h3>
            <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto">
              يمكن للسوبر أدمن إشهار تعميم جديد أو تغيير كلمة البحث واستعراض الفلاتر.
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
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          تعميم عام
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {tameem.created_at}
                    </span>
                  </div>

                  {/* Title & Preview */}
                  <div>
                    <h3
                      onClick={() => setSelectedTameem(tameem)}
                      className="text-base font-black text-foreground hover:text-primary cursor-pointer transition-colors line-clamp-2"
                    >
                      {tameem.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3 bg-muted/40 p-3 rounded-xl border border-border/50">
                      {tameem.content}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedTameem(tameem)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 hover:bg-muted text-foreground rounded-xl text-xs font-bold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>التفاصيل</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Mosque Manager Action: Mark as read */}
                    {isMosqueManager && !tameem.is_read && (
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
                    )}

                    {isMosqueManager && tameem.is_read && (
                      <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> تمت القراءة
                      </span>
                    )}

                    {/* Super Admin Actions: Edit & Delete */}
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
                          onClick={() => handleDeleteTameem(tameem.id)}
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

      {/* MODAL 1: Details Modal */}
      {selectedTameem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black text-foreground">تفاصيل التعميم الإداري</h3>
              </div>
              <button
                onClick={() => setSelectedTameem(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black text-foreground leading-snug">{selectedTameem.title}</h2>
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                <span>تاريخ الصدور: {selectedTameem.created_at}</span>
                <span>الفئة المستهدفة: {selectedTameem.target_role === 'mosque_manager' ? 'مدراء المساجد' : 'كافة الكوادر'}</span>
              </div>

              <div className="p-4 bg-muted/40 rounded-2xl border border-border leading-relaxed text-sm text-foreground space-y-2 whitespace-pre-line">
                {selectedTameem.content}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              {isMosqueManager && !selectedTameem.is_read && (
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedTameem.id);
                    setSelectedTameem(null);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد الاطلاع والقراءة</span>
                </button>
              )}

              <button
                onClick={() => setSelectedTameem(null)}
                className="px-5 py-2.5 bg-card border border-border text-foreground font-bold text-xs rounded-xl hover:bg-muted transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create / Edit Modal (Super Admin) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-black text-foreground">
                {editingTameem ? 'تعديل بيانات التعميم' : 'إصدار تعميم إداري جديد'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">عنوان التعميم *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="أدخل عنوان التعميم..."
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">درجة الأولوية</label>
                  <select
                    value={formPriority}
                    onChange={(e: any) => setFormPriority(e.target.value)}
                    className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="normal">اعتيادي</option>
                    <option value="high">هام</option>
                    <option value="urgent">عاجل جداً</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">الفئة المستهدفة</label>
                  <select
                    value={formTargetRole}
                    onChange={(e) => setFormTargetRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="all">كافة الكوادر والمدراء</option>
                    <option value="mosque_manager">مدراء المساجد فقط</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">نص ومضمون التعميم *</label>
                <textarea
                  required
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="اكتب التوجيهات والقرارات التفصيلية للتعميم..."
                  className="w-full p-4 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-card border border-border text-foreground font-bold text-xs rounded-xl hover:bg-muted transition-all"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingTameem ? 'حفظ التعديلات' : 'إصدار ونشر التعميم'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
