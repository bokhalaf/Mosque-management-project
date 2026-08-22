// ==============================
// Campaigns — CampaignDetailsSection Component
// صفحة تفاصيل الحملة بمطابقة 100% لنظام تصميم تفاصيل التبرع وتفاصيل مهام الصيانة
// ==============================

import React from 'react';
import { 
  Users, Clock, CheckCircle2, Target, Wallet, Calendar, Share2, 
  AlertCircle, Edit3, Trash2, Terminal, RefreshCw, Building2, ChevronRight, Tag
} from "lucide-react";
import { PageHeader } from "../../app/components/PageHeader";
import { useCampaignDetails } from "../hooks/useCampaignDetails";
import { EditCampaignModal } from "./campaigns/components/EditCampaignModal";
import { DeleteCampaignModal } from "./campaigns/components/DeleteCampaignModal";
import { CampaignDebugBox } from "./campaigns/components/CampaignDebugBox";
import { useToast } from "../../app/components/ui/Toast";

interface CampaignDetailsSectionProps {
  campaignId: string | number;
  onBack: () => void;
}

export function CampaignDetailsSection({ campaignId, onBack }: CampaignDetailsSectionProps) {
  const { showToast } = useToast();
  const {
    campaign,
    loading,
    error,
    refresh,
    isEditing,
    setIsEditing,
    isDeleting,
    setIsDeleting,
    handleUpdate,
    handleDelete,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
  } = useCampaignDetails(campaignId);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("تم نسخ رابط الحملة إلى الحافظة بنجاح", "success");
    }
  };

  const onConfirmDeleteAndBack = async (_id: string | number) => {
    await handleDelete();
    onBack();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`تفاصيل الحملة`} onBack={onBack} />
        <div className="px-4 md:px-8 py-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6 animate-pulse">
              <div className="h-6 w-32 bg-muted rounded-full" />
              <div className="h-10 w-64 bg-muted rounded-xl" />
              <div className="h-32 bg-muted/60 rounded-2xl" />
            </div>
          </div>
          <div className="xl:col-span-1">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-4 animate-pulse">
              <div className="h-48 bg-muted/60 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`تفاصيل الحملة`} onBack={onBack} />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
          <AlertCircle className="w-14 h-14 text-red-500" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">تعذر العثور على الحملة</h3>
            <p className="text-xs text-muted-foreground max-w-sm">{error || 'لم يتم العثور على بيانات الحملة المطلوبة بالسيرفر.'}</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
            <span>العودة لقائمة الحملات</span>
          </button>
        </div>
      </div>
    );
  }

  const target = Number(campaign.target_amount || campaign.targetAmount || 0);
  const raised = Number(campaign.collected_amount || campaign.raisedAmount || 0);
  const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
  const daysRemaining = campaign.remaining_days ?? campaign.days_remaining;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'مكتملة وناجحة',
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
          label: 'نشطة وتستقبل الدعم',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          icon: CheckCircle2,
        };
    }
  };

  const statusBadge = getStatusBadge(campaign.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      {/* Page Header */}
      <PageHeader
        title={campaign.title}
        description="عرض تفصيلي شامل للحملة الخيرية ومؤشرات الإنجاز المالي والزمني."
        onBack={onBack}
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'إدارة التبرعات' },
          { label: 'حملات التبرع', active: false },
          { label: campaign.title, active: true },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 text-emerald-400 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
              title="مراقب السيرفر"
            >
              <Terminal className="w-4 h-4" />
              <span>{showDebugTerminal ? 'إخفاء رد السيرفر' : 'طباعة رد السيرفر'}</span>
            </button>

            <button
              onClick={refresh}
              className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-sm"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4 text-primary" />
              <span>تحديث</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
              <span>مشاركة</span>
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="p-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl transition-all shadow-sm flex items-center justify-center"
              title="تعديل الحملة"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDeleting(true)}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all shadow-sm flex items-center justify-center"
              title="حذف الحملة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-8">
        {/* Live API Debug Terminal */}
        {showDebugTerminal && (
          <CampaignDebugBox
            debugLogs={debugLogs}
            onClear={clearDebugLogs}
            onClose={() => setShowDebugTerminal(false)}
          />
        )}

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main Column (xl:col-span-2) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Main Overview Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              {/* Badges Bar (Removed Campaign ID and Medium Priority as requested) */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusBadge.className}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusBadge.label}
                </span>

                {campaign.priority === 'high' && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500 text-white shadow-sm">
                    عاجلة
                  </span>
                )}
              </div>

              {/* Title & Mosque Headline */}
              <div className="space-y-1.5">
                <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug">{campaign.title}</h2>
                {campaign.mosque?.name && (
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{campaign.mosque.name} - {campaign.mosque.city || 'الرياض'}</span>
                  </p>
                )}
              </div>

              {/* Financial Progress Banner (Compacted font sizes) */}
              <div className="bg-muted/40 p-5 rounded-xl border border-border space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground">المبلغ المحقق</p>
                      <p className="text-sm md:text-base font-black text-foreground">{raised.toLocaleString('ar-EG')} ل.س</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground">الهدف المالي</p>
                      <p className="text-sm md:text-base font-black text-foreground">{target.toLocaleString('ar-EG')} ل.س</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground">الوقت المتبقي</p>
                      <p className="text-sm md:text-base font-black text-foreground">
                        {campaign.remaining_days !== null && campaign.remaining_days !== undefined
                          ? `${campaign.remaining_days} يوم`
                          : (campaign.timeLeft || 'مستمرة')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground">نسبة الإنجاز</p>
                      <p className="text-sm md:text-base font-black text-emerald-600">{percent}%</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
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
                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                    <span>تم جمع {percent}% من المبلغ المستهدف</span>
                    <span>المتبقي {Math.max(0, target - raised).toLocaleString('ar-EG')} ل.س</span>
                  </div>
                </div>
              </div>

              {/* Meta Grid (Compacted font sizes) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
                <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground mb-0.5">تاريخ البدء</p>
                  <p className="text-xs font-bold text-foreground">
                    {campaign.start_date ? campaign.start_date.split('T')[0] : 'غير محدد'}
                  </p>
                </div>

                <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground mb-0.5">تاريخ الانتهاء</p>
                  <p className="text-xs font-bold text-foreground">
                    {campaign.end_date ? campaign.end_date.split('T')[0] : 'مستمرة / مفتوحة'}
                  </p>
                </div>

                <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground mb-0.5">الأيام المتبقية</p>
                  <p className="text-xs font-bold text-foreground">
                    {daysRemaining !== null && daysRemaining !== undefined
                      ? `${daysRemaining} يوم`
                      : (campaign.timeLeft || 'غير محدد')}
                  </p>
                </div>

                <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground mb-0.5">عدد المتبرعين</p>
                  <p className="text-xs font-bold text-foreground">
                    {campaign.donors_count || campaign.donorsCount || 0} متبرع
                  </p>
                </div>
              </div>
            </div>

            {/* Description Card (Refined & compacted text) */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-foreground flex items-center gap-2 uppercase tracking-wide">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                تفاصيل ووصف الحملة
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {campaign.description || 'لا يوجد وصف مفصل متاح لهذه الحملة حالياً. الحملة مخصصة لدعم ومساندة احتياجات المسجد ورواده ومصارف الخير.'}
              </p>
            </div>
          </div>

          {/* Sidebar Column (xl:col-span-1) — Clean Cover Image only (No bottom buttons as requested) */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-foreground">غلاف الحملة</h4>
              <div className="h-56 w-full rounded-xl overflow-hidden bg-muted/40 border border-border relative">
                {campaign.cover_image || campaign.image ? (
                  <img
                    src={campaign.cover_image || campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <Building2 className="w-10 h-10 text-primary/40 mb-2" />
                    <span className="text-xs font-bold text-muted-foreground">{campaign.mosque?.name || 'جامع الراجحي الكبير'}</span>
                  </div>
                )}
                {campaign.mosque?.name && (
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10">
                    <Building2 className="w-3 h-3 text-emerald-400" />
                    <span>{campaign.mosque.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Summary & Trust Box */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>الشفافية والتكافل</span>
              </h4>
              <ul className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>جميع التبرعات موثقة بأرقام إيصالات رسمية من السيرفر.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>يتم تحويل المبالغ مباشرة لحساب المسجد المعتمد.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>إمكانية التعديل والإيقاف المؤقت متاحة للمشرفين في أي وقت.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        campaign={campaign}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onUpdate={async (_id, payload) => await handleUpdate(payload)}
      />

      {/* Delete Campaign Modal */}
      <DeleteCampaignModal
        campaign={campaign}
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirmDelete={onConfirmDeleteAndBack}
      />
    </div>
  );
}
