// ==============================
// Complaints — ComplaintTable Component
// جدول الشكاوى مع التنسيق المحسّن بدون سكرول زائد
// ==============================

import React from 'react';
import { Eye, MessageSquare, AlertCircle, ShieldCheck, Building2 } from 'lucide-react';
import { ComplaintItem } from '../../../../domain/entities/Complaint';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20 font-black';
    case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high': return 'عالية';
    case 'medium': return 'متوسطة';
    case 'low': return 'عادية';
    default: return priority || 'غير محدد';
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending':
    case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'in_progress':
    case 'review': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'canceled':
    case 'closed': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
    case 'new': return 'جديدة';
    case 'in_progress':
    case 'review': return 'قيد المعالجة';
    case 'resolved': return 'تم الحل';
    case 'canceled':
    case 'closed': return 'مغلقة';
    default: return status;
  }
};

const getComplaintTypeLabel = (type?: string) => {
  switch (type) {
    case 'service_missing': return 'خدمة مفقودة';
    case 'power_outage': return 'انقطاع كهرباء/تكييف';
    case 'corruption': return 'بلاغ إداري';
    case 'employee_misconduct': return 'سلوك موظف';
    case 'technical_issue': return 'مشكلة تقنية';
    case 'other': return 'أخرى';
    default: return 'عام';
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const checkIsAssignedToAdmin = (item: ComplaintItem): boolean => {
  return Boolean(
    item.assigned_admin_id ||
    (item as any).admin_id ||
    (item as any).is_assigned_to_admin ||
    (item as any).assigned_to_admin ||
    (item as any).assigned_admin ||
    item.status === 'escalated' ||
    item.status === 'assigned_to_admin'
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

interface ComplaintTableProps {
  complaints: ComplaintItem[];
  totalCount: number;
  loadingComplaints: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more?: boolean;
  };
  onPageChange?: (page: number) => void;
  onViewDetails?: (id: string) => void;
  onResetFilters: () => void;
}

export function ComplaintTable({
  complaints,
  totalCount,
  loadingComplaints,
  error,
  hasActiveFilters,
  pagination,
  onPageChange,
  onViewDetails,
  onResetFilters,
}: ComplaintTableProps) {
  const currentPage = pagination?.current_page || 1;
  const lastPage = pagination?.last_page || 1;
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col font-['Cairo']">
      <div className="overflow-x-auto">
        <table className="w-full text-right table-auto">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">رقم الشكوى</th>
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">المرسل</th>
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">الموضوع والتصنيف</th>
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">الأولوية</th>
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">جهة المتابعة</th>
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">الحالة</th>
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loadingComplaints ? (
              // Skeleton Animated Loading Rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-20 rounded-lg bg-muted animate-pulse" />
                    <div className="h-3 w-16 rounded-lg bg-muted animate-pulse mt-1.5 opacity-60" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
                      <div>
                        <div className="h-4 w-24 rounded-lg bg-muted animate-pulse" />
                        <div className="h-3 w-16 rounded-lg bg-muted animate-pulse mt-1 opacity-60" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-36 rounded-lg bg-muted animate-pulse mb-1.5" />
                    <div className="h-3 w-20 rounded-lg bg-muted animate-pulse opacity-60" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-6 w-14 rounded-lg bg-muted animate-pulse" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-6 w-20 rounded-lg bg-muted animate-pulse" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-6 w-16 rounded-lg bg-muted animate-pulse" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-7 w-14 rounded-xl bg-muted animate-pulse mx-auto" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{error}</p>
                  </div>
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border border-border">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm text-foreground">لا توجد شكاوى مطابقة للبحث أو الفلاتر المحددة</p>
                    <p className="text-xs text-muted-foreground">جرب تغيير كلمات البحث أو إعادة ضبط الفلاتر لعرض نتائج أخرى.</p>
                    {hasActiveFilters && (
                      <button
                        onClick={onResetFilters}
                        className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all border border-primary/20 mt-2"
                      >
                        إعادة ضبط جميع الفلاتر
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              complaints.map((item) => {
                const complaintIdStr = item.complaint_number || `CMP-${item.id}`;
                const isUnknown = Boolean(
                  item.is_anonymous ||
                  !item.user?.name ||
                  item.user?.name === 'مجهول' ||
                  item.user?.name === 'فاعل خير' ||
                  item.user?.name === 'anonymous' ||
                  item.user?.name === 'guest' ||
                  item.user?.name === 'غير محدد'
                );
                const senderName = isUnknown
                  ? 'مجهول الهوية'
                  : (item.user?.name || item.email || 'مجهول الهوية');
                const typeLabel = getComplaintTypeLabel(item.complaint_type);
                const isAssigned = checkIsAssignedToAdmin(item);

                return (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors group">
                    {/* Complaint ID & Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-black text-foreground">{complaintIdStr}</span>
                      <span className="block text-[10px] text-muted-foreground font-bold mt-0.5">{formatDate(item.created_at)}</span>
                    </td>

                    {/* Sender */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-[11px] border border-emerald-500/20 shrink-0">
                          {senderName[0] || '؟'}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-foreground">{senderName}</span>
                          <span className="block text-[10px] text-muted-foreground">{isUnknown ? 'مجهول الهوية' : (item.email || 'مصلي / زائر')}</span>
                        </div>
                      </div>
                    </td>

                    {/* Title & Type */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold text-foreground line-clamp-1 max-w-[200px]" title={item.title || item.description}>
                        {item.title || item.description || 'بدون عنوان'}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold">{typeLabel}</span>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getPriorityStyles(item.priority)}`}>
                        {getPriorityLabel(item.priority)}
                      </span>
                    </td>

                    {/* Handling Entity */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isAssigned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>مسندة للمنطقة</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-muted/70 text-muted-foreground border border-border/80">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>معالجة المسجد</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getStatusStyles(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onViewDetails && onViewDetails(String(item.id))}
                          className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-all"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Interactive Pagination */}
      <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground font-medium">
          عرض <span className="font-bold text-foreground">{complaints.length}</span> من أصل <span className="font-bold text-foreground">{pagination?.total || totalCount}</span> شكوى
          {lastPage > 1 && (
            <span className="mr-2 text-muted-foreground">
              (الصفحة <span className="font-bold text-foreground">{currentPage}</span> من <span className="font-bold text-foreground">{lastPage}</span>)
            </span>
          )}
        </div>

        {/* Pagination Buttons */}
        {lastPage > 1 && onPageChange && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3.5 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              السابق
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
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
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= lastPage}
              className="px-3.5 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
