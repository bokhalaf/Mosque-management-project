// ==============================
// Domain Use Case — GetComplaintDetailsUseCase
// Swagger: getComplaintDetails (GET /api/admin/complaints/{id})
// ==============================

import { IComplaintRepository } from "../../repositories/IComplaintRepository";
import { ComplaintItem } from "../../entities/Complaint";

export class GetComplaintDetailsUseCase {
  constructor(private complaintRepository: IComplaintRepository) {}

  async execute(id: string | number): Promise<ComplaintItem> {
    return this.complaintRepository.getComplaintDetails(id);
  }
}
