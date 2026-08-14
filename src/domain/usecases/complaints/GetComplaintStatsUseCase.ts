// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: جلب إحصائيات صفحة الشكاوى
// ==============================

import { ComplaintStats } from "../../entities/Complaint";
import { IComplaintRepository } from "../../repositories/IComplaintRepository";

export class GetComplaintStatsUseCase {
  constructor(private complaintRepository: IComplaintRepository) {}

  async execute(mosqueId?: number): Promise<ComplaintStats> {
    return await this.complaintRepository.getComplaintPageStats(mosqueId);
  }
}
