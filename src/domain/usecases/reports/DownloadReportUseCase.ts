// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: استخراج/تحميل تقرير رسمي (تبرعات/صيانة/شكاوى)
// ==============================

import { IReportRepository } from "../../repositories/IReportRepository";
import { ReportType, ReportFilters, ReportDownloadResult } from "../../entities/Report";

export class DownloadReportUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(reportType: ReportType, filters: ReportFilters): Promise<ReportDownloadResult> {
    return this.reportRepository.downloadReport(reportType, filters);
  }
}
