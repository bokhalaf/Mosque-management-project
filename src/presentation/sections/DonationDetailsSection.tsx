import React from 'react';
import { 
  ArrowRight, Download, Printer, Share2, 
  Wallet, User, Calendar, Tag, ShieldCheck,
  CheckCircle2, Clock, MapPin, Phone, Mail,
  ChevronLeft, ExternalLink, FileText, Receipt,
  MoreVertical, Edit, Trash2
} from "lucide-react";
import { PageHeader } from "../../app/components/PageHeader";

interface DonationDetailsSectionProps {
  donationId: string;
  onBack?: () => void;
}

export function DonationDetailsSection({ donationId, onBack }: DonationDetailsSectionProps) {
  // Mock data for display
  const donation = {
    id: donationId,
    donorName: "أحمد بن عبد الله الرشيدي",
    amount: 2500,
    date: "١٤ مايو ٢٠٢٦",
    time: "٠٤:٣٥ مساءً",
    type: "تبرع نقدي",
    campaign: "بناء وتوسعة المسجد - الدور الثاني",
    status: "مكتمل",
    receiptNumber: "REC-4589201",
    paymentMethod: "بطاقة مدى البنكية",
    transactionId: "TRX-998273645",
    donorPhone: "+٩٦٦ ٥٠ ١٢٣ ٤٥٦٧",
    donorEmail: "ahmed.r@example.com",
    notes: "هذا التبرع صدقة جارية عن والدي رحمه الله، نرجو تخصيصه لأعمال البناء والتشطيب."
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="تفاصيل التبرع"
        description={`عرض وتحميل إيصال التبرع رقم ${donation.receiptNumber}`}
        onBack={onBack}
        breadcrumbs={[
          { label: "إدارة التبرعات" },
          { label: "تفاصيل التبرع", active: true }
        ]}
        actions={
          <>
            <button className="p-3 bg-card border border-border text-muted-foreground hover:text-blue-600 rounded-2xl transition-all shadow-sm active:scale-95">
              <Edit className="w-5 h-5" />
            </button>
            <button className="p-3 bg-card border border-border text-muted-foreground hover:text-red-600 rounded-2xl transition-all shadow-sm active:scale-95">
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-border mx-2" />
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 active:scale-95">
              <Printer className="w-5 h-5" />
              طباعة الإيصال
            </button>
          </>
        }
      />

      <main className="px-4 md:px-8 space-y-8">
        <div className="py-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Donation Summary */}
          <div className="xl:col-span-2 space-y-8">
            {/* Main Info Card */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">قيمة التبرع</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-emerald-900">{donation.amount.toLocaleString()}</span>
                    <span className="text-xl font-bold text-emerald-600/60">ل.س</span>
                  </div>
                  
                  <div className="mt-12 space-y-6">
                    <DetailRow icon={Tag} label="نوع التبرع" value={donation.type} />
                    <DetailRow icon={Receipt} label="رقم الإيصال" value={donation.receiptNumber} />
                    <DetailRow icon={Calendar} label="التاريخ والوقت" value={`${donation.date} - ${donation.time}`} />
                    <DetailRow icon={ShieldCheck} label="حالة العملية" value={donation.status} statusColor="text-emerald-600" />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">الحملة المخصصة</p>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      {donation.campaign}
                    </h4>
                    <button className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-800 hover:underline">
                      عرض صفحة الحملة
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">طريقة الدفع والمعاملة</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                        <Wallet className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{donation.paymentMethod}</p>
                        <p className="text-[10px] font-mono text-slate-400">{donation.transactionId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background design */}
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Donor Info Card */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <User className="w-5 h-5 text-emerald-600" />
                بيانات المتبرع
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="w-20 h-20 bg-emerald-800 text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-900/20 mb-4">
                    {donation.donorName[0]}
                  </div>
                  <h4 className="text-lg font-black text-slate-900 text-center">{donation.donorName}</h4>
                  <p className="text-xs text-slate-400 mt-1">متبرع دائم</p>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <ContactInfo icon={Phone} label="رقم الهاتف" value={donation.donorPhone} />
                  <ContactInfo icon={Mail} label="البريد الإلكتروني" value={donation.donorEmail} />
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">ملاحظات المتبرع</p>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      {donation.notes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Receipt Preview */}
          <div className="space-y-6">
            <div className="sticky top-28">
              <div className="flex items-center justify-between mb-4 px-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  معاينة الإيصال
                </h3>
                <button className="p-2 text-slate-400 hover:text-emerald-800 transition-colors">
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden">
                {/* Receipt Header */}
                <div className="bg-emerald-900 p-8 text-white text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 backdrop-blur-sm">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-black">إيصال تبرع رسمي</h4>
                  <p className="text-emerald-100/60 text-[10px] mt-1">مسجد الفلاح الكبير - المدينة المنورة</p>
                </div>

                {/* Receipt Body */}
                <div className="p-8 space-y-8 relative">
                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <CheckCircle2 className="w-64 h-64 text-emerald-900" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-4">
                      <span className="text-slate-400">رقم الإيصال:</span>
                      <span className="font-bold text-slate-900">{donation.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-4">
                      <span className="text-slate-400">التاريخ:</span>
                      <span className="font-bold text-slate-900">{donation.date}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-4">
                      <span className="text-slate-400">المتبرع:</span>
                      <span className="font-bold text-slate-900">{donation.donorName}</span>
                    </div>
                  </div>

                  <div className="py-6 border-y-2 border-dashed border-slate-100 text-center">
                    <p className="text-xs text-slate-400 mb-2">المبلغ المدفوع</p>
                    <p className="text-3xl font-black text-emerald-900">{Number(donation.amount || 0).toLocaleString('ar-EG')} ل.س</p>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center leading-relaxed px-4">
                    جزاكم الله خيراً على تبرعكم السخي. هذا الإيصال معتمد كإثبات لعملية التبرع لمسجد الفلاح الكبير.
                  </div>

                  <div className="flex justify-center gap-8 pt-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Share2 className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">مشاركة</span>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Printer className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">طباعة</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, statusColor }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 mb-0.5">{label}</p>
        <p className={`text-sm font-bold ${statusColor || 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <Icon className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-bold text-slate-800">{value}</span>
      </div>
    </div>
  );
}
