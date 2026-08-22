'use client';
// ==============================
// Presentation Section — TameemDetailsSection
// صفحة تفاصيل التعميم الكاملة (تخصيص العرض للوارد والصادر)
// ==============================

import React, { useState } from 'react';
import { 
  Bell, ArrowRight, Clock, User, CheckCircle2, AlertCircle, 
  Trash2, Edit3, Terminal, RefreshCw, X, ShieldCheck, Printer, 
  Copy, Check, Send, Users, FileText, Calendar, Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../app/components/PageHeader';
import { useTameemDetails } from '../../hooks/useTameemDetails';
import { DeleteConfirmModal } from '../../../app/components/ui/DeleteConfirmModal';
import { useToast } from '../../../app/components/ui/Toast';

interface TameemDetailsSectionProps {
  tameemId: string | number;
  onBack?: () => void;
  onNavigateToEdit?: (id: string | number) => void;
}

export function TameemDetailsSection({ 
  tameemId, 
  onBack,
  onNavigateToEdit 
}: TameemDetailsSectionProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const {
    tameem,
    loading,
    actionLoading,
    error,
    isSuperAdmin,
    isMosqueManager,
    isSender,
    isIncoming,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
    fetchDetails,
    handleUpdateTameem,
    handleDeleteTameem,
    handleMarkAsRead,
  } = useTameemDetails(tameemId);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/tameems');
    }
  };

  const handleOpenEdit = () => {
    if (onNavigateToEdit) {
      onNavigateToEdit(tameemId);
      return;
    }
    if (tameem) {
      setEditTitle(tameem.title);
      setEditContent(tameem.content);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) return;
    setEditSubmitting(true);
    try {
      await handleUpdateTameem({
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await handleDeleteTameem();
      setShowDeleteModal(false);
      handleBack();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyContent = () => {
    if (!tameem) return;
    const text = `${tameem.title}\n\n${tameem.content}\n\nتاريخ التعميم: ${tameem.created_at || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('تم نسخ نص التعميم إلى الحافظة', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculations for recipients
  const recipients = tameem?.recipients || [];
  const totalRecipients = recipients.length;
  const readRecipients = recipients.filter(r => r.is_read).length;
  const unreadRecipients = totalRecipients - readRecipients;
  const readPercentage = totalRecipients > 0 ? Math.round((readRecipients / totalRecipients) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-16 space-y-6">
      {/* Page Header */}
      <PageHeader
        title={tameem?.title ? `تعميم: ${tameem.title}` : 'تفاصيل التعميم الإداري'}
        description={`رقم التعميم: #${tameemId} — عرض المحتوى وبيانات التعميم`}
        breadcrumbs={[
          { label: 'لوحة التحكم' },
          { label: 'التعاميم والقرارات' },
          { label: tameem ? `#${tameem.id}` : 'التفاصيل', active: true }
        ]}
        onBack={handleBack}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="فحص استجابة الـ API"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            <button
              onClick={fetchDetails}
              className="p-2 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* INCOMING TAMEEM: Mark as read button (Shown only if incoming and not read yet) */}
            {isIncoming && tameem && !tameem.is_read && (
              <button
                onClick={handleMarkAsRead}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>تأكيد الاطلاع والقراءة</span>
              </button>
            )}

            {/* SENT TAMEEM: Edit & Delete Buttons (Only for sender / admin) */}
            {isSender && (
              <>
                <button
                  onClick={handleOpenEdit}
                  disabled={loading || !tameem}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>تعديل التعميم</span>
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={loading || !tameem}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold transition-all shadow-sm"
                  title="حذف التعميم"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف</span>
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="px-4 md:px-8 space-y-6 max-w-6xl mx-auto">
        {/* Live Debug Inspector */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">مراقب الـ API المباشر لتفاصيل التعميم (Tameem Details API)</h3>
              </div>
              <button
                onClick={clearDebugLogs}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg"
              >
                مسح السجل
              </button>
            </div>

            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic">لا توجد طلبات مسجلة حالياً.</p>
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

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-muted rounded-full" />
                <div className="h-6 w-24 bg-muted rounded-full" />
              </div>
              <div className="h-8 w-3/4 bg-muted rounded-lg" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
                <div className="h-4 w-4/6 bg-muted rounded" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-3xl p-6 h-48 bg-muted/40" />
          </div>
        ) : error || !tameem ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-black text-foreground">{error || 'تعذر العثور على التعميم'}</h3>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={fetchDetails}
                className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-card border border-border text-foreground font-bold text-xs rounded-xl"
              >
                العودة للقائمة
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Info Banner Card */}
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-amber-500" />

              {/* Status Header Meta */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  {tameem.priority === 'urgent' && (
                    <span className="px-3.5 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-black rounded-full flex items-center gap-1 shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5" /> تعميم عاجل وفوري
                    </span>
                  )}
                  {tameem.priority === 'high' && (
                    <span className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-black rounded-full flex items-center gap-1 shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5" /> تعميم هام جداً
                    </span>
                  )}
                  {(!tameem.priority || tameem.priority === 'normal') && (
                    <span className="px-3.5 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-black rounded-full flex items-center gap-1 shadow-sm">
                      <Bell className="w-3.5 h-3.5" /> تعميم إداري اعتيادي
                    </span>
                  )}

                  <span className="px-3 py-1.5 bg-muted/60 text-muted-foreground border border-border rounded-full text-xs font-bold">
                    معرف التعميم: #{tameem.id}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/60">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>تاريخ الإصدار: {tameem.created_at}</span>
                  </span>

                  <button
                    onClick={handleCopyContent}
                    className="flex items-center gap-1 px-3 py-1.5 bg-muted/40 hover:bg-muted text-foreground rounded-xl border border-border/60 transition-colors"
                    title="نسخ نص التعميم"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-muted/40 hover:bg-muted text-foreground rounded-xl border border-border/60 transition-colors"
                    title="طباعة التعميم"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة</span>
                  </button>
                </div>
              </div>

              {/* Title & Body */}
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-black text-foreground leading-snug">
                  {tameem.title}
                </h1>

                <div className="p-6 bg-muted/20 border border-border/60 rounded-2xl">
                  <p className="text-base text-foreground/90 font-medium whitespace-pre-wrap leading-relaxed">
                    {tameem.content}
                  </p>
                </div>
              </div>

              {/* Sender & Target Metadata Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-bold">الجهة المصدرة / المرسل</p>
                    <p className="text-xs font-black text-foreground">
                      {tameem.sender_name || (tameem.sender_id ? `المرسل #${tameem.sender_id}` : 'إدارة المساجد')}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-bold">الفئة المستهدفة</p>
                    <p className="text-xs font-black text-foreground">
                      {tameem.target_role === 'mosque_manager' ? 'أئمة ومدراء المساجد' : 'كافة المنسوبين والكوادر'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${isSuperAdmin ? 'bg-primary/10 text-primary' : (tameem.is_read ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500')}`}>
                    {isSuperAdmin ? <Users className="w-5 h-5" /> : (tameem.is_read ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />)}
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-bold">{isSuperAdmin ? 'إحصائية الاطلاع' : 'حالة القراءة الخاصة بك'}</p>
                    <p className="text-xs font-black text-foreground">
                      {isSuperAdmin ? `${readRecipients} من ${totalRecipients} قرأوا (${readPercentage}%)` : (tameem.is_read ? 'تمت القراءة والاطلاع' : 'قيد الانتظار (لم تقرأ بعد)')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipients Table & Tracking Section — ONLY FOR SENT CIRCULARS (الصادرة منك) */}
            {isSender && (
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-black text-foreground">المستلمون ومتابعة حالة القراءة</h2>
                    </div>
                    <p className="text-xs text-muted-foreground font-bold mt-1">
                      قائمة الأشخاص أو مدراء المساجد المعنيين بهذا التعميم ومتابعة تأكيد اطلاعهم
                    </p>
                  </div>

                  {/* Progress Mini Stats */}
                  {totalRecipients > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{readRecipients} قرأوا</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-xl border border-amber-500/20">
                        <Clock className="w-4 h-4" />
                        <span>{unreadRecipients} لم يقرأوا</span>
                      </div>
                      <div className="text-xs font-black text-primary px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20">
                        نسبة الاطلاع: {readPercentage}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {totalRecipients > 0 && (
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${readPercentage}%` }}
                    />
                  </div>
                )}

                {recipients.length === 0 ? (
                  <div className="py-12 text-center space-y-2 bg-muted/20 rounded-2xl border border-border/60">
                    <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-bold text-muted-foreground">
                      هذا التعميم مرسل بشكل عام (All Staff / All Managers).
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-bold">
                          <th className="py-3 px-4">#</th>
                          <th className="py-3 px-4">اسم المستلم</th>
                          <th className="py-3 px-4">البريد / الدور</th>
                          <th className="py-3 px-4">حالة القراءة</th>
                          <th className="py-3 px-4">وقت الاطلاع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-medium text-foreground">
                        {recipients.map((recipient, idx) => (
                          <tr key={recipient.id || idx} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-muted-foreground">{idx + 1}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 font-bold">
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                                  {(recipient.name || 'م')[0]}
                                </div>
                                <span>{recipient.name || `مستلم #${recipient.id}`}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {recipient.email || recipient.role || 'مدير مسجد'}
                            </td>
                            <td className="py-3 px-4">
                              {recipient.is_read ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full font-black text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" /> مقروء
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full font-black text-[10px]">
                                  <Clock className="w-3 h-3" /> غير مقروء
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                              {recipient.read_at ? new Date(recipient.read_at).toLocaleString('ar-EG') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Edit Tameem */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black text-foreground">تعديل التعميم #{tameemId}</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">عنوان التعميم *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="عنوان التعميم..."
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">نص ومحتوى التعميم *</label>
                <textarea
                  required
                  rows={6}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="اكتب التوجيهات أو التعليمات بالتفصيل..."
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground font-bold text-xs rounded-xl hover:bg-muted"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20"
                >
                  {editSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>حفظ التعديلات (PUT)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirm */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="حذف التعميم الإداري"
        description={`هل أنت متأكد من رغبتك في حذف التعميم #${tameemId}؟ لا يمكن التراجع عن هذا الإجراء وسيتم إزالته من السيرفر بشكل دائم.`}
        isDeleting={actionLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
