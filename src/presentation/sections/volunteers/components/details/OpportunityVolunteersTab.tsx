'use client';

// ==============================
// UI Component — OpportunityVolunteersTab
// فصل المتطوعين المعتمدين عن طلبات الانضمام المعلقة
// ==============================

import React, { useState } from 'react';
import {
  Users, Check, X, Briefcase, Clock, Award,
  Phone, Mail, CheckCircle2, XCircle
} from 'lucide-react';
import { VolunteerApplication } from '../../../../../domain/entities/Volunteer';

interface OpportunityVolunteersTabProps {
  applications: VolunteerApplication[];
  onApprove: (id: number | string) => void;
  onReject: (id: number | string) => void;
  onOpenAssignTask: (app: VolunteerApplication) => void;
  onOpenLogHours: (app: VolunteerApplication) => void;
  onIssueCertificate: (volunteerId: number | string, volunteerName: string) => void;
}

export function OpportunityVolunteersTab({
  applications,
  onApprove,
  onReject,
  onOpenAssignTask,
  onOpenLogHours,
  onIssueCertificate,
}: OpportunityVolunteersTabProps) {
  const [subTab, setSubTab] = useState<'approved' | 'applications'>('approved');

  const approvedList = applications.filter(a => a.status === 'approved');
  const pendingOrRejectedList = applications.filter(a => a.status !== 'approved');

  const currentList = subTab === 'approved' ? approvedList : pendingOrRejectedList;

  return (
    <div className="space-y-5 font-['Cairo']">
      {/* Sub-tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setSubTab('approved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'approved'
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>المتطوعون المعتمدون ({approvedList.length})</span>
        </button>

        <button
          onClick={() => setSubTab('applications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'applications'
              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>طلبات الانضمام ({pendingOrRejectedList.length})</span>
        </button>
      </div>

      {currentList.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center text-xs text-muted-foreground space-y-2">
          <Users className="w-8 h-8 mx-auto text-muted-foreground/50" />
          <div>
            {subTab === 'approved'
              ? 'لا يوجد متطوعون معتمدون في هذه الفرصة حتى الآن.'
              : 'لا توجد طلبات انضمام قيد المراجعة لهذه الفرصة.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentList.map((app) => {
            const isApproved = app.status === 'approved';
            const isPending = app.status === 'pending';

            return (
              <div
                key={app.id}
                className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      }`}
                    >
                      {isApproved ? <CheckCircle2 className="w-3 h-3" /> : isPending ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{isApproved ? 'معتمد ومقبول' : isPending ? 'قيد المراجعة' : 'مرفوض'}</span>
                    </span>

                    <span className="text-[11px] text-muted-foreground font-mono">
                      {app.applied_at?.split('T')[0] || ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {app.volunteer_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground line-clamp-1">
                        {app.volunteer_name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">متطوع مسجل</p>
                    </div>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-3 space-y-1.5 text-xs">
                    {app.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground font-mono">
                        <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{app.phone}</span>
                      </div>
                    )}
                    {app.email && (
                      <div className="flex items-center gap-2 text-muted-foreground font-mono truncate">
                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{app.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border/60 pt-3">
                  {isPending ? (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => onApprove(app.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>قبول واعتماد</span>
                      </button>

                      <button
                        onClick={() => onReject(app.id)}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 rounded-xl text-xs font-bold transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>رفض</span>
                      </button>
                    </div>
                  ) : isApproved ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenAssignTask(app)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-all"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>إسناد مهمة</span>
                        </button>

                        <button
                          onClick={() => onOpenLogHours(app)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-all"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>تسجيل ساعات</span>
                        </button>
                      </div>

                      <button
                        onClick={() => onIssueCertificate(app.volunteer_id, app.volunteer_name)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-[11px] font-bold transition-all"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>إصدار شهادة تطوع</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
