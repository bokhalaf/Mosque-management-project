// ==============================
// Domain Entity — Complaint
// ==============================

export interface ComplaintStats {
  total_complaints: number;
  open_complaints: number;
  urgent_complaints: number;
  resolved_this_month: number;
  avg_response_hours: number;
}

export interface ComplaintUser {
  id: number;
  name: string;
  email: string;
}

export interface MosqueRef {
  id: number;
  name: string;
}

export interface ComplaintFile {
  id: number;
  file_path: string;
  file_name?: string;
  file_type?: string;
}

export interface ComplaintStatusLog {
  id: number;
  status: string;
  note?: string | null;
  created_at: string;
  user?: ComplaintUser;
}

export interface ComplaintItem {
  id: number | string;
  complaint_number: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'canceled' | string;
  priority: 'low' | 'medium' | 'high' | string;
  complaint_type?: 'service_missing' | 'power_outage' | 'corruption' | 'employee_misconduct' | 'technical_issue' | string;
  email?: string | null;
  is_anonymous?: boolean;
  admin_notes?: string | null;
  assigned_admin_id?: number | null;
  assigned_admin?: ComplaintUser | null;
  mosque_id?: number;
  mosque?: MosqueRef | null;
  user?: ComplaintUser | null;
  files?: ComplaintFile[];
  status_logs?: ComplaintStatusLog[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedComplaints {
  data: ComplaintItem[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
  } | null;
}
