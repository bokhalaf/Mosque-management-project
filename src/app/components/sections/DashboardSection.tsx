import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, DollarSign, Users,
  ShoppingCart, TrendingUp, Bell, Search, ChevronDown,
  ChevronLeft, Plus, Download, Filter, Home,
  MoreHorizontal, Settings, Eye, Zap, UserPlus,
  Wrench, MessageSquare, BookOpen, GraduationCap,
  CalendarCheck, Activity, Clock
} from "lucide-react";

const attendanceData = [
  { day: "الأحد", attendance: 92 },
  { day: "الاثنين", attendance: 88 },
  { day: "الثلاثاء", attendance: 95 },
  { day: "الأربعاء", attendance: 90 },
  { day: "الخميس", attendance: 85 },
  { day: "الجمعة", attendance: 98 },
  { day: "السبت", attendance: 94 },
];

const donationData = [
  { month: "يناير", amount: 15000 },
  { month: "فبراير", amount: 18500 },
  { month: "مارس", amount: 22000 },
  { month: "أبريل", amount: 12000 },
  { month: "مايو", amount: 25000 },
];

const activities = [
  { id: 1, user: "أحمد محمود", action: "انضم إلى حلقة الإمام النووي", time: "قبل ١٠ دقائق", icon: UserPlus, color: "text-emerald-600 bg-emerald-50" },
  { id: 2, user: "حلقة الشافعي", action: "تم تسجيل حضور بنسبة ٩٨٪", time: "قبل ساعة", icon: CalendarCheck, color: "text-blue-600 bg-blue-50" },
  { id: 3, user: "نظام الصيانة", action: "تم تقديم شكوى جديدة: عطل تكييف", time: "قبل ساعتين", icon: Wrench, color: "text-amber-600 bg-amber-50" },
  { id: 4, user: "إدارة التبرعات", action: "تبرع جديد بقيمة ٥٠٠ ر.س", time: "قبل ٣ ساعات", icon: DollarSign, color: "text-indigo-600 bg-indigo-50" },
];

const complaints = [
  { id: 1, title: "عطل في مكيف المصلى", dept: "القسم الرجالي", status: "قيد المعالجة", priority: "عالي" },
  { id: 2, title: "نقص في المصاحف", dept: "القسم النسائي", status: "جديد", priority: "متوسط" },
  { id: 3, title: "إضاءة المئذنة", dept: "المرافق العامة", status: "مكتمل", priority: "منخفض" },
];

function CustomTooltipContent({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-3 text-xs shadow-lg">
      <p className="font-bold text-slate-800 mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value.toLocaleString("ar-SA")}
        </p>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, positive, color }: any) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

import { PageHeader } from "../PageHeader";

export function DashboardSection() {
  return (
    <div className="min-h-full bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="السلام عليكم، أحمد 👋"
        description="هذا ما يحدث في المسجد اليوم، الجمعة ١٤ مايو ٢٠٢٦"
        actions={
          <>
            {/* <button className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-bold hover:bg-muted transition-all">
              <Download className="w-4 h-4" />
              تصدير التقرير
            </button> */}
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">
              <Download className="w-4 h-4" />
              تصدير تقارير
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 space-y-8">

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={GraduationCap}
            label="إجمالي الطلاب"
            value="١,٢٤٠"
            trend="+١٢٪"
            positive={true}
            color="emerald"
          />
          <StatCard
            icon={Users}
            label="إجمالي المعلمين"
            value="٣٢"
            trend="+٢"
            positive={true}
            color="blue"
          />
          <StatCard
            icon={CalendarCheck}
            label="حضور اليوم"
            value="٩٤٪"
            trend="+٥٪"
            positive={true}
            color="indigo"
          />
          <StatCard
            icon={DollarSign}
            label="تبرعات الشهر"
            value="٤٥,٢٠٠ ر.س"
            trend="-٨٪"
            positive={false}
            color="amber"
          />
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">معدلات الحضور الأسبوعية</h3>
                <p className="text-xs text-slate-400 mt-1">نسبة حضور الطلاب في حلقات التحفيظ</p>
              </div>
              <select className="bg-slate-50 border-none rounded-lg text-xs font-bold py-1.5 px-3 focus:ring-2 focus:ring-emerald-500/10 outline-none">
                <option>آخر ٧ أيام</option>
                <option>الشهر الماضي</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#065f46" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#065f46" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltipContent />} />
                  <Area type="monotone" dataKey="attendance" name="نسبة الحضور" stroke="#065f46" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">آخر النشاطات</h3>
              <button className="text-xs font-bold text-emerald-800 hover:underline">عرض الكل</button>
            </div>
            <div className="space-y-6">
              {activities.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-800">
                      {item.user} <span className="font-normal text-slate-500">{item.action}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid: Complaints & Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Complaints Table */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">أحدث الشكاوى والطلبات</h3>
                <p className="text-xs text-slate-400 mt-1">متابعة حالة الطلبات المرسلة من المصلين</p>
              </div>
              <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all">
                إدارة الكل
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">العنوان</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">القسم</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">الأولوية</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">الحالة</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {complaints.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-800">{item.title}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-xs text-slate-500">{item.dept}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${item.priority === 'عالي' ? 'bg-red-50 text-red-600' :
                          item.priority === 'متوسط' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                          }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${item.status === 'مكتمل' ? 'bg-emerald-50 text-emerald-700' :
                          item.status === 'قيد المعالجة' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'مكتمل' ? 'bg-emerald-500' :
                            item.status === 'قيد المعالجة' ? 'bg-blue-500' : 'bg-slate-400'
                            }`}></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-center">
                        <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-emerald-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2">إجراءات سريعة</h3>
              <p className="text-emerald-100/60 text-sm mb-8">الوصول السريع للمهام الأكثر تكراراً</p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: UserPlus, label: "إضافة طالب" },
                  { icon: Wrench, label: "طلب صيانة" },
                  { icon: BookOpen, label: "إضافة خطبة" },
                  { icon: MessageSquare, label: "رد على شكوى" },
                ].map((a) => (
                  <button key={a.label} className="flex flex-col items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10">
                    <a.icon className="w-6 h-6 text-emerald-300" />
                    <span className="text-xs font-bold">{a.label}</span>
                  </button>
                ))}
              </div>

              <button className="w-full mt-8 py-4 bg-white text-emerald-900 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                عرض كافة الصلاحيات
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-800/50 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
