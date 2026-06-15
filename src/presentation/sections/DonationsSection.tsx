import { 
  Search, Bell, Plus, Download, Filter, Eye, Edit, Printer, 
  TrendingUp, Users, Target, Clock, ArrowUpRight, ArrowDownRight, 
  Wallet, Calendar, CheckCircle2, ChevronRight, MoreVertical
} from "lucide-react";
import { useDonations } from "../hooks/useDonations";

import { PageHeader } from "../../app/components/PageHeader";

interface DonationsSectionProps {
  onAddDonation?: () => void;
  onViewDonationDetails?: (id: string) => void;
}

export function DonationsSection({ onAddDonation, onViewDonationDetails }: DonationsSectionProps) {
  const { donations, stats, loading } = useDonations();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo']">
      <PageHeader 
        title="إدارة التبرعات"
        description="تتبع وتحليل الموارد المالية للمسجد بدقة"
        actions={
          <>
            <button 
              onClick={onAddDonation}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/10 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              إضافة تبرع
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-2xl font-bold hover:bg-muted transition-all active:scale-95">
              <Download className="w-5 h-5" />
              تصدير التقرير
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-8 pb-8">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي التبرعات"
            value={`${stats?.totalDonations?.toLocaleString() || 0} ر.س`}
            trend="+12.5%"
            isPositive={true}
            icon={Wallet}
            color="emerald"
          />
          <StatCard
            title="تبرعات هذا الشهر"
            value={`${stats?.monthlyDonations?.toLocaleString() || 0} ر.س`}
            trend="+8.2%"
            isPositive={true}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="حملات نشطة"
            value={`${stats?.activeCampaigns || 0}`}
            trend="-2"
            isPositive={false}
            icon={Target}
            color="amber"
          />
          <StatCard
            title="إيصالات قيد المعالجة"
            value={`${stats?.pendingReceipts || 0}`}
            trend={`+${stats?.growthPercentage || 0}%`}
            isPositive={true}
            icon={Users}
            color="indigo"
          />
        </section>

        {/* Main Content Area */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">سجل التبرعات الأخير</h3>
                <p className="text-xs text-muted-foreground mt-1">آخر ٥٠ عملية تبرع تم تسجيلها</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="بحث عن متبرع، مبلغ، أو تاريخ..." 
                    className="pr-11 pl-4 py-2.5 bg-muted border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full md:w-80 text-right text-foreground placeholder:text-muted-foreground"
                    dir="rtl"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors text-sm font-bold">
                  <Filter className="w-4 h-4" />
                  تصفية
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-8 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">المتبرع</th>
                    <th className="px-8 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">الحملة / النوع</th>
                    <th className="px-8 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">المبلغ</th>
                    <th className="px-8 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">التاريخ</th>
                    <th className="px-8 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">الحالة</th>
                    <th className="px-8 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
                            {donation.donorName?.[0] || '-'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{donation.donorName}</span>
                            <span className="text-[10px] text-muted-foreground">رقم الإيصال: #REC-{donation.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{donation.type}</span>
                          {donation.campaign && (
                            <span className="text-[10px] text-primary font-bold">{donation.campaign}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-sm font-black text-primary">
                          {donation.amount?.toLocaleString()} ر.س
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground font-medium">{donation.date}</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${
                          donation.status === 'مكتمل' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          donation.status === 'فشل' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        } border rounded-lg text-[10px] font-bold`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            donation.status === 'مكتمل' ? 'bg-emerald-500' :
                            donation.status === 'فشل' ? 'bg-red-500' :
                            'bg-amber-500'
                          }`}></span>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onViewDonationDetails?.(donation.id)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all" 
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all" title="تعديل"><Edit className="w-4 h-4" /></button>
                          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all" title="طباعة"><Printer className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, isPositive, icon: Icon, color }: any) {
  // Using dynamic CSS variables for standard text colors, but allowing subtle tinted backgrounds based on primary or muted
  const colorStyles: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  };

  return (
    <div className="bg-card border border-border p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorStyles[color] || colorStyles.emerald} transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg border ${isPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}
