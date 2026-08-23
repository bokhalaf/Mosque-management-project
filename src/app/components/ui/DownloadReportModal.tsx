'use client';

// ==============================
// UI Component — DownloadReportModal
// نافذة تصدير التقارير الرسمية مع فلاتر التاريخ والمسجد
// ==============================

import React, { useState, useEffect } from 'react';
import {
  FileDown,
  Calendar,
  Building2,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  reportType: 'donations' | 'maintenance' | 'complaints';
  defaultMosqueId?: number | string;
}

export function DownloadReportModal({
  isOpen,
  onClose,
  title,
  description = 'حدد النطاق الزمني والمسجد المطلوب لتوليد وتحميل تقرير PDF رسمي موثق.',
  reportType,
  defaultMosqueId,
}: DownloadReportModalProps) {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedMosqueId, setSelectedMosqueId] = useState<string>(
    defaultMosqueId ? String(defaultMosqueId) : 'all'
  );
  const [mosques, setMosques] = useState<{ id: number; name: string; city?: string }[]>([]);
  const [loadingMosques, setLoadingMosques] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const userStr = localStorage.getItem('auth_user') || '{}';
      const rawUser = JSON.parse(userStr);
      const userRole = localStorage.getItem('user_role') || rawUser.role || rawUser.user_type || '';
      const roles = Array.isArray(rawUser.roles) ? rawUser.roles : [];
      return (
        userRole === 'super_admin' ||
        userRole === 'admin' ||
        userRole === 'administrator' ||
        roles.includes('super_admin') ||
        roles.includes('admin') ||
        Boolean(rawUser.is_super_admin)
      );
    } catch {
      return false;
    }
  }, []);

  // Fetch mosques catalog for dropdown (Super Admin Only)
  useEffect(() => {
    if (!isOpen || !isSuperAdmin) return;

    let isMounted = true;
    const fetchMosques = async () => {
      setLoadingMosques(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
        const res = await fetch('https://mms-backend-rose.vercel.app/api/mosques?per_page=100', {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json().catch(() => null);
        if (isMounted && res.ok && json) {
          const list = Array.isArray(json)
            ? json
            : Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.data?.data)
            ? json.data.data
            : [];
          setMosques(list.map((m: any) => ({ id: m.id, name: m.name, city: m.city })));
        }
      } catch (err) {
        console.warn('Failed to load mosques list:', err);
      } finally {
        if (isMounted) setLoadingMosques(false);
      }
    };

    fetchMosques();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Preset Date Range Helpers
  const handlePreset = (preset: 'all' | 'this_month' | 'last_30_days' | 'this_year') => {
    const today = new Date();
    const toStr = today.toISOString().split('T')[0];

    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else if (preset === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateFrom(firstDay.toISOString().split('T')[0]);
      setDateTo(toStr);
    } else if (preset === 'last_30_days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
      setDateTo(toStr);
    } else if (preset === 'this_year') {
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      setDateFrom(firstDayOfYear.toISOString().split('T')[0]);
      setDateTo(toStr);
    }
  };

  const [reportResult, setReportResult] = useState<any>(null);

  const handleDownload = async () => {
    setError(null);
    setDownloading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
      const params = new URLSearchParams();

      if (dateFrom && dateFrom.trim()) {
        params.append('date_from', dateFrom.trim());
      }
      if (dateTo && dateTo.trim()) {
        params.append('date_to', dateTo.trim());
      }
      if (isSuperAdmin && selectedMosqueId && selectedMosqueId !== 'all') {
        params.append('mosque_id', String(selectedMosqueId));
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      // Determine endpoint based on user role (Super Admin vs Mosque Manager)
      const url = isSuperAdmin
        ? `https://mms-backend-rose.vercel.app/api/admin/reports/${reportType}/download${queryString}`
        : `https://mms-backend-rose.vercel.app/api/dashboard/mosque-manager/reports/${reportType}${queryString}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await response.json().catch(() => null);

      if (response.ok) {
        if (json?.data?.url) {
          window.open(json.data.url, '_blank');
          onClose();
        } else if (json?.report_url) {
          window.open(json.report_url, '_blank');
          onClose();
        } else if (typeof json?.data === 'string' && json.data.startsWith('http')) {
          window.open(json.data, '_blank');
          onClose();
        } else if (json?.data || json?.items || Array.isArray(json)) {
          // If JSON data/items are returned for Mosque Manager report, display the report preview
          setReportResult(json.data || json.items || json);
        } else {
          throw new Error(json?.message || 'تم استلام رد غير متوقع من السيرفر');
        }
      } else {
        throw new Error(json?.message || 'فشل في إنشاء واستخراج التقرير من السيرفر');
      }
    } catch (err: any) {
      console.error('Download report failed:', err);
      setError(err.message || 'حدث خطأ غير متوقع أثناء استخراج التقرير.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in font-['Cairo']">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border/80 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 border border-primary/20">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                توليد ملف PDF رسمي ومُفلتر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={downloading}
            className="w-8 h-8 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Form or Report Result Preview */}
        {reportResult ? (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <div>
                <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                  تم استخراج تقرير المسجد بنجاح
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dateFrom || dateTo
                    ? `الفترة: ${dateFrom || 'البداية'} إلى ${dateTo || 'اليوم'}`
                    : 'التقرير الشامل لكافة الفترات'}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-600 text-white rounded-xl shadow-xs">
                {Array.isArray(reportResult)
                  ? `${reportResult.length} سجلات`
                  : Array.isArray(reportResult.items)
                  ? `${reportResult.items.length} سجلات`
                  : 'مكتمل'}
              </span>
            </div>

            {/* Render Items Table / List */}
            {(() => {
              const items: any[] = Array.isArray(reportResult)
                ? reportResult
                : Array.isArray(reportResult.items)
                ? reportResult.items
                : Array.isArray(reportResult.data)
                ? reportResult.data
                : [];

              if (items.length === 0) {
                return (
                  <div className="py-8 text-center text-muted-foreground text-xs font-bold">
                    لا توجد بيانات مسجلة في هذا النطاق الزمني.
                  </div>
                );
              }

              return (
                <div className="border border-border/80 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border/60 sticky top-0">
                        <tr>
                          <th className="px-4 py-2.5">العنوان / البيان</th>
                          <th className="px-4 py-2.5">التصنيف / القيمة</th>
                          <th className="px-4 py-2.5">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {items.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-bold text-foreground">
                              {row.title || row.donor_name || row.subject || row.name || `سجل #${i + 1}`}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground font-medium">
                              {row.amount !== undefined ? (
                                <span className="text-emerald-600 font-bold font-mono">
                                  {Number(row.amount).toLocaleString('ar-SA')} {row.currency || 'ل.س'}
                                </span>
                              ) : (
                                row.status || row.category || row.priority || '—'
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-[11px]">
                              {row.date || row.created_at ? new Date(row.date || row.created_at).toLocaleDateString('ar-SA') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Actions for Preview */}
            <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setReportResult(null)}
                className="px-4 py-2.5 bg-muted text-foreground hover:bg-muted/80 text-xs font-bold rounded-xl transition-all"
              >
                تغيير الفلاتر
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl transition-all shadow-md"
              >
                <FileDown className="w-4 h-4" />
                <span>طباعة / حفظ التقرير (Print)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                فترات زمنية سريعة:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePreset('this_month')}
                  className="px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-xl text-xs font-bold transition-all border border-border/60"
                >
                  هذا الشهر
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('last_30_days')}
                  className="px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-xl text-xs font-bold transition-all border border-border/60"
                >
                  آخر 30 يوم
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('this_year')}
                  className="px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-xl text-xs font-bold transition-all border border-border/60"
                >
                  هذا العام
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('all')}
                  className="px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-xl text-xs font-bold transition-all border border-border/60"
                >
                  كل الفترات
                </button>
              </div>
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>من تاريخ:</span>
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>إلى تاريخ:</span>
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Mosque Selector — Super Admin Only */}
            {isSuperAdmin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>تخصيص لمسجد محدد:</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedMosqueId}
                    onChange={(e) => setSelectedMosqueId(e.target.value)}
                    disabled={loadingMosques}
                    className="w-full px-3.5 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">كل المساجد في المنطقة (تقرير شامل)</option>
                    {mosques.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {m.name} {m.city ? `(${m.city})` : ''}
                      </option>
                    ))}
                  </select>
                  {loadingMosques && (
                    <div className="absolute left-3 top-2.5">
                      <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Actions (only when not in preview mode) */}
        {!reportResult && (
          <div className="px-6 py-4 bg-muted/30 border-t border-border/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={downloading}
              className="px-4 py-2.5 bg-card border border-border text-foreground hover:bg-muted text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري استخراج التقرير...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>استخراج التقرير الآن</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
