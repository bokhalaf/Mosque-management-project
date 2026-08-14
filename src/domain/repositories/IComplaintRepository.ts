// ==============================
// Domain Repository Interface — IComplaintRepository
// ==============================

import { ComplaintStats, ComplaintItem, PaginatedComplaints } from "../entities/Complaint";

export interface GetAdminComplaintsParams {
  status?: string;
  priority?: string;
  complaint_type?: string;
  mosque_id?: number;
  per_page?: number;
  page?: number;
  q?: string;
}

export interface IComplaintRepository {
  getComplaintPageStats(mosqueId?: number): Promise<ComplaintStats>;
  getAdminComplaints(params?: GetAdminComplaintsParams): Promise<PaginatedComplaints>;
  searchComplaints?(params?: GetAdminComplaintsParams): Promise<PaginatedComplaints>;
  getComplaintDetails(id: string | number): Promise<ComplaintItem>;
  updateComplaintStatus(id: string | number, status: string, note?: string): Promise<ComplaintItem>;
}
