// ==============================
// Presentation — DonationDetailsSection Component
// صفحة تفاصيل التبرع المربوطة بالسيرفر ومراقب الـ API المحدث
// ==============================

import React, { useState } from 'react';
import { 
  Printer, Wallet, User, Calendar, Tag, ShieldCheck,
  CheckCircle2, Mail, ExternalLink, FileText, Phone,
  Receipt, Download, AlertCircle, RefreshCw, Terminal, Paperclip, HeartHandshake,
  Copy, Check
} from "lucide-react";
import { PageHeader } from "../../app/components/PageHeader";
import { useDonationDetails } from "../hooks/useDonationDetails";

interface DonationDetailsSectionProps {
  donationId: string | number;
  onBack?: () => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'غير محدد';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
};

const formatDonationType = (type?: string) => {
  switch (type) {
    case 'cash':
      return 'تبرع نقدي';
    case 'in_kind':
      return 'تبرع عيني';
    case 'صدقة':
      return 'صدقة جارية';
    case 'زكاة':
      return 'زكاة مال';
    case 'كفارة':
      return 'كفارة';
    default:
      return type || 'تبرع عام';
  }
};

const formatPaymentMethod = (method?: string) => {
  switch (method) {
    case 'cash':
      return 'نقداً عبر إدارة المسجد';
    case 'stripe':
      return 'دفع إلكتروني (بطاقة بنكية / Stripe)';
    default:
      return method || 'نقدي';
  }
};

export function DonationDetailsSection({ donationId, onBack }: DonationDetailsSectionProps) {
  const {
    donation,
    loading,
    error,
    downloadingReceipt,
    handleDownloadReceipt,
    fetchDetails,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
  } = useDonationDetails(donationId);

  const [copiedLogIndex, setCopiedLogIndex] = useState<number | null>(null);

  const copyLog = (log: any, index: number) => {
    navigator.clipboard.writeText(JSON.stringify(log.response, null, 2));
    setCopiedLogIndex(index);
    setTimeout(() => setCopiedLogIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`تفاصيل التبرع #${donationId}`} onBack={onBack} />
        <div className="px-4 md:px-8 py-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6 animate-pulse">
              <div className="h-6 w-32 bg-muted rounded-full" />
              <div className="h-12 w-48 bg-muted rounded-xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                <div className="h-16 bg-muted/60 rounded-xl" />
                <div className="h-16 bg-muted/60 rounded-xl" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-4 animate-pulse">
              <div className="h-6 w-40 bg-muted rounded-md" />
              <div className="h-28 bg-muted/60 rounded-2xl" />
            </div>
          </div>
          <div className="xl:col-span-1">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-4 animate-pulse">
              <div className="h-48 bg-muted/60 rounded-2xl" />
              <div className="h-10 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title={`تفاصيل التبرع #${donationId}`} onBack={onBack} />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className="text-lg font-bold text-foreground">{error || 'التبرع غير موجود'}</h3>
          <button
            onClick={fetchDetails}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // Donor Data Logic:
  const hasUser = Boolean(donation.user && typeof donation.user === 'object');
  const hasDonorName = Boolean(donation.donor_name && donation.donor_name.trim() && donation.donor_name !== 'فاعل خير' && donation.donor_name !== 'null');
  const hasDonorData = hasUser || hasDonorName;

  const donorDisplayName = donation.user?.name || donation.donor_name || 'فاعل خير';
  const donorDisplayPhone = donation.user?.phone || donation.donorPhone || (hasDonorData ? 'غير متوفر' : 'فاعل خير');
  const donorDisplayEmail = donation.user?.email || donation.donorEmail || (hasDonorData ? 'غير متوفر' : 'فاعل خير');

  const isCompleted = donation.status === 'completed' || donation.status === 'مكتمل';
  const isInKind = donation.donation_type === 'in_kind' || donation.donation_type === 'عيني' || Boolean(donation.item_description);

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="تفاصيل التبرع"
        description={`عرض وتحميل إيصال التبرع رقم ${donation.reference}`}
        onBack={onBack}
        breadcrumbs={[
          { label: "إدارة التبرعات" },
          { label: "تفاصيل التبرع", active: true }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="معاينة سجل استجابة الـ API المباشرة"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{showDebugTerminal ? 'إخفاء مراقب السيرفر' : 'مراقب السيرفر (API)'}</span>
            </button>

            <button
              onClick={handleDownloadReceipt}
              disabled={downloadingReceipt}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              title="تحميل ملف الإيصال الرسمي (PDF)"
            >
              {downloadingReceipt ? (
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Download className="w-4 h-4 text-primary" />
              )}
              <span>تحميل الإيصال (PDF)</span>
            </button>

            <button
              onClick={handleDownloadReceipt}
              disabled={downloadingReceipt}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              title="طباعة إيصال التبرع"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الإيصال</span>
            </button>
          </div>
        }
      />

      <main className="px-4 md:px-8 space-y-6">

        {/* Live Debug Inspector Box (مراقب السيرفر المحدث) */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-white text-sm">مراقب الـ API المباشر لتفاصيل التبرع (Donation API Inspector)</h3>
                  <p className="text-[11px] text-slate-400 font-sans">معاينة تفاصيل الطلبات والردود من السيرفر بصيغة JSON المباشرة</p>
                </div>
              </div>
              <button
                onClick={clearDebugLogs}
                className="text-[10px] text-slate-400 hover:text-white px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all"
              >
                مسح السجل
              </button>
            </div>

            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic">لا توجد طلبات مسجلة حالياً.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto ltr text-left">
                {debugLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        [{log.time}] {log.action}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyLog(log, idx)}
                          className="flex items-center gap-1 text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 transition-all"
                        >
                          {copiedLogIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedLogIndex === idx ? 'تم النسخ' : 'نسخ JSON'}</span>
                        </button>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                          HTTP {log.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono break-all">{log.url}</p>
                    <pre className="text-[10px] bg-slate-950 p-2.5 rounded text-slate-300 overflow-x-auto leading-relaxed border border-slate-900">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Donation Summary & Donor Data */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Main Info Card */}
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    {isInKind ? 'العدد أو الكمية المستلمة' : 'قيمة التبرع المستلم'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black text-primary">
                      {Number(donation.amount || 0).toLocaleString()}
                    </span>
                    {!isInKind && (
                      <span className="text-lg font-bold text-muted-foreground">ل.س</span>
                    )}
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <DetailRow icon={Tag} label="نوع التبرع" value={formatDonationType(donation.donation_type)} />
                    <DetailRow icon={Receipt} label="الرقم المرجعي للإيصال" value={donation.reference} />
                    <DetailRow icon={Calendar} label="تاريخ العملية" value={formatDate(donation.created_at)} />
                    <DetailRow 
                      icon={ShieldCheck} 
                      label="حالة العملية" 
                      value={isCompleted ? 'مكتمل وناجح' : 'قيد المعالجة'} 
                      statusColor={isCompleted ? 'text-emerald-600' : 'text-amber-500'} 
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-muted/40 rounded-2xl border border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      {donation.donation_type === 'in_kind' || donation.donation_type === 'عيني' || donation.item_description
                        ? 'نوع أو وصف التبرع العيني'
                        : 'الحملة / المشروع المخصص'}
                    </p>
                    <h4 className="text-base font-black text-foreground leading-tight">
                      {donation.item_description || donation.campaign_title || (donation.donation_type === 'in_kind' ? 'تبرع عيني' : 'تبرع عام لمسجد الفلاح')}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">طريقة الدفع والمعاملة</p>
                    <div className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-2xl">
                      <div className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-sm">
                        <Wallet className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{formatPaymentMethod(donation.payment_method)}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{donation.reference}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Donor Info Card (الاسم أسفل الأيقونة، وبجانبه رقم المتبرع والبريد) */}
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="text-base font-black text-foreground flex items-center gap-2.5 border-b border-border pb-4">
                <User className="w-5 h-5 text-primary" />
                بيانات المتبرع
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Right Column: Icon & Donor Name underneath */}
                <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border border-border text-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center text-2xl font-black mb-3 shadow-sm">
                    {!hasDonorData ? <HeartHandshake className="w-8 h-8 text-primary" /> : donorDisplayName[0]}
                  </div>
                  {/* Name placed right under the icon */}
                  <h4 className="text-base font-black text-foreground leading-snug">{donorDisplayName}</h4>
                  <span className={`mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    hasDonorData 
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {hasDonorData ? 'متبرع مسجل' : 'فاعل خير'}
                  </span>
                </div>

                {/* Left/Beside Column: Donor Phone and Email */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ContactInfo icon={Phone} label="رقم المتبرع / الهاتف" value={donorDisplayPhone} />
                    <ContactInfo icon={Mail} label="البريد الإلكتروني" value={donorDisplayEmail} />
                  </div>

                  {donation.attachment && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-primary" /> صورة الإيصال أو المرفق
                      </p>
                      <a
                        href={donation.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-xl text-xs font-bold transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>فتح المرفق في نافذة جديدة</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Official Receipt Preview */}
          <div className="space-y-6">
            <div className="sticky top-28 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  معاينة الإيصال الرسمي
                </h3>
              </div>

              <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
                {/* Receipt Header */}
                <div className="bg-primary p-6 text-primary-foreground text-center space-y-2">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20 backdrop-blur-sm">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-base font-black">إيصال تبرع معتمد</h4>
                  <p className="text-primary-foreground/70 text-[10px]">نظام إدارة المساجد والشؤون الدينية</p>
                </div>

                {/* Receipt Body */}
                <div className="p-6 space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs border-b border-border/80 pb-2.5">
                      <span className="text-muted-foreground font-medium">رقم الإيصال:</span>
                      <span className="font-bold text-foreground font-mono">{donation.reference}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-border/80 pb-2.5">
                      <span className="text-muted-foreground font-medium">التاريخ:</span>
                      <span className="font-bold text-foreground">{formatDate(donation.created_at)}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-border/80 pb-2.5">
                      <span className="text-muted-foreground font-medium">اسم المتبرع:</span>
                      <span className="font-bold text-foreground">{donorDisplayName}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-border/80 pb-2.5">
                      <span className="text-muted-foreground font-medium">البريد الإلكتروني:</span>
                      <span className="font-bold text-foreground">{donorDisplayEmail}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-border/80 pb-2.5">
                      <span className="text-muted-foreground font-medium">نوع التبرع:</span>
                      <span className="font-bold text-foreground">{formatDonationType(donation.donation_type)}</span>
                    </div>
                  </div>

                  <div className="py-4 border-y-2 border-dashed border-border text-center bg-muted/20 rounded-xl">
                    <p className="text-[11px] text-muted-foreground mb-1 font-medium">
                      {isInKind ? 'العدد / الكمية المستلمة' : 'المبلغ المستلم'}
                    </p>
                    <p className="text-2xl font-black text-primary">
                      {Number(donation.amount || 0).toLocaleString()}{!isInKind ? ' ل.س' : ''}
                    </p>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    جزاكم الله خيراً وبارك في أموالكم، تقبل الله منا ومنكم صالح الأعمال.
                  </p>

                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={handleDownloadReceipt}
                      disabled={downloadingReceipt}
                      className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل الإيصال (PDF)</span>
                    </button>
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
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center shrink-0 border border-border">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground mb-0.5">{label}</p>
        <p className={`text-xs font-bold ${statusColor || 'text-foreground'}`}>{value}</p>
      </div>
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl border border-border">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs font-bold text-foreground truncate">{value}</span>
      </div>
    </div>
  );
}
