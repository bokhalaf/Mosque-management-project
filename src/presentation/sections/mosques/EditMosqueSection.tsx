'use client';
// ==============================
// Presentation Section — EditMosqueSection
// صفحة تعديل بيانات المسجد مطابقة تماماً لصفحة الإضافة ونظام التصميم وإرشادات Swagger / OpenAPI
// تتضمن عرض أخطاء الفالديشن (Validation Errors)، رفع الصورة، اختيار الموقع من الـ Geo Catalog، ومعاينة حية
// ==============================

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  Building2, Upload, X, MapPin, Clock, User, Star,
  CheckCircle2, Loader2, Sparkles, Navigation, Globe,
  ShieldCheck, AlertCircle, Info, ChevronRight, LocateFixed,
  ExternalLink, Compass, Layers, Terminal, RefreshCw, Save
} from 'lucide-react';
import { useMosques } from '../../hooks/useMosques';
import { useMosque } from '../../hooks/useMosque';
import { useToast } from '../../../app/components/ui/Toast';
import { QuranPeopleRepositoryImpl } from '../../../data/repositories/QuranPeopleRepositoryImpl';
import { QuranPerson } from '../../../domain/entities/QuranPeople';
import { InteractiveMapLocationPicker } from './components/InteractiveMapLocationPicker';

const cadresRepo = new QuranPeopleRepositoryImpl();

interface EditMosqueSectionProps {
  mosqueId: string | number;
  onBack: () => void;
  onSaveSuccess?: () => void;
}

export function EditMosqueSection({ mosqueId, onBack, onSaveSuccess }: EditMosqueSectionProps) {
  const { mosque, loading: loadingMosque } = useMosque(mosqueId);
  const {
    handleUpdateMosque,
    geoCatalog,
    geoLoading,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  } = useMosques();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [coordsPaste, setCoordsPaste] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);

  // Mosque Managers List from Cadres
  const [managersList, setManagersList] = useState<QuranPerson[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    workingHours: '5:00 AM - 10:00 PM',
    status: 'active' as 'active' | 'inactive' | 'maintenance' | 'closed',
    isFeatured: false,
    selectedGovId: '' as string | number,
    cityId: '' as string | number,
    districtId: '' as string | number,
    address: '',
    latitude: '',
    longitude: '',
    imam: '',
    khatib: '',
    managerId: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  // Load Managers
  useEffect(() => {
    const loadManagers = async () => {
      setLoadingManagers(true);
      try {
        const res = await cadresRepo.getPeople({ role: 'mosque_manager', per_page: 50 });
        if (res?.data) setManagersList(res.data);
      } catch (e) {
        console.warn('Failed to load mosque managers:', e);
      } finally {
        setLoadingManagers(false);
      }
    };
    loadManagers();
  }, []);

  // Populate data when mosque and geoCatalog are available
  useEffect(() => {
    if (mosque) {
      let matchedGovId: string | number = '';
      let matchedCityId = mosque.city_id ? String(mosque.city_id) : '';
      let matchedDistrictId = mosque.district_id ? String(mosque.district_id) : '';

      if (geoCatalog.length > 0) {
        // 1. Match governorate by city_id
        if (mosque.city_id) {
          const foundGov = geoCatalog.find(g => g.cities?.some(c => Number(c.id) === Number(mosque.city_id)));
          if (foundGov) {
            matchedGovId = foundGov.id;
            matchedCityId = String(mosque.city_id);
          }
        }

        // 2. Match by district_id if gov still not found
        if (!matchedGovId && mosque.district_id) {
          for (const gov of geoCatalog) {
            for (const city of (gov.cities || [])) {
              if (city.districts?.some(d => Number(d.id) === Number(mosque.district_id))) {
                matchedGovId = gov.id;
                matchedCityId = String(city.id);
                matchedDistrictId = String(mosque.district_id);
                break;
              }
            }
            if (matchedGovId) break;
          }
        }

        // 3. Match by city name if gov still not found
        if (!matchedGovId && mosque.city) {
          const cityQuery = String(mosque.city).trim().toLowerCase();
          for (const gov of geoCatalog) {
            const foundCity = gov.cities?.find(c => c.name.trim().toLowerCase() === cityQuery);
            if (foundCity) {
              matchedGovId = gov.id;
              matchedCityId = String(foundCity.id);
              break;
            }
          }
        }

        // 4. Default fallback if no match
        if (!matchedGovId && geoCatalog.length > 0) {
          matchedGovId = geoCatalog[0].id;
          if (!matchedCityId && geoCatalog[0].cities?.length > 0) {
            matchedCityId = String(geoCatalog[0].cities[0].id);
          }
        }
      }

      setFormData(prev => ({
        ...prev,
        name: mosque.name || '',
        workingHours: mosque.working_hours || '5:00 AM - 10:00 PM',
        status: (mosque.status as any) || 'active',
        isFeatured: Boolean(mosque.is_featured),
        selectedGovId: matchedGovId,
        cityId: matchedCityId,
        districtId: matchedDistrictId,
        address: mosque.address || '',
        latitude: mosque.latitude !== undefined && mosque.latitude !== null ? String(mosque.latitude) : '',
        longitude: mosque.longitude !== undefined && mosque.longitude !== null ? String(mosque.longitude) : '',
        imam: mosque.imam || '',
        khatib: mosque.khatib || '',
        managerId: mosque.manager_id ? String(mosque.manager_id) : '',
        imagePreview: mosque.image || null,
      }));
    }
  }, [mosque, geoCatalog]);

  // Extract cities based on selected governorate
  const currentGov = useMemo(() => {
    return geoCatalog.find(g => String(g.id) === String(formData.selectedGovId));
  }, [geoCatalog, formData.selectedGovId]);

  const availableCities = useMemo(() => {
    if (!currentGov) return [];
    return currentGov.cities || [];
  }, [currentGov]);

  const currentCity = useMemo(() => {
    return availableCities.find(c => String(c.id) === String(formData.cityId));
  }, [availableCities, formData.cityId]);

  const availableDistricts = useMemo(() => {
    return currentCity?.districts || [];
  }, [currentCity]);

  // Handle Governorate Change
  const handleGovChange = (govId: string) => {
    const gov = geoCatalog.find(g => String(g.id) === String(govId));
    const firstCity = gov?.cities?.[0];
    setFormData(prev => ({
      ...prev,
      selectedGovId: govId,
      cityId: firstCity?.id || gov?.id || '',
      districtId: '',
      latitude: firstCity?.lat ? String(firstCity.lat) : (gov?.lat ? String(gov.lat) : prev.latitude),
      longitude: firstCity?.lng ? String(firstCity.lng) : (gov?.lng ? String(gov.lng) : prev.longitude),
    }));
  };

  // Handle City Change
  const handleCityChange = (cityId: string) => {
    const city = availableCities.find(c => String(c.id) === String(cityId));
    const firstDist = city?.districts?.[0];
    setFormData(prev => ({
      ...prev,
      cityId,
      districtId: firstDist?.id ? String(firstDist.id) : '',
      latitude: city?.lat ? String(city.lat) : prev.latitude,
      longitude: city?.lng ? String(city.lng) : prev.longitude,
    }));
  };

  // Handle District Change
  const handleDistrictChange = (distId: string) => {
    const dist = availableDistricts.find(d => String(d.id) === String(distId));
    setFormData(prev => ({
      ...prev,
      districtId: distId,
      latitude: dist?.lat ? String(dist.lat) : prev.latitude,
      longitude: dist?.lng ? String(dist.lng) : prev.longitude,
    }));
  };

  // GPS Current Location Picker
  const handleGetLocationGPS = () => {
    if (!navigator.geolocation) {
      showToast('المتصفح لا يدعم جلب الموقع الجغرافي', 'error');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setFormData(prev => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
        }));
        setIsLocating(false);
        showToast('تم تحديد الإحداثيات الحالية بنجاح!', 'success');
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS error:', err);
        showToast('تعذر جلب موقع GPS. تأكد من منح إذن الموقع', 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Coordinates Parser from input / maps link
  const handleParseCoords = (val: string) => {
    setCoordsPaste(val);
    if (!val.trim()) return;
    const match = val.match(/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/);
    if (match && match[1] && match[3]) {
      setFormData(prev => ({
        ...prev,
        latitude: match[1],
        longitude: match[3],
      }));
      showToast('تم استخراج خط الطول والعرض وتعيينهما بنجاح', 'success');
    }
  };

  // Handle Image Change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
    }));
  };

  // Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationErrors(null);
    setServerErrorMessage(null);

    if (!formData.name.trim()) {
      showToast('يرجى إدخال اسم المسجد أو الجامع', 'error');
      return;
    }

    if (!formData.imam.trim()) {
      showToast('يرجى إدخال اسم إمام المسجد', 'error');
      return;
    }

    if (!formData.khatib.trim()) {
      showToast('يرجى إدخال اسم خطيب المسجد', 'error');
      return;
    }

    if (!formData.imagePreview) {
      showToast('يرجى اختيار صورة للمسجد', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const cityName = currentCity?.name || currentGov?.name || mosque?.city || 'دمشق';
      const districtName = availableDistricts.find(d => String(d.id) === String(formData.districtId))?.name || mosque?.district || '';

      await handleUpdateMosque(mosqueId, {
        name: formData.name.trim(),
        image: formData.imageFile || undefined,
        city_id: formData.cityId ? Number(formData.cityId) : (mosque?.city_id ? Number(mosque.city_id) : undefined),
        district_id: formData.districtId ? Number(formData.districtId) : (mosque?.district_id ? Number(mosque.district_id) : undefined),
        city: cityName,
        district: districtName,
        address: formData.address.trim() || undefined,
        latitude: formData.latitude !== '' ? String(formData.latitude) : undefined,
        longitude: formData.longitude !== '' ? String(formData.longitude) : undefined,
        working_hours: formData.workingHours.trim() || '5:00 AM - 10:00 PM',
        status: formData.status,
        is_featured: formData.isFeatured,
        imam: formData.imam.trim() || undefined,
        khatib: formData.khatib.trim() || undefined,
        manager_id: formData.managerId ? Number(formData.managerId) : undefined,
      });

      showToast('تم حفظ تعديلات المسجد بنجاح في قاعدة البيانات!', 'success');
      if (onSaveSuccess) {
        onSaveSuccess();
      } else {
        onBack();
      }
    } catch (err: any) {
      console.error('Error updating mosque:', err);
      // Capture and display validation errors from server response
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
      setServerErrorMessage(err.message || 'فشل تعديل بيانات المسجد');
      showToast(err.message || 'فشل تعديل بيانات المسجد', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingMosque) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title="تعديل بيانات المسجد" onBack={onBack} />
        <div className="px-4 md:px-8 max-w-7xl mx-auto w-full py-16 space-y-6">
          <div className="h-48 rounded-3xl bg-muted/60 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 rounded-3xl bg-muted/60 animate-pulse" />
            <div className="h-64 rounded-3xl bg-muted/60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const latNum = formData.latitude ? Number(formData.latitude) : 33.5138;
  const lngNum = formData.longitude ? Number(formData.longitude) : 36.2765;

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title={`تعديل بيانات: ${formData.name || mosque?.name || 'المسجد'}`}
        description="تحديث المعلومات الأساسية للمسجد، الكادر الإداري، الموقع الجغرافي، وساعات العمل."
        onBack={onBack}
        breadcrumbs={[
          { label: 'دليل المساجد' },
          { label: mosque?.name || 'المسجد' },
          { label: 'تعديل المسجد', active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="فحص استجابة الـ API"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Server Validation Error Banner (عرض أخطاء الفالديشن بوضوح) */}
        {(validationErrors || serverErrorMessage) && (
          <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-700 dark:text-red-400 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-black text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>تنبيه خطأ في التحقق من البيانات (Validation Error):</span>
            </div>
            <p className="text-xs font-bold leading-relaxed">{serverErrorMessage}</p>
            {validationErrors && (
              <ul className="list-disc list-inside space-y-1 text-xs font-semibold pt-1 border-t border-red-500/20">
                {Object.entries(validationErrors).map(([field, msgs]) => (
                  <li key={field}>
                    <span className="font-bold font-mono">{field}:</span> {Array.isArray(msgs) ? msgs.join(', ') : msgs}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Debug Terminal */}
        {showDebugTerminal && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                سجل اتصالات الـ API المباشرة (PUT /api/mosques/{mosqueId})
              </span>
              <button
                onClick={clearDebugLogs}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg transition-colors"
                title="مسح السجل"
              >
                مسح
              </button>
            </div>
            {debugLogs.length === 0 ? (
              <p className="text-slate-500 text-xs py-2">لا توجد سجلات مسجلة بعد — اضغط «حفظ التعديلات» لرؤية استجابة الـ API.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {debugLogs.map((log, i) => {
                  const isError = Number(log.status) >= 400 || String(log.status).includes('❌');
                  const validErrs: Record<string, string[]> | null =
                    log.response?.errors ?? log.response?.validationErrors ?? null;
                  const serverMsg: string | null =
                    log.response?.message ?? null;
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border space-y-2 ${
                        isError
                          ? 'bg-red-950/40 border-red-700/40'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-[11px] ${isError ? 'text-red-400' : 'text-emerald-400'}`}>
                          [{log.time}] {log.action}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          isError
                            ? 'bg-red-900/60 border-red-700 text-red-300'
                            : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                        }`}>
                          HTTP {log.status}
                        </span>
                      </div>

                      {/* URL */}
                      <p className="text-[10px] text-slate-400 font-mono break-all">{log.url}</p>

                      {/* Validation errors — highlighted block */}
                      {isError && validErrs && Object.keys(validErrs).length > 0 && (
                        <div className="p-2 bg-red-950/60 border border-red-600/40 rounded-lg space-y-1">
                          <p className="text-[10px] font-black text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            أخطاء التحقق (Validation Errors):
                          </p>
                          <ul className="space-y-0.5">
                            {Object.entries(validErrs).map(([field, msgs]) => (
                              <li key={field} className="text-[10px] text-red-300">
                                <span className="font-bold text-red-400 font-mono">{field}:</span>{' '}
                                {Array.isArray(msgs) ? msgs.join('، ') : String(msgs)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Server message (if error and no validation errors object) */}
                      {isError && serverMsg && !validErrs && (
                        <p className="text-[10px] text-red-300 font-semibold">
                          رسالة السيرفر: {serverMsg}
                        </p>
                      )}

                      {/* Full JSON response (collapsed by default for errors to save space) */}
                      <details className="group">
                        <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-300 select-none">
                          {isError ? '← عرض الرد الكامل (JSON)' : '← الرد الكامل'}
                        </summary>
                        <pre className="text-[10px] bg-slate-950 p-2 rounded mt-1 text-slate-300 overflow-x-auto max-h-40">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              {/* Header inside form */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-6 bg-primary rounded-full inline-block" />
                  <h3 className="text-base font-bold text-foreground">بيانات المسجد الأساسية</h3>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">الحقول المميزة بـ (*) مطلوبة</span>
              </div>

              {/* 1. Mosque Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  اسم المسجد أو الجامع *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: جامع الملك عبد الله الكبير، مسجد التقوى..."
                  className={`w-full px-4 py-2.5 bg-muted border rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground ${
                    validationErrors?.name ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-primary'
                  }`}
                  dir="rtl"
                />
                {validationErrors?.name && (
                  <p className="text-[11px] font-bold text-red-500">{validationErrors.name.join(', ')}</p>
                )}
              </div>

              {/* 2. Working Hours & Status & Featured Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Working Hours */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>أوقات العمل *</span>
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={formData.workingHours}
                      onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                      placeholder="مثال: 5:00 AM - 10:00 PM"
                      className="w-full px-4 py-2 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground font-mono ltr text-left"
                      required
                    />
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: 'الفجر - العشاء', val: '5:00 AM - 10:00 PM' },
                        { label: '24 ساعة', val: '12:00 AM - 11:59 PM' },
                        { label: 'الظهر - العشاء', val: '11:30 AM - 10:30 PM' },
                        { label: 'فترة موسعة', val: '4:30 AM - 11:00 PM' },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setFormData({ ...formData, workingHours: preset.val })}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                            formData.workingHours === preset.val
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status without emojis */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>الحالة التشغيلية *</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground cursor-pointer"
                    dir="rtl"
                  >
                    <option value="active">جاهز ونشط (Active)</option>
                    <option value="maintenance">تحت الصيانة (Maintenance)</option>
                    <option value="closed">مغلق مؤقتاً (Closed)</option>
                    <option value="inactive">غير نشط (Inactive)</option>
                  </select>
                </div>

                {/* Featured Checkbox */}
                <div className="space-y-1.5 flex flex-col justify-start">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>تمييز المسجد</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2.5 bg-muted/60 hover:bg-muted border border-border/50 rounded-xl cursor-pointer transition-colors h-[38px]">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Star className={`w-3.5 h-3.5 ${formData.isFeatured ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                      <span>تمييز</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Religious Staff (Imam & Khatib) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>اسم الإمام المسؤول *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.imam}
                    onChange={(e) => setFormData({ ...formData, imam: e.target.value })}
                    placeholder="مثال: الشيخ د. عبد الرحمن السديس"
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>اسم خطيب الجمعة *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.khatib}
                    onChange={(e) => setFormData({ ...formData, khatib: e.target.value })}
                    placeholder="مثال: الشيخ د. صالح بن حميد"
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* 5. Geographic Location & Geo Catalog */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-foreground">الموقع الجغرافي ودليل المناطق (Geo Catalog)</h4>
                  </div>
                  {geoLoading && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> جاري تحميل المناطق...
                    </span>
                  )}
                </div>

                {/* 3-Level Hierarchy: Governorate -> City -> District */}
                <div className={`grid grid-cols-1 gap-4 ${availableDistricts.length > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  {/* Governorate */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">1. المحافظة *</label>
                    <select
                      value={formData.selectedGovId}
                      onChange={(e) => handleGovChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                      dir="rtl"
                    >
                      {geoCatalog.map(gov => (
                        <option key={gov.id} value={gov.id}>{gov.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* City Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">2. المدينة *</label>
                    <select
                      value={formData.cityId}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                      dir="rtl"
                      required
                    >
                      {availableCities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Selection (Shown only when districts exist) */}
                  {availableDistricts.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">3. الحي / المنطقة</label>
                      <select
                        value={formData.districtId}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                        dir="rtl"
                      >
                        <option value="">اختر الحي...</option>
                        {availableDistricts.map(dist => (
                          <option key={dist.id} value={dist.id}>
                            {dist.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Street Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    العنوان التفصيلي والشارع
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="مثال: طريق الملك فهد، بجوار الحديقة العامة، شارع الإيمان"
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    dir="rtl"
                  />
                </div>

                {/* Interactive Map & GPS Location Picker */}
                <div className="p-4 md:p-5 bg-muted/30 border border-border rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
                    <Compass className="w-4 h-4 text-primary" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">تحديد الموقع الجغرافي للمسجد على الخريطة (GPS)</h4>
                      <p className="text-[11px] text-muted-foreground">يمكنك البحث بالاسم أو اختيار موقع المسجد مباشرة على الخريطة التفاعلية</p>
                    </div>
                  </div>

                  <InteractiveMapLocationPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                    address={formData.address}
                    onAddressSelect={(newAddress) => {
                      if (!formData.address) {
                        setFormData(prev => ({ ...prev, address: newAddress }));
                      }
                    }}
                  />

                  {/* Quick Paste Coordinate */}
                  <div className="space-y-1 pt-2 border-t border-border/40">
                    <label className="text-[11px] font-bold text-muted-foreground">
                      إلصاق سريع لإحداثيات أو رابط خرائط (مثال: 33.5138, 36.2765)
                    </label>
                    <input
                      type="text"
                      value={coordsPaste}
                      onChange={(e) => handleParseCoords(e.target.value)}
                      placeholder="الصق الإحداثيات هنا وسيقوم النظام باستخراجها وتعبئتها فوراً..."
                      className="w-full px-3 py-1.5 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Secondary Sidebar Column (4 Cols): Image Upload & Live Preview Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Image Upload Box */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  صورة المسجد الرئيسية
                </span>
                {formData.imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-[11px] text-red-500 font-bold hover:underline"
                  >
                    حذف الصورة
                  </button>
                )}
              </div>

              {formData.imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border group h-44 bg-muted">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow-lg">
                      تغيير الصورة
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40">
                  <div className="p-3 bg-primary/10 text-primary rounded-full mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">انقر لاختيار صورة المسجد</span>
                  <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG حتى 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Live Mosque Card Preview */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border pb-3">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>معاينة البطاقة في المنصة والتطبيقات</span>
              </div>

              <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
                <div className="relative h-40 w-full bg-muted overflow-hidden">
                  <img
                    src={formData.imagePreview || 'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=600&q=80'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-black shadow-md">
                    {formData.status === 'active' ? 'نشط ومهيأ' : formData.status === 'maintenance' ? 'تحت الصيانة' : 'غير نشط'}
                  </span>

                  {formData.isFeatured && (
                    <span className="absolute top-2.5 left-2.5 p-1 rounded-full bg-amber-500 text-white shadow-md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </span>
                  )}

                  <div className="absolute bottom-2.5 right-3 left-3 text-white">
                    <h4 className="text-sm font-black line-clamp-1">{formData.name || 'اسم المسجد...'}</h4>
                    <p className="text-[10px] text-white/80 font-bold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span>{currentCity?.name || 'المدينة'} - {availableDistricts.find(d => String(d.id) === String(formData.districtId))?.name || 'الحي'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 space-y-1.5 text-[11px] font-bold text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>الإمام:</span>
                    <span className="text-foreground">{formData.imam || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>الخطيب:</span>
                    <span className="text-foreground">{formData.khatib || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ساعات العمل:</span>
                    <span className="text-foreground font-mono">{formData.workingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSubmitting ? 'جاري حفظ التعديلات...' : 'حفظ التعديلات على المسجد'}</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 bg-card border border-border text-foreground font-bold text-xs rounded-xl hover:bg-muted transition-all text-center"
              >
                إلغاء والعودة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
