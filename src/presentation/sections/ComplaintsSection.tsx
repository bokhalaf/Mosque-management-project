import React, { useState } from 'react';
import { 
  MessageSquareWarning, CheckCircle2, Clock, AlertTriangle,
  Search, Filter, Calendar, ChevronDown, Eye, UserPlus, Archive, CheckCircle,
  Plus, Download, User, ArrowLeft, MoreHorizontal, MessageCircle, Activity,
  Briefcase, Info
} from 'lucide-react';
import { PageHeader } from "../../app/components/PageHeader";

// --- Interfaces ---
type ComplaintStatus = 'new' | 'review' | 'resolved' | 'closed';
type PriorityLevel = 'high' | 'medium' | 'low';

interface Complaint {
  id: string;
  senderName: string;
  senderType: string;
  subject: string;
  priority: PriorityLevel;
  status: ComplaintStatus;
  date: string;
  assignedTo?: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  type: 'submitted' | 'assigned' | 'resolved' | 'updated';
}

// --- Mock Data ---
const MOCK_COMPLAINTS: Complaint[] = [
  { id: 'CMP-1042', senderName: 'أحمد محمود', senderType: 'مصلي', subject: 'عطل في مكبر الصوت الداخلي', priority: 'high', status: 'new', date: 'منذ ساعتين' },
  { id: 'CMP-1041', senderName: 'فاطمة علي', senderType: 'مصلى النساء', subject: 'نقص في مصاحف قسم النساء', priority: 'medium', status: 'review', date: 'أمس', assignedTo: 'إدارة المشتريات' },
  { id: 'CMP-1040', senderName: 'يوسف خليل', senderType: 'إمام مسجد', subject: 'تسريب مياه في دورات المياه', priority: 'high', status: 'resolved', date: 'منذ يومين', assignedTo: 'فريق الصيانة' },
  { id: 'CMP-1039', senderName: 'عمر زيدان', senderType: 'متطوع', subject: 'اقتراح تنظيم حركة الدخول وقت الجمعة', priority: 'low', status: 'closed', date: 'الخميس الماضي' },
  { id: 'CMP-1038', senderName: 'خالد عبدالله', senderType: 'مصلي', subject: 'عطل في التكييف المركزي', priority: 'high', status: 'review', date: 'منذ ٣ أيام', assignedTo: 'مؤسسة التكييف' },
];

const MOCK_TIMELINE: TimelineEvent[] = [
  { id: 't1', title: 'تم إسناد الشكوى CMP-1041 إلى إدارة المشتريات', time: 'منذ ساعة', type: 'assigned' },
  { id: 't2', title: 'تم حل مشكلة تسريب المياه (CMP-1040)', time: 'منذ ٤ ساعات', type: 'resolved' },
  { id: 't3', title: 'شكوى جديدة مسجلة برقم CMP-1042', time: 'أمس ١٤:٣٠', type: 'submitted' },
  { id: 't4', title: 'تحديث حالة الشكوى CMP-1038 إلى "قيد المراجعة"', time: 'أمس ٠٩:١٥', type: 'updated' },
];

// --- Helpers ---
const getPriorityStyles = (priority: PriorityLevel) => {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  }
};

const getStatusStyles = (status: ComplaintStatus) => {
  switch (status) {
    case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'review': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'closed': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

const getStatusLabel = (status: ComplaintStatus) => {
  switch (status) {
    case 'new': return 'جديدة';
    case 'review': return 'قيد المراجعة';
    case 'resolved': return 'تم الحل';
    case 'closed': return 'مغلقة';
  }
};

// --- Sub Components ---
const StatCard = ({ title, value, icon: Icon, trendColor, colorStyle }: any) => (
  <div className="bg-card border border-border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-xl border ${colorStyle}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-black text-foreground mb-1">{value}</h3>
      <p className="text-sm font-bold text-muted-foreground">{title}</p>
    </div>
  </div>
);

export function ComplaintsSection({ onViewComplaintDetails }: { onViewComplaintDetails?: (id: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="الشكاوى والاقتراحات"
        description="إدارة ومتابعة شکاوى المصلين والمرافق لضمان تقديم أفضل تجربة للمسجد."
        breadcrumbs={[
          { label: "الإدارة التشغيلية" },
          { label: "الشكاوى والاقتراحات", active: true }
        ]}
      />

      <div className="px-4 md:px-8 pt-4 space-y-8">
        {/* SECTION 1: KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard 
            title="إجمالي الشكاوى" 
            value="١٤٢" 
            icon={MessageSquareWarning} 
            colorStyle="bg-primary/10 text-primary border-primary/20"
          />
          <StatCard 
            title="شكاوى مفتوحة" 
            value="١٢" 
            icon={AlertTriangle} 
            colorStyle="bg-amber-500/10 text-amber-500 border-amber-500/20"
          />
          <StatCard 
            title="شكاوى عاجلة" 
            value="٣" 
            icon={Activity} 
            colorStyle="bg-red-500/10 text-red-500 border-red-500/20"
          />
          <StatCard 
            title="تم الحل (الشهر)" 
            value="٨٥" 
            icon={CheckCircle2} 
            colorStyle="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          />
          <StatCard 
            title="متوسط الاستجابة" 
            value="٤ ساعات" 
            icon={Clock} 
            colorStyle="bg-blue-500/10 text-blue-500 border-blue-500/20"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Column (Filters + Table) */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* SECTION 2: Filters */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="ابحث برقم الشكوى أو اسم المرسل..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-sm outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <button className="flex shrink-0 items-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all border border-border">
                  <Filter className="w-4 h-4" /> الحالة
                </button>
                <button className="flex shrink-0 items-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all border border-border">
                  <AlertTriangle className="w-4 h-4" /> الأولوية
                </button>
                <button className="flex shrink-0 items-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all border border-border">
                  <Calendar className="w-4 h-4" /> التاريخ
                </button>
              </div>
            </div>

            {/* SECTION 3: Table */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">رقم الشكوى</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">المرسل</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الموضوع</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الأولوية</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الحالة</th>

                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_COMPLAINTS.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-black text-foreground">{complaint.id}</span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5">{complaint.date}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                              {complaint.senderName[0]}
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-foreground">{complaint.senderName}</span>
                              <span className="block text-[10px] text-muted-foreground">{complaint.senderType}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-foreground line-clamp-1 max-w-[200px]" title={complaint.subject}>
                            {complaint.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getPriorityStyles(complaint.priority)}`}>
                            {complaint.priority === 'high' ? 'عالية' : complaint.priority === 'medium' ? 'متوسطة' : 'عادية'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyles(complaint.status)}`}>
                            {getStatusLabel(complaint.status)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => onViewComplaintDetails && onViewComplaintDetails(complaint.id)}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all" 
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                              <button className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="إسناد">
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}
                            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all" title="أرشفة">
                              <Archive className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">عرض ١ إلى ٥ من أصل ١٤٢ شكوى</span>
                <div className="flex gap-1">
                  <button className="px-3 py-1 bg-card border border-border text-muted-foreground rounded-lg text-xs font-bold hover:bg-muted transition-all">السابق</button>
                  <button className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-md shadow-primary/20">١</button>
                  <button className="px-3 py-1 bg-card border border-border text-muted-foreground rounded-lg text-xs font-bold hover:bg-muted transition-all">٢</button>
                  <button className="px-3 py-1 bg-card border border-border text-muted-foreground rounded-lg text-xs font-bold hover:bg-muted transition-all">التالي</button>
                </div>
              </div>
            </div>
          </div>

          {/* Side Column (Quick Actions + Timeline) */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* SECTION 5: Quick Actions */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">إجراءات سريعة</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span>تسجيل شكوى جديدة</span>
                  </div>
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                </button>
                
                <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted border border-border text-foreground font-bold hover:bg-muted/80 transition-all active:scale-95">
                  <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-primary" />
                  </div>
                  <span>إسناد الشكاوى المفتوحة (٣)</span>
                </button>

                <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted border border-border text-foreground font-bold hover:bg-muted/80 transition-all active:scale-95">
                  <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
                    <Download className="w-4 h-4 text-primary" />
                  </div>
                  <span>تصدير تقرير الشكاوى</span>
                </button>
              </div>
            </div>

            {/* SECTION 4: Activity Timeline */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">أحدث النشاطات</h3>
                <button className="text-xs font-bold text-primary hover:underline">عرض الكل</button>
              </div>
              
              <div className="space-y-6">
                {MOCK_TIMELINE.map((event, idx) => (
                  <div key={event.id} className="flex gap-4 relative">
                    {/* Line connector */}
                    {idx !== MOCK_TIMELINE.length - 1 && (
                      <div className="absolute right-4 top-10 bottom-[-20px] w-px bg-border"></div>
                    )}
                    
                    {/* Icon */}
                    <div className="relative z-10 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-card ${
                        event.type === 'submitted' ? 'bg-blue-500 text-white' :
                        event.type === 'resolved' ? 'bg-emerald-500 text-white' :
                        event.type === 'assigned' ? 'bg-amber-500 text-white' :
                        'bg-primary text-white'
                      }`}>
                        {event.type === 'submitted' && <MessageCircle className="w-4 h-4" />}
                        {event.type === 'resolved' && <CheckCircle className="w-4 h-4" />}
                        {event.type === 'assigned' && <User className="w-4 h-4" />}
                        {event.type === 'updated' && <Info className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="pt-1.5 pb-2">
                      <p className="text-sm font-bold text-foreground leading-snug">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
