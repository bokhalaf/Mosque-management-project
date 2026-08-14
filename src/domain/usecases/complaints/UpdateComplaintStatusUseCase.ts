// ==============================
// Domain Use Case — UpdateComplaintStatusUseCase
// Swagger: updateComplaintStatus (PATCH /api/admin/complaints/{id}/status)
// ==============================

import { IComplaintRepository } from "../../repositories/IComplaintRepository";
import { ComplaintItem } from "../../entities/Complaint";

export class UpdateComplaintStatusUseCase {
  constructor(private complaintRepository: IComplaintRepository) {}

  async execute(id: string | number, status: string, note?: string): Promise<ComplaintItem> {
    return this.complaintRepository.updateComplaintStatus(id, status, note);
  }
}
