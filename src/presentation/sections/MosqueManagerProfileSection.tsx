'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from "../../app/components/PageHeader";
import {
  User, Building2, Lock, Activity, CheckCircle2,
  Edit, Key, Clock, RefreshCw, Check
} from 'lucide-react';
import { ManagerProfileRepositoryImpl } from "../../data/repositories/ManagerProfileRepositoryImpl";
import {
  ManagerProfile,
  UpdatePersonalProfilePayload,
  ChangePasswordPayload,
} from "../../domain/entities/ManagerProfile";

const repo = new ManagerProfileRepositoryImpl();

export function MosqueManagerProfileSection() {
  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Tab State: 'overview' | 'personal' | 'mosque' | 'security' | 'activity'
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'mosque' | 'security' | 'activity'>('overview');

  // Modals State
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  // Edit Personal Profile Form
  const [editForm, setEditForm] = useState<UpdatePersonalProfilePayload>({
    full_name: '',
    phone: '',
    email: '',
    language: 'العربية (الرئيسية)',
  });
  const [submittingEdit, setSubmittingEdit] = useState<boolean>(false);

  // Change Password Form
  const [passForm, setPassForm] = useState<ChangePasswordPayload>({
    current_password: '',
    new_password: '',
  });
  const [submittingPass, setSubmittingPass] = useState<boolean>(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await repo.getProfile();
      setProfile(data);
      setEditForm({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        language: data.language,
      });
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEdit(true);
    try {
      const updated = await repo.updateProfile(editForm);
      setProfile(updated);
      setShowEditModal(false);
      alert("تم تحديث البيانات الشخصية بنجاح!");
    } catch (e: any) {
      alert(e.message || "حدث خطأ أثناء تحديث البيانات.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passForm.new_password) return;
    setSubmittingPass(true);
    try {
      await repo.changePassword(passForm);
      setShowPasswordModal(false);
      setPassForm({ current_password: '', new_password: '' });
      alert("تم تغيير كلمة المرور بنجاح!");
      loadProfile();
    } catch (e: any) {
      alert(e.message || "فشل تغيير كلمة المرور.");
    } finally {
      setSubmittingPass(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!profile) return;
    try {
      const newState = await repo.toggleTwoFactor();
      alert(newState ? "تم تفعيل التحقق بخطوتين (2FA) للحساب." : "تم إيقاف التحقق بخطوتين.");
      loadProfile();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground font-['Cairo']">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-bold">جاري تحميل ملف مدير المسجد...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      {/* ── Page Header ── */}
      <PageHeader
        title="الملف الشخصي لمدير المسجد"
        description="لوحة كاملة للتعريف بالمدير، بيانات المسجد المرتبط، وأمان وسجل نشاط الحساب."
        breadcrumbs={[
          { label: "إدارة المسجد" },
          { label: "الملف الشخصي", active: true }
        ]}
      />

      <div className="px-4 md:px-8 py-4 space-y-6">

        {/* ── HEADER CARD: Profile Identity & Quick Actions ── */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-right">
            {/* Avatar Badge */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-primary to-emerald-800 text-white font-black text-3xl flex items-center justify-center shadow-xl shadow-primary/20 border-2 border-primary/20 shrink-0">
              {profile.full_name.charAt(0)}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h2 className="text-xl md:text-2xl font-black text-foreground">{profile.full_name}</h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {profile.job_title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> حساب موثق
                </span>
              </div>

              <p className="text-xs text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-2">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{profile.mosque_name} ({profile.city} - {profile.district})</span>
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-muted-foreground font-mono pt-1">
                <span>الرقم الوظيفي: <strong className="text-foreground">{profile.employee_id}</strong></span>
                <span>•</span>
                <span>رمز المسجد: <strong className="text-foreground">{profile.mosque_code}</strong></span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center justify-center md:justify-end gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل الملف</span>
            </button>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-muted text-foreground hover:bg-muted/80 border border-border rounded-xl text-xs font-bold transition-all"
            >
              <Key className="w-4 h-4" />
              <span>تغيير كلمة المرور</span>
            </button>
          </div>
        </div>

        {/* ── UX NAVIGATION TABS ── */}
        <div className="bg-card border border-border rounded-2xl p-1.5 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: Activity },
              { id: 'personal', label: 'المعلومات الشخصية', icon: User },
              { id: 'mosque', label: 'بيانات المسجد', icon: Building2 },
              { id: 'security', label: 'أمان الحساب', icon: Lock },
              { id: 'activity', label: 'سجل النشاط', icon: Clock },
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

        {/* ── TAB 1: OVERVIEW (Top 20% Key Info) ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Identity Summary */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <User className="w-4 h-4 text-primary" />
                    <h3 className="text-sm">الهوية الشخصية</h3>
                  </div>
                  <button onClick={() => setActiveTab('personal')} className="text-xs text-primary font-bold hover:underline">
                    التفاصيل
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">الاسم الكامل</span>
                    <span className="font-bold text-foreground">{profile.full_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">رقم الجوال</span>
                    <span className="font-mono font-bold text-foreground">{profile.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">البريد الإلكتروني</span>
                    <span className="font-mono text-foreground">{profile.email}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground font-medium">اللغة المفضلة</span>
                    <span className="font-bold text-foreground">{profile.language}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Mosque Snapshot */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="text-sm">المسجد المرتبط</h3>
                  </div>
                  <button onClick={() => setActiveTab('mosque')} className="text-xs text-primary font-bold hover:underline">
                    التفاصيل
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">اسم المسجد</span>
                    <span className="font-bold text-foreground">{profile.mosque_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">إمام المسجد</span>
                    <span className="font-bold text-primary">الشيخ د. عبد العزيز العتيبي</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">خطيب الجمعة</span>
                    <span className="font-bold text-primary">الشيخ د. محمد آل الشيخ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">المدينة / الحي</span>
                    <span className="font-bold text-foreground">{profile.city} - {profile.district}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground font-medium">حالة المسجد</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {profile.mosque_status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Security & Verification */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Lock className="w-4 h-4 text-primary" />
                    <h3 className="text-sm">أمان الحساب</h3>
                  </div>
                  <button onClick={() => setActiveTab('security')} className="text-xs text-primary font-bold hover:underline">
                    التفاصيل
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">حالة الحساب</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      نشط
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">مستوى التحقق</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> موثّق بالكامل
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">التحقق بخطوتين (2FA)</span>
                    <span className={`font-bold ${profile.two_factor_enabled ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {profile.two_factor_enabled ? 'مفعّل' : 'غير مفعّل'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground font-medium">آخر دخول</span>
                    <span className="font-medium text-foreground truncate max-w-[140px]">{profile.last_login}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB 2: PERSONAL INFORMATION ── */}
        {activeTab === 'personal' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">المعلومات الشخصية والوظيفية</h3>
                <p className="text-xs text-muted-foreground">البيانات التعريفية الخاصة بمدير المسجد المعتمدة بالنظام.</p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold"
              >
                <Edit className="w-3.5 h-3.5" /> <span>تعديل البيانات</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">الاسم الكامل</span>
                <p className="text-sm font-bold text-foreground">{profile.full_name}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">المسمى الوظيفي</span>
                <p className="text-sm font-bold text-primary">{profile.job_title}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">رقم الجوال</span>
                <p className="text-sm font-bold text-foreground font-mono" dir="ltr">{profile.phone}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">البريد الإلكتروني</span>
                <p className="text-sm font-bold text-foreground font-mono">{profile.email}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">الرقم الوظيفي / المعرف</span>
                <p className="text-sm font-bold text-foreground font-mono">{profile.employee_id}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">رقم الهوية الوطنية</span>
                <p className="text-sm font-bold text-foreground font-mono">{profile.national_id || 'غير مدخل'}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">اللغة المعتمدة</span>
                <p className="text-sm font-bold text-foreground">{profile.language}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: ASSOCIATED MOSQUE DATA ── */}
        {activeTab === 'mosque' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">بيانات المسجد المرتبط بالإدارة</h3>
                <p className="text-xs text-muted-foreground">تفاصيل المسجد الذي يتولى المدير إدارته حالياً مع تعيين الإمام والخطيب والقاعات.</p>
              </div>

              <Link
                href="/mosque/edit"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-sm hover:bg-primary/90 transition-all w-fit"
              >
                <Edit className="w-4 h-4" />
                <span>تعديل</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">اسم المسجد الرسمي</span>
                <p className="text-sm font-bold text-foreground">{profile.mosque_name}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">رمز / معرف المسجد</span>
                <p className="text-sm font-bold text-foreground font-mono">{profile.mosque_code}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">إمام المسجد المعتمد</span>
                <p className="text-sm font-bold text-primary">الشيخ د. عبد العزيز بن فهد العتيبي</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">خطيب الجمعة الرسمية</span>
                <p className="text-sm font-bold text-primary">الشيخ د. محمد بن إبراهيم آل الشيخ</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">المدينة والحي</span>
                <p className="text-sm font-bold text-foreground">{profile.city} - {profile.district}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium block">العنوان التفصيلي</span>
                <p className="text-sm font-bold text-foreground">{profile.address}</p>
              </div>
            </div>

            {/* Facilities Snapshot */}
            <div className="space-y-3 pt-2 border-t border-border">
              <span className="text-xs font-bold text-foreground block">مرافق وخدمات المسجد المتاحة:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  "مواقف سيارات متسعة",
                  "مصلى للنساء مع مدخل مستقل",
                  "برادات برودة المياه وسقيا الزمزم",
                  "تجهيزات وممرات ذوي الاحتياجات الخاصة",
                  "مكتبة إسلامية عامة",
                  "دورات مياه وموضأ متطور",
                  "تجهيزات ومغسلة الجنائز"
                ].map((fac, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{fac}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: ACCOUNT SECURITY ── */}
        {activeTab === 'security' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">إعدادات أمان الحساب والحماية</h3>
              <p className="text-xs text-muted-foreground mt-0.5">إدارة وسائط التحقق، كلمة المرور، وسجل الجلسات النشطة.</p>
            </div>

            <div className="space-y-4">
              {/* 2FA Toggle Row */}
              <div className="bg-muted/30 border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">التحقق بخطوتين (Two-Factor Authentication)</h4>
                  <p className="text-xs text-muted-foreground">
                    توفير طبقة أمان إضافية للحساب عبر رمز يُرسل لجوال مدير المسجد عند كل دخول جديد.
                  </p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    profile.two_factor_enabled
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border hover:bg-card'
                  }`}
                >
                  {profile.two_factor_enabled ? 'مفعّل (تعطيل)' : 'تفعيل الآن'}
                </button>
              </div>

              {/* Password Action Row */}
              <div className="bg-muted/30 border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">كلمة المرور الحالية</h4>
                  <p className="text-xs text-muted-foreground">
                    آخر تعديل على كلمة المرور كان قبل 60 يوماً. ينصح بتحديثها بشكل دوري.
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-sm"
                >
                  تغيير كلمة المرور
                </button>
              </div>

              {/* Account Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                <div className="p-4 bg-muted/20 border border-border rounded-xl">
                  <span className="text-muted-foreground font-medium block">تاريخ إنشاء الحساب</span>
                  <p className="text-sm font-bold text-foreground mt-1">{profile.created_at}</p>
                </div>
                <div className="p-4 bg-muted/20 border border-border rounded-xl">
                  <span className="text-muted-foreground font-medium block">مستوى الموثوقية</span>
                  <p className="text-sm font-bold text-emerald-600 mt-1">حساب موثق ومفعل</p>
                </div>
                <div className="p-4 bg-muted/20 border border-border rounded-xl">
                  <span className="text-muted-foreground font-medium block">آخر نشاط مسجل</span>
                  <p className="text-xs font-bold text-foreground mt-1">{profile.last_login}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: ACTIVITY LOG ── */}
        {activeTab === 'activity' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">سجل عمليات مدير المسجد (Activity Audit Log)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">تتبع زمني دقيق لكل التعديلات، الإجراءات، وتغييرات البيانات التي قام بها المدير.</p>
            </div>

            <div className="space-y-3">
              {profile.activities.map((act) => (
                <div key={act.id} className="p-4 bg-muted/30 border border-border rounded-xl flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-foreground">{act.action}</h4>
                      <p className="text-xs text-muted-foreground font-medium">{act.details}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground font-bold shrink-0">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL 1: Edit Personal Profile ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">تعديل المعلومات الشخصية</h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">إلغاء</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">الاسم الكامل *</label>
                <input
                  type="text" required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">رقم الجوال *</label>
                <input
                  type="tel" required
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">البريد الإلكتروني *</label>
                <input
                  type="email" required
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground ltr text-right"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl">
                  إلغاء
                </button>
                <button type="submit" disabled={submittingEdit} className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
                  {submittingEdit ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Change Password ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">تغيير كلمة المرور</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">إلغاء</button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={passForm.current_password}
                  onChange={(e) => setPassForm(prev => ({ ...prev, current_password: e.target.value }))}
                  placeholder="أدخل كلمة المرور الحالية"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">كلمة المرور الجديدة *</label>
                <input
                  type="password" required
                  value={passForm.new_password}
                  onChange={(e) => setPassForm(prev => ({ ...prev, new_password: e.target.value }))}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl">
                  إلغاء
                </button>
                <button type="submit" disabled={submittingPass} className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
                  {submittingPass ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
