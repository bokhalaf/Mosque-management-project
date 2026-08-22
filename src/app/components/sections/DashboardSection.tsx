'use client';

// ==============================
// Presentation Section — DashboardSection
// لوحة التحكم الذكية والمخصصة وفق الأدوار (مدير المسجد vs مدير المنطقة)
// تتضمن: مؤشرات الأداء، خطبة الجمعة، مهام المسجد والتقويم، سجل النشاطات (اللوغ)، الشكاوى، والحملات
// ==============================

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '../PageHeader';
import {
  DollarSign, Wrench, MessageSquareWarning, HeartHandshake,
  BookOpen, ArrowUpRight, AlertTriangle, CheckCircle2,
  Clock, Calendar, Users, ChevronLeft, Plus, Eye,
  CalendarCheck, Activity, UserPlus, Sparkles, ShieldCheck,
  Building2, Coins, ArrowRightLeft, TrendingUp, RefreshCw
} from 'lucide-react';
import { useDashboardData, MosqueManagerDashboardData, RegionManagerDashboardData } from '../../../presentation/hooks/useDashboardData';
import { MosqueVolunteerLoader } from '../../../presentation/sections/volunteers/components/MosqueVolunteerLoader';

// ── 1. واجهة مدير المسجد ────────────────────────────────────────────────
function MosqueManagerView({
  data,
  mosqueName,
}: {
  data: MosqueManagerDashboardData;
  mosqueName: string;
}) {
  const [selectedDay, setSelectedDay] = useState<number>(3); // الجمعة افتراضياً

  const daysOfWeek = [
    { day: 'ث', name: 'الثلاثاء', date: '١١' },
    { day: 'أ', name: 'الأربعاء', date: '١٢' },
    { day: 'خ', name: 'الخميس', date: '١٣' },
    { day: 'ج', name: 'الجمعة', date: '١٤' },
    { day: 'س', name: 'السبت', date: '١٥' },
  ];

  return (
    <div className="space-y-8 font-['Cairo']">
      
      {/* 1. KPIs العلوية (بالأخضر الزمردي) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* تبرعات الشهر */}
        <Link
          href="/donations"
          className="bg-card border border-border/80 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {data.monthlyDonationsGrowth > 0 ? `+${data.monthlyDonationsGrowth}%` : `${data.monthlyDonationsGrowth}%`}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">تبرعات هذا الشهر</p>
            <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight">
              {Number(data.monthlyDonations || 0).toLocaleString('ar-SA')} <span className="text-xs font-bold text-muted-foreground">ل.س</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
              <span>إجمالي الحملات النشطة:</span>
              <strong className="text-emerald-600 font-bold">{data.activeCampaignsCount}</strong>
            </p>
          </div>
        </Link>

        {/* طلبات الصيانة المفتوحة */}
        <Link
          href="/maintenance/tasks"
          className="bg-card border border-border/80 hover:border-primary/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            {data.criticalMaintenanceCount > 0 ? (
              <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                {data.criticalMaintenanceCount} حرج
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                مستقر
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">طلبات الصيانة المفتوحة</p>
            <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight">
              {data.openMaintenanceCount} <span className="text-xs font-bold text-muted-foreground">طلبات</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
              <span>قيد العمل والإصلاح:</span>
              <strong className="text-primary font-bold">{data.inProgressMaintenanceCount}</strong>
            </p>
          </div>
        </Link>

        {/* الشكاوى والبلاغات */}
        <Link
          href="/maintenance/complaints"
          className="bg-card border border-border/80 hover:border-rose-500/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            {data.pendingComplaintsCount > 0 ? (
              <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                قيد المتابعة
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                لا توجد شكاوى
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">بلاغات وشكاوى المصلين</p>
            <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight">
              {data.pendingComplaintsCount} <span className="text-xs font-bold text-muted-foreground">بلاغات</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-2 font-medium">
              تحتاج للاستجابة والإغلاق
            </p>
          </div>
        </Link>

        {/* المتطوعون المعتمدون */}
        <Link
          href="/volunteers"
          className="bg-card border border-border/80 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            {data.pendingApplicationsCount > 0 && (
              <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-600 text-white shadow-sm">
                {data.pendingApplicationsCount} طلب جديد
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">المتطوعون المعتمدون</p>
            <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight">
              {data.volunteersCount} <span className="text-xs font-bold text-muted-foreground">متطوع</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
              <span>الفرص التطوعية المتاحة:</span>
              <strong className="text-emerald-600 font-bold">{data.activeOpportunitiesCount}</strong>
            </p>
          </div>
        </Link>

      </div>

      {/* 2. بطاقة خطبة الجمعة القادمة */}
      {data.fridaySermon && (
        <div className="bg-gradient-to-br from-emerald-500/15 via-card to-primary/10 border-2 border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-full shadow-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>خطبة الجمعة القادمة</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{data.fridaySermon.status}</span>
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-foreground leading-snug">
                {data.fridaySermon.title}
              </h2>

              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5 text-foreground font-black">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>الخطيب: {data.fridaySermon.speakerName}</span>
                </span>
                <span>•</span>
                <span>{mosqueName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/sermons"
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>استعراض مكتبة الخطب</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. مهام المسجد والتقويم + سجل النشاطات (اللوغ) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* مهام المسجد والجدول اليومي - 7 Cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
              <span>مهام وجدول المسجد اليومي</span>
            </h3>
            <Link href="/tasks" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              <span>إدارة كافة المهام</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-5">
            {/* Weekly Days Strip */}
            <div className="flex justify-between items-center bg-muted/40 p-1.5 rounded-2xl border border-border/60">
              {daysOfWeek.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-all ${
                    selectedDay === i
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-black scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card'
                  }`}
                >
                  <span className="text-[10px]">{d.day}</span>
                  <span className="text-sm font-black mt-0.5">{d.date}</span>
                </button>
              ))}
            </div>

            {/* Today Tasks List */}
            <div className="space-y-3">
              {(data.todayTasks || []).map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          {t.time}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">{t.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                        {t.title}
                      </h4>
                      {t.assignee && (
                        <p className="text-[11px] text-muted-foreground">
                          المسند إليه: <span className="font-bold text-foreground">{t.assignee}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 border ${
                    t.status === 'in_progress'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {t.status === 'in_progress' ? 'جارية الآن' : 'مجدولة'}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/tasks"
              className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>فتح جدول مهام المسجد الكامل</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* سجل النشاطات المباشر (اللوغ) - 5 Cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>سجل النشاطات والأحداث (اللوغ)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              مباشر
            </span>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="space-y-4">
              {(data.recentActivities || []).map((item) => {
                const isDonation = item.type === 'donation';
                const isMaintenance = item.type === 'maintenance';
                const isQuran = item.type === 'quran';

                return (
                  <div key={item.id} className="flex items-start gap-3 group">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                      isDonation
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : isMaintenance
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : isQuran
                        ? 'bg-emerald-600/10 text-emerald-700 border border-emerald-600/20'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {isDonation ? <DollarSign className="w-4 h-4" /> :
                       isMaintenance ? <Wrench className="w-4 h-4" /> :
                       isQuran ? <BookOpen className="w-4 h-4" /> :
                       <UserPlus className="w-4 h-4" />}
                    </div>

                    <div className="flex flex-col flex-grow">
                      <p className="text-xs font-bold text-foreground leading-relaxed">
                        <span className="text-emerald-700 dark:text-emerald-400">{item.user}</span>{' '}
                        <span className="font-normal text-muted-foreground">{item.action}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600/70" />
                        <span>{item.time}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border/60">
              <Link
                href="/donations"
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center justify-center gap-1 py-1"
              >
                <span>استعراض السجل المالي والتشغيلي بالكامل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* 4. الشكاوى والأعطال + الحملات التكافلية */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* مركز الاستجابة للأعطال والشكاوى - 7 Cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-base font-black text-foreground">مركز معالجة الأعطال والشكاوى</h3>
            </div>
            <Link href="/maintenance/tasks" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              <span>عرض كل البلاغات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-5 md:p-6 shadow-xs space-y-3.5">
            {data.urgentComplaints.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/50" />
                <p className="font-bold text-foreground">المسجد في حالة ممتازة!</p>
                <p>لا توجد أعطال حرجة أو بلاغات قيد الانتظار حالياً.</p>
              </div>
            ) : (
              data.urgentComplaints.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${
                        item.priority === 'urgent'
                          ? 'bg-red-500/10 text-red-600 border-red-500/20'
                          : item.priority === 'high'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      }`}>
                        {item.priority === 'urgent' ? 'عاجل وحرج' : item.priority === 'high' ? 'أولوية مرتفعة' : 'عادي'}
                      </span>
                      <span className="text-[11px] font-bold text-muted-foreground">{item.dept}</span>
                      <span className="text-[10px] text-muted-foreground/80">• {item.createdAt}</span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  <Link
                    href="/maintenance/tasks"
                    className="self-end sm:self-auto px-3.5 py-1.5 bg-card hover:bg-emerald-500/10 hover:text-emerald-600 border border-border rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معالجة</span>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* الحملات التكافلية النشطة - 5 Cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>الحملات التكافلية النشطة للمسجد</span>
            </h3>
            <Link href="/donations/campaigns" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              <span>إدارة الحملات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
            {data.activeCampaigns.map((camp) => (
              <div key={camp.id} className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <h4 className="text-foreground font-black line-clamp-1">{camp.title}</h4>
                  <span className="text-emerald-600 font-black">{camp.percent}%</span>
                </div>

                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                    style={{ width: `${camp.percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-1">
                  <span>المحصل: <strong className="text-foreground">{camp.raisedAmount.toLocaleString('ar-SA')}</strong></span>
                  <span>الهدف: {camp.targetAmount.toLocaleString('ar-SA')} ل.س</span>
                </div>
              </div>
            ))}

            <Link
              href="/donations/add"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل تبرع جديد للمسجد</span>
            </Link>
          </div>
        </div>

      </div>

      {/* 5. روابط الوصول السريع للمسجد */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <Link
          href="/maintenance/tasks/create"
          className="p-4 bg-card border border-border/80 hover:border-emerald-500/40 rounded-2xl flex items-center gap-3 transition-all group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">طلب صيانة جديد</p>
            <p className="text-[10px] text-muted-foreground">تسجيل عطل للمصلى</p>
          </div>
        </Link>

        <Link
          href="/volunteers/opportunities/create"
          className="p-4 bg-card border border-border/80 hover:border-emerald-500/40 rounded-2xl flex items-center gap-3 transition-all group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">إضافة فرصة تطوع</p>
            <p className="text-[10px] text-muted-foreground">استقطاب متطوعين</p>
          </div>
        </Link>

        <Link
          href="/sermons"
          className="p-4 bg-card border border-border/80 hover:border-emerald-500/40 rounded-2xl flex items-center gap-3 transition-all group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">مكتبة الخطب</p>
            <p className="text-[10px] text-muted-foreground">تجهيز خطبة الجمعة</p>
          </div>
        </Link>

        <Link
          href="/dawah"
          className="p-4 bg-card border border-border/80 hover:border-emerald-500/40 rounded-2xl flex items-center gap-3 transition-all group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">البرامج الدعوية</p>
            <p className="text-[10px] text-muted-foreground">دروس وحلقات المسجد</p>
          </div>
        </Link>
      </div>

    </div>
  );
}

// ── 2. واجهة مدير المنطقة / السوبر أدمن ──────────────────────────────────
function RegionManagerView({
  data,
}: {
  data: RegionManagerDashboardData;
}) {
  return (
    <div className="space-y-8 font-['Cairo']">

      {/* 1. KPIs الإقليمية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <Link
          href="/mosques"
          className="bg-card border border-border/80 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              {data.activeMosques} نشط
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">مساجد المنطقة والمحافظة</p>
            <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight">
              {data.totalMosques} <span className="text-xs font-bold text-muted-foreground">مسجداً وجامعاً</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
              <span>تحت الصيانة الشاملة:</span>
              <strong className="text-emerald-600 font-bold">{data.maintenanceMosques} مساجد</strong>
            </p>
          </div>
        </Link>

        <Link
          href="/sermons"
          className="bg-card border border-border/80 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 border border-amber-500/30">
              قرار مطلوب
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">خطب بانتظار الاعتماد المركزي</p>
            <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight">
              {data.pendingSermonsCount} <span className="text-xs font-bold text-muted-foreground">خطب مرفوعة</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-2 font-medium">
              مراجعة خطباء الجمعة القادمة
            </p>
          </div>
        </Link>

        <Link
          href="/donations"
          className="bg-card border border-border/80 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              إقليمي
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">تبرعات مساجد المنطقة (الشهر)</p>
            <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight">
              {(data.regionMonthlyDonations || 0).toLocaleString('ar-SA')} <span className="text-xs font-bold text-muted-foreground">ل.س</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
              <span>الحملات الإقليمية الجارية:</span>
              <strong className="text-emerald-600 font-bold">{data.activeRegionCampaignsCount}</strong>
            </p>
          </div>
        </Link>

        <Link
          href="/maintenance/tasks"
          className="bg-card border border-border/80 hover:border-red-500/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20">
              تدخل إداري
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">بلاغات حرجة ومصعدة</p>
            <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight">
              {data.regionUrgentComplaintsCount} <span className="text-xs font-bold text-muted-foreground">بلاغات</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-2 font-medium">
              تتطلب اعتماد ميزانية أو متابعة
            </p>
          </div>
        </Link>

      </div>

      {/* 2. مركز الاعتمادات المركزية للخطب */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-2 border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <h3 className="text-lg font-black text-foreground">مركز الاعتمادات المركزية: خطب الجمعة المرفوعة</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              مراجعة واعتماد الخطب المرفوعة من خطباء مساجد المنطقة قبل حلول موعد صلاة الجمعة.
            </p>
          </div>

          <Link
            href="/sermons"
            className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>عرض كل الخطب المعلقة ({data.pendingSermonsCount})</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.pendingSermonsList.map((sermon) => (
            <div
              key={sermon.id}
              className="bg-card border border-border/80 hover:border-emerald-500/40 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                    {sermon.date}
                  </span>
                  <span className="text-muted-foreground font-medium">{sermon.mosqueName}</span>
                </div>

                <h4 className="text-sm font-black text-foreground leading-snug line-clamp-2">
                  {sermon.title}
                </h4>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {sermon.contentBrief}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
                  الخطيب: {sermon.speakerName}
                </span>

                <Link
                  href="/sermons"
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>مراجعة وقرار</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. متابعة مساجد المنطقة وسعر الصرف */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* جدول مساجد المنطقة - 8 Cols */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>متابعة وجاهزية مساجد المنطقة ({data.totalMosques})</span>
            </h3>
            <Link href="/mosques" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              <span>عرض دليل المساجد الكامل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-bold">
                    <th className="px-5 py-3.5">اسم المسجد</th>
                    <th className="px-5 py-3.5">المدينة / الحي</th>
                    <th className="px-5 py-3.5">السعة</th>
                    <th className="px-5 py-3.5">مدير المسجد</th>
                    <th className="px-5 py-3.5">الحالة التشغيلية</th>
                    <th className="px-5 py-3.5 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.mosquesList.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-foreground">
                        {m.name}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        <span>{m.city}</span>
                      </td>
                      <td className="px-5 py-4 font-medium text-foreground">
                        {m.capacity ? `${m.capacity.toLocaleString('ar-SA')} مصلٍ` : '—'}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {m.managerName || 'مدير المسجد'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                          m.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {m.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>جاهز ونشط</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              <span>أعمال صيانة</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link
                          href={`/mosques/${m.id}`}
                          className="px-3 py-1 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-bold text-[11px] transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>التفاصيل</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* سعر الصرف والسياسات المالية المركزية - 4 Cols */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              <span>السياسة المالية وسعر الصرف</span>
            </h3>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-emerald-500/5 border border-emerald-500/20 space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>سعر الصرف المركزي المعتمد:</span>
              </span>
              <h4 className="text-2xl font-black text-foreground tracking-tight">
                1 USD = {data.exchangeRate.toLocaleString('ar-SA')} SYP
              </h4>
              <p className="text-[10px] text-muted-foreground">
                يُطبق هذا السعر تلقائياً على كافة التبرعات المحولة بالدولار في جميع مساجد المنطقة.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-black text-foreground">تقارير وإحصائيات إقليمية سريعة:</h5>
              <div className="space-y-2 text-xs">
                <Link
                  href="/donations"
                  className="p-3 bg-muted/40 hover:bg-muted/70 rounded-xl border border-border/60 flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-foreground">كشف تبرعات مساجد المنطقة</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/sermons"
                  className="p-3 bg-muted/40 hover:bg-muted/70 rounded-xl border border-border/60 flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-foreground">أرشيف خطب الجمعة المعتمدة</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/settings"
                  className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-xl border border-emerald-500/20 flex items-center justify-between font-bold transition-all"
                >
                  <span>تعديل سعر الصرف المركزي</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

// ── 3. المكون الرئيسي الموحد للوحة التحكم ────────────────────────────────
export function DashboardSection() {
  const {
    isSuperAdmin,
    mosqueName,
    managerData,
    regionData,
    loading,
    refresh,
  } = useDashboardData();

  const currentDateFormatted = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-full bg-transparent font-['Cairo'] pb-16">
      
      {/* ── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="لوحة التحكم"
        description={
          isSuperAdmin
            ? `لوحة المتابعة الإشرافية والرقابية لكافة مساجد المنطقة • ${currentDateFormatted}`
            : `التقرير التشغيلي المباشر لـ ${mosqueName} • ${currentDateFormatted}`
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={refresh}
              disabled={loading}
              title="تحديث البيانات الحية"
              className="flex items-center gap-2 px-4 py-2.5 bg-card hover:bg-muted border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
              <span>تحديث البيانات</span>
            </button>
          </div>
        }
      />

      {/* ── Main Dashboard Content ────────────────────────────────────── */}
      <div className="px-4 md:px-8 mt-6">
        {loading ? (
          <div className="py-16">
            <MosqueVolunteerLoader text="جاري تحديث واستدعاء مؤشرات لوحة التحكم..." />
          </div>
        ) : isSuperAdmin ? (
          <RegionManagerView data={regionData} />
        ) : (
          <MosqueManagerView data={managerData} mosqueName={mosqueName} />
        )}
      </div>

    </div>
  );
}
