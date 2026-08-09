// ==============================
// Domain Entity — Volunteer Management
// ==============================

export type OpportunityStatus = 'open' | 'closed' | 'in_progress';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type TaskStatus = 'assigned' | 'completed';

export interface VolunteerOpportunity {
  id: number | string;
  mosque_id: number | string;
  title: string;
  description: string;
  required_volunteers: number;
  current_volunteers?: number;
  start_date: string;
  end_date: string;
  status: OpportunityStatus;
  created_at: string;
}

export interface VolunteerApplication {
  id: number | string;
  opportunity_id: number | string;
  opportunity_title?: string;
  volunteer_id: number | string;
  volunteer_name: string;
  phone: string;
  email?: string;
  status: ApplicationStatus;
  applied_at: string;
  notes?: string;
}

export interface VolunteerTask {
  id: number | string;
  application_id: number | string;
  volunteer_id?: number | string;
  volunteer_name: string;
  opportunity_id?: number | string;
  opportunity_title?: string;
  task_description: string;
  status: TaskStatus;
  created_at: string;
}

export interface VolunteerLog {
  id: number | string;
  volunteer_id: number | string;
  volunteer_name: string;
  opportunity_id: number | string;
  opportunity_title: string;
  logged_hours: number;
  manager_evaluation: string;
  notes?: string;
  created_at: string;
}

export interface VolunteerCertificate {
  id: number | string;
  volunteer_id: number | string;
  volunteer_name: string;
  opportunity_id: number | string;
  opportunity_title: string;
  certificate_url: string;
  issued_at: string;
  total_hours: number;
}

// Payload Types
export interface CreateOpportunityPayload {
  mosque_id?: number | string;
  title: string;
  description: string;
  required_volunteers: number;
  start_date: string;
  end_date: string;
}

export interface AssignTaskPayload {
  application_id: number | string;
  task_description: string;
}

export interface LogHoursPayload {
  volunteer_id: number | string;
  opportunity_id: number | string;
  logged_hours: number;
  manager_evaluation: string;
  notes?: string;
}
