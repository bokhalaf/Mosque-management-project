// ==============================
// Domain Repository Interface — IReportRepository
// ==============================

import { ReportType, ReportFilters, ReportDownloadResult } from "../entities/Report";

export interface IReportRepository {
  downloadReport(reportType: ReportType, filters: ReportFilters): Promise<ReportDownloadResult>;
}
