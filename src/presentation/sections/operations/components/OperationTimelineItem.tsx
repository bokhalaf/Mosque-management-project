'use client';

// ==============================
// Component — OperationTimelineItem
// عنصر بطاقة العملية ضمن سجل العمليات الزمني
// ==============================

import React from 'react';
import {
  Activity, MessageSquareWarning, Wrench, DollarSign,
  BookOpen, Building2, Clock, User, ArrowLeft, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MosqueOperation, MosqueOperationModule } from '../../../../domain/entities/MosqueOperation';

interface OperationTimelineItemProps {
  operation: MosqueOperation;
}

export function OperationTimelineItem({ operation }: OperationTimelineItemProps) {
  const getModuleConfig = (mod: MosqueOperationModule) => {
    switch (mod) {
      case 'donations':
        return {
          icon: DollarSign,
          label: 'إدارة التبرعات',
          badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        };
      case 'maintenance':
        return {
          icon: Wrench,
          label: 'إدارة الصيانة',
          badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          iconBg: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        };
      case 'complaints':
        return {
          icon: MessageSquareWarning,
          label: 'الشكاوى والبلاغات',
          badgeBg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
          iconBg: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
        };
      case 'sermons':
        return {
          icon: BookOpen,
          label: 'خطب الجمعة',
          badgeBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          iconBg: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        };
      case 'mosques':
        return {
          icon: Building2,
          label: 'دليل المساجد',
          badgeBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
          iconBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
        };
      default:
        return {
          icon: Activity,
          label: 'عملية عامة',
          badgeBg: 'bg-primary/10 text-primary border-primary/20',
          iconBg: 'bg-primary/10 text-primary border-primary/30',
        };
    }
  };

  const config = getModuleConfig(operation.module);
  const Icon = config.icon;

  // Format date
  let formattedDate = operation.created_at;
  try {
    const d = new Date(operation.created_at);
    if (!isNaN(d.getTime())) {
      formattedDate = new Intl.DateTimeFormat('ar-SA', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    }
  } catch {}

  return (
    <div className="p-5 rounded-3xl bg-card border border-border/80 hover:border-border transition-all duration-300 shadow-2xs hover:shadow-md space-y-3 group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
        
        {/* Module Badge & Action */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${config.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${config.badgeBg}`}>
                {config.label}
              </span>
              {operation.mosque_name && (
                <span className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                  <span>{operation.mosque_name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Operation Content & Title */}
      <div className="space-y-1.5">
        <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
          {operation.title || operation.action}
        </h4>

        {operation.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {operation.description}
          </p>
        )}
      </div>

      {/* Status transition or amount details */}
      {(operation.old_status || operation.new_status || operation.amount) && (
        <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
          {operation.amount !== undefined && (
            <span className="font-black text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
              المبلغ: {operation.amount.toLocaleString('ar-SA')} {operation.currency || 'ل.س'}
            </span>
          )}

          {operation.old_status && operation.new_status && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold bg-muted/50 border border-border/80 px-2.5 py-1 rounded-xl">
              <span className="text-muted-foreground">{operation.old_status}</span>
              <ArrowLeft className="w-3 h-3 text-primary" />
              <span className="text-primary font-black">{operation.new_status}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer / User info */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          <span>منفذ العملية:</span>
          <strong className="text-foreground font-bold">{operation.user_name}</strong>
          {operation.user_role && <span className="text-[10px]">({operation.user_role})</span>}
        </div>

        <span className="text-[10px] text-muted-foreground">
          معرف: #{String(operation.id).slice(-6)}
        </span>
      </div>
    </div>
  );
}
