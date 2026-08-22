'use client';
// ==============================
// Presentation Section — MosqueDetailsSection (Full Page)
// صفحة عرض تفاصيل المسجد الكاملة متطابقة 100% مع وثائق Swagger / OpenAPI
// تتضمن لودينغ المسح (Skeleton Scan)، مراقب السيرفر المباشر للـ API، وأزرار التعديل والحذف
// ==============================

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  Building2, MapPin, Clock, User, CheckCircle2, Wrench,
  AlertCircle, Trash2, Edit3, Terminal, RefreshCw, Star,
  Compass, ExternalLink, ShieldCheck, Calendar, StarHalf,
  ChevronRight, ArrowRight, Eye, ShieldAlert, Award
} from 'lucide-react';
import { useMosque } from '../../hooks/useMosque';
import { useMosques } from '../../hooks/useMosques';
import { useToast } from '../../../app/components/ui/Toast';
import { DeleteConfirmModal } from '../../../app/components/ui/DeleteConfirmModal';

interface MosqueDetailsSectionProps {
  mosqueId: string | number;
  onBack: () => void;
  onNavigateToEdit?: (id: string | number) => void;
  onDeleteSuccess?: () => void;
}

export function MosqueDetailsSection({
  mosqueId,
  onBack,
  onNavigateToEdit,
  onDeleteSuccess,
}: MosqueDetailsSectionProps) {
  const { mosque, loading, error, fetchMosque } = useMosque(mosqueId);
  const { handleDeleteMosque, handleToggleFeatured, handleUpdateStatus } = useMosques();
  const { showToast } = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDebugTerminal, setShowDebugTerminal] = useState(false);
  const [debugLogs, setDebugLogs] = useState<any[]>([]);

  const addDebugLog = (action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-EG') },
      ...prev.slice(0, 19),
    ]);
  };

  // Automatic API Monitor Logger for GET /api/mosques/{id}
  useEffect(() => {
    if (mosqueId) {
      const url = `https://mms-backend-rose.vercel.app/api/mosques/${mosqueId}`;
      fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''}`
        }
      })
        .then(res => res.json().then(data => ({ status: res.status, data })))
        .then(({ status, data }) => {
          addDebugLog(`GET /api/mosques/${mosqueId}`, url, status, data);
        })
        .catch(err => {
          addDebugLog(`GET /api/mosques/${mosqueId} [FAILED]`, url, 500, { error: err.message });
        });
    }
  }, [mosqueId]);

  // Operational Status Changer (Clean, no emojis)
  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'maintenance' | 'closed') => {
    if (!mosque) return;
    setIsUpdatingStatus(true);
    try {
      await handleUpdateStatus(mosque.id, newStatus);
      addDebugLog(`PATCH /api/mosques/${mosque.id}/status`, `https://mms-backend-rose.vercel.app/api/mosques/${mosque.id}/status`, 200, { status: newStatus });
      showToast('تم تحديث الحالة التشغيلية للمسجد بنجاح', 'success');
      await fetchMosque();
    } catch (e: any) {
      showToast(e.message || 'فشل تحديث حالة المسجد', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Toggle Featured Star
  const handleToggleStar = async () => {
    if (!mosque) return;
    try {
      await handleToggleFeatured(mosque.id);
      addDebugLog(`POST /api/mosques/${mosque.id}/featured`, `https://mms-backend-rose.vercel.app/api/mosques/${mosque.id}/featured`, 200, { toggle: true });
      await fetchMosque();
    } catch (e: any) {
      showToast(e.message || 'فشل تغيير تمييز المسجد', 'error');
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!mosque) return;
    setIsDeleting(true);
    try {
      await handleDeleteMosque(mosque.id);
      addDebugLog(`DELETE /api/mosques/${mosque.id}`, `https://mms-backend-rose.vercel.app/api/mosques/${mosque.id}`, 200, { deleted_id: mosque.id });
      setShowDeleteModal(false);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        onBack();
      }
    } catch (e: any) {
      showToast(e.message || 'فشل حذف المسجد', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'غير محدد';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  // ── 1. SKELETON SCAN LOADING STATE (لودينغ المسح) ──────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader
          title="تفاصيل المسجد الجامع"
          description="جاري فحص وجلب بيانات المسجد والخدمات من السيرفر..."
          onBack={onBack}
          breadcrumbs={[
            { label: 'دليل المساجد' },
            { label: 'تفاصيل المسجد', active: true },
          ]}
        />

        <div className="px-4 md:px-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Scanning Header Banner Skeleton */}
          <div className="relative h-64 md:h-80 w-full rounded-3xl bg-muted/70 overflow-hidden border border-border animate-pulse shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            <div className="absolute bottom-6 right-6 left-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <div className="space-y-3 w-full md:w-1/2">
                <div className="h-8 w-3/4 bg-muted-foreground/20 rounded-2xl animate-pulse" />
                <div className="h-4 w-1/2 bg-muted-foreground/20 rounded-xl animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-28 bg-muted-foreground/20 rounded-xl animate-pulse" />
                <div className="h-10 w-28 bg-muted-foreground/20 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Stat Cards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="p-5 bg-card border border-border rounded-2xl animate-pulse space-y-3 shadow-sm">
                <div className="h-4 w-1/3 bg-muted rounded-md" />
                <div className="h-6 w-2/3 bg-muted rounded-lg" />
              </div>
            ))}
          </div>

          {/* Details Body Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 bg-card border border-border rounded-3xl animate-pulse space-y-4 shadow-sm">
                <div className="h-6 w-1/4 bg-muted rounded-md" />
                <div className="h-24 bg-muted/60 rounded-xl" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-card border border-border rounded-3xl animate-pulse space-y-4 shadow-sm">
                <div className="h-6 w-1/2 bg-muted rounded-md" />
                <div className="h-32 bg-muted/60 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. ERROR STATE ──────────────────────────────────────────────────────────
  if (error || !mosque) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title="تفاصيل المسجد" onBack={onBack} />
        <div className="px-4 md:px-8 max-w-2xl mx-auto w-full py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-foreground">{error || 'تعذر العثور على بيانات المسجد المطلوب'}</h2>
          <p className="text-xs text-muted-foreground font-bold">قد يكون المسجد قد تم حذفه أو أن الرابط غير صحيح.</p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-card border border-border text-foreground font-bold text-xs rounded-xl hover:bg-muted transition-all"
            >
              العودة للقائمة
            </button>
            <button
              onClick={fetchMosque}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 shadow-md transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      {/* Top Page Header */}
      <PageHeader
        title={mosque.name}
        description={`إدارة وتفاصيل ${mosque.name}، الكوادر الدينية، الحالة التشغيلية، وموقع المسجد.`}
        onBack={onBack}
        breadcrumbs={[
          { label: 'دليل المساجد' },
          { label: mosque.name, active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Edit Button */}
            <button
              onClick={() => onNavigateToEdit && onNavigateToEdit(mosque.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>تعديل بيانات المسجد</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/20 font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف المسجد</span>
            </button>

            {/* Live API Inspector Toggle */}
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="مراقب استجابة السيرفر المباشر"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{showDebugTerminal ? 'إخفاء مراقب الـ API' : 'مراقب الـ API المباشر'}</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Live Debug Terminal Box (مراقب استجابة السيرفر المباشر) */}
        {showDebugTerminal && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                مراقب الـ API المباشر — استجابة السيرفر (GET /api/mosques/{mosqueId})
              </span>
              <button
                onClick={() => setDebugLogs([])}
                className="text-[10px] text-slate-400 hover:text-white underline"
              >
                مسح السجل
              </button>
            </div>
            {debugLogs.length === 0 ? (
              <p className="text-slate-500 text-xs py-2">جاري الاتصال بالسيرفر وتسجيل الطلبات...</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {debugLogs.map((log, i) => (
                  <div key={i} className="p-2.5 bg-slate-950/90 rounded border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-emerald-400">
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

        {/* Hero Mosque Banner */}
        <div className="relative h-64 md:h-80 w-full rounded-3xl overflow-hidden border border-border shadow-md group">
          {mosque.image ? (
            <img
              src={mosque.image}
              alt={mosque.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-slate-900 to-slate-950 flex items-center justify-center">
              <Building2 className="w-24 h-24 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Top Overlays */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {mosque.status === 'active' && (
              <span className="px-3.5 py-1.5 bg-emerald-500/95 backdrop-blur-md text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> نشط ومهيأ
              </span>
            )}
            {mosque.status === 'maintenance' && (
              <span className="px-3.5 py-1.5 bg-amber-500/95 backdrop-blur-md text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> تحت الصيانة
              </span>
            )}
            {mosque.status === 'inactive' && (
              <span className="px-3.5 py-1.5 bg-red-500/95 backdrop-blur-md text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> غير نشط
              </span>
            )}
            {mosque.status === 'closed' && (
              <span className="px-3.5 py-1.5 bg-slate-700/95 backdrop-blur-md text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> مغلق مؤقتاً
              </span>
            )}
          </div>

          <button
            onClick={handleToggleStar}
            className={`absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md border transition-all shadow-lg ${
              mosque.is_featured
                ? 'bg-amber-500 text-white border-amber-400'
                : 'bg-black/50 border-white/20 text-white hover:bg-amber-500'
            }`}
            title={mosque.is_featured ? 'إلغاء التمييز' : 'تمييز المسجد في الصفحة الرئيسية'}
          >
            <Star className={`w-5 h-5 ${mosque.is_featured ? 'fill-current' : ''}`} />
          </button>

          {/* Bottom Banner Content */}
          <div className="absolute bottom-6 right-6 left-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 text-white">
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-black">{mosque.name}</h1>
              {([mosque.city, mosque.district, mosque.address].some(Boolean)) && (
                <p className="text-xs md:text-sm text-white/80 font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{[mosque.city, mosque.district].filter(Boolean).join(' - ') || mosque.address}</span>
                  {mosque.address && mosque.city && <span className="opacity-75">({mosque.address})</span>}
                </p>
              )}
            </div>

            {mosque.latitude && mosque.longitude && (
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps?q=${mosque.latitude},${mosque.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح بالخرائط</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Operational Status Switcher Card (Clean & Emoji-free) ── */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">الحالة التشغيلية للمسجد</h3>
                <p className="text-xs text-muted-foreground font-medium">
                  تحديث حالة إشهار المسجد واستقبال المصلين عبر طلب PATCH رسمي للسيرفر
                </p>
              </div>
            </div>

            {/* Quick Status Buttons without emojis */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => handleStatusChange('active')}
                disabled={isUpdatingStatus || mosque.status === 'active'}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  mosque.status === 'active'
                    ? 'bg-emerald-600 text-white shadow-md font-black'
                    : 'bg-muted/60 border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>نشط ومهيأ</span>
              </button>

              <button
                onClick={() => handleStatusChange('maintenance')}
                disabled={isUpdatingStatus || mosque.status === 'maintenance'}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  mosque.status === 'maintenance'
                    ? 'bg-amber-600 text-white shadow-md font-black'
                    : 'bg-muted/60 border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>تحت الصيانة</span>
              </button>

              <button
                onClick={() => handleStatusChange('closed')}
                disabled={isUpdatingStatus || mosque.status === 'closed'}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  mosque.status === 'closed'
                    ? 'bg-slate-700 text-white shadow-md font-black'
                    : 'bg-muted/60 border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>مغلق مؤقتاً</span>
              </button>

              <button
                onClick={() => handleStatusChange('inactive')}
                disabled={isUpdatingStatus || mosque.status === 'inactive'}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  mosque.status === 'inactive'
                    ? 'bg-red-600 text-white shadow-md font-black'
                    : 'bg-muted/60 border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>غير نشط</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Key Info Stat Cards (3 Clean Cards from Server) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              إمام المسجد
            </span>
            <p className="text-sm font-black text-foreground">{mosque.imam || '—'}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              خطيب الجمعة
            </span>
            <p className="text-sm font-black text-foreground">{mosque.khatib || '—'}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              أوقات العمل
            </span>
            <p className="text-sm font-black text-foreground font-mono ltr text-right">{mosque.working_hours || '—'}</p>
          </div>
        </div>

        {/* ── Details Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Info (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Detailed Info Card */}
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-base font-black text-foreground">بيانات المسجد الرسمية</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      المعلومات المسجلة لدى إدارة المساجد والأوقاف
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-1">
                  <span className="text-muted-foreground block text-[11px]">اسم المسجد الجامع:</span>
                  <span className="text-foreground text-sm font-black">{mosque.name}</span>
                </div>

                <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-1">
                  <span className="text-muted-foreground block text-[11px]">الحالة التشغيلية:</span>
                  <span className="text-foreground text-sm font-bold">
                    {mosque.status === 'active' ? 'نشط ومهيأ' : mosque.status === 'maintenance' ? 'تحت الصيانة' : mosque.status === 'closed' ? 'مغلق مؤقتاً' : 'غير نشط'}
                  </span>
                </div>

                <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-1">
                  <span className="text-muted-foreground block text-[11px]">المدينة:</span>
                  <span className="text-foreground text-sm font-bold">{mosque.city || '—'}</span>
                </div>

                <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-1">
                  <span className="text-muted-foreground block text-[11px]">الحي / المنطقة:</span>
                  <span className="text-foreground text-sm font-bold">{mosque.district || '—'}</span>
                </div>

                <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-1 md:col-span-2">
                  <span className="text-muted-foreground block text-[11px]">العنوان التفصيلي والشارع:</span>
                  <span className="text-foreground text-sm leading-relaxed">{mosque.address || '—'}</span>
                </div>
              </div>
            </div>

            {/* Dates & Auditing Card */}
            {(mosque.created_at || mosque.updated_at) && (
              <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-black text-foreground">سجل الإنشاء والتحديث</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                  {mosque.created_at && (
                    <div className="p-3 bg-muted/30 rounded-xl border border-border">
                      <span className="text-muted-foreground block text-[11px] mb-1">تاريخ التسجيل والإنشاء:</span>
                      <span className="text-foreground font-mono">{formatDate(mosque.created_at)}</span>
                    </div>
                  )}
                  {mosque.updated_at && (
                    <div className="p-3 bg-muted/30 rounded-xl border border-border">
                      <span className="text-muted-foreground block text-[11px] mb-1">آخر تحديث للبيانات:</span>
                      <span className="text-foreground font-mono">{formatDate(mosque.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Left Column: Location & Coordinates (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Geo & Location Card */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Compass className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-black text-foreground">الموقع الجغرافي والإحداثيات</h3>
              </div>

              <div className="space-y-3 text-xs font-bold text-foreground">
                <div className="p-3 bg-muted/40 rounded-xl border border-border">
                  <span className="text-muted-foreground block mb-1">المدينة والحي:</span>
                  <span>{[mosque.city, mosque.district].filter(Boolean).join(' - ') || '—'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-muted/40 rounded-xl border border-border">
                    <span className="text-muted-foreground block text-[10px]">Lat (العرض):</span>
                    <span>{mosque.latitude ?? '—'}</span>
                  </div>
                  <div className="p-2.5 bg-muted/40 rounded-xl border border-border">
                    <span className="text-muted-foreground block text-[10px]">Lng (الطول):</span>
                    <span>{mosque.longitude ?? '—'}</span>
                  </div>
                </div>

                {mosque.latitude && mosque.longitude ? (
                  <a
                    href={`https://www.google.com/maps?q=${mosque.latitude},${mosque.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-xl font-bold transition-all shadow-sm text-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>عرض في خرائط Google</span>
                  </a>
                ) : null}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-foreground">إجراءات المسجد</h3>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigateToEdit && onNavigateToEdit(mosque.id)}
                  className="w-full flex items-center justify-between p-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl text-xs font-bold text-primary transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    <span>تعديل بيانات المسجد</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-between p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-600 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>حذف المسجد من النظام</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="حذف المسجد نهائياً"
        description="هل أنت متأكد من رغبتك في حذف هذا المسجد من النظام بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء."
        itemName={mosque.name}
        confirmButtonText="نعم، احذف المسجد"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
