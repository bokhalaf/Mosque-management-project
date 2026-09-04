// ==============================
// Domain Entity — Report
// أنواع بيانات تصدير التقارير (تبرعات/صيانة/شكاوى) المستخدمة من DownloadReportModal.
// ==============================

export type ReportType = 'donations' | 'maintenance' | 'complaints';

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  mosqueId?: string | number;
}

/** السيرفر إما يرجع رابط ملف جاهز للتحميل، أو بيانات/عناصر تُعرض كمعاينة داخل الواجهة. */
export type ReportDownloadResult =
  | { kind: 'url'; url: string }
  | { kind: 'items'; items: any };
