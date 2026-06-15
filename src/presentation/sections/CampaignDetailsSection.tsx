import React, { useEffect, useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import { useCampaigns } from "../hooks/useCampaigns";
import { Campaign } from "../../domain/entities/Donation";
import { 
  Users, Clock, CheckCircle, Target, Wallet, Calendar, Share2, AlertCircle, Edit2 
} from "lucide-react";

interface CampaignDetailsSectionProps {
  campaignId: string;
  onBack: () => void;
}

export function CampaignDetailsSection({ campaignId, onBack }: CampaignDetailsSectionProps) {
  const { getCampaignById } = useCampaigns();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaign() {
      try {
        setLoading(true);
        const data = await getCampaignById(campaignId);
        setCampaign(data);
      } catch (error) {
        console.error("Failed to fetch campaign details", error);
      } finally {
        setLoading(false);
      }
    }
    loadCampaign();
  }, [campaignId, getCampaignById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-foreground">الحملة غير موجودة</h2>
        <button onClick={onBack} className="mt-4 text-primary hover:underline font-bold">العودة للحملات</button>
      </div>
    );
  }

  const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="تفاصيل الحملة"
        description="عرض تفصيلي للحملة الخيرية وتقارير الإنجاز الخاصة بها."
        onBack={onBack}
        breadcrumbs={[
          { label: "إدارة التبرعات" },
          { label: "حملات التبرع", active: false },
          { label: campaign.title, active: true }
        ]}
        actions={
          <>
            <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-2xl font-bold hover:bg-muted transition-all active:scale-95">
              <Share2 className="w-5 h-5" />
              مشاركة
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 active:scale-95">
              <Edit2 className="w-5 h-5" />
              تعديل الحملة
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-8">
        {/* Main Details Card */}
        <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
          <div className="h-64 md:h-96 relative bg-muted">
            {campaign.image ? (
              <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">
                لا توجد صورة مخصصة
              </div>
            )}
            <div className="absolute top-6 right-6">
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-md ${
                campaign.status === 'urgent' ? 'bg-red-500/90 text-white' : 
                campaign.status === 'completed' ? 'bg-slate-500/90 text-white' : 
                'bg-emerald-500/90 text-white'
              }`}>
                {campaign.status === 'urgent' ? 'عاجلة' : campaign.status === 'completed' ? 'مكتملة' : 'نشطة'}
              </span>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h1 className="text-3xl font-black text-foreground mb-4">{campaign.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-4xl">
              {campaign.description || 'لا يوجد وصف متوفر لهذه الحملة.'}
            </p>

            {/* Financial Progress */}
            <div className="bg-muted/30 p-8 rounded-3xl border border-border mb-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">المبلغ المحقق</p>
                    <p className="text-3xl font-black text-foreground">{campaign.raisedAmount.toLocaleString()} ر.س</p>
                  </div>
                </div>
                <div className="hidden md:block w-px h-16 bg-border"></div>
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-card border border-border rounded-2xl text-muted-foreground">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">الهدف المالي</p>
                    <p className="text-3xl font-black text-foreground">{campaign.targetAmount.toLocaleString()} ر.س</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="w-full bg-muted h-4 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      campaign.status === 'urgent' ? 'bg-amber-500' : 'bg-primary'
                    }`} 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-primary">{Math.round(progress)}% مكتمل</span>
                  <span className="text-muted-foreground">المتبقي: {(campaign.targetAmount - campaign.raisedAmount).toLocaleString()} ر.س</span>
                </div>
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-1">عدد المتبرعين</p>
                  <p className="text-xl font-black text-foreground">{campaign.donorsCount}</p>
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  {campaign.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-1">{campaign.status === 'completed' ? 'تاريخ الاكتمال' : 'الوقت المتبقي'}</p>
                  <p className="text-xl font-black text-foreground">{campaign.status === 'completed' ? (campaign.completedDate || '-') : (campaign.timeLeft || 'غير محدد')}</p>
                </div>
              </div>
              
              <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-1">حالة الحملة</p>
                  <p className="text-xl font-black text-foreground">
                    {campaign.status === 'urgent' ? 'عاجلة' : campaign.status === 'completed' ? 'مكتملة' : 'نشطة'}
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
