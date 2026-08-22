'use client';
// ==============================
// Presentation Section — CreateMosqueSection
// صفحة إضافة مسجد جديد مطابقة لنظام التصميم وإرشادات Swagger / OpenAPI
// تتضمن رفع الصورة، اختيار الموقع الجغرافي من الـ Geo Catalog، ومعاينة حية
// ==============================

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  Building2, Upload, X, MapPin, Clock, User, Star,
  CheckCircle2, Loader2, Sparkles, Navigation, Globe,
  ShieldCheck, AlertCircle, Info, ChevronRight, LocateFixed,
  ExternalLink, Compass, Layers, Terminal
} from 'lucide-react';
import { useMosques } from '../../hooks/useMosques';
import { useToast } from '../../../app/components/ui/Toast';
import { GeoGovernorate, GeoCity, GeoDistrict } from '../../../domain/entities/Mosque';
import { QuranPeopleRepositoryImpl } from '../../../data/repositories/QuranPeopleRepositoryImpl';
import { QuranPerson } from '../../../domain/entities/QuranPeople';
import { InteractiveMapLocationPicker } from './components/InteractiveMapLocationPicker';

const cadresRepo = new QuranPeopleRepositoryImpl();

interface CreateMosqueSectionProps {
  onBack: () => void;
}

export function CreateMosqueSection({ onBack }: CreateMosqueSectionProps) {
  const {
    handleCreateMosque,
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

  // Extract cities based on selected governorate
  const currentGov = useMemo(() => {
    return geoCatalog.find(g => String(g.id) === String(formData.selectedGovId));
  }, [geoCatalog, formData.selectedGovId]);

  const availableCities = useMemo(() => {
    if (!currentGov) return [];
    if (currentGov.cities && currentGov.cities.length > 0) return currentGov.cities;
    return [{ id: currentGov.id, name: currentGov.name, lat: currentGov.lat, lng: currentGov.lng, districts: [] }];
  }, [currentGov]);

  const currentCity = useMemo(() => {
    return availableCities.find(c => String(c.id) === String(formData.cityId));
  }, [availableCities, formData.cityId]);

  const availableDistricts = useMemo(() => {
    return currentCity?.districts || [];
  }, [currentCity]);

  // Set default governorate on load
  useEffect(() => {
    if (geoCatalog.length > 0 && !formData.selectedGovId) {
      const firstGov = geoCatalog[0];
      setFormData(prev => {
        const firstCity = firstGov.cities?.[0] || { id: firstGov.id, lat: firstGov.lat, lng: firstGov.lng };
        return {
          ...prev,
          selectedGovId: firstGov.id,
          cityId: firstCity?.id || '',
          latitude: firstCity?.lat ? String(firstCity.lat) : (firstGov.lat ? String(firstGov.lat) : ''),
          longitude: firstCity?.lng ? String(firstCity.lng) : (firstGov.lng ? String(firstGov.lng) : ''),
        };
      });
    }
  }, [geoCatalog]);

  // Handle Governorate Change
  const handleGovChange = (govId: string) => {
    const gov = geoCatalog.find(g => String(g.id) === String(govId));
    const firstCity = gov?.cities?.[0];
    setFormData(prev => ({
      ...prev,
      selectedGovId: govId,
      cityId: firstCity?.id || gov?.id || '',
      districtId: '',
      latitude: firstCity?.lat ? String(firstCity.lat) : (gov?.lat ? String(gov.lat) : ''),
      longitude: firstCity?.lng ? String(firstCity.lng) : (gov?.lng ? String(gov.lng) : ''),
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
        showToast('تم تحديد الإحداثيات الحالية لموقعك بنجاح!', 'success');
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS error:', err);
        showToast('تعذر جلب موقع GPS. يرجى التأكد من تفعيل إذن الموقع', 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Coordinates Parser from input / maps link
  const handleParseCoords = (val: string) => {
    setCoordsPaste(val);
    if (!val.trim()) return;

    // Pattern: 33.5138, 36.2765 or @33.5138,36.2765 or q=33.5138,36.2765
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
    if (!formData.name.trim()) {
      showToast('يرجى إدخال اسم المسجد أو الجامع', 'error');
      return;
    }

    if (!formData.cityId) {
      showToast('يرجى اختيار المدينة من دليل المناطق', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const cityName = currentCity?.name || currentGov?.name || 'الرياض';
      const districtName = availableDistricts.find(d => String(d.id) === String(formData.districtId))?.name || '';

      await handleCreateMosque({
        name: formData.name.trim(),
        image: formData.imageFile || undefined,
        city_id: Number(formData.cityId),
        district_id: formData.districtId ? Number(formData.districtId) : undefined,
        city: cityName,
        district: districtName || undefined,
        address: formData.address.trim() || undefined,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        working_hours: formData.workingHours.trim() || '5:00 AM - 10:00 PM',
        status: formData.status,
        is_featured: formData.isFeatured,
        imam: formData.imam.trim() || undefined,
        khatib: formData.khatib.trim() || undefined,
        manager_id: formData.managerId ? Number(formData.managerId) : undefined,
      });


      onBack();
    } catch (err: any) {
      console.error("Create Mosque Submit Error:", err);
      showToast(err.message || 'فشل إشهار المسجد، يرجى مراجعة البيانات المدخلة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCityName = currentCity?.name || currentGov?.name || 'المدينة المختارة';
  const selectedDistrictName = availableDistricts.find(d => String(d.id) === String(formData.districtId))?.name || '';
  const latNum = parseFloat(formData.latitude) || 33.5138;
  const lngNum = parseFloat(formData.longitude) || 36.2765;

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      {/* Page Header */}
      <PageHeader
        title="إضافة وإشهار مسجد جديد"
        description="تسجيل مسجد أو مجمع إسلامي جديد، تحديد موقعه الجغرافي بدقة، وإسناد كادره الإداري والديني."
        onBack={onBack}
        breadcrumbs={[
          { label: "الإدارة المركزية" },
          { label: "دليل المساجد" },
          { label: "إضافة مسجد", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="مراقب استجابة السيرفر المباشرة"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ والإشهار...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>إشهار وحفظ المسجد</span>
                </>
              )}
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-6">

        {/* Live Debug Inspector Box */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">مراقب الـ API المباشر لإضافة المسجد (Create Mosque Server Inspector)</h3>
              </div>
              <button
                type="button"
                onClick={clearDebugLogs}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg"
              >
                مسح السجل
              </button>
            </div>

            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic">لا توجد طلبات مسجلة حالياً. اضغط "إشهار وحفظ المسجد" لمعاينة استجابة السيرفر هنا فوراً.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto ltr text-left">
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
                  className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  dir="rtl"
                />
              </div>

              {/* 2. Working Hours & Status & Featured Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Working Hours */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      أوقات العمل (Working Hours) *
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">5:00 AM - 10:00 PM</span>
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


                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    الحالة التشغيلية *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                    dir="rtl"
                  >
                    <option value="active">جاهز ونشط (Active)</option>
                    <option value="maintenance">تحت الصيانة (Maintenance)</option>
                    <option value="closed">مغلق مؤقتاً (Closed)</option>
                    <option value="inactive">غير نشط (Inactive)</option>
                  </select>
                </div>

                {/* Featured Checkbox */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 bg-muted/60 hover:bg-muted border border-border/50 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Star className={`w-3.5 h-3.5 ${formData.isFeatured ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                      <span>تمييز في الواجهة</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 2: Geo Location Selection & Map Picker */}
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold text-foreground">الموقع الجغرافي والإحداثيات (Geo Catalog & Coordinates)</h4>
                  </div>
                  {geoLoading && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> جاري تحميل المناطق...
                    </span>
                  )}
                </div>

                {/* 3-Level Hierarchy: Governorate -> City -> District */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        <option key={gov.id} value={gov.id}>
                          {gov.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">2. المدينة (City ID) *</label>
                    <select
                      value={formData.cityId}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                      dir="rtl"
                      required
                    >
                      {availableCities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.name} (ID: {city.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">3. الحي / المنطقة (District)</label>
                    <select
                      value={formData.districtId}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                      dir="rtl"
                      disabled={availableDistricts.length === 0}
                    >
                      <option value="">{availableDistricts.length === 0 ? 'لا توجد أحياء فرعية مسجلة' : 'اختر الحي...'}</option>
                      {availableDistricts.map(dist => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name} (ID: {dist.id})
                        </option>
                      ))}
                    </select>
                  </div>
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

                {/* Interactive Location Controls: Map + GPS + Quick Paste */}
                <div className="p-4 md:p-5 bg-muted/30 border border-border rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
                    <Compass className="w-4 h-4 text-primary" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">تحديد الموقع الجغرافي للمسجد على الخريطة (GPS)</h4>
                      <p className="text-[11px] text-muted-foreground">يمكنك البحث بالاسم أو اختيار وتحديد إحداثيات المسجد بدقة على الخريطة التفاعلية</p>
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

                  {/* Quick Paste Coordinate / Maps Link */}
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

              {/* Section 3: Personnel & Manager Assignment */}
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">الكادر الإداري والديني</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">إمام المسجد</label>
                    <input
                      type="text"
                      value={formData.imam}
                      onChange={(e) => setFormData({ ...formData, imam: e.target.value })}
                      placeholder="مثال: الشيخ د. عبد الرحمن"
                      className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">خطيب الجمعة</label>
                    <input
                      type="text"
                      value={formData.khatib}
                      onChange={(e) => setFormData({ ...formData, khatib: e.target.value })}
                      placeholder="مثال: الشيخ د. صالح"
                      className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">مدير المسجد (Manager)</label>
                    <select
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                      dir="rtl"
                    >
                      <option value="">-- اختياري: اختر مدير المسجد --</option>
                      {managersList.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} (ID: {m.id}) {m.mosque_name ? `• ${m.mosque_name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Mosque Cover Image Upload */}
              <div className="pt-4 border-t border-border space-y-3">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  صورة غلاف المسجد (Mosque Image Upload)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {formData.imagePreview ? (
                    <div className="relative w-full sm:w-44 h-32 rounded-2xl overflow-hidden border border-border shrink-0 bg-muted group">
                      <img src={formData.imagePreview} alt="Mosque Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                        title="إزالة الصورة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}

                  <label className="w-full flex-1 border-2 border-dashed border-border hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all text-center">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {formData.imageFile ? formData.imageFile.name : 'انقر لاختيار أو سحب صورة المسجد هنا'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">صيغ مدعومة: JPG, PNG, WEBP حتى 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Bottom Submit Action */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ المسجد...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>إشهار وحفظ المسجد</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Live Card Preview & Quick Guides (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Mosque Card Preview */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <h4 className="text-xs font-bold text-foreground">معاينة بطاقة المسجد المباشرة</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary rounded-full">Live</span>
              </div>

              {/* Mosque Card Mockup */}
              <div className="bg-muted/30 border border-border/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={formData.imagePreview || 'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=800&q=80'}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {formData.isFeatured && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white rounded-xl text-[10px] font-bold shadow-md">
                        <Star className="w-3 h-3 fill-white" /> مميز
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md text-white ${
                      formData.status === 'active' ? 'bg-emerald-600' :
                      formData.status === 'maintenance' ? 'bg-amber-600' : 'bg-red-600'
                    }`}>
                      {formData.status === 'active' ? 'نشط' :
                       formData.status === 'maintenance' ? 'تحت الصيانة' : 'مغلق'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 left-3 text-white">
                    <h5 className="font-bold text-sm truncate">{formData.name || 'اسم المسجد يظهر هنا'}</h5>
                    <p className="text-[11px] text-white/80 flex items-center gap-1 truncate mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0 text-primary" />
                      <span>{selectedCityName} {selectedDistrictName ? `• ${selectedDistrictName}` : ''} {formData.address ? `• ${formData.address}` : ''}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px] border-b border-border/50 pb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {formData.workingHours}
                    </span>
                    <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {formData.latitude && formData.longitude ? `${Number(formData.latitude).toFixed(2)}, ${Number(formData.longitude).toFixed(2)}` : 'إحداثيات Geo'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">الإمام:</span>
                      <span className="font-bold text-foreground truncate block">{formData.imam || 'لم يُحدد'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">الخطيب:</span>
                      <span className="font-bold text-foreground truncate block">{formData.khatib || 'لم يُحدد'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Geo Integration & Guidelines Info Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground">توجيهات الربط الجغرافي</h4>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>الربط الهرمي (محافظة ثم مدينة ثم حي) يضمن صحة الـ `city_id` و `district_id` المطلوبة في الـ API.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>يمكنك استخدام زر GPS لتحديد إحداثيات المسجد الحالية بدقة أو لصق رابط Google Maps مباشرة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>المعاينة التفاعلية المباشرة للخريطة تتيح التحقق من الموقع قبل اعتماد الحفظ والإشهار.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}


