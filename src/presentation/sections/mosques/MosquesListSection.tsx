'use client';
// ==============================
// Presentation Section — MosquesListSection (Super Admin Only)
// ==============================

import React, { useState, useCallback } from 'react';
import { 
  Building2, Search, Plus, Star, MapPin, Clock, User, CheckCircle2, 
  Wrench, AlertCircle, Trash2, Edit3, Eye, Terminal, RefreshCw, X, ShieldCheck, Sparkles, Filter,
  ChevronRight, ChevronLeft, UserPlus, Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../app/components/PageHeader';
import { useMosques } from '../../hooks/useMosques';
import { MosqueDetail } from '../../../domain/entities/Mosque';
import { DeleteConfirmModal } from '../../../app/components/ui/DeleteConfirmModal';
import { InviteStaffModal } from '../cadres/components/InviteStaffModal';
import { QuranPeopleRepositoryImpl } from '../../../data/repositories/QuranPeopleRepositoryImpl';
import { useToast } from '../../../app/components/ui/Toast';

interface MosquesListSectionProps {
  onNavigateToAdd?: () => void;
  onViewDetails?: (id: string | number) => void;
  onNavigateToEdit?: (id: string | number) => void;
}

export function MosquesListSection({ 
  onNavigateToAdd, 
  onViewDetails, 
  onNavigateToEdit 
}: MosquesListSectionProps = {}) {
  const router = useRouter();

  const {
    mosques,
    filteredMosques,
    paginatedMosques,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    stats,
    loading,
    error,
    isSuperAdmin,
    actionLoadingId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    featuredFilter,
    setFeaturedFilter,
    cityFilter,
    setCityFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    geoCatalog,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
    loadMosques,
    handleToggleFeatured,
    handleUpdateStatus,
    handleCreateMosque,
    handleUpdateMosque,
    handleDeleteMosque,
  } = useMosques();

  const [selectedMosque, setSelectedMosque] = useState<MosqueDetail | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMosque, setEditingMosque] = useState<MosqueDetail | null>(null);
  const [mosqueToDelete, setMosqueToDelete] = useState<MosqueDetail | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Invite Mosque Manager Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteInitialMosqueId, setInviteInitialMosqueId] = useState<string | number | undefined>(undefined);
  const { showToast } = useToast();

  // Form State
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formImam, setFormImam] = useState('');
  const [formKhatib, setFormKhatib] = useState('');
  const [formWorkingHours, setFormWorkingHours] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive' | 'maintenance' | 'closed'>('active');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    if (onNavigateToAdd) {
      onNavigateToAdd();
      return;
    }
    setEditingMosque(null);
    setFormName('');
    setFormCity('الرياض');
    setFormDistrict('');
    setFormAddress('');
    setFormImam('');
    setFormKhatib('');
    setFormWorkingHours('5:00 AM - 10:00 PM');
    setFormStatus('active');
    setFormIsFeatured(false);
    setShowCreateModal(true);
  };

  const handleEditClick = (mosque: MosqueDetail) => {
    if (onNavigateToEdit) {
      onNavigateToEdit(mosque.id);
      return;
    }
    openEditModal(mosque);
  };

  const handleViewClick = (mosque: MosqueDetail) => {
    if (onViewDetails) {
      onViewDetails(mosque.id);
      return;
    }
    setSelectedMosque(mosque);
  };

  // Dynamically resolve City and District from Geo Catalog if string names are empty
  const getMosqueLocationText = useCallback((m: MosqueDetail) => {
    let cityName = m.city && typeof m.city === 'string' && isNaN(Number(m.city)) && m.city.trim() !== '' ? m.city : '';
    let districtName = m.district && typeof m.district === 'string' && isNaN(Number(m.district)) && m.district.trim() !== '' ? m.district : '';

    if (!cityName && m.city_id && geoCatalog && geoCatalog.length > 0) {
      for (const gov of geoCatalog) {
        const foundCity = gov.cities?.find(c => Number(c.id) === Number(m.city_id));
        if (foundCity) {
          cityName = foundCity.name;
          break;
        }
      }
    }

    if (!districtName && m.district_id && geoCatalog && geoCatalog.length > 0) {
      for (const gov of geoCatalog) {
        for (const city of (gov.cities || [])) {
          const foundDist = city.districts?.find(d => Number(d.id) === Number(m.district_id));
          if (foundDist) {
            districtName = foundDist.name;
            if (!cityName) cityName = city.name;
            break;
          }
        }
        if (districtName) break;
      }
    }

    const parts = [cityName, districtName].filter(Boolean);
    if (parts.length > 0) return parts.join(' - ');
    if (m.address) return m.address;
    return 'الموقع غير محدد';
  }, [geoCatalog]);

  const openEditModal = (mosque: MosqueDetail) => {
    setEditingMosque(mosque);
    setFormName(mosque.name);
    setFormCity(mosque.city || 'الرياض');
    setFormDistrict(mosque.district || '');
    setFormAddress(mosque.address || '');
    setFormImam(mosque.imam || '');
    setFormKhatib(mosque.khatib || '');
    setFormWorkingHours(mosque.working_hours || '5:00 AM - 10:00 PM');
    setFormStatus(mosque.status || 'active');
    setFormIsFeatured(Boolean(mosque.is_featured));
    setShowCreateModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!mosqueToDelete) return;
    setIsDeleting(true);
    try {
      await handleDeleteMosque(mosqueToDelete.id);
      setMosqueToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    try {
      if (editingMosque) {
        await handleUpdateMosque(editingMosque.id, {
          name: formName,
          city: formCity,
          district: formDistrict,
          address: formAddress,
          imam: formImam,
          khatib: formKhatib,
          working_hours: formWorkingHours,
          status: formStatus,
          is_featured: formIsFeatured,
        });
      } else {
        await handleCreateMosque({
          name: formName,
          city: formCity,
          district: formDistrict,
          address: formAddress,
          imam: formImam,
          khatib: formKhatib,
          working_hours: formWorkingHours,
          status: formStatus,
          is_featured: formIsFeatured,
        });
      }
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="إدارة مساجد المنطقة وتصنيفاتها"
        description="لوحة التحكم المركزية لإشهار المساجد والمصليات، إدارة الحالات التشغيلية والتمييز (خاص بالسوبر أدمن)."
        breadcrumbs={[
          { label: 'الإدارة المركزية' },
          { label: 'دليل المساجد', active: true },
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
              onClick={() => loadMosques()}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (onNavigateToAdd) {
                  onNavigateToAdd();
                } else {
                  router.push('/mosques/create');
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> إضافة مسجد جديد
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-8">

        {/* Live Debug Inspector */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">مراقب الـ API المباشر لخدمة المساجد (Mosques API Inspector)</h3>
              </div>
              <button
                onClick={clearDebugLogs}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg"
              >
                مسح السجل
              </button>
            </div>

            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic">لا توجد طلبات معالجة حالياً.</p>
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

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">إجمالي المساجد المسجلة</span>
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground">{stats.totalMosques}</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">مساجد نشطة ومهيأة</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600">{stats.activeMosques}</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">مساجد تحت الصيانة</span>
              <Wrench className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{stats.maintenanceMosques}</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">مساجد مميزة بالمقدمة</span>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-500">{stats.featuredMosques}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative w-full md:w-80 lg:w-96">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المساجد عبر السيرفر..."
                className="w-full pl-4 pr-10 py-2 bg-muted/50 border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* City & Sort Dropdowns */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary shrink-0"
              >
                <option value="all">جميع المدن والمحافظات</option>
                {geoCatalog.map((gov) => (
                  <optgroup key={gov.id} label={gov.name}>
                    <option value={gov.id}>{gov.name} (المحافظة)</option>
                    {gov.cities?.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split(':');
                  setSortBy(sb);
                  setSortOrder(so as 'asc' | 'desc');
                }}
                className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary shrink-0"
              >
                <option value="created_at:desc">الأحدث أولاً</option>
                <option value="name:asc">الاسم (أ - ي)</option>
                <option value="name:desc">الاسم (ي - أ)</option>
                <option value="average_rating:desc">الأعلى تقييماً</option>
                <option value="city:asc">المدينة</option>
              </select>

              {(statusFilter !== 'all' || featuredFilter !== 'all' || cityFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setFeaturedFilter('all');
                    setCityFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                  title="إلغاء جميع الفلاتر"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>إعادة تعيين</span>
                </button>
              )}
            </div>
          </div>

          {/* Status & Featured Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-border/60">
            <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground shrink-0 pl-1">
              <Filter className="w-3.5 h-3.5" /> الحالة:
            </div>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'active', label: 'نشط' },
              { id: 'maintenance', label: 'تحت الصيانة' },
              { id: 'inactive', label: 'غير نشط' },
              { id: 'closed', label: 'مغلق' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === s.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}

            <div className="h-4 w-px bg-border my-auto mx-1 shrink-0" />

            <button
              onClick={() => setFeaturedFilter(featuredFilter === 'featured' ? 'all' : 'featured')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                featuredFilter === 'featured'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-muted/50 border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>المميزة فقط</span>
            </button>
          </div>
        </div>

        {/* Mosques Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-card border border-border rounded-3xl p-6 animate-pulse space-y-4 shadow-sm">
                <div className="h-40 bg-muted rounded-2xl w-full" />
                <div className="h-6 w-2/3 bg-muted rounded-md" />
                <div className="h-4 w-full bg-muted rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 bg-card border border-border rounded-3xl">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-bold text-foreground">{error}</h3>
            <button
              onClick={() => loadMosques()}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : totalItems === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm space-y-3">
            <Building2 className="w-12 h-12 text-muted-foreground/40" />
            <h3 className="text-base font-black text-foreground">لا توجد مساجد مطابقة للبحث</h3>
            <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto">
              قم بإضافة مسجد جديد أو تعديل خيارات البحث والتصفية.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedMosques.map((mosque) => (
                <div
                  key={mosque.id}
                  className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between group"
                >
                  {/* Image & Header Overlay */}
                  <div className="relative h-44 w-full bg-muted overflow-hidden">
                    <img
                      src={mosque.image}
                      alt={mosque.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {mosque.status === 'active' && (
                        <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black rounded-full shadow-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> نشط
                        </span>
                      )}
                      {mosque.status === 'maintenance' && (
                        <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black rounded-full shadow-md flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> تحت الصيانة
                        </span>
                      )}
                      {mosque.status === 'inactive' && (
                        <span className="px-3 py-1 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black rounded-full shadow-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> غير نشط
                        </span>
                      )}
                      {mosque.status === 'closed' && (
                        <span className="px-3 py-1 bg-slate-600/90 backdrop-blur-md text-white text-[10px] font-black rounded-full shadow-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> مغلق مؤقتاً
                        </span>
                      )}
                    </div>

                    {/* Toggle Featured Star Button */}
                    <button
                      onClick={() => handleToggleFeatured(mosque.id)}
                      disabled={actionLoadingId === mosque.id}
                      className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md border transition-all shadow-md ${
                        mosque.is_featured
                          ? 'bg-amber-500 text-white border-amber-400'
                          : 'bg-black/40 border-white/20 text-white hover:bg-amber-500'
                      }`}
                      title={mosque.is_featured ? 'إلغاء التمييز' : 'تمييز المسجد في الصفحة الرئيسية'}
                    >
                      <Star className={`w-4 h-4 ${mosque.is_featured ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 right-3 left-3 text-white">
                      <h3 
                        onClick={() => handleViewClick(mosque)}
                        className="text-lg font-black line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                      >
                        {mosque.name}
                      </h3>
                      <p className="text-xs text-white/80 font-bold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span>{getMosqueLocationText(mosque)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 text-xs font-bold text-muted-foreground">
                      <div className="flex items-center justify-between py-1 border-b border-border/40">
                        <span>الإمام المسؤول:</span>
                        <span className="text-foreground">{mosque.imam || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-border/40">
                        <span>الخطيب:</span>
                        <span className="text-foreground">{mosque.khatib || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>ساعات العمل:</span>
                        <span className="text-foreground font-mono ltr">{mosque.working_hours || '5:00 AM - 10:00 PM'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                      {/* Status Switcher Quick Menu (Clean, without emojis) */}
                      <select
                        value={mosque.status || 'active'}
                        onChange={(e: any) => handleUpdateStatus(mosque.id, e.target.value)}
                        disabled={actionLoadingId === mosque.id}
                        className="px-2.5 py-1.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer hover:bg-muted transition-colors"
                      >
                        <option value="active">نشط ومهيأ</option>
                        <option value="maintenance">تحت الصيانة</option>
                        <option value="inactive">غير نشط</option>
                        <option value="closed">مغلق مؤقتاً</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setInviteInitialMosqueId(mosque.id);
                            setInviteModalOpen(true);
                          }}
                          className="p-2 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-500/20 rounded-xl transition-all shadow-sm"
                          title="إرسال دعوة تعيين مدير لهذا المسجد"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleViewClick(mosque)}
                          className="p-2 bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground rounded-xl transition-all shadow-sm"
                          title="عرض التفاصيل الكاملة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleEditClick(mosque)}
                          className="p-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl transition-all shadow-sm"
                          title="تعديل المسجد"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setMosqueToDelete(mosque)}
                          disabled={actionLoadingId === mosque.id}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                          title="حذف المسجد"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls (6 items per page) */}
            {totalPages > 1 && (
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <p className="text-xs text-muted-foreground font-bold">
                  عرض <span className="text-foreground font-black">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
                  <span className="text-foreground font-black">{Math.min(currentPage * itemsPerPage, totalItems)}</span> من إجمالي{' '}
                  <span className="text-primary font-black">{totalItems}</span> مسجد
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          currentPage === page
                            ? 'bg-primary text-primary-foreground shadow-sm font-black'
                            : 'bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span>التالي</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Details Modal */}
      {selectedMosque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black text-foreground">بطاقة تفاصيل المسجد الكاملة</h3>
              </div>
              <button
                onClick={() => setSelectedMosque(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="h-48 rounded-2xl overflow-hidden relative">
                <img src={selectedMosque.image} alt={selectedMosque.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <h2 className="absolute bottom-4 right-4 text-xl font-black text-white">{selectedMosque.name}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-foreground">
                <div className="p-3 bg-muted/40 rounded-xl border border-border">
                  <span className="text-muted-foreground block mb-1">المدينة والحي:</span>
                  <span>{getMosqueLocationText(selectedMosque)}</span>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border">
                  <span className="text-muted-foreground block mb-1">العنوان التفصيلي:</span>
                  <span>{selectedMosque.address || 'العنوان الرئيسي'}</span>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border">
                  <span className="text-muted-foreground block mb-1">الإمام المسؤول:</span>
                  <span>{selectedMosque.imam || 'غير محدد'}</span>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border">
                  <span className="text-muted-foreground block mb-1">خطيب الجمعة:</span>
                  <span>{selectedMosque.khatib || 'غير محدد'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end">
              <button
                onClick={() => setSelectedMosque(null)}
                className="px-5 py-2.5 bg-card border border-border text-foreground font-bold text-xs rounded-xl hover:bg-muted transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create / Edit Mosque Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-black text-foreground">
                {editingMosque ? 'تعديل بيانات المسجد' : 'إضافة وتصنيف مسجد جديد'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">اسم المسجد الجامع *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: جامع الملك فهد الكبير..."
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">المدينة</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">الحي السكني</label>
                  <input
                    type="text"
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    placeholder="حي العليا..."
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">اسم الإمام</label>
                  <input
                    type="text"
                    value={formImam}
                    onChange={(e) => setFormImam(e.target.value)}
                    placeholder="الشيخ الإمام..."
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">اسم الخطيب</label>
                  <input
                    type="text"
                    value={formKhatib}
                    onChange={(e) => setFormKhatib(e.target.value)}
                    placeholder="الشيخ الخطيب..."
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  ساعات العمل
                </label>
                <input
                  type="text"
                  value={formWorkingHours}
                  onChange={(e) => setFormWorkingHours(e.target.value)}
                  placeholder="5:00 AM - 10:00 PM"
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary font-mono ltr text-left"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">حالة المسجد</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="active">نشط ومهيأ</option>
                    <option value="maintenance">تحت الصيانة</option>
                    <option value="inactive">غير نشط</option>
                    <option value="closed">مغلق مؤقتاً</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">تمييز المسجد</label>
                  <label className="flex items-center gap-2 px-3 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground cursor-pointer h-[38px]">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                    />
                    <span>تمييز</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-card border border-border text-foreground font-bold text-xs rounded-xl hover:bg-muted transition-all"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingMosque ? 'حفظ التعديلات' : 'إضافة المسجد'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(mosqueToDelete)}
        title="حذف المسجد نهائياً"
        description="هل أنت متأكد من رغبتك في حذف هذا المسجد من النظام بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء."
        itemName={mosqueToDelete?.name}
        confirmButtonText="نعم، احذف المسجد"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setMosqueToDelete(null)}
      />

      {/* MODAL 4: Invite Mosque Manager Modal */}
      {inviteModalOpen && (
        <InviteStaffModal
          onClose={() => {
            setInviteModalOpen(false);
            setInviteInitialMosqueId(undefined);
          }}
          isSuperAdmin={true}
          initialRole="mosque_manager"
          initialMosqueId={inviteInitialMosqueId}
          mosquesList={mosques}
          onSendInvitation={async (payload) => {
            const quranRepo = new QuranPeopleRepositoryImpl();
            const res = await quranRepo.sendInvitation(payload);
            if (res.success) {
              showToast(res.message || 'تم إرسال دعوة مدير المسجد بنجاح عبر السيرفر ✅', 'success');
            } else {
              showToast(res.message || 'تعذر إرسال الدعوة من السيرفر', 'error');
            }
            return res;
          }}
        />
      )}
    </div>
  );
}
