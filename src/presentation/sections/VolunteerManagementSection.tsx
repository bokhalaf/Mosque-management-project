'use client';

import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  HeartHandshake, Plus, CheckCircle2, XCircle, Clock, Award,
  Terminal, RefreshCw, AlertCircle, FileText, CheckCheck, Users,
  Calendar, ShieldCheck, UserCheck, Check, Download, Layers, Sparkles
} from 'lucide-react';
import { useVolunteers } from "../hooks/useVolunteers";
import { CreateOpportunityPayload, AssignTaskPayload, LogHoursPayload } from "../../domain/entities/Volunteer";

interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function VolunteerManagementSection() {
  const {
    opportunities,
    applications,
    tasks,
    logs,
    certificates,
    loading,
    error,
    refreshData,
    createOpportunity,
    closeOpportunity,
    approveApplication,
    rejectApplication,
    assignTask,
    logHours,
    issueCertificate,
  } = useVolunteers();

  // Active Tab State: 'opportunities' | 'applications' | 'tasks' | 'logs' | 'certificates'
  const [activeTab, setActiveTab] = useState<'opportunities' | 'applications' | 'tasks' | 'logs' | 'certificates'>('opportunities');

  // Live Debug Terminal State
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const addDebugLog = (action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev.slice(0, 15),
    ]);
  };

  // Modal States
  const [showCreateOppModal, setShowCreateOppModal] = useState<boolean>(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState<boolean>(false);
  const [showLogHoursModal, setShowLogHoursModal] = useState<boolean>(false);

  // Forms State
  const [oppForm, setOppForm] = useState<CreateOpportunityPayload>({
    title: '',
    description: '',
    required_volunteers: 5,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });
  const [submittingOpp, setSubmittingOpp] = useState<boolean>(false);

  const [taskForm, setTaskForm] = useState<AssignTaskPayload>({
    application_id: '',
    task_description: '',
  });
  const [submittingTask, setSubmittingTask] = useState<boolean>(false);

  const [hoursForm, setHoursForm] = useState<LogHoursPayload>({
    volunteer_id: '',
    opportunity_id: '',
    logged_hours: 3.5,
    manager_evaluation: 'ممتاز',
    notes: '',
  });
  const [submittingHours, setSubmittingHours] = useState<boolean>(false);

  // Handlers
  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppForm.title || !oppForm.description) return;
    setSubmittingOpp(true);
    try {
      const created = await createOpportunity(oppForm);
      addDebugLog(
        "POST /api/volunteer/opportunities",
        "https://mms-backend-rose.vercel.app/api/volunteer/opportunities",
        200,
        { payload: oppForm, response: created }
      );
      setShowCreateOppModal(false);
      setOppForm({
        title: '',
        description: '',
        required_volunteers: 5,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      });
      alert("تم إنشاء الفرصة التطوعية بنجاح!");
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء إنشاء الفرصة.");
    } finally {
      setSubmittingOpp(false);
    }
  };

  const handleApproveApp = async (id: number | string) => {
    try {
      await approveApplication(id);
      addDebugLog(
        `POST /api/volunteer/applications/${id}/approve`,
        `https://mms-backend-rose.vercel.app/api/volunteer/applications/${id}/approve`,
        200,
        { status: true, message: "Application approved" }
      );
      alert("تم قبول طلب التقديم بنجاح!");
    } catch (err: any) {
      alert(err.message || "فشل قبول الطلب.");
    }
  };

  const handleRejectApp = async (id: number | string) => {
    try {
      await rejectApplication(id);
      addDebugLog(
        `POST /api/volunteer/applications/${id}/reject`,
        `https://mms-backend-rose.vercel.app/api/volunteer/applications/${id}/reject`,
        200,
        { status: true, message: "Application rejected" }
      );
      alert("تم رفض طلب التقديم.");
    } catch (err: any) {
      alert(err.message || "فشل رفض الطلب.");
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.application_id || !taskForm.task_description) return;
    setSubmittingTask(true);
    try {
      const created = await assignTask(taskForm);
      addDebugLog(
        "POST /api/volunteer/tasks",
        "https://mms-backend-rose.vercel.app/api/volunteer/tasks",
        200,
        { payload: taskForm, response: created }
      );
      setShowAssignTaskModal(false);
      setTaskForm({ application_id: '', task_description: '' });
      alert("تم إسناد المهمة للمتطوع بنجاح!");
    } catch (err: any) {
      alert(err.message || "فشل إسناد المهمة.");
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoursForm.volunteer_id || !hoursForm.opportunity_id) return;
    setSubmittingHours(true);
    try {
      const created = await logHours(hoursForm);
      addDebugLog(
        "POST /api/volunteer/logs",
        "https://mms-backend-rose.vercel.app/api/volunteer/logs",
        200,
        { payload: hoursForm, response: created }
      );
      setShowLogHoursModal(false);
      alert("تم تسجيل ساعات التطوع والتقييم بنجاح!");
    } catch (err: any) {
      alert(err.message || "فشل تسجيل الساعات.");
    } finally {
      setSubmittingHours(false);
    }
  };

  const handleIssueCert = async (volunteerId: number | string, opportunityId: number | string, volunteerName: string) => {
    if (!confirm(`هل أنت تأكد من إصدار شهادة رسمية للمتطوع "${volunteerName}"؟`)) return;
    try {
      const cert = await issueCertificate(volunteerId, opportunityId);
      addDebugLog(
        `POST /api/volunteer/certificates/${volunteerId}/${opportunityId}`,
        `https://mms-backend-rose.vercel.app/api/volunteer/certificates/${volunteerId}/${opportunityId}`,
        200,
        { response: cert }
      );
      alert("تم إصدار شهادة التطوع بنجاح!");
    } catch (err: any) {
      alert(err.message || "فشل إصدار الشهادة.");
    }
  };

  const handleCloseOpp = async (id: number | string, title: string) => {
    if (!confirm(`هل أنت تأكد من إغلاق الفرصة التطوعية "${title}"؟`)) return;
    try {
      await closeOpportunity(id);
      addDebugLog(
        `POST /api/volunteer/opportunities/${id}/close`,
        `https://mms-backend-rose.vercel.app/api/volunteer/opportunities/${id}/close`,
        200,
        { status: true, message: "Opportunity closed" }
      );
      alert("تم إغلاق الفرصة التطوعية بنجاح.");
    } catch (err: any) {
      alert(err.message || "فشل إغلاق الفرصة.");
    }
  };

  const approvedApps = applications.filter(a => a.status === 'approved');

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title="إدارة المتطوعين والفرص التطوعية"
        description="مسار عمل موحد لإنشاء الفرص التطوعية، قبول المتقدمين، إسناد المهام، وتسجيل الساعات والشهادات."
        breadcrumbs={[
          { label: "إدارة المسجد" },
          { label: "إدارة المتطوعين", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateOppModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-sm hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء فرصة جديدة</span>
            </button>

            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-mono font-bold transition-all"
            >
              <Terminal className="w-4 h-4" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            <button
              onClick={refreshData}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-6">

        {/* ── LIVE API DEBUG TERMINAL ── */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-200 font-mono text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">مراقب الـ API المباشر (Volunteer API Inspector)</span>
              </div>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto ltr text-left">
              {debugLogs.length === 0 ? (
                <p className="text-[11px] text-slate-500">لا توجد طلبات مسجلة حالياً. قُم بأي إجراء لاستعراض تفاصيل HTTP API.</p>
              ) : (
                debugLogs.map((log, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                      <span>[{log.time}] {log.action}</span>
                      <span>HTTP {log.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{log.url}</p>
                    <pre className="text-[10px] bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── KPI STATS CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-bold block">إجمالي الفرص التطوعية</span>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-foreground">{opportunities.length}</h3>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-bold block">طلبات التقديم الواردة</span>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-foreground">{applications.length}</h3>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-bold block">المتطوعون المقبولون</span>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-emerald-600">{approvedApps.length}</h3>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-bold block">الشهادات الصادرة</span>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-amber-600">{certificates.length}</h3>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ── UX TABS NAVIGATION ── */}
        <div className="bg-card border border-border rounded-2xl p-1.5 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {[
              { id: 'opportunities', label: `الفرص التطوعية (${opportunities.length})`, icon: HeartHandshake },
              { id: 'applications', label: `طلبات التقديم (${applications.length})`, icon: Users },
              { id: 'tasks', label: `إسناد المهام (${tasks.length})`, icon: Layers },
              { id: 'logs', label: `تسجيل الساعات والتقييم (${logs.length})`, icon: Clock },
              { id: 'certificates', label: `الشهادات الصادرة (${certificates.length})`, icon: Award },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-transparent text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB 1: VOLUNTEER OPPORTUNITIES ── */}
        {activeTab === 'opportunities' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">قائمة الفرص التطوعية الحالية بالمسجد</h3>
              <button
                onClick={() => setShowCreateOppModal(true)}
                className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> <span>فرصة جديدة</span>
              </button>
            </div>

            {opportunities.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
                <HeartHandshake className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-sm font-bold text-foreground">لا توجد فرص تطوعية منشورة حالياً</p>
                <button
                  onClick={() => setShowCreateOppModal(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl"
                >
                  إنشاء أول فرصة تطوعية
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-foreground leading-snug">{opp.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
                          opp.status === 'open'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {opp.status === 'open' ? 'مفتوحة للتقديم' : 'مغلقة'}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {opp.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>المتطوعون المطلوبة:</span>
                        <span className="font-bold text-foreground">{opp.current_volunteers || 0} / {opp.required_volunteers} متطوع</span>
                      </div>

                      <div className="flex justify-between text-muted-foreground font-mono text-[11px]">
                        <span>فترة الفرصة:</span>
                        <span>{opp.start_date} إلى {opp.end_date}</span>
                      </div>

                      {opp.status === 'open' && (
                        <button
                          onClick={() => handleCloseOpp(opp.id, opp.title)}
                          className="w-full py-2 bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border rounded-xl font-bold transition-all text-xs"
                        >
                          إغلاق الفرصة التطوعية
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: APPLICATIONS (طلبات التقديم) ── */}
        {activeTab === 'applications' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">مراجعة طلبات التقديم على الفرص التطوعية</h3>
              <p className="text-xs text-muted-foreground">قبول أو رفض طلبات التقديم الواردة من المتطوعين.</p>
            </div>

            {applications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs font-bold">لا توجد طلبات تقديم حالياً.</div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 bg-muted/30 border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-foreground">{app.volunteer_name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : app.status === 'rejected'
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {app.status === 'approved' ? 'مقبول' : app.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>
                      <p className="text-xs text-primary font-bold">{app.opportunity_title}</p>
                      <p className="text-xs text-muted-foreground font-mono" dir="ltr">{app.phone} • {app.email || 'لا يوجد بريد'}</p>
                      {app.notes && <p className="text-xs text-muted-foreground italic">ملاحظات: {app.notes}</p>}
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveApp(app.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                        >
                          قبول الطلب
                        </button>
                        <button
                          onClick={() => handleRejectApp(app.id)}
                          className="px-3 py-1.5 bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive border border-border rounded-xl text-xs font-bold transition-all"
                        >
                          رفض
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: TASKS ASSIGNMENT (إسناد المهام) ── */}
        {activeTab === 'tasks' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">إسناد المهام للمتطوعين المقبولين</h3>
                <p className="text-xs text-muted-foreground">تحديد المهام الميدانية والإدارية للمتطوعين المعتمدين.</p>
              </div>

              <button
                onClick={() => setShowAssignTaskModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> <span>إسناد مهمة جديدة</span>
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs font-bold">لا توجد مهام مسندة حالياً.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((tsk) => (
                  <div key={tsk.id} className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">{tsk.volunteer_name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {tsk.status === 'assigned' ? 'مهمة قائمة' : 'مكتملة'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground">{tsk.task_description}</h4>
                    <p className="text-[11px] text-muted-foreground">{tsk.opportunity_title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: HOURS & EVALUATIONS (تسجيل الساعات والتقييم) ── */}
        {activeTab === 'logs' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">تسجيل ساعات التطوع وتقييم الأداء</h3>
                <p className="text-xs text-muted-foreground">رصد عدد الساعات وتدوين التقييم الإداري لكل متطوع.</p>
              </div>

              <button
                onClick={() => setShowLogHoursModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Clock className="w-4 h-4" /> <span>تسجيل ساعات جديدة</span>
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs font-bold">لا توجد ساعات مسجلة حالياً.</div>
            ) : (
              <div className="space-y-3">
                {logs.map((lg) => (
                  <div key={lg.id} className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground">{lg.volunteer_name}</h4>
                      <p className="text-xs text-muted-foreground">{lg.opportunity_title}</p>
                      {lg.notes && <p className="text-xs text-muted-foreground italic">ملاحظات: {lg.notes}</p>}
                    </div>

                    <div className="text-left space-y-1 shrink-0">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold rounded-full block text-center">
                        {lg.logged_hours} ساعة تطوعية
                      </span>
                      <span className="text-[11px] font-bold text-primary block text-center">تقييم: {lg.manager_evaluation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: CERTIFICATES (إصدار الشهادات) ── */}
        {activeTab === 'certificates' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">إصدار وإدارة شهادات التطوع الرسمية</h3>
              <p className="text-xs text-muted-foreground">توليد شهادات التقدير للمتطوعين وتوفير روابط التنزيل كملفات PDF.</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground">المتطوعون المعتمدون المستحقون للشهادات:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedApps.map((app) => (
                  <div key={app.id} className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{app.volunteer_name}</h4>
                      <p className="text-[11px] text-muted-foreground">{app.opportunity_title}</p>
                    </div>
                    <button
                      onClick={() => handleIssueCert(app.volunteer_id, app.opportunity_id, app.volunteer_name)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm shrink-0"
                    >
                      <Award className="w-3.5 h-3.5" /> <span>إصدار الشهادة</span>
                    </button>
                  </div>
                ))}
              </div>

              {certificates.length > 0 && (
                <div className="pt-4 border-t border-border space-y-3">
                  <h4 className="text-xs font-bold text-foreground">الشهادات الصادرة رسمياً:</h4>
                  <div className="space-y-2">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="p-4 bg-emerald-500/[0.03] border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{cert.volunteer_name}</h4>
                            <p className="text-[11px] text-muted-foreground">{cert.opportunity_title} ({cert.total_hours} ساعة)</p>
                          </div>
                        </div>

                        <a
                          href={cert.certificate_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-all shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تنزيل الشهادة PDF</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL 1: Create Volunteer Opportunity ── */}
      {showCreateOppModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">إنشاء فرصة تطوعية جديدة</h3>
              <button onClick={() => setShowCreateOppModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">إلغاء</button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">عنوان الفرصة التطوعية *</label>
                <input
                  type="text" required
                  value={oppForm.title}
                  onChange={(e) => setOppForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: تنظيم صفوف صلاة الجمعة"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">وصف والاحتياج التطوعي *</label>
                <textarea
                  rows={3} required
                  value={oppForm.description}
                  onChange={(e) => setOppForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="توضيح المهام المطلوبة والعدد والساعات المتوقعة..."
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">عدد المتطوعين المطلوبين *</label>
                <input
                  type="number" min={1} required
                  value={oppForm.required_volunteers}
                  onChange={(e) => setOppForm(prev => ({ ...prev, required_volunteers: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">تاريخ البدء *</label>
                  <input
                    type="date" required
                    value={oppForm.start_date}
                    onChange={(e) => setOppForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl text-xs font-bold outline-none text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">تاريخ الانتهاء *</label>
                  <input
                    type="date" required
                    value={oppForm.end_date}
                    onChange={(e) => setOppForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl text-xs font-bold outline-none text-foreground"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateOppModal(false)} className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl">
                  إلغاء
                </button>
                <button type="submit" disabled={submittingOpp} className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
                  {submittingOpp ? 'جاري الإنشاء...' : 'نشر الفرصة التطوعية'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Assign Task Modal ── */}
      {showAssignTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">إسناد مهمة جديدة لمتطوع</h3>
              <button onClick={() => setShowAssignTaskModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">إلغاء</button>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">اختر المتطوع المقبول *</label>
                <select
                  required
                  value={taskForm.application_id}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, application_id: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                >
                  <option value="">-- اختر المتطوع --</option>
                  {approvedApps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.volunteer_name} ({a.opportunity_title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">تفاصيل ووصف المهمة *</label>
                <textarea
                  rows={3} required
                  value={taskForm.task_description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, task_description: e.target.value }))}
                  placeholder="مثال: توجيه المصلين وتنظيم الممرات قبل الصلاة بـ 30 دقيقة"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button type="button" onClick={() => setShowAssignTaskModal(false)} className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl">
                  إلغاء
                </button>
                <button type="submit" disabled={submittingTask} className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
                  {submittingTask ? 'جاري الإسناد...' : 'إسناد المهمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Log Hours & Evaluation ── */}
      {showLogHoursModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">تسجيل ساعات التطوع والتقييم</h3>
              <button onClick={() => setShowLogHoursModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">إلغاء</button>
            </div>

            <form onSubmit={handleLogHours} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">المتطوع *</label>
                <select
                  required
                  value={hoursForm.volunteer_id}
                  onChange={(e) => setHoursForm(prev => ({ ...prev, volunteer_id: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                >
                  <option value="">-- اختر المتطوع --</option>
                  {approvedApps.map((a) => (
                    <option key={a.id} value={a.volunteer_id}>
                      {a.volunteer_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">الفرصة التطوعية *</label>
                <select
                  required
                  value={hoursForm.opportunity_id}
                  onChange={(e) => setHoursForm(prev => ({ ...prev, opportunity_id: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                >
                  <option value="">-- اختر الفرصة --</option>
                  {opportunities.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">عدد الساعات التطوعية المنجزة *</label>
                <input
                  type="number" step="0.5" min="0.5" required
                  value={hoursForm.logged_hours}
                  onChange={(e) => setHoursForm(prev => ({ ...prev, logged_hours: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">تقييم المدير للأداء *</label>
                <select
                  value={hoursForm.manager_evaluation}
                  onChange={(e) => setHoursForm(prev => ({ ...prev, manager_evaluation: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                >
                  <option value="ممتاز">ممتاز</option>
                  <option value="جيد جداً">جيد جداً</option>
                  <option value="جيد">جيد</option>
                  <option value="مقبول">مقبول</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">ملاحظات التقييم</label>
                <input
                  type="text"
                  value={hoursForm.notes || ''}
                  onChange={(e) => setHoursForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="ملاحظات توثيقية إضافية..."
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button type="button" onClick={() => setShowLogHoursModal(false)} className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl">
                  إلغاء
                </button>
                <button type="submit" disabled={submittingHours} className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
                  {submittingHours ? 'جاري التسجيل...' : 'تسجيل الساعات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
