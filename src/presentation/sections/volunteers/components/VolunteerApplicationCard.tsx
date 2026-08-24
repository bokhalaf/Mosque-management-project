'use client';

import React from 'react';
import {
  User, Phone, Mail, Calendar, Check, X,
  Briefcase, Award, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { VolunteerApplication } from '../../../../domain/entities/Volunteer';

interface VolunteerApplicationCardProps {
  application: VolunteerApplication;
  isSuperAdmin?: boolean;
  onApprove: (id: number | string) => void;
  onReject: (id: number | string) => void;
  onOpenAssignTask: (app: VolunteerApplication) => void;
  onOpenLogHours: (app: VolunteerApplication) => void;
  onIssueCertificate?: (app: VolunteerApplication) => void;
}

export function VolunteerApplicationCard({
  application,
  isSuperAdmin = false,
  onApprove,
  onReject,
  onOpenAssignTask,
  onOpenLogHours,
  onIssueCertificate,
}: VolunteerApplicationCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: 'معتمد ومقبول', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 };
      case 'rejected':
        return { label: 'مرفوض', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: XCircle };
      case 'pending':
      default:
        return { label: 'قيد المراجعة', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock };
    }
  };

  const statusInfo = getStatusBadge(application.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between font-['Cairo']">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${statusInfo.color}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.label}</span>
          </span>

          <span className="text-[11px] text-muted-foreground font-mono">
            {application.applied_at?.split('T')[0] || ''}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
            {application.volunteer_name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground line-clamp-1">
              {application.volunteer_name}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {application.opportunity_title || 'فرصة تطوعية'}
            </p>
          </div>
        </div>

        <div className="bg-muted/40 rounded-xl p-3 mb-3 space-y-1.5 text-xs">
          {application.phone && (
            <div className="flex items-center gap-2 text-muted-foreground font-mono">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{application.phone}</span>
            </div>
          )}
          {application.email && (
            <div className="flex items-center gap-2 text-muted-foreground font-mono truncate">
              <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{application.email}</span>
            </div>
          )}
        </div>

        {/* Task completion indicator */}
        {application.status === 'approved' && (
          <div
            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 mb-3 ${
              application.all_tasks_completed
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            <span className="flex items-center gap-1.5 font-bold">
              {application.all_tasks_completed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>أكمل جميع المهام بنجاح</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>قيد إنجاز المهام</span>
                </>
              )}
            </span>
            {application.all_tasks_completed ? (
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md shrink-0">
                جاهز للساعات
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground font-normal">
                لم تكتمل
              </span>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border/60 pt-3 flex flex-col gap-2">
        {application.status === 'pending' ? (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onApprove(application.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>قبول الطلب</span>
            </button>

            <button
              onClick={() => onReject(application.id)}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 rounded-xl text-xs font-bold transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>رفض</span>
            </button>
          </div>
        ) : application.status === 'approved' ? (
          isSuperAdmin ? (
            <div className="w-full text-center text-xs font-bold text-emerald-600 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/15">
              متطوع معتمد بالمسجد
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAssignTask(application)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  <span>إسناد مهمة</span>
                </button>

                {application.all_tasks_completed && (
                  <button
                    onClick={() => onOpenLogHours(application)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm animate-in fade-in"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>تسجيل الساعات</span>
                  </button>
                )}
              </div>

              {application.all_tasks_completed && onIssueCertificate && (
                <button
                  onClick={() => onIssueCertificate(application)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-all"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>إصدار شهادة تطوع</span>
                </button>
              )}
            </div>
          )
        ) : (
          <div className="w-full text-center text-xs text-muted-foreground py-1">
            الطلب مرفوض
          </div>
        )}
      </div>
    </div>
  );
}
