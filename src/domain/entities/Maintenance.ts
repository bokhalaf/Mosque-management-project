// ==============================
// Domain Entity — Maintenance
// ==============================

export interface MaintenanceStats {
  open_requests: number;
  in_progress: number;
  completed_this_month: number;
  critical: number;
}

export interface MaintenanceUserRef {
  id: number;
  name: string;
  email?: string;
}

export interface MaintenanceMosqueRef {
  id: number;
  name: string;
}

export interface MaintenanceFile {
  id: number;
  file_path: string;
  file_name?: string;
  file_type?: string;
}

export interface MaintenanceStatusLog {
  id: number;
  status: string;
  note?: string | null;
  created_at: string;
  user?: MaintenanceUserRef;
}

export interface MaintenanceRequestItem {
  id: number | string;
  maintenance_number: string;
  title: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'carpentry' | 'cleaning' | 'other' | string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
  requested_by?: MaintenanceUserRef;
  scheduled_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  mosque_id?: number;
  mosque?: MaintenanceMosqueRef | null;
  files?: MaintenanceFile[];
  status_logs?: MaintenanceStatusLog[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedMaintenanceRequests {
  data: MaintenanceRequestItem[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more?: boolean;
  } | null;
}

export interface CreateMaintenancePayload {
  title: string;
  description: string;
  category: string;
  priority: string;
  notes?: string;
  scheduled_at?: string;
  mosque_id?: number;
  files?: File[];
}
