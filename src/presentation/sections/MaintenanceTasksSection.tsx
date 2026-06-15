import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import { 
  Wrench, CheckCircle2, Clock, AlertTriangle,
  Activity, Plus, Filter, Search, Download, Eye, 
  DollarSign, FileText
} from 'lucide-react';

// --- Interfaces ---
type TaskStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'delayed';
type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

interface MaintenanceTask {
  id: string;
  title: string;
  location: string;
  priority: PriorityLevel;
  status: TaskStatus;
  date: string;
}

// --- Mock Data ---
const MOCK_TASKS: MaintenanceTask[] = [
  { id: 'MNT-204', title: 'إصلاح تسريب مياه في دورات المياه', location: 'دورات المياه - رجال', priority: 'critical', status: 'in_progress', date: 'اليوم ١٠:٠٠ ص' },
  { id: 'MNT-203', title: 'صيانة دورية للمكيفات المركزية', location: 'المصلى الرئيسي', priority: 'medium', status: 'approved', date: 'غداً' },
  { id: 'MNT-202', title: 'استبدال مصابيح الإضاءة التالفة', location: 'المواقف الخارجية', priority: 'low', status: 'pending', date: 'بعد غد' },
  { id: 'MNT-201', title: 'إصلاح عطل في سماعات المحراب', location: 'المحراب', priority: 'high', status: 'completed', date: 'أمس' },
  { id: 'MNT-200', title: 'صيانة أبواب المداخل الرئيسية', location: 'المدخل الشرقي', priority: 'medium', status: 'delayed', date: 'منذ ٣ أيام' },
];

const MOCK_ACTIVITY = [
  { id: '1', title: 'تم الانتهاء من صيانة سماعات المحراب', time: 'أمس، ١٤:٣٠', type: 'completed' },
  { id: '2', title: 'بدء العمل على إصلاح تسريب المياه', time: 'اليوم، ٠٩:١٥', type: 'in_progress' },
  { id: '3', title: 'تأجيل صيانة الأبواب بسبب نقص قطع الغيار', time: 'منذ يومين', type: 'delayed' },
];

// --- Helpers ---
const getPriorityStyles = (priority: PriorityLevel) => {
  switch (priority) {
    case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20 font-black';
    case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'low': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

const getPriorityLabel = (priority: PriorityLevel) => {
  switch (priority) {
    case 'critical': return 'حرجة';
    case 'high': return 'عالية';
    case 'medium': return 'متوسطة';
    case 'low': return 'منخفضة';
  }
};

const getStatusStyles = (status: TaskStatus) => {
  switch (status) {
    case 'pending': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    case 'approved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'delayed': return 'bg-red-500/10 text-red-500 border-red-500/20';
  }
};

const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case 'pending': return 'قيد الانتظار';
    case 'approved': return 'معتمدة';
    case 'in_progress': return 'جاري العمل';
    case 'completed': return 'مكتملة';
    case 'delayed': return 'متأخرة';
  }
};

const StatCard = ({ title, value, icon: Icon, colorStyle }: any) => (
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

export function MaintenanceTasksSection({ 
  onViewTaskDetails, 
  onCreateTask 
}: { 
  onViewTaskDetails?: (id: string) => void,
  onCreateTask?: () => void
}) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="إدارة المهام والصيانة"
        description="تتبع طلبات الصيانة الدورية والطارئة بكفاءة."
        breadcrumbs={[
          { label: "الإدارة التشغيلية" },
          { label: "مهام الصيانة", active: true }
        ]}
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-bold hover:bg-muted transition-all">
              <FileText className="w-4 h-4 text-primary" /> تقارير الصيانة
            </button>
            <button
              onClick={onCreateTask}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> طلب صيانة جديد
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-8">
        
        {/* SECTION 1: Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="طلبات مفتوحة" value="١٤" icon={Wrench} colorStyle="bg-primary/10 text-primary border-primary/20" />
          <StatCard title="جاري العمل" value="٥" icon={Activity} colorStyle="bg-amber-500/10 text-amber-500 border-amber-500/20" />
          <StatCard title="تم إنجازها (الشهر)" value="٤٢" icon={CheckCircle2} colorStyle="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" />
          <StatCard title="أعطال حرجة" value="١" icon={AlertTriangle} colorStyle="bg-red-500/10 text-red-500 border-red-500/20" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Column */}
          <div className="xl:col-span-9 space-y-6">
            
            {/* Search & Filter Bar */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="ابحث عن مهمة صيانة..." 
                  className="w-full pl-4 pr-11 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-sm outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <button className="flex shrink-0 items-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all border border-border">
                  <Filter className="w-4 h-4" /> تصفية
                </button>
                <button className="flex shrink-0 items-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all border border-border">
                  <Download className="w-4 h-4" /> تصدير
                </button>
              </div>
            </div>

            {/* Maintenance Table */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">رقم المهمة</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">التفاصيل والموقع</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الأولوية</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_TASKS.map((task) => (
                      <tr key={task.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-black text-foreground">{task.id}</span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5">{task.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block text-sm font-bold text-foreground mb-1">{task.title}</span>
                          <span className="inline-block text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">{task.location}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getPriorityStyles(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyles(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => onViewTaskDetails && onViewTaskDetails(task.id)}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all" 
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Side Column: Activity Timeline */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">أحدث النشاطات</h3>
              <div className="space-y-6">
                {MOCK_ACTIVITY.map((event, idx) => (
                  <div key={event.id} className="flex gap-4 relative">
                    {idx !== MOCK_ACTIVITY.length - 1 && (
                      <div className="absolute right-4 top-10 bottom-[-20px] w-px bg-border"></div>
                    )}
                    <div className="relative z-10 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-card ${
                        event.type === 'completed' ? 'bg-emerald-500 text-white' :
                        event.type === 'in_progress' ? 'bg-amber-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {event.type === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                        {event.type === 'in_progress' && <Activity className="w-4 h-4" />}
                        {event.type === 'delayed' && <Clock className="w-4 h-4" />}
                      </div>
                    </div>
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
