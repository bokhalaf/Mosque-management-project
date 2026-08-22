'use client';

import React from 'react';
import {
  Search, RefreshCw, User, Phone, Mail, Calendar,
  Shield, CheckCircle2, XCircle, Users, ChevronRight, ChevronLeft, AlertCircle
} from 'lucide-react';
import { VolunteerUser, VolunteerPaginationState } from '../../../../domain/entities/Volunteer';
import { MosqueVolunteerLoader } from './MosqueVolunteerLoader';

interface VolunteersListTabProps {
  volunteers: VolunteerUser[];
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  pagination: VolunteerPaginationState;
  search: string;
  setSearch: (search: string) => void;
  status: string;
  setStatus: (status: string) => void;
  onRefresh: () => void;
}

export function VolunteersListTab({
  volunteers,
  loading,
  error,
  page,
  setPage,
  pagination,
  search,
  setSearch,
  status,
  setStatus,
  onRefresh,
}: VolunteersListTabProps) {
  const getStatusBadge = (userStatus: string) => {
    switch (userStatus) {
      case 'active':
        return { label: 'نشط', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 };
      case 'inactive':
        return { label: 'غير نشط', color: 'bg-muted text-muted-foreground border-border', icon: XCircle };
      default:
        return { label: userStatus || 'متطوع', color: 'bg-primary/10 text-primary border-primary/20', icon: CheckCircle2 };
    }
  };

  return (
    <div className="space-y-6 font-['Cairo']">
      {/* Top Filter and Search Bar */}
      <div className="bg-card border border-border rounded-3xl p-4 md:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="البحث بالاسم أو البريد أو رقم الهاتف..."
              className="w-full pl-4 pr-10 py-2.5 bg-muted/50 border border-border rounded-2xl text-xs outline-none focus:border-primary transition-all text-foreground"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-2xl text-xs font-bold transition-all disabled:opacity-50 shrink-0"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 text-xs font-bold underline hover:no-underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* Content Area */}
      {loading && volunteers.length === 0 ? (
        <MosqueVolunteerLoader
          message="جاري جلب قائمة المتطوعين المعتمدين بالمسجد..."
          subMessage="يتم مزامنة بيانات المتطوعين والمهام المرتبطة بالسيرفر"
        />
      ) : volunteers.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-bold text-foreground mb-1">لا يوجد متطوعين مسجلين</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              لم يتم العثور على أي متطوعين يطابقون معايير البحث الحالية.
            </p>
          </div>
        </div>
      ) : (
        /* Volunteers Grid */
        <div className="relative">
          {/* Overlay loading during page switch */}
          {loading && volunteers.length > 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-3xl">
              <MosqueVolunteerLoader
                message="جاري تحديث صفحة المتطوعين..."
                subMessage="يرجى الانتظار لحظات"
                minHeight="min-h-[220px]"
              />
            </div>
          )}

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity duration-300 ${loading ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
            {volunteers.map((vol) => {
              const statusInfo = getStatusBadge(vol.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div
                  key={vol.id}
                  className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Avatar & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black text-base border border-primary/20 shrink-0">
                          {vol.name?.charAt(0) || 'م'}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-foreground line-clamp-1">{vol.name}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono text-muted-foreground">ID: #{vol.id}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>

                    {/* Roles Badges */}
                    {vol.roles && vol.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {vol.roles.map((r, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold"
                          >
                            <Shield className="w-3 h-3" />
                            <span>{r === 'volunteer' ? 'متطوع مسجل' : r}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Contact Info Box */}
                    <div className="bg-muted/40 rounded-2xl p-3 space-y-2 text-xs">
                      {vol.phone ? (
                        <div className="flex items-center gap-2 text-muted-foreground font-mono">
                          <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span dir="ltr">{vol.phone}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                          <span className="text-[11px] italic text-muted-foreground/70">لا يوجد رقم هاتف</span>
                        </div>
                      )}

                      {vol.email ? (
                        <div className="flex items-center gap-2 text-muted-foreground font-mono truncate">
                          <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate" dir="ltr">{vol.email}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                          <span className="text-[11px] italic text-muted-foreground/70">لا يوجد بريد إلكتروني</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer: Joined Date */}
                  <div className="pt-4 mt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                      <span>تاريخ الانضمام:</span>
                    </div>
                    <span className="font-mono font-bold text-foreground">
                      {vol.created_at ? vol.created_at.split('T')[0] : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-card border border-border rounded-2xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">
            عرض الصفحة <span className="font-bold text-foreground">{page}</span> من <span className="font-bold text-foreground">{pagination.lastPage}</span> (إجمالي {pagination.total} متطوع)
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(Math.max(1, page - 1))}
              className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <div className="flex items-center gap-1" dir="ltr">
              {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                .filter((i) => i === 1 || i === pagination.lastPage || Math.abs(i - page) <= 1)
                .map((i, index, array) => (
                  <React.Fragment key={i}>
                    {index > 0 && array[index - 1] !== i - 1 && (
                      <span className="px-1 text-muted-foreground text-xs">...</span>
                    )}
                    <button
                      onClick={() => setPage(i)}
                      disabled={loading}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        page === i
                          ? 'bg-primary text-primary-foreground shadow-sm font-black'
                          : 'bg-card border border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {i}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              disabled={page >= pagination.lastPage || loading}
              onClick={() => setPage(Math.min(pagination.lastPage, page + 1))}
              className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
