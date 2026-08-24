'use client';
// ==============================
// KhutbahsListSection — Wrapper (Clean & Design System Aligned)
// ==============================

import React, { useState } from 'react';
import { Plus, Clock, History, RefreshCw, BookOpen, AlertCircle, ChevronRight, ChevronLeft, Star, Check, X, ShieldCheck, Archive, User, Eye, Send } from 'lucide-react';
import { PageHeader } from '../../../app/components/PageHeader';
import { useSermons } from '../../hooks/useSermons';
import { FridaySermonBanner } from './components/FridaySermonBanner';
import { SermonFilterBar } from './components/SermonFilterBar';
import { SermonCard } from './components/SermonCard';
import { PendingModal } from './components/PendingModal';
import { HistoryModal } from './components/HistoryModal';

interface KhutbahsListSectionProps {
  onNavigateToAdd?: () => void;
  onViewDetails?: (id: string | number) => void;
}

export function KhutbahsListSection({ onNavigateToAdd, onViewDetails }: KhutbahsListSectionProps) {
  const {
    pendingSermons,
    mostSelectedSermon,
    upcomingSelection,
    selectionsHistory,
    filteredSermons,
    archivedPagination,
    setArchivedPage,
    pendingPagination,
    setPendingPage,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    selectingSermonId,
    error,
    loadData,
    handleSelectForFriday,
    handleCancelFridaySelection,
    handleDeletePendingSermon,
    handleApprovePendingSermon,
    handleRejectPendingSermon,
    deletingSermonId,
    processingSermonId,
  } = useSermons();

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'archived'>('pending');

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const roles: string[] = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
          if (roles.includes('super_admin') || Boolean(user.is_super_admin)) {
            setIsSuperAdmin(true);
            setActiveTab('pending');
          } else {
            setActiveTab('archived');
          }
        }
      } catch (e) {}
    }
  }, []);

  const totalItems = archivedPagination.totalItems || filteredSermons.length;
  const currentPage = archivedPagination.currentPage || 1;
  const itemsPerPage = archivedPagination.itemsPerPage || 6;
  const totalPages = Math.max(1, archivedPagination.totalPages || Math.ceil(totalItems / itemsPerPage));

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="مكتبة وإدارة خطب المسجد"
        description="استعراض المكتبة والخطب المؤرشفة للإعتماد، مع استعراض الخطبة المختارة للجمعة القادمة والسجلات."
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'خطب المسجد', active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {!isSuperAdmin && (
              <>
                <button
                  onClick={() => setShowPendingModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 rounded-xl text-xs font-bold transition-all shadow-sm relative"
                  title="عرض الخطب المنتظرة للاعتماد"
                >
                  <Clock className="w-4 h-4 text-primary" />
                  <span>قيد الانتظار</span>
                  {pendingPagination.totalItems > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary text-primary-foreground font-black">
                      {pendingPagination.totalItems}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm"
                  title="عرض سجل الخطب المختارة للجمعة"
                >
                  <History className="w-4 h-4 text-primary" />
                  <span>السجل ({selectionsHistory.length})</span>
                </button>
              </>
            )}

            <button
              onClick={loadData}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات من السيرفر"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {!isSuperAdmin && (
              <button
                onClick={onNavigateToAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> إضافة خطبة جديدة
              </button>
            )}
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-8">
        {/* Large Most Selected Sermon Banner — ONLY FOR SUPER ADMIN */}
        {isSuperAdmin && mostSelectedSermon && (
          <div className="bg-gradient-to-l from-primary/15 via-card to-card border border-primary/30 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-black rounded-full flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                    الأكثر اختياراً
                  </span>
                  <span className="text-xs text-muted-foreground font-bold">
                    توصية عامة
                  </span>
                </div>

                <h2
                  onClick={() => {
                    const id = Array.isArray(mostSelectedSermon) ? mostSelectedSermon[0]?.id : mostSelectedSermon.id;
                    if (onViewDetails && id) onViewDetails(id);
                  }}
                  className="text-xl md:text-2xl font-black text-foreground hover:text-primary cursor-pointer transition-colors"
                >
                  {Array.isArray(mostSelectedSermon) ? mostSelectedSermon[0]?.title : mostSelectedSermon.title}
                </h2>

                <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" />
                  {Array.isArray(mostSelectedSermon) ? (mostSelectedSermon[0]?.speaker_name || mostSelectedSermon[0]?.preacher) : (mostSelectedSermon.speaker_name || mostSelectedSermon.preacher || 'الشيخ الخطيب')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {onViewDetails && (
                  <button
                    onClick={() => {
                      const id = Array.isArray(mostSelectedSermon) ? mostSelectedSermon[0]?.id : mostSelectedSermon.id;
                      if (id) onViewDetails(id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-2xl text-xs font-bold transition-all shadow-sm"
                    title="عرض التفاصيل"
                  >
                    <Eye className="w-4 h-4" />
                    <span>عرض التفاصيل</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Friday Sermon Hero Banner for Mosque Manager */}
        {!isSuperAdmin && upcomingSelection && (
          <FridaySermonBanner
            upcomingSelection={upcomingSelection}
            onViewDetails={onViewDetails}
            onCancelSelection={handleCancelFridaySelection}
          />
        )}

        {/* Compact Most Selected Sermon Recommendation Pill — FOR MOSQUE MANAGER ONLY */}
        {!isSuperAdmin && mostSelectedSermon && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 min-w-0">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0 animate-pulse" />
              <span className="shrink-0 font-black">توصية النظام (الخطبة الأكثر استخدماً):</span>
              <span className="truncate text-foreground font-extrabold">
                {Array.isArray(mostSelectedSermon) ? mostSelectedSermon[0]?.title : mostSelectedSermon.title}
              </span>
            </div>
            {onViewDetails && (
              <button
                onClick={() => {
                  const id = Array.isArray(mostSelectedSermon) ? mostSelectedSermon[0]?.id : mostSelectedSermon.id;
                  if (id) onViewDetails(id);
                }}
                className="px-3.5 py-1.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shrink-0 text-xs shadow-sm flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>عرض الخطبة</span>
              </button>
            )}
          </div>
        )}

        {/* Section Tabs Switcher ONLY FOR SUPER ADMIN */}
        {isSuperAdmin && (
          <div className="flex items-center gap-3 border-b border-border pb-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                activeTab === 'pending'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>قسم طلبات الخطب (قيد الاعتماد)</span>
              {pendingPagination.totalItems > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'pending' ? 'bg-white text-primary' : 'bg-primary/20 text-primary'
                }`}>
                  {pendingPagination.totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('archived')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                activeTab === 'archived'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>قسم الخطب المؤرشفة</span>
              {archivedPagination.totalItems > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'archived' ? 'bg-white text-primary' : 'bg-primary/20 text-primary'
                }`}>
                  {archivedPagination.totalItems}
                </span>
              )}
            </button>
          </div>
        )}

        {/* TAB 1: Pending Sermons Requests (قسم طلبات الخطب - ONLY FOR SUPER ADMIN when activeTab === 'pending') */}
        {isSuperAdmin && activeTab === 'pending' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">طلبات واعتمادات الخطب قيد الانتظار</h3>
                <p className="text-xs text-muted-foreground font-medium">يمكن للسوبر أدمن قبول أو رفض أو مراجعة طلبات الخطب المرفوعة.</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-card border border-border rounded-2xl p-6 animate-pulse space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-muted rounded-md" />
                      <div className="h-6 w-20 bg-muted rounded-full" />
                    </div>
                    <div className="h-6 w-5/6 bg-muted rounded-md" />
                    <div className="h-4 w-full bg-muted rounded-md" />
                    <div className="h-4 w-2/3 bg-muted rounded-md" />
                    <div className="pt-4 border-t border-border flex justify-between items-center">
                      <div className="h-9 w-24 bg-muted rounded-xl" />
                      <div className="h-9 w-28 bg-muted rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingSermons.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm space-y-3">
                <Clock className="w-12 h-12 text-muted-foreground/50" />
                <h4 className="text-sm font-bold text-foreground">لا توجد طلبات خطب قيد الانتظار حالياً</h4>
                <p className="text-xs text-muted-foreground font-medium">جميع الطلبات تمت معالجتها واعتلاؤها بنجاح.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pendingSermons.map((sermon) => (
                    <div
                      key={sermon.id}
                      onClick={() => onViewDetails && onViewDetails(sermon.id)}
                      className="bg-card border border-border hover:border-primary/50 hover:bg-muted/20 rounded-2xl p-6 shadow-sm space-y-4 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          طلب قيد المراجعة
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">{sermon.sermon_date}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {sermon.title}
                        </h4>
                        <p className="text-xs font-bold text-primary">الخطيب: {sermon.speaker_name || sermon.preacher || 'غير محدد'}</p>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 bg-muted/50 p-3 rounded-xl border border-border">
                        {sermon.content || 'لا يوجد نص توضيحي مدخل.'}
                      </p>

                      {/* Open Details For Review & Decision */}
                      <div className="pt-3 border-t border-border flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onViewDetails && onViewDetails(sermon.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20"
                        >
                          <Eye className="w-4 h-4" />
                          <span>مراجعة نص الخطبة واتخاذ القرار (قبول / رفض)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pending Sermons Pagination Bar (6 per page) */}
                {pendingPagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-border bg-card rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground">
                      عرض {(pendingPagination.currentPage - 1) * 6 + 1} - {Math.min(pendingPagination.currentPage * 6, pendingPagination.totalItems)} من أصل {pendingPagination.totalItems} خطبة قيد الاعتماد
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPendingPage(pendingPagination.currentPage - 1)}
                        disabled={pendingPagination.currentPage <= 1}
                        className="px-3.5 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        السابق
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: pendingPagination.totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPendingPage(p)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                              pendingPagination.currentPage === p
                                ? 'bg-primary text-primary-foreground font-black shadow-md shadow-primary/20'
                                : 'bg-card border border-border text-foreground hover:bg-muted'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setPendingPage(pendingPagination.currentPage + 1)}
                        disabled={pendingPagination.currentPage >= pendingPagination.totalPages}
                        className="px-3.5 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        التالي
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Archived Sermons Section (or default for Manager) */}
        {(!isSuperAdmin || activeTab === 'archived') && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <SermonFilterBar
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onSetSearchQuery={setSearchQuery}
              onSetCategory={setSelectedCategory}
            />

            {/* Sermons Grid / Skeleton Scan */}
            {loading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="bg-card border border-border rounded-2xl p-6 animate-pulse space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-muted rounded-md" />
                        <div className="h-6 w-20 bg-muted rounded-full" />
                      </div>
                      <div className="h-6 w-5/6 bg-muted rounded-md" />
                      <div className="h-4 w-full bg-muted rounded-md" />
                      <div className="h-4 w-2/3 bg-muted rounded-md" />
                      <div className="pt-4 border-t border-border flex justify-between items-center">
                        <div className="h-9 w-24 bg-muted rounded-xl" />
                        <div className="h-9 w-28 bg-muted rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
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
            ) : filteredSermons.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground mb-1">لا توجد خطب مؤرشفة مطابقة للبحث حالياً</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto font-medium">
                    قم بإضافة خطبة جديدة أو تغيير كلمة البحث لتأكيد استعراض المكتبة.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Grid of Sermon Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredSermons.map(sermon => (
                    <SermonCard
                      key={sermon.id}
                      sermon={sermon}
                      upcomingSelection={upcomingSelection}
                      isSelecting={selectingSermonId === sermon.id}
                      onViewDetails={onViewDetails}
                      onSelectForFriday={!isSuperAdmin ? handleSelectForFriday : undefined}
                    />
                  ))}
                </div>

                {/* Pagination Controls Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-border bg-card rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-muted-foreground">
                    عرض {startItem} - {endItem} من أصل {totalItems} خطبة مؤرشفة
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setArchivedPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-3.5 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setArchivedPage(p)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                            currentPage === p
                              ? 'bg-primary text-primary-foreground font-black shadow-md shadow-primary/20'
                              : 'bg-card border border-border text-foreground hover:bg-muted'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setArchivedPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-3.5 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      التالي
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modals */}
      {showPendingModal && (
        <PendingModal
          pendingSermons={pendingSermons}
          pendingPagination={pendingPagination}
          deletingSermonId={deletingSermonId}
          processingSermonId={processingSermonId}
          isSuperAdmin={isSuperAdmin}
          onPageChange={setPendingPage}
          onSelectSermon={(id) => {
            setShowPendingModal(false);
            if (onViewDetails) onViewDetails(id);
          }}
          onApproveSermon={handleApprovePendingSermon}
          onRejectSermon={handleRejectPendingSermon}
          onDeleteSermon={handleDeletePendingSermon}
          onClose={() => setShowPendingModal(false)}
        />
      )}


      {showHistoryModal && (
        <HistoryModal
          selectionsHistory={selectionsHistory}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}
