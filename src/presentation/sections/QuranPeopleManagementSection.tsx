'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  Users, GraduationCap, UserPlus, Search, RefreshCw, Send,
  Mail, Phone, Shield, CheckCircle2, Clock, AlertCircle,
  X, Filter, Eye, Terminal, Sparkles, UserCheck, Layers, BookOpen
} from 'lucide-react';
import { QuranPeopleRepositoryImpl } from "../../data/repositories/QuranPeopleRepositoryImpl";
import { QuranPerson, SendInvitationPayload, QuranPeopleStats } from "../../domain/entities/QuranPeople";

const peopleRepo = new QuranPeopleRepositoryImpl();

interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function QuranPeopleManagementSection() {
  const [people, setPeople] = useState<QuranPerson[]>([]);
  const [stats, setStats] = useState<QuranPeopleStats>({
    total_students: 0,
    total_teachers: 0,
    total_supervisors: 0,
    pending_invitations: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Terminal States
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  // Send Invitation Form State (Roles allowed for Mosque Manager: teacher | halaqa_supervisor)
  const [inviteForm, setInviteForm] = useState<{
    role: 'teacher' | 'halaqa_supervisor'; // Exact API role values accepted by POST /api/invitations/send
    name: string;
    email: string;
    phone: string;
    notes: string;
  }>({
    role: 'teacher',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [submittingInvite, setSubmittingInvite] = useState<boolean>(false);

  const addDebugLog = (action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      {
        action,
        url,
        status,
        response,
        time: new Date().toLocaleTimeString('ar-SA')
      },
      ...prev.slice(0, 15)
    ]);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [peopleData, statsData] = await Promise.all([
        peopleRepo.getPeople({ role: selectedRole, q: searchQuery }),
        peopleRepo.getStats(),
      ]);

      setPeople(peopleData);
      setStats(statsData);

      addDebugLog("GET /api/students & GET /api/teachers", "https://mms-backend-rose.vercel.app/api/teachers", 200, {
        total_fetched: peopleData.length,
        stats: statsData,
      });

    } catch (err: any) {
      console.error("Error loading people data:", err);
      setError(err.message || "تعذر تحميل بيانات الكادر والطلاب من السيرفر");
    } finally {
      setLoading(false);
    }
  }, [selectedRole, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Submit Send Invitation to Teacher or Circle Manager (POST /api/invitations/send)
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email || !inviteForm.phone) {
      alert("يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، رقم الجوال).");
      return;
    }

    setSubmittingInvite(true);
    try {
      const payload: SendInvitationPayload = {
        mosque_id: 1,
        name: inviteForm.name,
        email: inviteForm.email,
        phone: inviteForm.phone,
        role: inviteForm.role,
        notes: inviteForm.notes || undefined,
      };

      const result = await peopleRepo.sendInvitation(payload);

      addDebugLog(
        "POST /api/invitations/send",
        "https://mms-backend-rose.vercel.app/api/invitations/send",
        result.success ? 200 : 422,
        {
          payload_sent: payload,
          response: result.invitation,
        }
      );

      alert(`تم إرسال دعوة التسجيل بنجاح إلى ${inviteForm.role === 'teacher' ? 'المعلم' : 'مدير الحلقات'}: ${inviteForm.name}`);

      setInviteForm({
        role: 'teacher',
        name: '',
        email: '',
        phone: '',
        notes: '',
      });

      setShowInviteModal(false);
      loadData();
    } catch (err: any) {
      console.error("Error sending invitation:", err);
      alert(err.message || "فشل إرسال الدعوة. يرجى المحاولة لاحقاً.");
    } finally {
      setSubmittingInvite(false);
    }
  };

  // Re-send Invitation
  const handleResendInvitation = async (person: QuranPerson) => {
    try {
      await peopleRepo.resendInvitation(person.id);
      addDebugLog(
        "POST /api/invitations/send (Resend)",
        "https://mms-backend-rose.vercel.app/api/invitations/send",
        200,
        { resent_to: person }
      );
      alert(`تم إعادة إرسال دعوة التسجيل إلى ${person.name} بنجاح!`);
      loadData();
    } catch (e: any) {
      console.error("Resend error:", e);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'halaqa_supervisor':
        return (
          <span className="px-3 py-1 bg-muted text-foreground border border-border text-xs font-bold rounded-full flex items-center gap-1.5 w-fit">
            <Shield className="w-3.5 h-3.5" />
            مدير حلقات
          </span>
        );
      case 'teacher':
        return (
          <span className="px-3 py-1 bg-muted text-foreground border border-border text-xs font-bold rounded-full flex items-center gap-1.5 w-fit">
            <Users className="w-3.5 h-3.5" />
            معلم قرآن
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-muted text-muted-foreground border border-border text-xs font-bold rounded-full flex items-center gap-1.5 w-fit">
            <GraduationCap className="w-3.5 h-3.5" />
            طالب
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> نشط
          </span>
        );
      case 'pending_invitation':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1 w-fit animate-pulse">
            <Clock className="w-3 h-3" /> دعوة معلقة
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border flex items-center gap-1 w-fit">
            غير نشط
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="إدارة الكادر والطلاب والحلقات"
        description="دليل موحد لإدارة المعلمين ومديري الحلقات والطلاب مع إمكانية إرسال دعوات التسجيل المباشرة."
        breadcrumbs={[
          { label: "الحلقات القرآنية" },
          { label: "إدارة الكادر والطلاب", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="معاينة سجل استجابة الـ API المباشرة"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            <button
              onClick={loadData}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات من السيرفر"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Primary Action Button: Send Invitation to Teacher or Manager ONLY */}
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Send className="w-4 h-4" />
              <span>إرسال دعوة تسجيل</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-8">

        {/* ── LIVE API DEBUG TERMINAL INSPECTOR BOX ── */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">مراقب الـ API المباشر لدعوات المعلمين والطلاب (People & Invitations API Inspector)</h3>
              </div>
              <button
                onClick={() => setDebugLogs([])}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg"
              >
                مسح السجل
              </button>
            </div>

            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic">لا توجد طلبات معالجة حالياً. قم بالنقر على زر إرسال دعوة لرؤية النتائج المباشرة.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto ltr text-left">
                {debugLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="font-bold">[{log.time}] {log.action}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                        HTTP {log.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{log.url}</p>
                    <pre className="text-[10px] bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 1: KPI Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">إجمالي الطلاب</span>
              <h3 className="text-2xl font-black text-foreground">{stats.total_students}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">إجمالي المعلمين</span>
              <h3 className="text-2xl font-black text-foreground">{stats.total_teachers}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">مديرو الحلقات</span>
              <h3 className="text-2xl font-black text-foreground">{stats.total_supervisors}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">الدعوات المعلقة</span>
              <h3 className="text-2xl font-black text-amber-600">{stats.pending_invitations}</h3>
              <p className="text-[11px] text-amber-600 font-bold">بانتظار اكمال التسجيل</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* ── SECTION 2: Search & Filter Toolbar ── */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedRole('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedRole === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
              >
                جميع الكوادر ({people.length})
              </button>

              <button
                onClick={() => setSelectedRole('teacher')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedRole === 'teacher'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>المعلمون</span>
              </button>

              <button
                onClick={() => setSelectedRole('halaqa_supervisor')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedRole === 'halaqa_supervisor'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>مديرو الحلقات</span>
              </button>

              <button
                onClick={() => setSelectedRole('student')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedRole === 'student'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>الطلاب</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، البريد، أو رقم الجوال..."
                className="w-full pl-4 pr-10 py-2.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
              />
            </div>

          </div>
        </div>

        {/* ── SECTION 3: Unified Data Table ( المعلمين، مديري الحلقات، الطلاب) ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-bold">جاري تحميل دليل المعلمين والطلاب من السيرفر...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-bold text-foreground">{error}</h3>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : people.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground mb-1">لا توجد سجلات مطابقة للبحث</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto font-medium">
                قم بإرسال دعوة تسجيل جديدة للمعلمين أو مديري الحلقات لإكمال الدليل.
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>إرسال أول دعوة تسجيل الآن</span>
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground text-[11px] font-bold uppercase">
                    <th className="py-4 px-6">الاسم والدور</th>
                    <th className="py-4 px-6">معلومات التواصل</th>
                    <th className="py-4 px-6">الحلقة / المجمع</th>
                    <th className="py-4 px-6">تاريخ الانضمام</th>
                    <th className="py-4 px-6">حالة التسجيل</th>
                    <th className="py-4 px-6 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-medium">
                  {people.map((person) => {
                    const isStaff = person.role === 'teacher' || person.role === 'halaqa_supervisor';

                    return (
                      <tr key={person.id} className="hover:bg-muted/30 transition-colors group">

                        {/* Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm shadow-sm">
                              {person.name.charAt(0)}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-black text-foreground text-sm group-hover:text-primary transition-colors">
                                {person.name}
                              </h4>
                              {getRoleBadge(person.role)}
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="py-4 px-6 space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                            <span className="font-mono text-xs">{person.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 text-primary" />
                            <span className="font-mono text-xs" dir="ltr">{person.phone}</span>
                          </div>
                        </td>

                        {/* Associated Circle */}
                        <td className="py-4 px-6 font-bold text-foreground">
                          {person.circle_name || 'غير محدد'}
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-6 text-muted-foreground font-bold">
                          {person.joined_date || 'غير محدد'}
                        </td>

                        {/* Registration Status */}
                        <td className="py-4 px-6">
                          {getStatusBadge(person.status)}
                        </td>

                        {/* Actions (Send invitation only for Teachers & Managers) */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isStaff && (
                              <button
                                onClick={() => handleResendInvitation(person)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all border border-primary/20"
                                title="إعادة إرسال دعوة التسجيل"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>إعادة الدعوة</span>
                              </button>
                            )}

                            {!isStaff && (
                              <span className="text-[11px] text-muted-foreground italic font-bold">طالب مسجل</span>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL: Send Registration Invitation to Teacher or Circle Manager (POST /api/invitations/send) ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6">

            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 text-primary font-black">
                <Send className="w-5 h-5" />
                <h3 className="text-lg text-foreground">إرسال دعوة تسجيل معلم أو مدير حلقات</h3>
              </div>
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => setShowInviteModal(null)} />
            </div>

            <form onSubmit={handleSendInvitation} className="space-y-4">

              {/* Role Selection Toggle */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2">نوع الدور المراد دعوته *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInviteForm(prev => ({ ...prev, role: 'teacher' }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold border transition-all ${inviteForm.role === 'teacher'
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-muted/60 border-border text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>دعوة معلم قرآن</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInviteForm(prev => ({ ...prev, role: 'halaqa_supervisor' }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold border transition-all ${inviteForm.role === 'halaqa_supervisor'
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-muted/60 border-border text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>دعوة مدير حلقات</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">الاسم الثلاثي *</label>
                <input
                  type="text"
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: الشيخ عبد الله بن محمد العتيبي"
                  className="w-full px-4 py-2.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="example@mosque.com"
                  className="w-full px-4 py-2.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground ltr text-right"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">رقم الجوال *</label>
                <input
                  type="tel"
                  required
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="050XXXXXXXX"
                  className="w-full px-4 py-2.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground ltr text-right"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">ملاحظات إضافية (اختياري)</label>
                <textarea
                  rows={2}
                  value={inviteForm.notes}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="أدخل أي ملاحظات خاصة بالدعوة..."
                  className="w-full px-4 py-2.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-medium outline-none text-foreground resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-5 py-2.5 bg-muted text-foreground font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={submittingInvite}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 transition-all"
                >
                  {submittingInvite ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري إرسال الدعوة...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>إرسال الدعوة إلى السيرفر</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
