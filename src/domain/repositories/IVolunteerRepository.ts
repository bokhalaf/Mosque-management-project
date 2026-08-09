// ==============================
// Domain Repository Interface — IVolunteerRepository
// ==============================

import {
  VolunteerOpportunity,
  VolunteerApplication,
  VolunteerTask,
  VolunteerLog,
  VolunteerCertificate,
  CreateOpportunityPayload,
  AssignTaskPayload,
  LogHoursPayload,
} from "../entities/Volunteer";

export interface IVolunteerRepository {
  // 1. Opportunities
  getManagerOpportunities(): Promise<VolunteerOpportunity[]>;
  createOpportunity(payload: CreateOpportunityPayload): Promise<VolunteerOpportunity>;
  updateOpportunity(id: number | string, payload: Partial<CreateOpportunityPayload>): Promise<VolunteerOpportunity>;
  closeOpportunity(id: number | string): Promise<boolean>;

  // 2. Applications
  getOpportunityApplications(opportunityId?: number | string): Promise<VolunteerApplication[]>;
  approveApplication(applicationId: number | string): Promise<boolean>;
  rejectApplication(applicationId: number | string): Promise<boolean>;

  // 3. Tasks
  assignTask(payload: AssignTaskPayload): Promise<VolunteerTask>;
  getTasks(): Promise<VolunteerTask[]>;

  // 4. Hours & Evaluations
  logVolunteerHours(payload: LogHoursPayload): Promise<VolunteerLog>;
  getVolunteerHours(volunteerId: number | string, opportunityId: number | string): Promise<number>;
  getLogs(): Promise<VolunteerLog[]>;

  // 5. Certificates
  issueCertificate(volunteerId: number | string, opportunityId: number | string): Promise<VolunteerCertificate>;
  getCertificates(): Promise<VolunteerCertificate[]>;
}
