import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  CheckCircle2, Clock, AlertTriangle, Printer,
  Archive, FileText, Send, User, Paperclip, MessageSquare,
  Calendar, AlertCircle, Eye, ChevronDown
} from 'lucide-react';

interface ComplaintDetailsSectionProps {
  complaintId: string;
  onBack: () => void;
}

// --- Mock Data ---
const MOCK_COMPLAINT = {
  id: 'CMP-1041',
  title: 'نقص في مصاحف قسم النساء',
  status: 'review' as const,
  priority: 'medium' as const,
  date: '١٥ مايو ٢٠٢٦ - ١٠:٣٠ صباحاً',
  category: 'احتياجات المصلى',
  description: `السلام عليكم ورحمة الله وبركاته،
نلاحظ مؤخراً نقصاً ملحوظاً في عدد المصاحف المتوفرة في مصلى النساء، خاصة خلال صلوات التراويح ويوم الجمعة. نرجو توفير عدد إضافي من المصاحف بأحجام مختلفة (عادي وكبير) لتلبية احتياجات المصليات وتسهيل تلاوة القرآن الكريم.

جزاكم الله خيراً وجعله في ميزان حسناتكم.`,
  sender: {
    name: 'فاطمة علي',
    type: 'مصلى النساء',
    phone: '٠٥٠١٢٣٤٥٦٧',
  },
  attachments: [
    { name: 'صورة_الأرفف.jpg', size: '1.2 MB' }
  ],
};

const MOCK_TIMELINE = [
  { id: '1', title: 'تم تقديم الشكوى', time: '١٥ مايو، ١٠:٣٠ ص', type: 'submitted' },
  { id: '2', title: 'تم تحديث الحالة إلى "قيد المراجعة"', time: '١٥ مايو، ١١:٤٥ ص', type: 'updated' },
  { id: '3', title: 'تمت إضافة ملاحظة داخلية', time: '١٦ مايو، ٠٩:١٥ ص', type: 'updated' },
];

const MOCK_NOTES = [
  { id: '1', author: 'أحمد الإداري', time: 'أمس، ١٤:٠٠', text: 'تم التواصل مع المورد لطلب ٥٠ مصحف جديد بأحجام مختلفة.' },
  { id: '2', author: 'سارة (قسم النساء)', time: 'اليوم، ٠٨:٣٠', text: 'يرجى التركيز على المصاحف ذات الخط الكبير لكبار السن.' },
];

const RELATED_COMPLAINTS = [
  { id: 'CMP-0920', title: 'عطل في تكييف قسم النساء', status: 'resolved', date: 'منذ شهر' },
  { id: 'CMP-0845', title: 'طلب زيادة عدد الكراسي', status: 'closed', date: 'منذ ٣ أشهر' },
];

// --- Status Type ---
type StatusKey = 'new' | 'review' | 'in_progress' | 'resolved' | 'rejected' | 'closed';

// --- Workflow Pipeline Statuses (main flow) ---
const PIPELINE: { value: StatusKey; label: string; icon: string; color: string; glow: string; ring: string }[] = [
  { value: 'new',         label: 'جديدة',        icon: '✦', color: 'text-blue-500',    glow: 'bg-blue-500',    ring: 'ring-blue-500/40' },
  { value: 'review',      label: 'قيد المراجعة', icon: '◎', color: 'text-amber-500',  glow: 'bg-amber-500',   ring: 'ring-amber-500/40' },
  { value: 'in_progress', label: 'قيد المعالجة', icon: '⟳', color: 'text-violet-500', glow: 'bg-violet-500',  ring: 'ring-violet-500/40' },
  { value: 'resolved',    label: 'مكتملة',       icon: '✓', color: 'text-emerald-500', glow: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
];

const PIPELINE_IDX = (s: StatusKey) => PIPELINE.findIndex(p => p.value === s);

const getStatusBadgeStyles = (status: StatusKey) => {
  switch (status) {
    case 'new':         return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'review':      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'in_progress': return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
    case 'resolved':    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'rejected':    return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'closed':      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

const getStatusLabel = (status: StatusKey) => {
  switch (status) {
    case 'new':         return 'جديدة';
    case 'review':      return 'قيد المراجعة';
    case 'in_progress': return 'قيد المعالجة';
    case 'resolved':    return 'مكتملة';
    case 'rejected':    return 'مرفوضة';
    case 'closed':      return 'مغلقة';
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high': return 'أولوية عالية';
    case 'medium': return 'أولوية متوسطة';
    case 'low': return 'أولوية منخفضة';
    default: return 'غير محدد';
  }
};

export function ComplaintDetailsSection({ complaintId, onBack }: ComplaintDetailsSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [mockStatus, setMockStatus] = useState<StatusKey>(MOCK_COMPLAINT.status as StatusKey);
  const [resolutionNote, setResolutionNote] = useState('');

  const currentStatusConfig = PIPELINE.find(s => s.value === mockStatus);

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title={`الشكوى ${complaintId}`}
        description="عرض تفاصيل الشكوى، السجل الزمني، وتعديل حالتها."
        onBack={onBack}
        breadcrumbs={[
          { label: "الشكاوى والاقتراحات" },
          { label: "تفاصيل الشكوى", active: true }
        ]}
        actions={
          <div className="flex gap-2">
            <button className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:bg-muted transition-all" title="طباعة التذكرة">
              <Printer className="w-5 h-5" />
            </button>
            <button className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:bg-muted transition-all" title="أرشفة">
              <Archive className="w-5 h-5" />
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-6">

          {/* SECTION 1: Complaint Header Info */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">{MOCK_COMPLAINT.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className={`px-3 py-1 rounded-lg font-bold border ${getStatusBadgeStyles(mockStatus)}`}>
                    {getStatusLabel(mockStatus)}
                  </span>
                  <span className={`px-3 py-1 rounded-lg font-bold border ${getPriorityStyles(MOCK_COMPLAINT.priority)}`}>
                    {getPriorityLabel(MOCK_COMPLAINT.priority)}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {MOCK_COMPLAINT.date}
                  </span>
                </div>
              </div>
            </div>

            {/* Info row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {MOCK_COMPLAINT.sender.name[0]}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">المرسل</p>
                  <p className="text-sm font-bold text-foreground">{MOCK_COMPLAINT.sender.name}</p>
                  <p className="text-xs text-muted-foreground">{MOCK_COMPLAINT.sender.phone}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">التصنيف</p>
                  <p className="text-sm font-bold text-foreground">{MOCK_COMPLAINT.category}</p>
                  <p className="text-xs text-muted-foreground">{MOCK_COMPLAINT.sender.type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Complaint Content */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> تفاصيل الشكوى
            </h3>
            <div className="p-6 bg-muted rounded-xl border border-border">
              <p className="text-sm text-foreground leading-loose whitespace-pre-wrap">
                {MOCK_COMPLAINT.description}
              </p>
            </div>

            {MOCK_COMPLAINT.attachments.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">المرفقات</p>
                <div className="flex flex-wrap gap-3">
                  {MOCK_COMPLAINT.attachments.map((file, i) => (
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
          </div>

          {/* SECTION 3: Internal Notes */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> الملاحظات الداخلية
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
                  placeholder="أضف ملاحظة داخلية للقسم (لن يراها المرسل)..."
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

          {/* SECTION: Change Status — Premium Pipeline Widget */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-foreground">حالة الشكوى</h3>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                mockStatus === 'new'         ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                mockStatus === 'review'      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                mockStatus === 'in_progress' ? 'bg-violet-500/10 text-violet-500 border-violet-500/20' :
                mockStatus === 'resolved'    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                mockStatus === 'rejected'    ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                'bg-slate-500/10 text-slate-500 border-slate-500/20'
              }`}>
                {PIPELINE.find(p => p.value === mockStatus)?.label ??
                  (mockStatus === 'rejected' ? 'مرفوضة' : 'مغلقة')}
              </span>
            </div>

            {/* Pipeline Steps */}
            <div className="relative mb-6">
              {/* Connector Line */}
              <div className="absolute top-4 right-4 left-4 h-0.5 bg-border" />
              {/* Progress Fill */}
              <div
                className="absolute top-4 right-4 h-0.5 bg-gradient-to-l from-emerald-500 to-primary transition-all duration-500"
                style={{ width: `${ PIPELINE_IDX(mockStatus) >= 0 ? (PIPELINE_IDX(mockStatus) / (PIPELINE.length - 1)) * 100 : 0 }%` }}
              />
              <div className="relative flex justify-between">
                {PIPELINE.map((step, idx) => {
                  const currentIdx = PIPELINE_IDX(mockStatus);
                  const isDone    = currentIdx > idx;
                  const isActive  = currentIdx === idx;
                  const isFuture  = currentIdx < idx;
                  return (
                    <button
                      key={step.value}
                      onClick={() => setMockStatus(step.value)}
                      className="flex flex-col items-center gap-2 group focus:outline-none"
                    >
                      {/* Circle indicator */}
                      <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? `${step.glow} border-transparent text-white shadow-lg ring-4 ${step.ring} scale-110`
                          : isDone
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-card border-border text-muted-foreground group-hover:border-primary/50'
                      }`}>
                        {isDone ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className={`text-[10px] font-black transition-all ${
                            isActive ? 'text-white' : 'text-muted-foreground'
                          }`}>{idx + 1}</span>
                        )}
                        {/* Active pulse ring */}
                        {isActive && (
                          <span className={`absolute inset-0 rounded-full ${step.glow} opacity-30 animate-ping`} />
                        )}
                      </div>
                      {/* Label */}
                      <span className={`text-[9px] font-bold text-center leading-tight transition-colors max-w-[52px] ${
                        isActive ? step.color : isDone ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution panel - slides in when resolved */}
            {mockStatus === 'resolved' && (
              <div className="mt-2 mb-4 animate-in fade-in slide-in-from-top-3 duration-400 space-y-3">
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-emerald-600">ممتاز! يرجى توثيق الحل المتخذ.</p>
                </div>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  placeholder="صف الإجراء الذي تم اتخاذه لحل هذه المشكلة..."
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm resize-none text-foreground placeholder:text-muted-foreground"
                />
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" /> حفظ وإغلاق الشكوى
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border pt-4 mt-2 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">إجراءات خاصة</p>

              {/* Rejected */}
              <button
                onClick={() => setMockStatus('rejected')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-bold transition-all ${
                  mockStatus === 'rejected'
                    ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20'
                    : 'bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  mockStatus === 'rejected' ? 'bg-white/20' : 'bg-red-500/10'
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span>رفض الشكوى</span>
                {mockStatus === 'rejected' && (
                  <svg className="w-4 h-4 mr-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Closed */}
              <button
                onClick={() => setMockStatus('closed')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-bold transition-all ${
                  mockStatus === 'closed'
                    ? 'bg-slate-500 text-white border-slate-600 shadow-lg shadow-slate-500/20'
                    : 'bg-slate-500/5 border-slate-500/20 text-slate-500 hover:bg-slate-500/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  mockStatus === 'closed' ? 'bg-white/20' : 'bg-slate-500/10'
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span>إغلاق الشكوى</span>
                {mockStatus === 'closed' && (
                  <svg className="w-4 h-4 mr-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* SECTION: Timeline */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6">سجل الإجراءات</h3>
            <div className="space-y-6">
              {MOCK_TIMELINE.map((event, idx) => (
                <div key={event.id} className="flex gap-4 relative">
                  {idx !== MOCK_TIMELINE.length - 1 && (
                    <div className="absolute right-4 top-10 bottom-[-20px] w-px bg-border"></div>
                  )}
                  <div className="relative z-10 shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-card ${
                      event.type === 'submitted' ? 'bg-blue-500 text-white' :
                      event.type === 'assigned' ? 'bg-amber-500 text-white' :
                      'bg-primary text-white'
                    }`}>
                      {event.type === 'submitted' && <FileText className="w-4 h-4" />}
                      {event.type === 'assigned' && <User className="w-4 h-4" />}
                      {event.type === 'updated' && <AlertCircle className="w-4 h-4" />}
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

          {/* SECTION: Related Complaints */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">شكاوى سابقة للمرسل</h3>
            <div className="space-y-3">
              {RELATED_COMPLAINTS.map(rel => (
                <div key={rel.id} className="flex items-center justify-between p-3 bg-muted border border-border rounded-xl group cursor-pointer hover:border-primary/50 transition-all">
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{rel.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{rel.id} • {rel.date}</p>
                  </div>
                  <button className="text-muted-foreground group-hover:text-primary transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
