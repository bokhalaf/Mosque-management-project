'use client';

// ==============================
// Presentation Section — MosqueOperationsSection
// صفحة سجل عمليات ونشاطات المساجد (مدير المنطقة / السوبر أدمن)
// مطابقة لنظام التصميم والصفحات الأخرى 100% مع باجنيشن وفلاتر وتصميم زمني فخم
// ==============================

import React from 'react';
import Link from 'next/link';
import {
  Activity, RefreshCw, ChevronLeft, ChevronRight,
  History, Calendar, Filter, Sparkles, Inbox
} from 'lucide-react';
import { PageHeader } from '../../../app/components/PageHeader';
import { useMosqueOperations } from '../../hooks/useMosqueOperations';
import { OperationsStatCards } from './components/OperationsStatCards';
import { OperationsFilterBar } from './components/OperationsFilterBar';
import { OperationTimelineItem } from './components/OperationTimelineItem';
import { MosqueVolunteerLoader } from '../volunteers/components/MosqueVolunteerLoader';

export function MosqueOperationsSection() {
  const {
    operations,
    loading,
    error,
    stats,
    page,
    setPage,
    perPage,
    setPerPage,
    lastPage,
    totalCount,
    selectedModule,
    setSelectedModule,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    refresh,
    isSuperAdmin,
  } = useMosqueOperations();

  const hasActiveFilters = Boolean(
    selectedModule !== 'all' ||
    searchQuery.trim() ||
    dateFrom.trim() ||
    dateTo.trim()
  );

  const handleResetFilters = () => {
    setSelectedModule('all');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      
      {/* ── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="سجل عمليات المساجد"
        description="السجل الزمني والرقابي الشامل لكافة العمليات والأنشطة (تغييرات الشكاوى، طلبات الصيانة، حركات التبرع، اعتماد الخطب، وإضافة المساجد)."
        breadcrumbs={[
          { label: 'لوحة القيادة' },
          { label: 'الرقابة والإشراف' },
          { label: 'سجل العمليات', active: true },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={refresh}
              disabled={loading}
              title="تحديث البيانات من السيرفر"
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث السجل</span>
            </button>
          </div>
        }
      />

      {/* ── Content Body ───────────────────────────────────────────── */}
      <div className="px-4 md:px-8 pt-4 space-y-6">
        
        {/* KPI Stat Cards */}
        <OperationsStatCards
          stats={stats}
          loading={loading}
          selectedModule={selectedModule}
          onSelectModule={(m) => {
            setSelectedModule(m);
            setPage(1);
          }}
        />

        {/* Filter Bar */}
        <OperationsFilterBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setPage(1);
          }}
          selectedModule={selectedModule}
          onSelectModule={(m) => {
            setSelectedModule(m);
            setPage(1);
          }}
          dateFrom={dateFrom}
          onDateFromChange={(d) => {
            setDateFrom(d);
            setPage(1);
          }}
          dateTo={dateTo}
          onDateToChange={(d) => {
            setDateTo(d);
            setPage(1);
          }}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Operations List / Loader / Empty State */}
        {loading ? (
          <div className="py-16">
            <MosqueVolunteerLoader text="جاري استدعاء سجل العمليات من السيرفر..." />
          </div>
        ) : operations.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">لا توجد عمليات مطابقة</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'لم يتم العثور على عمليات تتطابق مع الفلاتر المحددة. جرب تغيير التاريخ أو الوحدة.'
                  : 'لم يتم تسجيل أي عمليات أو أنشطة في هذا النطاق الزمني بعد.'}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                إلغاء الفلاتر
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-muted-foreground">
                عرض <strong>{operations.length}</strong> من إجمالي <strong>{totalCount}</strong> عملية مسجلة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operations.map((op) => (
                <OperationTimelineItem key={op.id} operation={op} />
              ))}
            </div>

            {/* Pagination Controls */}
            {lastPage > 1 && (
              <div className="pt-6 border-t border-border/60 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs font-bold text-muted-foreground">
                  الصفحة {page} من {lastPage}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className="p-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="الصفحة السابقة"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                    let pageNum = i + 1;
                    if (lastPage > 5 && page > 3) {
                      pageNum = page - 3 + i;
                      if (pageNum > lastPage) pageNum = lastPage - (4 - i);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        disabled={loading}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          page === pageNum
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page >= lastPage || loading}
                    className="p-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="الصفحة التالية"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
