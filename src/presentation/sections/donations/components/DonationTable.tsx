// ==============================
// Donations — DonationTable Component
// جدول التبرعات بتصميم وسطور وإجراءات وترقيم مطابق تماماً للصيانة
// ==============================

import React from 'react';
import { Eye, Printer, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Donation } from '../../../../domain/entities/Donation';

interface DonationTableProps {
  donations: Donation[];
  loading: boolean;
  hasActiveFilters: boolean;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  page: number;
  onPageChange: (p: number) => void;
  onViewDetails?: (id: string) => void;
  onPrintReceipt?: (id: string | number) => void;
  printingId?: string | number | null;
  onResetFilters: () => void;
}

export function DonationTable({
  donations,
  loading,
  hasActiveFilters,
  pagination,
  page,
  onPageChange,
  onViewDetails,
  onPrintReceipt,
  printingId,
  onResetFilters,
}: DonationTableProps) {
  const lastPage = pagination?.last_page || 1;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm font-['Cairo']">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-foreground">سجل التبرعات المسجلة</h3>
          <p className="text-xs text-muted-foreground mt-0.5">استعراض تفاصيل وقيم العمليات المالية والعينية</p>
        </div>
        {pagination && (
          <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold">
            الإجمالي: {pagination.total} تبرع
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">المتبرع</th>
              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">الحملة / النوع</th>
              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">المبلغ</th>
              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">التاريخ</th>
              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <SkeletonRows />
            ) : donations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <AlertCircle className="w-10 h-10 text-muted-foreground/60" />
                    <h4 className="text-sm font-bold text-foreground">لا توجد عمليات تبرع مطابقة للبحث حالياً</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      قم بإضافة تبرع جديد أو تغيير كلمة البحث وتصفية الفلاتر.
                    </p>
                    {hasActiveFilters && (
                      <button onClick={onResetFilters} className="px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow">
                        إلغاء الفلاتر
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id} className="hover:bg-muted/30 transition-colors border-b border-border/60 last:border-0 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-black text-primary border border-primary/20 shrink-0">
                        {donation.donorName?.[0] || 'ت'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{donation.donorName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">#REC-{donation.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">{donation.type}</span>
                      {donation.campaign && (
                        <span className="text-[10px] text-primary font-bold">{donation.campaign}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-black text-primary">
                      {donation.type === 'تبرع عيني' || donation.type === 'عيني' || donation.type === 'in_kind'
                        ? Number(donation.amount || 0).toLocaleString('ar-EG')
                        : `${Number(donation.amount || 0).toLocaleString('ar-EG')} ل.س`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground font-medium">{donation.date}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-[10px] font-bold ${
                      donation.status === 'مكتمل' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      donation.status === 'فشل' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        donation.status === 'مكتمل' ? 'bg-emerald-500' :
                        donation.status === 'فشل' ? 'bg-red-500' :
                        'bg-amber-500'
                      }`} />
                      {donation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => onViewDetails?.(donation.reference || donation.id)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all" 
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onPrintReceipt?.(donation.id)}
                        disabled={printingId === donation.id}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all disabled:opacity-50" 
                        title="تحميل وطباعة الإيصال (PDF)"
                      >
                        {printingId === donation.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <Printer className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.last_page > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted/10">
          <p className="text-xs text-muted-foreground font-medium">
            عرض الصفحة <span className="font-bold text-foreground">{page}</span> من <span className="font-bold text-foreground">{lastPage}</span> (إجمالي {pagination.total} تبرع)
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>
            
            <div className="flex items-center gap-1" dir="ltr">
              {Array.from({ length: lastPage }, (_, i) => i + 1)
                .filter(i => i === 1 || i === lastPage || Math.abs(i - page) <= 1)
                .map((i, index, array) => (
                  <React.Fragment key={i}>
                    {index > 0 && array[index - 1] !== i - 1 && (
                      <span className="px-1 text-muted-foreground text-xs">...</span>
                    )}
                    <button
                      onClick={() => onPageChange(i)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        page === i 
                          ? 'bg-primary text-primary-foreground shadow-sm font-black' 
                          : 'bg-card border border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {i}
                    </button>
                  </React.Fragment>
                ))
              }
            </div>

            <button 
              disabled={page === lastPage}
              onClick={() => onPageChange(Math.min(lastPage, page + 1))}
              className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50"
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

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((idx) => (
        <tr key={idx} className="animate-pulse border-b border-border/60">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-muted/60 rounded-xl shrink-0" />
              <div className="space-y-1">
                <div className="w-28 h-3.5 bg-muted/60 rounded" />
                <div className="w-16 h-2.5 bg-muted/60 rounded" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="w-20 h-3.5 bg-muted/60 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="w-24 h-4 bg-muted/60 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="w-16 h-3 bg-muted/60 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="w-16 h-5 bg-muted/60 rounded-lg" />
          </td>
          <td className="px-6 py-4 text-center">
            <div className="w-12 h-6 bg-muted/60 rounded-lg mx-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}
