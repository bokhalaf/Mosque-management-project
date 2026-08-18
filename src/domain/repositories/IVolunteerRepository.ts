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
  VolunteerPaginatedResponse,
  VolunteerStats,
} from "../entities/Volunteer";

export interface IVolunteerRepository {
  // 1. Opportunities
  getManagerOpportunities(): Promise<VolunteerOpportunity[]>;
  getManagerOpportunitiesPaginated(page?: number, perPage?: number): Promise<VolunteerPaginatedResponse>;
  getOpportunityById(id: number | string): Promise<VolunteerOpportunity | null>;
  createOpportunity(payload: CreateOpportunityPayload): Promise<VolunteerOpportunity>;
  updateOpportunity(id: number | string, payload: Partial<CreateOpportunityPayload>): Promise<VolunteerOpportunity>;
  closeOpportunity(id: number | string): Promise<boolean>;
  getStats(): Promise<VolunteerStats>;

  // 2. Applications
  getOpportunityApplications(opportunityId?: number | string): Promise<VolunteerApplication[]>;
  approveApplication(applicationId: number | string): Promise<boolean>;
  rejectApplication(applicationId: number | string): Promise<boolean>;

  // 3. Tasks
  createOpportunityTask(opportunityId: number | string, taskDescription: string): Promise<VolunteerTask>;
  assignTaskToVolunteer(taskId: number | string, applicationId: number | string): Promise<VolunteerTask>;
  getOpportunityTasks(opportunityId: number | string): Promise<VolunteerTask[]>;
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
