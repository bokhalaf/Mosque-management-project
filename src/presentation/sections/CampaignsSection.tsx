import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Wallet, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  MoreVertical, 
  Clock, 
  Users, 
  ChevronLeft,
  Settings,
  Bell,
  User,
  ExternalLink,
  Edit2
} from 'lucide-react';

import { PageHeader } from "../../app/components/PageHeader";
import { useCampaigns } from "../hooks/useCampaigns";
import { Campaign } from "../../domain/entities/Donation";

const StatCard = ({ icon: Icon, title, value, subtext, trend, progress }: any) => (
  <div className="bg-card p-5 rounded-2xl shadow-sm border border-border flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <div className="p-3 bg-primary/10 rounded-xl text-primary">
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${trend > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-foreground">{value}</h3>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  </div>
);

const CampaignCard = ({ campaign, isExpanded, onToggle }: { campaign: Campaign, isExpanded: boolean, onToggle: () => void }) => {
  const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);
  
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={onToggle}>
        <img src={campaign.image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400'} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
            campaign.status === 'urgent' ? 'bg-red-500 text-white' : 
            campaign.status === 'completed' ? 'bg-slate-500 text-white' : 
            'bg-emerald-500 text-white'
          }`}>
            {campaign.status === 'urgent' ? 'عاجلة' : campaign.status === 'completed' ? 'مكتملة' : 'نشطة'}
          </span>
        </div>
      </div>
      <div className="p-5 text-right flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-bold text-foreground cursor-pointer" onClick={onToggle}>{campaign.title}</h4>
          <div className="flex items-center gap-1">
            <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg hover:text-primary transition-colors" title="تعديل الحملة">
              <Edit2 size={16} />
            </button>
            <button className="text-muted-foreground hover:text-primary transition-colors p-2" onClick={onToggle}>
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 justify-start" dir="rtl">
          {campaign.status === 'completed' ? (
            <div className="flex items-center gap-1">
              <CheckCircle size={14} className="text-primary" />
              <span>اكتملت في {campaign.completedDate || '-'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-primary" />
              <span>متبقي {campaign.timeLeft || 'غير محدد'}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 cursor-pointer" onClick={onToggle}>
          <div className="flex justify-between text-sm flex-row-reverse">
            <span className="text-muted-foreground">تم جمع: <span className="font-bold text-foreground">{campaign.raisedAmount.toLocaleString()} ر.س</span></span>
            <span className="text-muted-foreground">الهدف: {campaign.targetAmount.toLocaleString()} ر.س</span>
          </div>
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                campaign.status === 'urgent' ? 'bg-amber-500' : 
                campaign.status === 'completed' ? 'bg-emerald-500' : 
                'bg-emerald-500'
              }`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="flex justify-between items-center pt-2 flex-row-reverse">
            <span className="text-xs font-bold text-primary">{Math.round(progress)}% مكتمل</span>
            <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'} <ChevronLeft size={14} className={isExpanded ? "-rotate-90 transition-transform" : "transition-transform"} />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-6 pt-4 border-t border-border animate-in fade-in slide-in-from-top-4 duration-300">
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {campaign.description || 'لا يوجد وصف متاح لهذه الحملة.'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-3 rounded-xl border border-border/50 text-center flex flex-col items-center justify-center">
                <Users size={18} className="text-primary mb-1" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">المتبرعون</p>
                <p className="text-lg font-black text-foreground">{campaign.donorsCount || 0}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-xl border border-border/50 text-center flex flex-col items-center justify-center">
                <Clock size={18} className="text-primary mb-1" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">الأيام المتبقية</p>
                <p className="text-lg font-black text-foreground">{campaign.timeLeft || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CampaignsSectionProps {
  onCreateCampaign?: () => void;
}

export function CampaignsSection({ onCreateCampaign }: CampaignsSectionProps) {
  const { campaigns, campaignStats, loading } = useCampaigns();
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'urgent'>('all');

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filter === 'all' ? true : c.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [campaigns, searchQuery, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="إدارة حملات التبرع"
        description="متابعة وإدارة الحملات الخيرية للمسجد وقياس مدى الإنجاز."
        breadcrumbs={[
          { label: "إدارة التبرعات" },
          { label: "حملات التبرع", active: true }
        ]}
        actions={
          <>
            <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-2xl font-bold hover:bg-muted transition-all active:scale-95">
              <Download className="w-5 h-5" />
              تصدير التقرير
            </button>
            <button 
              onClick={onCreateCampaign}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              إنشاء حملة جديدة
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 pt-0 space-y-8">

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={Wallet} 
          title="إجمالي التبرعات" 
          value={`${campaignStats?.totalRaised?.toLocaleString() || 0} ر.س`} 
          subtext="" 
          trend={15} 
        />
        <StatCard 
          icon={Zap} 
          title="الحملات النشطة" 
          value={`${campaignStats?.activeCampaigns || 0}`} 
          subtext="تحتاج دعم مستمر" 
        />
        <StatCard 
          icon={CheckCircle} 
          title="الحملات المكتملة" 
          value={`${(campaignStats?.totalCampaigns || 0) - (campaignStats?.activeCampaigns || 0)}`} 
          subtext="في العام الحالي" 
        />
        <StatCard 
          icon={TrendingUp} 
          title="نسبة الإنجاز الكلية" 
          value={`${campaignStats?.targetAmount ? Math.round(((campaignStats.totalRaised || 0) / campaignStats.targetAmount) * 100) : 0}%`} 
          progress={campaignStats?.targetAmount ? Math.round(((campaignStats.totalRaised || 0) / campaignStats.targetAmount) * 100) : 0} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Campaigns Grid */}
        <div className="lg:col-span-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
              قائمة الحملات
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="ابحث عن حملة بالاسم أو الوصف..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-11 pl-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none text-right text-foreground placeholder:text-muted-foreground shadow-sm"
                  dir="rtl"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'all' ? 'bg-primary/10 text-primary' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}
                >
                  الكل
                </button>
                <button 
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'active' ? 'bg-primary/10 text-primary' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}
                >
                  النشطة
                </button>
                <button 
                  onClick={() => setFilter('urgent')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'urgent' ? 'bg-primary/10 text-primary' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}
                >
                  العاجلة
                </button>
              </div>
            </div>
          </div>
          
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-bold text-foreground">لا توجد حملات تطابق بحثك</p>
              <p className="text-sm text-muted-foreground">حاول استخدام كلمات بحث مختلفة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
              {filteredCampaigns.map(campaign => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  isExpanded={expandedCampaignId === campaign.id}
                  onToggle={() => setExpandedCampaignId(expandedCampaignId === campaign.id ? null : campaign.id)}
                />
              ))}
              {/* Empty state or Add New Card placeholder */}
              <div 
                onClick={onCreateCampaign}
                className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer group bg-card hover:bg-muted/30 min-h-[300px]"
              >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Plus size={32} />
                </div>
                <p className="font-bold">أضف حملة جديدة</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
