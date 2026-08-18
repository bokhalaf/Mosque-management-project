'use client';

import React from 'react';
import {
  Calendar, Users, Clock, HeartHandshake, CheckCircle2,
  XCircle, ArrowLeft, PlusCircle, Edit
} from 'lucide-react';
import { VolunteerOpportunity } from '../../../../domain/entities/Volunteer';

interface OpportunityCardProps {
  opportunity: VolunteerOpportunity;
  onCloseOpportunity: (id: number | string) => void;
  onNavigateToApplications?: (oppId: number | string) => void;
  onNavigateToDetails?: (oppId: number | string) => void;
  onOpenEdit?: (opportunity: VolunteerOpportunity) => void;
}

export function OpportunityCard({
  opportunity,
  onCloseOpportunity,
  onNavigateToApplications,
  onNavigateToDetails,
  onOpenEdit,
}: OpportunityCardProps) {
  const isOpen = opportunity.status === 'open';

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group font-['Cairo']">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
              isOpen
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {isOpen ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <span>{isOpen ? 'متاحة للتقديم' : 'مغلقة'}</span>
          </span>

          <span className="text-[11px] text-muted-foreground font-mono">
            {opportunity.created_at?.split('T')[0] || ''}
          </span>
        </div>

        <h3
          onClick={() => onNavigateToDetails?.(opportunity.id)}
          className="text-base font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
        >
          {opportunity.title}
        </h3>

        {opportunity.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3.5 leading-relaxed">
            {opportunity.description}
          </p>
        )}

        <div className="bg-muted/40 rounded-xl p-3 mb-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>العدد المطلوب:</span>
            </span>
            <span className="font-bold text-foreground font-mono">
              {opportunity.required_volunteers} متطوع
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>الفترة الزمنية:</span>
            </span>
            <span className="font-medium text-foreground text-[11px] font-mono">
              {opportunity.start_date} إلى {opportunity.end_date || 'مفتوح'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 pt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => onNavigateToDetails ? onNavigateToDetails(opportunity.id) : onNavigateToApplications?.(opportunity.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-muted/80 hover:bg-muted text-foreground border border-border rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <span>إدارة وتفاصيل الفرصة</span>
          <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {onOpenEdit && (
          <button
            onClick={() => onOpenEdit(opportunity)}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all border border-transparent hover:border-border"
            title="تعديل الفرصة والمهام"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}

        {isOpen && (
          <button
            onClick={() => onCloseOpportunity(opportunity.id)}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 rounded-xl transition-all flex items-center justify-center"
            title="إغلاق استقبال الطلبات"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
