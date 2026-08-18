// ==============================
// Domain UseCase — AssignComplaintToAdminUseCase
// رفع/إسناد الشكوى إلى السوبر أدمن من قبل مدير المسجد (mosque_manager)
// Swagger: PATCH /api/admin/complaints/{id}/assign (assignComplaintToAdmin)
// ==============================

import { ComplaintItem } from "../../entities/Complaint";
import { IComplaintRepository } from "../../repositories/IComplaintRepository";

export class AssignComplaintToAdminUseCase {
  constructor(private repo: IComplaintRepository) {}

  async execute(id: string | number, adminId: number, note?: string): Promise<ComplaintItem> {
    if (!this.repo.assignComplaintToAdmin) {
      throw new Error("دالة إسناد الشكوى إلى السوبر أدمن غير معرّفة في المستودع");
    }
    return this.repo.assignComplaintToAdmin(id, adminId, note);
  }
}
