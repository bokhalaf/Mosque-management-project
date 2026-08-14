// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: جلب قائمة الشكاوى للمدير مع الفلاتر
// ==============================

import { PaginatedComplaints } from "../../entities/Complaint";
import { IComplaintRepository, GetAdminComplaintsParams } from "../../repositories/IComplaintRepository";

export class GetAdminComplaintsUseCase {
  constructor(private complaintRepository: IComplaintRepository) {}

  async execute(params?: GetAdminComplaintsParams): Promise<PaginatedComplaints> {
    return await this.complaintRepository.getAdminComplaints(params);
  }
}
