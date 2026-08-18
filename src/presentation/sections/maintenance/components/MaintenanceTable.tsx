// ==============================
// Maintenance — MaintenanceTable Component
// جدول طلبات الصيانة مع حالات التحميل والخطأ والفراغ
// ==============================

import React from 'react';
import { Eye, RefreshCw, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { MaintenanceRequestItem } from '../../../../domain/entities/Maintenance';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'critical':
    case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20 font-black';
    case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'low': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'critical':
    case 'urgent': return 'حرجة';
    case 'high': return 'عالية';
    case 'medium': return 'متوسطة';
    case 'low': return 'منخفضة';
    default: return priority || 'عادية';
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    case 'approved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'cancelled':
    case 'delayed': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'قيد الانتظار';
    case 'approved': return 'معتمدة';
    case 'in_progress': return 'جاري العمل';
    case 'completed': return 'مكتملة';
    case 'cancelled': return 'ملغاة';
    case 'delayed': return 'متأخرة';
    default: return status;
  }
};

const getCategoryLabel = (cat?: string) => {
  switch (cat) {
    case 'electrical': return 'أعطال كهربائية';
    case 'plumbing': return 'سباكة ومياه';
    case 'carpentry': return 'نجارة وأثاث';
    case 'cleaning': return 'نظافة وعناية';
    case 'other': return 'أخرى';
    default: return cat || 'عام';
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

// ── Component ─────────────────────────────────────────────────────────────────

export interface MaintenancePaginationState {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more?: boolean;
}

interface MaintenanceTableProps {
  requests: MaintenanceRequestItem[];
  totalCount: number;
  loadingRequests: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  pagination?: MaintenancePaginationState;
  onPageChange?: (page: number) => void;
  onViewDetails?: (id: string) => void;
  onEditItem?: (item: MaintenanceRequestItem) => void;
  onDeleteItem?: (id: string | number) => void;
  onResetFilters: () => void;
}

export function MaintenanceTable({
  requests,
  totalCount,
  loadingRequests,
  error,
  hasActiveFilters,
  pagination,
  onPageChange,
  onViewDetails,
  onEditItem,
  onDeleteItem,
  onResetFilters,
}: MaintenanceTableProps) {
  const currentPage = pagination?.current_page || 1;
  const lastPage = pagination?.last_page || 1;

  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const roles: string[] = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
          if (roles.includes('super_admin') || Boolean(user.is_super_admin)) {
            setIsSuperAdmin(true);
          }
        }
      } catch (e) {}
    }
  }, []);

  // Build page numbers array
  const pageNumbers = [];
  for (let i = 1; i <= lastPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">رقم المهمة</th>
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">التفاصيل والتصنيف</th>
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">الأولوية</th>
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">الحالة</th>
              <th className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loadingRequests ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded-lg bg-muted animate-pulse" />
                    <div className="h-3 w-16 rounded-lg bg-muted animate-pulse mt-1.5 opacity-60" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-48 rounded-lg bg-muted animate-pulse mb-1.5" />
                    <div className="h-3 w-32 rounded-lg bg-muted animate-pulse opacity-60" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-16 rounded-lg bg-muted animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 rounded-lg bg-muted animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                      <div className="h-8 w-8 rounded-lg bg-muted animate-pulse opacity-70" />
                      <div className="h-8 w-8 rounded-lg bg-muted animate-pulse opacity-40" />
                    </div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-red-500 font-bold">
                  {error}
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground space-y-2">
                  <p className="font-bold text-foreground">لا توجد طلبات صيانة مطابقة للبحث أو التصفية الحالية.</p>
                  {hasActiveFilters && (
                    <button onClick={onResetFilters} className="text-xs text-primary underline font-bold">
                      إعادة ضبط الفلاتر لرؤية كل الطلبات
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              requests.map((task) => {
                const mNumber = task.maintenance_number || `MR-${task.id}`;
                return (
                  <tr key={task.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-black text-foreground">{mNumber}</span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">{formatDate(task.created_at)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="block text-xs font-bold text-foreground mb-1 line-clamp-1">{task.title}</span>
                      <span className="inline-block text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                        {getCategoryLabel(task.category)} • {task.mosque?.name || 'المسجد الرئيسي'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getPriorityStyles(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyles(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onViewDetails && onViewDetails(String(task.id))}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isSuperAdmin && (
                          <>
                            <button
                              onClick={() => onEditItem && onEditItem(task)}
                              className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                              title="تعديل طلب الصيانة"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteItem && onDeleteItem(task.id)}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              title="حذف طلب الصيانة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground font-medium">
          عرض <span className="font-bold text-foreground">{requests.length}</span> من أصل <span className="font-bold text-foreground">{pagination?.total || totalCount}</span> طلب صيانة
          {lastPage > 1 && (
            <span className="mr-2 text-muted-foreground">
              (الصفحة <span className="font-bold text-foreground">{currentPage}</span> من <span className="font-bold text-foreground">{lastPage}</span>)
            </span>
          )}
        </div>

        {/* Pagination Buttons */}
        {lastPage > 1 && onPageChange && (
          <div className="flex items-center gap-1.5 dir-rtl">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => onPageChange(pNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${currentPage === pNum
                      ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                      : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  {pNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= lastPage}
              className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

