// ==============================
// Campaigns — CampaignCard Component
// كارد الحملة الفاخر مع تباينات الأخضر المطلوبة (نشطة: أخضر فاتح/أبيض، مكتملة: أخضر غامق كامل)
// ==============================

import React from 'react';
import { Eye, Edit3, Trash2, Users, Clock, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Campaign } from '../../../../domain/entities/Donation';

interface CampaignCardProps {
  campaign: Campaign;
  onViewDetails: (id: string) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  isSuperAdmin?: boolean;
}

export function CampaignCard({
  campaign,
  onViewDetails,
  onEdit,
  onDelete,
  isSuperAdmin = false,
}: CampaignCardProps) {
  const target = Number(campaign.target_amount || campaign.targetAmount || 0);
  const raised = Number(campaign.collected_amount || campaign.raisedAmount || 0);
  const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
  const daysRemaining = campaign.remaining_days ?? campaign.days_remaining;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'مكتملة',
          // أخضر كامل غامق بتباين واضح
          className: 'bg-emerald-600 text-white border-emerald-700 shadow-sm',
          icon: CheckCircle2,
        };
      case 'paused':
        return {
          label: 'متوقفة مؤقتاً',
          className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          icon: AlertCircle,
        };
      case 'cancelled':
        return {
          label: 'ملغاة',
          className: 'bg-red-500/10 text-red-600 border-red-500/20',
          icon: AlertCircle,
        };
      default:
        return {
          label: 'نشطة',
          // أخضر أبيض فاتح وناصع
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 shadow-xs',
          icon: CheckCircle2,
        };
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return { label: 'عاجلة', className: 'bg-rose-500 text-white' };
      case 'low':
        return { label: 'عادية', className: 'bg-slate-700 text-slate-200' };
      default:
        return { label: 'متوسطة', className: 'bg-primary/90 text-primary-foreground' };
    }
  };

  const statusBadge = getStatusBadge(campaign.status);
  const priorityBadge = getPriorityBadge(campaign.priority);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col group relative">
      {/* Cover Image / Header Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-muted/40 shrink-0">
        {campaign.cover_image || campaign.image ? (
          <img
            src={campaign.cover_image || campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500/10 via-card to-emerald-500/5 p-4 text-center">
            <Building2 className="w-12 h-12 text-primary/40 mb-2" />
            <span className="text-xs font-bold text-muted-foreground">{campaign.mosque?.name || 'جامع الراجحي الكبير'}</span>
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md shadow-sm ${statusBadge.className}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusBadge.label}
          </span>
          {campaign.priority === 'high' && (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black shadow-md ${priorityBadge.className}`}>
              {priorityBadge.label}
            </span>
          )}
        </div>

        {/* Mosque Name Pill */}
        {campaign.mosque?.name && (
          <div className="absolute bottom-3 right-3 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5 border border-white/10">
            <Building2 className="w-3 h-3 text-emerald-400" />
            <span>{campaign.mosque.name}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Title & Description */}
        <div className="space-y-1.5">
          <h4
            onClick={() => onViewDetails(String(campaign.id))}
            className="font-bold text-base text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1"
          >
            {campaign.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {campaign.description || 'حملة خيرية تكافلية تهدف لدعم ومساندة احتياجات المسجد ورواده.'}
          </p>
        </div>

        {/* Financial Progress Section */}
        <div className="bg-muted/40 p-3.5 rounded-xl border border-border/50 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">
              تم جمع: <span className="text-foreground font-black">{raised.toLocaleString('ar-EG')} ل.س</span>
            </span>
            <span className="text-emerald-600 font-black">{percent}%</span>
          </div>

          {/* Progress Bar with Green Contrast (No Purple) */}
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                percent >= 100
                  ? 'bg-emerald-600'
                  : percent >= 50
                  ? 'bg-emerald-500'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>الهدف: {target.toLocaleString('ar-EG')} ل.س</span>
            <span>المتبقي: {Math.max(0, target - raised).toLocaleString('ar-EG')} ل.س</span>
          </div>
        </div>

        {/* Stats Row (Donors & Remaining Days) */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>المتبرعون: <strong className="text-foreground">{campaign.donors_count || campaign.donorsCount || 0}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {daysRemaining !== null && daysRemaining !== undefined
                ? `${daysRemaining} يوم متبقي`
                : (campaign.timeLeft || 'غير محدد')}
            </span>
          </div>
        </div>

        {/* Actions Bar matching Design System */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={() => onViewDetails(String(campaign.id))}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>عرض التفاصيل</span>
          </button>

          {!isSuperAdmin && (
            <>
              <button
                onClick={() => onEdit(campaign)}
                className="p-2 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all border border-border"
                title="تعديل الحملة"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(campaign)}
                className="p-2 bg-muted hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl transition-all border border-border"
                title="حذف الحملة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
