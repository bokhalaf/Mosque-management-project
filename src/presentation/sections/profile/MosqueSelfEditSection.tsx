'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from "../../app/components/PageHeader";
import {
  Building2, UserCheck, BookOpen, Clock, MapPin, Plus, Trash2,
  RefreshCw, CheckCircle2, AlertCircle, Save, Check,
  Car, Heart, Coffee, ShieldCheck, Sparkles, Layers, Volume2, ArrowRight
} from 'lucide-react';
import { useMosque } from "../hooks/useMosque";
import { UpdateMosquePayload, CreateSpacePayload, MosqueFacility } from "../../domain/entities/Mosque";

interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function MosqueDetailsSection() {
  const [activeMosqueId, setActiveMosqueId] = useState<string | number>(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('active_mosque_id');
      if (savedId) setActiveMosqueId(savedId);
    }
  }, []);

  const { mosque, loading, error, fetchMosque, updateMosque, addSpace, deleteSpace } = useMosque(activeMosqueId);

  // Mosque Edit Form State
  const [form, setForm] = useState<UpdateMosquePayload>({
    name: '',
    working_hours: '',
    status: 'active',
    imam: '',
    khatib: '',
    city: '',
    district: '',
    address: '',
    latitude: '',
    longitude: '',
    facilities: [],
  });

  const [facilitiesList, setFacilitiesList] = useState<MosqueFacility[]>([]);
  const [savingMosque, setSavingMosque] = useState<boolean>(false);

  // Add Custom Facility State
  const [showAddFacilityModal, setShowAddFacilityModal] = useState<boolean>(false);
  const [newFacilityName, setNewFacilityName] = useState<string>('');

  // Add Space Modal / Form State
  const [showSpaceModal, setShowSpaceModal] = useState<boolean>(false);
  const [spaceForm, setSpaceForm] = useState<CreateSpacePayload>({
    name: '',
    capacity: 100,
    description: '',
  });
  const [addingSpace, setAddingSpace] = useState<boolean>(false);

  // Live Debug Terminal State
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const addDebugLog = (action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev.slice(0, 15),
    ]);
  };

  useEffect(() => {
    if (mosque) {
      setForm({
        name: mosque.name || '',
        working_hours: mosque.working_hours || '',
        status: mosque.status || 'active',
        imam: mosque.imam || '',
        khatib: mosque.khatib || '',
        city: mosque.city || '',
        district: mosque.district || '',
        address: mosque.address || '',
        latitude: mosque.latitude || '',
        longitude: mosque.longitude || '',
        facilities: mosque.facilities || [],
      });
      setFacilitiesList(mosque.facilities || []);

      addDebugLog(
        `GET /api/mosques/${activeMosqueId}`,
        `https://mms-backend-rose.vercel.app/api/mosques/${activeMosqueId}`,
        200,
        { status: true, data: mosque }
      );
    }
  }, [mosque, activeMosqueId]);

  // Toggle Facility Status
  const handleToggleFacility = (id: number | string) => {
    setFacilitiesList(prev =>
      prev.map(f => String(f.id) === String(id) ? { ...f, is_enabled: !f.is_enabled } : f)
    );
  };

  // Add Custom Facility Item
  const handleAddCustomFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacilityName.trim()) return;

    const newItem: MosqueFacility = {
      id: Date.now(),
      name: newFacilityName.trim(),
      description: "مرفق خاص مضاف حديثاً بالمسجد",
      is_enabled: true,
    };

    setFacilitiesList(prev => [newItem, ...prev]);
    setNewFacilityName('');
    setShowAddFacilityModal(false);
  };

  // Submit Mosque Details Update
  const handleSaveMosque = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMosque(true);
    try {
      const payload: UpdateMosquePayload = {
        name: form.name?.trim(),
        working_hours: typeof form.working_hours === 'string' ? form.working_hours.trim() : form.working_hours,
        imam: form.imam?.trim(),
        khatib: form.khatib?.trim(),
        status: form.status,
        image: form.image,
        city_id: form.city_id,
        district_id: form.district_id,
        address: form.address,
        latitude: form.latitude,
        longitude: form.longitude,
        facilities: facilitiesList,
      };
      const updated = await updateMosque(payload);
      addDebugLog(
        `POST /api/mosques/${activeMosqueId} (_method=PUT)`,
        `https://mms-backend-rose.vercel.app/api/mosques/${activeMosqueId}`,
        200,
        { payload, response: updated }
      );
      alert("تم تحديث بيانات المسجد في السيرفر بنجاح!");
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حفظ بيانات المسجد بالسيرفر.");
    } finally {
      setSavingMosque(false);
    }
  };

  // Submit New Space Creation
  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceForm.name) return;

    setAddingSpace(true);
    try {
      const newSpace = await addSpace(spaceForm);
      addDebugLog(
        "POST /api/mosques/20/spaces",
        "https://mms-backend-rose.vercel.app/api/mosques/20/spaces",
        200,
        { payload: spaceForm, response: newSpace }
      );
      setShowSpaceModal(false);
      setSpaceForm({ name: '', capacity: 100, description: '' });
      alert("تم إضافة القاعة بنجاح!");
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء إضافة القاعة.");
    } finally {
      setAddingSpace(false);
    }
  };

  // Delete Space
  const handleDeleteSpace = async (spaceId: number | string, spaceName: string) => {
    if (!confirm(`هل أنت تأكد من حذف القاعة: "${spaceName}"؟`)) return;

    try {
      await deleteSpace(spaceId);
      addDebugLog(
        `DELETE /api/mosques/20/spaces/${spaceId}`,
        `https://mms-backend-rose.vercel.app/api/mosques/20/spaces/${spaceId}`,
        200,
        { deleted_space_id: spaceId }
      );
      alert("تم حذف القاعة بنجاح.");
    } catch (err: any) {
      alert(err.message || "فشل حذف القاعة.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground font-['Cairo']">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-bold">جاري تحميل بيانات المسجد والسجلات...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title="تحديث وإدارة بيانات المسجد والمرافق"
        description="صفحة موحدة لتحديث معلومات المسجد، ساعات التشغيل، تعيين الإمام والخطيب، وتفعيل المرافق (مواقف، مصلى نساء، برادات مياه)."
        breadcrumbs={[
          { label: "إدارة المسجد" },
          { label: "الملف الشخصي" },
          { label: "تعديل بيانات المسجد", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Back Button */}
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-card border border-border text-foreground rounded-xl text-xs font-bold transition-all shadow-sm"
              title="العودة لصفحة الملف الشخصي"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للملف الشخصي</span>
            </Link>

            <button
              onClick={fetchMosque}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-6">
        {/* ── SUMMARY BANNER: Imam, Khatib & Mosque Status Display ── */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-bold">إمام المسجد المعتمد:</span>
              <h4 className="text-xs font-black text-foreground">{form.imam || 'الشيخ د. عبد العزيز بن فهد العتيبي'}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-bold">خطيب الجمعة الرسمية:</span>
              <h4 className="text-xs font-black text-foreground">{form.khatib || 'الشيخ د. محمد بن إبراهيم آل الشيخ'}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-bold">حالة المسجد والمرافق:</span>
              <h4 className="text-xs font-black text-emerald-600">نشط وموثق بالكامل</h4>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveMosque} className="space-y-6">

          {/* ── CARD 1: Basic Mosque Info ── */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="text-base">1. معلومات المسجد الأساسية</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                حالة الحساب: نشط
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">اسم المسجد الرسمي *</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: مسجد الرحمة الجامع"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">ساعات العمل والتشغيل *</label>
                <input
                  type="text" required
                  value={form.working_hours}
                  onChange={(e) => setForm(prev => ({ ...prev, working_hours: e.target.value }))}
                  placeholder="5:00 AM - 10:00 PM"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground font-mono"
                />
              </div>


              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">المدينة *</label>
                <input
                  type="text" required
                  value={form.city}
                  onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="مثال: الرياض"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">الحي *</label>
                <input
                  type="text" required
                  value={form.district}
                  onChange={(e) => setForm(prev => ({ ...prev, district: e.target.value }))}
                  placeholder="مثال: حي النزهة"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="أدخل العنوان المباشر للمسجد (الشارع، المعالم القريبة)..."
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              {/* ── Mosque Image Upload / URL Field ── */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-muted-foreground">صورة المسجد الرسمية (Mosque Image)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted/30 border border-border rounded-2xl">
                  {form.image ? (
                    <div className="w-28 h-20 rounded-xl overflow-hidden border border-border relative bg-muted shrink-0 shadow-sm">
                      <img
                        src={typeof form.image === 'string' ? form.image : URL.createObjectURL(form.image)}
                        alt="صورة المسجد"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-28 h-20 rounded-xl bg-primary/10 text-primary border border-primary/20 flex flex-col items-center justify-center gap-1 shrink-0">
                      <Building2 className="w-6 h-6" />
                      <span className="text-[10px] font-bold">بدون صورة</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setForm(prev => ({ ...prev, image: file }));
                        }
                      }}
                      className="w-full text-xs text-muted-foreground file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={typeof form.image === 'string' ? form.image : ''}
                      onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="أو أدخل رابط صورة المسجد المباشرة (URL)..."
                      className="w-full px-3.5 py-2 bg-card border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: Assign Imam & Khatib (تحديد الإمام والخطيب) ── */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <UserCheck className="w-4 h-4 text-primary" />
                <h3 className="text-base">2. تحديد وتعيين الإمام والخطيب المعتمدين</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                تأكيد أسماء الإمام الرسمي المعتمد وخطيب الجمعة للتطبيقات واللوحات الرسمية.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <UserCheck className="w-4 h-4" />
                  <span>إمام المسجد الرئيسي *</span>
                </div>
                <input
                  type="text" required
                  value={form.imam}
                  onChange={(e) => setForm(prev => ({ ...prev, imam: e.target.value }))}
                  placeholder="مثال: الشيخ د. عبد العزيز بن فهد العتيبي"
                  className="w-full px-3.5 py-2.5 bg-card border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
                <p className="text-[11px] text-muted-foreground">الإمام المسجّل رسمياً لإمامة الصلوات الخمس.</p>
              </div>

              <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <BookOpen className="w-4 h-4" />
                  <span>خطيب الجمعة المعتمد *</span>
                </div>
                <input
                  type="text" required
                  value={form.khatib}
                  onChange={(e) => setForm(prev => ({ ...prev, khatib: e.target.value }))}
                  placeholder="مثال: الشيخ د. محمد بن إبراهيم آل الشيخ"
                  className="w-full px-3.5 py-2.5 bg-card border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
                <p className="text-[11px] text-muted-foreground">الخطيب الرسمي لإلقاء خطبة صلاة الجمعة.</p>
              </div>
            </div>
          </div>

          {/* ── CARD 3: Mosque Facilities & Services (مرافق المسجد: مواقف، مصلى نساء، برادات مياه...) ── */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h3 className="text-base">3. مرافق وخدمات المسجد (Mosque Facilities & Amenities)</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  تحديد وتفعيل كافة المرافق المتاحة بالمسجد مثل مواقف السيارات، مصلى النساء، برادات المياه، وتجهيزات ذوي الاحتياجات.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddFacilityModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-muted hover:bg-card text-foreground border border-border rounded-xl text-xs font-bold transition-all shrink-0"
              >
                <Plus className="w-4 h-4 text-primary" />
                <span>إضافة مرفق خاص</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facilitiesList.map((facility) => (
                <div
                  key={facility.id}
                  onClick={() => handleToggleFacility(facility.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    facility.is_enabled
                      ? 'bg-primary/[0.03] border-primary/40 shadow-sm'
                      : 'bg-muted/30 border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">{facility.name}</h4>
                      {facility.is_enabled && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          متاح
                        </span>
                      )}
                    </div>
                    {facility.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1">
                        {facility.description}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <input
                      type="checkbox"
                      checked={!!facility.is_enabled}
                      onChange={() => handleToggleFacility(facility.id)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Action: Save All Mosque Changes ── */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingMosque}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingMosque ? 'جاري حفظ التعديلات...' : 'حفظ كامل بيانات المسجد والمرافق والإمام والخطيب'}</span>
            </button>
          </div>
        </form>

        {/* ── CARD 4: Spaces & Halls Management (قاعات ومصليات المسجد) ── */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="text-base">4. قاعات ومصليات المسجد الداخلية (Mosque Spaces)</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">قائمة المصليات والقاعات المخصصة لإقامة الأنشطة والحلقات والصلوات.</p>
            </div>

            <button
              onClick={() => setShowSpaceModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قاعة جديدة</span>
            </button>
          </div>

          {(!mosque?.spaces || mosque.spaces.length === 0) ? (
            <div className="bg-muted/40 border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
              <Building2 className="w-10 h-10 text-muted-foreground" />
              <p className="text-xs font-bold text-foreground">لا توجد قاعات مسجلة حالياً</p>
              <button
                onClick={() => setShowSpaceModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl"
              >
                إضافة أول قاعة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mosque.spaces.map((sp) => (
                <div key={sp.id} className="bg-muted/30 border border-border rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">{sp.name}</h4>
                      <button
                        onClick={() => handleDeleteSpace(sp.id, sp.name)}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-card rounded-lg transition-all"
                        title="حذف القاعة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {sp.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{sp.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className="text-muted-foreground font-medium">الطاقة الاستيعابية:</span>
                    <span className="font-black text-foreground">{sp.capacity || 100} شخص</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL 1: Add Custom Facility ── */}
      {showAddFacilityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">إضافة مرفق أو خدمة جديدة للمسجد</h3>
              <button onClick={() => setShowAddFacilityModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">إلغاء</button>
            </div>

            <form onSubmit={handleAddCustomFacility} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">اسم المرفق / الخدمة *</label>
                <input
                  type="text" required
                  value={newFacilityName}
                  onChange={(e) => setNewFacilityName(e.target.value)}
                  placeholder="مثال: برادات مياه مبردة، مصعد كهربائي، مواقف سيارات"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddFacilityModal(false)} className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
                  إضافة المرفق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Add New Space ── */}
      {showSpaceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">إضافة قاعة جديدة للمسجد</h3>
              <button onClick={() => setShowSpaceModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">إلغاء</button>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">اسم القاعة *</label>
                <input
                  type="text" required
                  value={spaceForm.name}
                  onChange={(e) => setSpaceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: مصلى النساء العلوي، قاعة التحفيظ"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">الطاقة الاستيعابية (عدد الأشخاص)</label>
                <input
                  type="number" min={1}
                  value={spaceForm.capacity}
                  onChange={(e) => setSpaceForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                  placeholder="100"
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">وصف القاعة</label>
                <textarea
                  rows={2}
                  value={spaceForm.description}
                  onChange={(e) => setSpaceForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="أدخل وصفاً موجزاً للقاعة واستخداماتها..."
                  className="w-full px-3.5 py-2 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button type="button" onClick={() => setShowSpaceModal(false)} className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl">
                  إلغاء
                </button>
                <button type="submit" disabled={addingSpace} className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
                  {addingSpace ? 'جاري الإضافة...' : 'إضافة القاعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
