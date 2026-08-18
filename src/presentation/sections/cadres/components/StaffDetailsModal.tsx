'use client';

import React from 'react';
import { X, User, Mail, Phone, Calendar, Shield, GraduationCap, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { QuranPerson } from '../../../../domain/entities/QuranPeople';

interface StaffDetailsModalProps {
  person: QuranPerson | null;
  onClose: () => void;
}

export function StaffDetailsModal({ person, onClose }: StaffDetailsModalProps) {
  if (!person) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'teacher':
        return { label: 'معلم ومقرئ قرآن', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: GraduationCap };
      case 'halaqa_supervisor':
        return { label: 'مشرف حلقة', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: Shield };
      case 'student':
      default:
        return { label: 'طالب بالحلقة', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: User };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'نشط ومسجل', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 };
      case 'pending_invitation':
        return { label: 'دعوة معلقة', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock };
      case 'inactive':
      default:
        return { label: 'غير نشط', color: 'bg-muted text-muted-foreground border-border', icon: AlertCircle };
    }
  };

  const roleInfo = getRoleBadge(person.role);
  const statusInfo = getStatusBadge(person.status);
  const RoleIcon = roleInfo.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-['Cairo'] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">بيانات الكادر / الطالب</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border/80 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
              {person.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{person.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${roleInfo.color}`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span>{roleInfo.label}</span>
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${statusInfo.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{statusInfo.label}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-muted/20 border border-border/60 rounded-xl space-y-1">
              <span className="text-muted-foreground block text-[11px]">البريد الإلكتروني</span>
              <span className="font-bold font-mono text-foreground">{person.email || 'غير محدد'}</span>
            </div>

            <div className="p-3.5 bg-muted/20 border border-border/60 rounded-xl space-y-1">
              <span className="text-muted-foreground block text-[11px]">رقم الجوال</span>
              <span className="font-bold font-mono text-foreground">{person.phone || 'غير محدد'}</span>
            </div>

            <div className="p-3.5 bg-muted/20 border border-border/60 rounded-xl space-y-1">
              <span className="text-muted-foreground block text-[11px]">الحلقة المرتبطة</span>
              <span className="font-bold text-foreground">{person.circle_name || 'حلقة عامة'}</span>
            </div>

            <div className="p-3.5 bg-muted/20 border border-border/60 rounded-xl space-y-1">
              <span className="text-muted-foreground block text-[11px]">تاريخ الانضمام / التسجيل</span>
              <span className="font-bold font-mono text-foreground">{person.joined_date || 'غير محدد'}</span>
            </div>
          </div>

          {person.notes && (
            <div className="p-3.5 bg-muted/20 border border-border/60 rounded-xl text-xs space-y-1">
              <span className="text-muted-foreground block text-[11px] font-bold">ملاحظات:</span>
              <p className="text-foreground leading-relaxed">{person.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
