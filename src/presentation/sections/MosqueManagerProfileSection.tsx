'use client';
// ==============================
// MosqueManagerProfileSection — Design System & OpenAPI 100% Aligned
// متصل بنقطة النهاية الرسمية GET /api/profile و PUT /api/profile و POST /api/profile/confirm-email
// ==============================

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  User, Building2, Lock, Activity, CheckCircle2,
  Edit, Key, Clock, RefreshCw, Terminal, Phone, Mail,
  ShieldCheck, ShieldAlert, Sparkles, MapPin, BadgeCheck,
  Check, X, AlertCircle, Loader2, Upload, Image, BookOpen, UserCheck, DollarSign
} from 'lucide-react';
import { ManagerProfileRepositoryImpl } from "../../data/repositories/ManagerProfileRepositoryImpl";
import { MosqueRepositoryImpl } from "../../data/repositories/MosqueRepositoryImpl";
import {
  ManagerProfile,
  UpdateProfilePayload,
} from "../../domain/entities/ManagerProfile";
import { useToast } from "../../app/components/ui/Toast";
import { ProfileDebugBox, ProfileApiDebugLog } from "./profile/components/ProfileDebugBox";
import { MosqueSpacesSection } from "./profile/components/MosqueSpacesSection";
import { MosqueVolunteerLoader } from "./volunteers/components/MosqueVolunteerLoader";
import { SystemSettingsSection } from "./profile/components/SystemSettingsSection";

const repo = new ManagerProfileRepositoryImpl();
const mosqueRepo = new MosqueRepositoryImpl();

export function MosqueManagerProfileSection() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Super Admin / Region Manager Detection
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const role = String(user.role || user.user_type || user.role_name || (typeof user.role === 'object' ? user.role?.name : '') || '').toLowerCase();
          const roles = (user.roles || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : String(r.name || '').toLowerCase());
          const roleStr = String(localStorage.getItem("user_role") || "").toLowerCase();
          const activeRoleView = String(localStorage.getItem("active_role_view") || "").toLowerCase();
          if (
            role === 'super_admin' ||
            role === 'superadmin' ||
            role === 'admin' ||
            role === 'administrator' ||
            role === 'region_manager' ||
            role === 'regionmanager' ||
            role.includes('region') ||
            role.includes('super') ||
            role.includes('مدير المنطقة') ||
            user.is_super_admin === true ||
            user.role_id === 1 ||
            roles.includes('super_admin') ||
            roles.includes('region_manager') ||
            roles.includes('superadmin') ||
            roleStr === 'super_admin' ||
            roleStr === 'region_manager' ||
            activeRoleView === 'super_admin' ||
            activeRoleView === 'region_manager'
          ) {
            setIsSuperAdmin(true);
          }
        }
      } catch (e) {}
    }
  }, []);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'mosque' | 'security' | 'activity' | 'settings'>('overview');

  // Modals State
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [showEditMosqueModal, setShowEditMosqueModal] = useState<boolean>(false);

  // Live Debug Terminal State
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<ProfileApiDebugLog[]>([]);

  const addDebugLog = useCallback((action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev.slice(0, 15),
    ]);
  }, []);

  // Edit Personal Profile Form (first_name, last_name, phone) - Email REMOVED as requested
  const [editForm, setEditForm] = useState<{
    first_name: string;
    last_name: string;
    phone: string;
  }>({
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [submittingEdit, setSubmittingEdit] = useState<boolean>(false);

  // Edit Mosque Form (name, working_hours, imam, khatib, image) - EXACTLY the 5 fields requested
  const [mosqueEditForm, setMosqueEditForm] = useState<{
    name: string;
    working_hours: string;
    imam: string;
    khatib: string;
    image: File | string | null;
  }>({
    name: '',
    working_hours: '',
    imam: '',
    khatib: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submittingMosqueEdit, setSubmittingMosqueEdit] = useState<boolean>(false);

  // Change Password Form
  const [passForm, setPassForm] = useState<{
    password: string;
    password_confirmation: string;
  }>({
    password: '',
    password_confirmation: '',
  });
  const [submittingPass, setSubmittingPass] = useState<boolean>(false);

  // OTP Form
  const [otpCode, setOtpCode] = useState<string>('');
  const [submittingOtp, setSubmittingOtp] = useState<boolean>(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repo.getProfile();
      setProfile(data);
      setEditForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      });
      setMosqueEditForm({
        name: data.mosque_name || '',
        working_hours: data.working_hours || 'طوال اليوم (مفتوح للصلوات الخمس)',
        imam: data.imam_name && data.imam_name !== 'غير محدد' ? data.imam_name : '',
        khatib: data.khatib_name && data.khatib_name !== 'غير محدد' ? data.khatib_name : '',
        image: data.mosque_image || null,
      });
      setImagePreview(data.mosque_image || null);
      addDebugLog('GET /api/profile', 'https://mms-backend-rose.vercel.app/api/profile', 200, data._rawResponse || data);
    } catch (e: any) {
      console.error("Failed to load profile:", e);
      showToast("تعذر جلب بيانات الملف الشخصي من السيرفر", "error");
    } finally {
      setLoading(false);
    }
  }, [addDebugLog, showToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handle Save Profile (PUT /api/profile) - Without Email
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEdit(true);
    try {
      const payload: UpdateProfilePayload = {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        phone: editForm.phone.trim(),
      };
      const updated = await repo.updateProfile(payload);
      addDebugLog('PUT /api/profile', 'https://mms-backend-rose.vercel.app/api/profile', 200, updated._rawResponse || updated);
      setProfile(updated);
      setShowEditModal(false);
      showToast("تم تحديث البيانات الشخصية بنجاح ✅", "success");
    } catch (err: any) {
      console.error("Update Profile Error:", err);
      showToast(err.message || "حدث خطأ أثناء تحديث البيانات.", "error");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handle Save Mosque Details (Only name, image, working_hours, imam, khatib)
  const handleSaveMosqueDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.mosque_id) {
      showToast("معرف المسجد غير متاح للتعديل", "error");
      return;
    }

    setSubmittingMosqueEdit(true);
    try {
      const payload: any = {
        name: mosqueEditForm.name.trim(),
        working_hours: mosqueEditForm.working_hours.trim(),
        imam: mosqueEditForm.imam.trim(),
        khatib: mosqueEditForm.khatib.trim(),
      };
      if (mosqueEditForm.image instanceof File) {
        payload.image = mosqueEditForm.image;
      }

      // 1. Send to server and wait for real response
      const updatedMosque = await mosqueRepo.updateMosque(profile.mosque_id, payload);
      
      addDebugLog(
        `POST /api/mosques/${profile.mosque_id} (_method=PUT)`,
        `https://mms-backend-rose.vercel.app/api/mosques/${profile.mosque_id}`,
        200,
        { payload, serverResponse: updatedMosque }
      );

      // 2. Only after server confirmation, update the UI state with returned data
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          mosque_name: updatedMosque.name || mosqueEditForm.name.trim(),
          working_hours: updatedMosque.working_hours || mosqueEditForm.working_hours.trim(),
          imam_name: updatedMosque.imam || mosqueEditForm.imam.trim() || 'غير محدد',
          khatib_name: updatedMosque.khatib || mosqueEditForm.khatib.trim() || 'غير محدد',
          mosque_image: updatedMosque.image || imagePreview || prev.mosque_image,
        };
      });

      // 3. Update localStorage cache
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('mosque_manager_profile_cache');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.mosque_name = updatedMosque.name || mosqueEditForm.name.trim();
            parsed.working_hours = updatedMosque.working_hours || mosqueEditForm.working_hours.trim();
            parsed.imam_name = updatedMosque.imam || mosqueEditForm.imam.trim() || 'غير محدد';
            parsed.khatib_name = updatedMosque.khatib || mosqueEditForm.khatib.trim() || 'غير محدد';
            if (updatedMosque.image) parsed.mosque_image = updatedMosque.image;
            localStorage.setItem('mosque_manager_profile_cache', JSON.stringify(parsed));
          } catch (e) {}
        }
      }

      setShowEditMosqueModal(false);
      showToast("تم تحديث بيانات المسجد في السيرفر بنجاح ✅", "success");
    } catch (err: any) {
      console.error("Update Mosque Error:", err);
      // In case of failure: show error message from server and DO NOT display success toast
      showToast(err.message || "فشل تحديث بيانات المسجد بالسيرفر.", "error");
    } finally {
      setSubmittingMosqueEdit(false);
    }
  };

  // Handle Change Password (PUT /api/profile)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passForm.password) {
      showToast("يرجى إدخال كلمة المرور الجديدة", "error");
      return;
    }
    if (passForm.password !== passForm.password_confirmation) {
      showToast("تأكيد كلمة المرور غير متطابق", "error");
      return;
    }
    if (passForm.password.length < 6) {
      showToast("يجب أن تكون كلمة المرور 6 أحرف على الأقل", "error");
      return;
    }

    setSubmittingPass(true);
    try {
      await repo.changePassword("", passForm.password, passForm.password_confirmation);
      addDebugLog('PUT /api/profile (Password Change)', 'https://mms-backend-rose.vercel.app/api/profile', 200, { status: true, message: "Password changed successfully" });
      setShowPasswordModal(false);
      setPassForm({ password: '', password_confirmation: '' });
      showToast("تم تغيير كلمة المرور بنجاح 🔒", "success");
      loadProfile();
    } catch (err: any) {
      showToast(err.message || "فشل تغيير كلمة المرور.", "error");
    } finally {
      setSubmittingPass(false);
    }
  };

  // Handle Confirm Email OTP (POST /api/profile/confirm-email)
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      showToast("يرجى إدخال رمز التحقق بشكل صحيح", "error");
      return;
    }

    setSubmittingOtp(true);
    try {
      await repo.confirmEmail({ otp: otpCode });
      addDebugLog('POST /api/profile/confirm-email', 'https://mms-backend-rose.vercel.app/api/profile/confirm-email', 200, { status: true, message: "Email confirmed" });
      setShowOtpModal(false);
      setOtpCode('');
      showToast("تم تأكيد البريد الإلكتروني بنجاح ✅", "success");
      loadProfile();
    } catch (err: any) {
      showToast(err.message || "رمز التحقق غير صحيح أو منتهي الصلاحية.", "error");
    } finally {
      setSubmittingOtp(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
        <PageHeader
          title="الملف الشخصي لمدير المسجد"
          description="إدارة ومتابعة بيانات الحساب الإداري، والمسجد المسند، وإعدادات الأمان والموثوقية."
          breadcrumbs={[
            { label: "إدارة المسجد" },
            { label: "الملف الشخصي", active: true }
          ]}
        />
        <div className="px-4 md:px-8 py-8">
          <MosqueVolunteerLoader
            message="جاري تحميل بيانات الملف الشخصي والمسجد..."
            subMessage="يتم مزامنة بيانات المدير والمسجد والقاعات التابعة مباشرة من السيرفر"
            minHeight="min-h-[460px]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      {/* ── Page Header ── */}
      <PageHeader
        title="الملف الشخصي لمدير المسجد"
        description="إدارة ومتابعة بيانات الحساب الإداري، والمسجد المسند، وإعدادات الأمان والموثوقية."
        breadcrumbs={[
          { label: "إدارة المسجد" },
          { label: "الملف الشخصي", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={loadProfile}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-sm"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل الملف</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-6">

        {/* ── HEADER HERO CARD: Identity & Status ── */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-right">
            {/* Avatar Badge */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-primary via-emerald-700 to-emerald-900 text-white font-black text-3xl flex items-center justify-center shadow-xl shadow-primary/20 border-2 border-primary/30 shrink-0">
              {profile.first_name ? profile.first_name.charAt(0) : 'م'}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h2 className="text-xl md:text-2xl font-black text-foreground">{profile.full_name}</h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {profile.job_title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {profile.verification_level}
                </span>
              </div>

              {!isSuperAdmin && profile.mosque_name && (
                <p className="text-xs text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-2">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>{profile.mosque_name} {profile.address ? `(${profile.address})` : ''}</span>
                </p>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-muted-foreground font-mono pt-1">
                <span>الرقم الوظيفي: <strong className="text-foreground">{profile.employee_id}</strong></span>
                {!isSuperAdmin && profile.mosque_code && (
                  <>
                    <span>•</span>
                    <span>رمز المسجد: <strong className="text-foreground">{profile.mosque_code}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex items-center justify-center md:justify-end gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل البيانات</span>
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
              ...(!isSuperAdmin ? [{ id: 'mosque', label: 'بيانات المسجد', icon: Building2 }] : []),
              { id: 'security', label: 'أمان الحساب والموثوقية', icon: Lock },
              ...(isSuperAdmin
                ? [{ id: 'settings', label: 'سعر الصرف', icon: DollarSign }]
                : [{ id: 'activity', label: 'سجل النشاط', icon: Clock }]),
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

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            <div className={`grid grid-cols-1 ${isSuperAdmin ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-5`}>
              
              {/* Identity Summary Card */}
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
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">الاسم الكامل</span>
                    <span className="font-bold text-foreground">{profile.full_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">رقم الجوال</span>
                    <span className="font-mono font-bold text-foreground" dir="ltr">{profile.phone}</span>
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

              {/* Mosque Snapshot Card (Hidden for Super Admin) */}
              {!isSuperAdmin && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Building2 className="w-4 h-4 text-primary" />
                      <h3 className="text-sm">المسجد المسند</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowEditMosqueModal(true)}
                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>
                      <span className="text-muted-foreground">•</span>
                      <button onClick={() => setActiveTab('mosque')} className="text-xs text-muted-foreground hover:text-foreground font-bold">
                        التفاصيل
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground font-medium">اسم المسجد</span>
                      <span className="font-bold text-foreground">{profile.mosque_name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground font-medium">أوقات العمل</span>
                      <span className="font-bold text-foreground font-mono">{profile.working_hours || 'طوال اليوم (مفتوح للصلوات)'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground font-medium">إمام المسجد</span>
                      <span className="font-bold text-foreground">{profile.imam_name || 'غير محدد'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground font-medium">خطيب الجمعة</span>
                      <span className="font-bold text-foreground">{profile.khatib_name || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security & Verification Card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm">أمان الحساب</h3>
                  </div>
                  <button onClick={() => setActiveTab('security')} className="text-xs text-primary font-bold hover:underline">
                    التفاصيل
                  </button>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">حالة الحساب</span>
                    <span className="font-bold text-emerald-600">نشط ومفعل</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">توثيق البريد</span>
                    <span className="font-bold text-foreground">{profile.is_email_verified ? 'موثّق بالكامل' : 'غير مؤكد'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">الموثوقية</span>
                    <span className="font-bold text-foreground">{profile.verification_level}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground font-medium">تاريخ الإنشاء</span>
                    <span className="font-mono text-muted-foreground">{profile.created_at}</span>
                  </div>
                </div>
              </div>

              {/* For Super Admin: System Exchange Rate Card in Overview */}
              {isSuperAdmin && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm">سعر الصرف</h3>
                    </div>
                    <button onClick={() => setActiveTab('settings')} className="text-xs text-primary font-bold hover:underline">
                      إدارة السعر
                    </button>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground font-medium">العملة الأساسية</span>
                      <span className="font-bold text-foreground">الليرة السورية (SYP)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground font-medium">بوابة التبرع</span>
                      <span className="font-bold text-primary">Stripe (بالدولار)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground font-medium">سعر التحويل المباشر</span>
                      <span className="font-bold text-emerald-600">1 دولار = 14,500 ل.س</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ── TAB 2: PERSONAL INFO ── */}
        {activeTab === 'personal' && (
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">المعلومات الشخصية والوظيفية</h3>
                <p className="text-xs text-muted-foreground mt-0.5">البيانات التعريفية الخاصة بالحساب الإداري المسجلة في النظام.</p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  الاسم الأول
                </span>
                <p className="text-sm font-bold text-foreground">{profile.first_name}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  اسم العائلة
                </span>
                <p className="text-sm font-bold text-foreground">{profile.last_name}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  البريد الإلكتروني
                </span>
                <p className="text-sm font-mono font-bold text-foreground">{profile.email}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  رقم الهاتف والجوال
                </span>
                <p className="text-sm font-mono font-bold text-foreground" dir="ltr">{profile.phone}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium">الدور الوظيفي</span>
                <p className="text-sm font-bold text-foreground">{profile.job_title}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium">الرقم الوظيفي المعتمد</span>
                <p className="text-sm font-mono font-bold text-primary">{profile.employee_id}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: MOSQUE INFO (Hidden for Super Admin) ── */}
        {!isSuperAdmin && activeTab === 'mosque' && (
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">بيانات المسجد المسند</h3>
                <p className="text-xs text-muted-foreground mt-0.5">تفاصيل المسجد الذي يشرف عليه المدير الحالي: الاسم، ساعات العمل، الإمام والخطيب، والصورة الرسمية.</p>
              </div>
              <button
                onClick={() => setShowEditMosqueModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0 self-start sm:self-auto"
              >
                <Edit className="w-4 h-4" />
                <span>تعديل بيانات المسجد</span>
              </button>
            </div>

            {/* Mosque Hero Banner with Image */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-muted/30 border border-border rounded-2xl">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                {profile.mosque_image ? (
                  <img
                    src={profile.mosque_image}
                    alt={profile.mosque_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-primary gap-1">
                    <Building2 className="w-12 h-12" />
                    <span className="text-[10px] font-bold">لا توجد صورة</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-center md:text-right flex-1">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 inline-block mb-1.5">
                    مسجد نشط ومعتمد
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-foreground">{profile.mosque_name}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span>أوقات العمل: <strong className="text-foreground font-mono">{profile.working_hours || 'طوال اليوم'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>المنطقة: <strong className="text-foreground">{profile.address}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  اسم المسجد
                </span>
                <p className="text-sm font-bold text-foreground">{profile.mosque_name}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  أوقات وساعات العمل
                </span>
                <p className="text-sm font-mono font-bold text-foreground">{profile.working_hours || 'طوال اليوم (مفتوح للصلوات الخمس)'}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  إمام المسجد
                </span>
                <p className="text-sm font-bold text-foreground">{profile.imam_name || 'غير محدد'}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  خطيب الجمعة
                </span>
                <p className="text-sm font-bold text-foreground">{profile.khatib_name || 'غير محدد'}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium">رمز المسجد الرسمي</span>
                <p className="text-sm font-mono font-bold text-primary">{profile.mosque_code}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-muted-foreground font-medium">المدينة والمنطقة</span>
                <p className="text-sm font-bold text-foreground">{profile.address}</p>
              </div>
            </div>

            {/* Mosque Spaces & Halls Section */}
            {profile.mosque_id && (
              <div className="pt-4 border-t border-border">
                <MosqueSpacesSection
                  mosqueId={profile.mosque_id}
                  mosqueName={profile.mosque_name}
                  onAddDebugLog={addDebugLog}
                />
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: SECURITY & VERIFICATION ── */}
        {activeTab === 'security' && (
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">أمان الحساب والموثوقية</h3>
                <p className="text-xs text-muted-foreground mt-0.5">إعدادات كلمة المرور ومستوى التوثيق الأمني للحساب الإداري.</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
              >
                <Key className="w-3.5 h-3.5" />
                <span>تغيير كلمة المرور</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1">
                <span className="text-muted-foreground font-medium">حالة التوثيق</span>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4" />
                  <span>{profile.verification_level}</span>
                </p>
              </div>

              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1">
                <span className="text-muted-foreground font-medium">حالة الحساب</span>
                <p className="text-sm font-bold text-foreground">نشط ومفعل</p>
              </div>

              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1">
                <span className="text-muted-foreground font-medium">تاريخ إنشاء الحساب</span>
                <p className="text-sm font-mono font-bold text-foreground">{profile.created_at}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: SYSTEM SETTINGS (Super Admin) ── */}
        {isSuperAdmin && activeTab === 'settings' && (
          <SystemSettingsSection onAddDebugLog={addDebugLog} />
        )}

        {/* ── TAB 5: ACTIVITY AUDIT LOG (Non-Super Admin) ── */}
        {!isSuperAdmin && activeTab === 'activity' && (
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">سجل نشاط الحساب</h3>
              <p className="text-xs text-muted-foreground mt-0.5">تتبع زمني للعمليات والتعديلات المنفذة عبر الحساب.</p>
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

      {/* ── MODAL 1: Edit Profile (PUT /api/profile) - Email REMOVED as requested ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">تعديل بيانات الملف الشخصي</h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">الاسم الأول *</label>
                  <input
                    type="text"
                    required
                    value={editForm.first_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">اسم العائلة *</label>
                  <input
                    type="text"
                    required
                    value={editForm.last_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">رقم الجوال *</label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  dir="ltr"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl hover:bg-muted/80 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {submittingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>حفظ التعديلات</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit Mosque Details (name, image, working_hours, imam, khatib) ── */}
      {showEditMosqueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">تعديل بيانات المسجد</h3>
              </div>
              <button onClick={() => setShowEditMosqueModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              يمكنك هنا تعديل اسم المسجد، أوقات وساعات العمل، إمام المسجد، خطيب الجمعة، وصورة المسجد.
            </p>

            <form onSubmit={handleSaveMosqueDetails} className="space-y-4">
              {/* Mosque Image Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">صورة المسجد</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="معاينة" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 border border-border rounded-xl text-xs font-bold cursor-pointer text-foreground transition-all">
                    <Upload className="w-4 h-4 text-primary" />
                    <span>اختر صورة جديدة</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setMosqueEditForm(prev => ({ ...prev, image: file }));
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Mosque Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">اسم المسجد *</label>
                <input
                  type="text"
                  required
                  value={mosqueEditForm.name}
                  onChange={(e) => setMosqueEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: جامع الراجحي الكبير"
                  className="w-full px-3.5 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  dir="rtl"
                />
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">أوقات وساعات العمل *</label>
                <input
                  type="text"
                  required
                  value={mosqueEditForm.working_hours}
                  onChange={(e) => setMosqueEditForm(prev => ({ ...prev, working_hours: e.target.value }))}
                  placeholder="مثال: 5:00 AM - 10:00 PM أو طوال اليوم"
                  className="w-full px-3.5 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground font-mono"
                  dir="rtl"
                />
              </div>

              {/* Imam */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">إمام المسجد</label>
                <input
                  type="text"
                  value={mosqueEditForm.imam}
                  onChange={(e) => setMosqueEditForm(prev => ({ ...prev, imam: e.target.value }))}
                  placeholder="اسم إمام المسجد"
                  className="w-full px-3.5 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  dir="rtl"
                />
              </div>

              {/* Khatib */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">خطيب الجمعة</label>
                <input
                  type="text"
                  value={mosqueEditForm.khatib}
                  onChange={(e) => setMosqueEditForm(prev => ({ ...prev, khatib: e.target.value }))}
                  placeholder="اسم خطيب الجمعة"
                  className="w-full px-3.5 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  dir="rtl"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditMosqueModal(false)}
                  className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl hover:bg-muted/80 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingMosqueEdit}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {submittingMosqueEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري حفظ بيانات المسجد...</span>
                    </>
                  ) : (
                    <span>حفظ بيانات المسجد</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Change Password (PUT /api/profile) ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">تغيير كلمة المرور</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">كلمة المرور الجديدة *</label>
                <input
                  type="password"
                  required
                  value={passForm.password}
                  onChange={(e) => setPassForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">تأكيد كلمة المرور الجديدة *</label>
                <input
                  type="password"
                  required
                  value={passForm.password_confirmation}
                  onChange={(e) => setPassForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  dir="ltr"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl hover:bg-muted/80 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingPass}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {submittingPass ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التحديث...</span>
                    </>
                  ) : (
                    <span>تحديث كلمة المرور</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Confirm Email OTP (POST /api/profile/confirm-email) ── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">تأكيد البريد الإلكتروني الجديد</h3>
              <button onClick={() => setShowOtpModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              تم إرسال رمز تحقق (OTP) مكون من 6 أرقام إلى بريدك الجديد. يرجى إدخال الرمز لتثبيت البريد.
            </p>

            <form onSubmit={handleConfirmOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">رمز التحقق (OTP) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-muted border border-border focus:border-primary rounded-xl text-center text-lg font-mono font-black tracking-widest outline-none text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl hover:bg-muted/80 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingOtp}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {submittingOtp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التحقق...</span>
                    </>
                  ) : (
                    <span>تأكيد البريد</span>
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
