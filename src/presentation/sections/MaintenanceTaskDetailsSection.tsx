import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import { 
  CheckCircle2, Clock, AlertTriangle, Printer, Archive, 
  MapPin, User, Phone, Activity, DollarSign, Package, 
  MessageSquare, Send, Paperclip, Wrench, Settings,
  Calendar, FileText, ChevronUp, CheckCircle, Info, PhoneCall, Plus
} from 'lucide-react';

interface MaintenanceTaskDetailsProps {
  taskId: string;
  onBack: () => void;
}

// --- Mock Data ---
const MOCK_TASK = {
  id: 'MNT-204',
  title: 'إصلاح تسريب مياه في دورات المياه',
  status: 'in_progress' as const, // 'pending' | 'approved' | 'in_progress' | 'completed' | 'delayed'
  priority: 'critical' as const, // 'critical' | 'high' | 'medium' | 'low'
  date: '١٦ مايو ٢٠٢٦ - ٠٨:١٥ صباحاً',
  location: 'دورات المياه - القسم الغربي (رجال)',
  severity: 'عالي (يؤثر على المرافق الأساسية)',
  description: `تم الإبلاغ عن تسريب مياه مستمر من أحد الأنابيب الرئيسية المغذية للمغاسل في دورات مياه الرجال بالقسم الغربي. التسريب أدى إلى تجمع المياه في الأرضية مما قد يتسبب في انزلاق المصلين وتلف البلاط. 
يرجى سرعة المعالجة وإيقاف التسريب وتغيير الأجزاء التالفة.`,
  attachments: [
    { name: 'صورة_التسريب١.jpg', size: '2.4 MB' },
    { name: 'صورة_التسريب٢.jpg', size: '1.8 MB' }
  ],
  technician: {
    name: 'محمد عبدالسلام',
    specialty: 'فني سباكة أول',
    phone: '٠٥٠١٢٣٤٥٦٧',
    availability: 'متاح',
    workload: '٣ مهام حالية'
  },
  costAndMaterials: {
    estimatedCost: '٣٥٠ ر.س',
    budgetStatus: 'ضمن الميزانية',
    materials: [
      { name: 'محبس مياه بوصة', quantity: 2, cost: '٨٠ ر.س' },
      { name: 'شريط تيفلون', quantity: 1, cost: '٥ ر.س' },
      { name: 'أنبوب بلاستيكي', quantity: 1, cost: '٤٥ ر.س' }
    ]
  }
};

const MOCK_TIMELINE = [
  { id: '1', title: 'تم تقديم طلب الصيانة', time: '١٦ مايو، ٠٨:١٥ ص', type: 'submitted' },
  { id: '2', title: 'تم اعتماد الطلب وتحديد الأولوية (حرجة)', time: '١٦ مايو، ٠٨:٣٠ ص', type: 'approved' },
  { id: '3', title: 'تم إسناد المهمة إلى الفني (محمد عبدالسلام)', time: '١٦ مايو، ٠٨:٤٥ ص', type: 'assigned' },
  { id: '4', title: 'تم البدء في العمل وفحص المشكلة', time: '١٦ مايو، ٠٩:٣٠ ص', type: 'in_progress' },
];

const MOCK_NOTES = [
  { id: '1', author: 'محمد عبدالسلام (الفني)', time: 'اليوم، ٠٩:٤٥', text: 'المشكلة في المحبس الرئيسي للمغاسل. سيتم استبداله بالكامل. تم صرف المواد من المستودع.' },
  { id: '2', author: 'إدارة الصيانة', time: 'اليوم، ٠٩:٥٠', text: 'يرجى التأكد من تنشيف الأرضية بالكامل بعد الانتهاء لتجنب انزلاق المصلين.' },
];

const RELATED_REQUESTS = [
  { id: 'MNT-185', title: 'انسداد في المصرف الرئيسي', status: 'completed', date: 'منذ شهرين' },
  { id: 'MNT-142', title: 'تغيير صنابير المياه التالفة', status: 'completed', date: 'منذ ٤ أشهر' },
];

// --- Helpers ---
const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20 font-black';
    case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'low': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    case 'approved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'delayed': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'قيد الانتظار';
    case 'approved': return 'معتمدة';
    case 'in_progress': return 'جاري العمل';
    case 'completed': return 'مكتملة';
    case 'delayed': return 'متأخرة';
    default: return 'غير معروف';
  }
};

export function MaintenanceTaskDetailsSection({ taskId, onBack }: MaintenanceTaskDetailsProps) {
  const [newNote, setNewNote] = useState('');

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title={`مهمة الصيانة ${taskId}`}
        description="إدارة وتتبع دورة حياة طلب الصيانة والمواد المستخدمة."
        onBack={onBack}
        breadcrumbs={[
          { label: "العمليات التشغيلية" },
          { label: "مهام الصيانة" },
          { label: "تفاصيل المهمة", active: true }
        ]}
        actions={
          <div className="flex gap-2">
            <button className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:bg-muted transition-all" title="طباعة التقرير">
              <Printer className="w-5 h-5" />
            </button>
            <button className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:bg-muted transition-all" title="أرشفة">
              <Archive className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
              إنهاء المهمة
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Content Area (Left/Center in LTR, Right/Center in RTL) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* SECTION 1: Header Info */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">{MOCK_TASK.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className={`px-3 py-1 rounded-lg font-bold border ${getStatusStyles(MOCK_TASK.status)}`}>
                    {getStatusLabel(MOCK_TASK.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-lg font-bold border ${getPriorityStyles(MOCK_TASK.priority)}`}>
                    {MOCK_TASK.priority === 'critical' ? 'أولوية حرجة' : MOCK_TASK.priority === 'high' ? 'أولوية عالية' : 'أولوية'}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {MOCK_TASK.date}
                  </span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">موقع المشكلة</p>
                  <p className="text-sm font-bold text-foreground">{MOCK_TASK.location}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-wider mb-0.5">درجة الخطورة</p>
                  <p className="text-sm font-bold text-red-500">{MOCK_TASK.severity}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Issue Description */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> التفاصيل الفنية للمشكلة
            </h3>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <p className="text-sm text-foreground leading-loose whitespace-pre-wrap">
                {MOCK_TASK.description}
              </p>
            </div>
            
            {MOCK_TASK.attachments.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">الصور المرفقة</p>
                <div className="flex flex-wrap gap-3">
                  {MOCK_TASK.attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg group cursor-pointer hover:border-primary/50 transition-all">
                      <div className="p-2 bg-card rounded-md border border-border group-hover:text-primary transition-colors">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>          {/* SECTION 4: Technician Information */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> الفني المعيّن
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-black">
                {MOCK_TASK.technician.name[0]}
              </div>
              <div>
                <p className="font-bold text-foreground">{MOCK_TASK.technician.name}</p>
                <p className="text-xs text-muted-foreground">{MOCK_TASK.technician.specialty}</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-2"><PhoneCall className="w-4 h-4" /> الهاتف</span>
                <span className="text-sm font-bold text-foreground" dir="ltr">{MOCK_TASK.technician.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> الحالة</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{MOCK_TASK.technician.availability}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-2"><Wrench className="w-4 h-4" /> ضغط العمل</span>
                <span className="text-sm font-bold text-amber-500">{MOCK_TASK.technician.workload}</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Cost & Budget (Ministry-assigned, read-only) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> الميزانية والمواد
              </h3>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg text-[10px] font-bold">
                {MOCK_TASK.costAndMaterials.budgetStatus}
              </span>
            </div>

            <div className="bg-muted border border-border rounded-xl p-4 mb-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-bold">التكلفة التقديرية</span>
              <span className="text-xl font-black text-primary">{MOCK_TASK.costAndMaterials.estimatedCost}</span>
            </div>

            <div className="space-y-2">
              {MOCK_TASK.costAndMaterials.materials.map((mat, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs font-bold text-foreground">{mat.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>×{mat.quantity}</span>
                    <span className="font-bold text-foreground">{mat.cost}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">الميزانية مخصصة من الوزارة — للاستفسار يرجى التواصل مع إدارة الشؤون الدينية.</p>
            </div>
          </div>

          {/* SECTION 6: Internal Notes */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> السجل الفني والملاحظات
            </h3>
            
            <div className="space-y-6 mb-6">
              {MOCK_NOTES.map(note => (
                <div key={note.id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20">
                    {note.author[0]}
                  </div>
                  <div className="flex-1 bg-muted p-4 rounded-xl rounded-tr-none border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold text-foreground">{note.author}</p>
                      <p className="text-[10px] text-muted-foreground">{note.time}</p>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{note.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea 
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="أضف تحديثاً تقنياً أو ملاحظة..."
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0 h-11 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          
        </div>

        {/* Side Column */}
        <div className="xl:col-span-4 space-y-6">
          


          {/* SECTION 3: Timeline */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6">التسلسل الزمني للعملية</h3>
            <div className="space-y-6">
              {MOCK_TIMELINE.map((event, idx) => (
                <div key={event.id} className="flex gap-4 relative">
                  {idx !== MOCK_TIMELINE.length - 1 && (
                    <div className="absolute right-4 top-10 bottom-[-20px] w-px bg-border"></div>
                  )}
                  <div className="relative z-10 shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-card ${
                      event.type === 'submitted' ? 'bg-blue-500 text-white' :
                      event.type === 'approved' ? 'bg-indigo-500 text-white' :
                      event.type === 'assigned' ? 'bg-amber-500 text-white' :
                      'bg-primary text-white'
                    }`}>
                      {event.type === 'submitted' && <FileText className="w-4 h-4" />}
                      {event.type === 'approved' && <CheckCircle className="w-4 h-4" />}
                      {event.type === 'assigned' && <User className="w-4 h-4" />}
                      {event.type === 'in_progress' && <Activity className="w-4 h-4" />}
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

          {/* SECTION 7: Related Requests */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">صيانة سابقة بالموقع</h3>
            <div className="space-y-3">
              {RELATED_REQUESTS.map(rel => (
                <div key={rel.id} className="flex flex-col p-3 bg-muted border border-border rounded-xl group cursor-pointer hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{rel.title}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-muted-foreground">{rel.id} • {rel.date}</span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 rounded border border-emerald-500/20">منجزة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
