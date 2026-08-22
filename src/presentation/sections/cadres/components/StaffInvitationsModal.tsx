'use client';

// ==============================
// StaffInvitationsModal Component
// نافذة سجل دعوات الانضمام مع التصفية وإعادة الإرسال المباشر عبر السيرفر
// ==============================

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, X, RefreshCw, Send, Clock, CheckCircle2, AlertCircle, GraduationCap, Shield, Users, Building2 } from 'lucide-react';
import { QuranPeopleRepositoryImpl } from '../../../../data/repositories/QuranPeopleRepositoryImpl';
import { useToast } from '../../../../app/components/ui/Toast';

interface StaffInvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaffInvitationsModal({ isOpen, onClose }: StaffInvitationsModalProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendingId, setResendingId] = useState<string | number | null>(null);

  const repository = React.useMemo(() => new QuranPeopleRepositoryImpl(), []);
  const { showToast } = useToast();

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await repository.getInvitations(statusFilter);
      setInvitations(res.data || []);
    } catch (err: any) {
      showToast('تعذر جلب سجل الدعوات من السيرفر', 'error');
    } finally {
      setLoading(false);
    }
  }, [repository, statusFilter, showToast]);

  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen, loadInvitations]);

  const handleResend = async (invitationId: string | number) => {
    setResendingId(invitationId);
    try {
      const res = await repository.resendInvitationApi(invitationId);
      if (res.success) {
        showToast(res.message || 'تمت إعادة إرسال الدعوة وتمديد صلاحيتها بنجاح ✅', 'success');
        await loadInvitations();
      } else {
        showToast(res.message || 'تعذر إعادة إرسال الدعوة', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء إعادة إرسال الدعوة', 'error');
    } finally {
      setResendingId(null);
    }
  };

  if (!isOpen) return null;

  const statusTabs = [
    { id: 'all', label: 'جميع الدعوات' },
    { id: 'pending', label: 'معلقة' },
    { id: 'accepted', label: 'مقبولة' },
    { id: 'expired', label: 'منتهية الصلاحية' },
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'mosque_manager':
        return { label: 'مدير مسجد', icon: Building2 };
      case 'teacher':
        return { label: 'معلم قرآن', icon: GraduationCap };
      case 'halaqa_supervisor':
        return { label: 'مشرف حلقة', icon: Shield };
      case 'student':
      default:
        return { label: 'طالب بالحلقة', icon: Users };
    }
  };

  const getStatusBadge = (status?: string, label?: string) => {
    switch (status) {
      case 'accepted':
        return { label: label || 'مقبولة', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 };
      case 'expired':
        return { label: label || 'منتهية الصلاحية', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: AlertCircle };
      case 'pending':
      default:
        return { label: label || 'معلقة', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 font-['Cairo']">
      <div className="bg-card border border-border w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">سجل دعوات الانضمام للمسجد</h2>
              <p className="text-xs text-muted-foreground">عرض واستعراض جميع الدعوات المرسلة وإعادة تفعيلها عبر API السيرفر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Refresh Header */}
        <div className="p-4 border-b border-border/60 bg-card flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadInvitations}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 border border-border/60 rounded-2xl bg-muted/20 animate-pulse flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-44 rounded-lg bg-muted" />
                    <div className="h-3 w-28 rounded-lg bg-muted opacity-60" />
                  </div>
                  <div className="h-8 w-24 rounded-xl bg-muted" />
                </div>
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-3">
              <Mail className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p className="font-bold text-sm text-foreground">لا توجد دعوات في السجل بهذه الحالة الحالية.</p>
              <p className="text-xs">يمكنك تغيير حالة الفلتر أعلاه لاستعراض الدعوات الأخرى.</p>
            </div>
          ) : (
            invitations.map((inv) => {
              const roleInfo = getRoleBadge(inv.role);
              const statusInfo = getStatusBadge(inv.status, inv.status_label);
              const RoleIcon = roleInfo.icon;
              const StatusIcon = statusInfo.icon;
              const isResending = resendingId === inv.id;
              const canResend = inv.status === 'pending' || inv.status === 'expired' || !inv.status;

              return (
                <div
                  key={inv.id}
                  className="p-4 border border-border/80 rounded-2xl bg-card hover:bg-muted/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {inv.email?.charAt(0).toUpperCase() || 'M'}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground font-mono">{inv.email || `دعوة رقم #${inv.id}`}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                          <RoleIcon className="w-3 h-3" />
                          <span>{roleInfo.label}</span>
                        </span>
                        {inv.created_at && (
                          <span className="text-[10px] text-muted-foreground">
                            تاريخ الإرسال: {inv.created_at.split('T')[0] || inv.created_at.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${statusInfo.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusInfo.label}</span>
                    </span>

                    {canResend && (
                      <button
                        onClick={() => handleResend(inv.id)}
                        disabled={isResending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                        title="إعادة إرسال الدعوة وتمديد صلاحيتها (POST /api/invitations/{id}/resend)"
                      >
                        <Send className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                        <span>{isResending ? 'جاري الإرسال...' : 'إعادة إرسال'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
