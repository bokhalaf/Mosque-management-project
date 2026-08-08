// ==============================
// Domain Entity — ManagerProfile
// ==============================

export interface ActivityLogItem {
  id: string | number;
  action: string;
  details: string;
  timestamp: string;
  type: 'update' | 'create' | 'report' | 'security';
}

export interface ManagerProfile {
  // 1. Personal Identity
  avatar_url?: string;
  full_name: string;
  job_title: string;
  phone: string;
  email: string;
  employee_id: string;
  national_id?: string;
  language: string;

  // 2. Associated Mosque Data
  mosque_id: number | string;
  mosque_name: string;
  mosque_image?: string;
  city: string;
  district: string;
  address: string;
  mosque_code: string;
  mosque_status: 'active' | 'inactive';
  appointment_date: string;

  // 3. Account Security & Details
  username: string;
  created_at: string;
  last_login: string;
  account_status: 'active' | 'suspended';
  verification_level: 'verified' | 'unverified';
  two_factor_enabled: boolean;

  // 4. Activity Log
  activities: ActivityLogItem[];
}

export interface UpdatePersonalProfilePayload {
  full_name?: string;
  phone?: string;
  email?: string;
  language?: string;
}

export interface ChangePasswordPayload {
  current_password?: string;
  new_password?: string;
}
