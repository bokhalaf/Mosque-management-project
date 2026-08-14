// ==============================
// Domain Use Case — SearchComplaintsUseCase
// Swagger: searchComplaints (GET /api/admin/complaints/search)
// ==============================

import { IComplaintRepository, GetAdminComplaintsParams } from "../../repositories/IComplaintRepository";
import { PaginatedComplaints } from "../../entities/Complaint";

export class SearchComplaintsUseCase {
  constructor(private complaintRepository: IComplaintRepository) {}

  async execute(params?: GetAdminComplaintsParams): Promise<PaginatedComplaints> {
    if (this.complaintRepository.searchComplaints) {
      return this.complaintRepository.searchComplaints(params);
    }
    return this.complaintRepository.getAdminComplaints(params);
  }
}
