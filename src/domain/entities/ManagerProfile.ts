// ==============================
// Domain Entity — ManagerProfile & UserProfile
// مطابقة لردود الـ API الرسمية (GET /api/profile و PUT /api/profile)
// ==============================

export interface ProfilePersonalInfo {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  role_display: string;
  employee_code?: string;
  preferred_language?: string;
  pending_email?: string | null;
}

export interface ProfileMosqueInfo {
  id: number;
  name: string;
  code?: string;
  imam_name?: string;
  khatib_name?: string;
  city_district?: string;
  status?: string;
}

export interface ProfileAccountSecurity {
  status: string;
  status_display: string;
  verification_level: string;
  is_email_verified: boolean;
  has_fcm_token?: boolean;
  created_at: string;
}

export interface UserProfileData {
  personal_info: ProfilePersonalInfo;
  mosque_info?: ProfileMosqueInfo | null;
  account_security: ProfileAccountSecurity;
  _rawResponse?: any;
}

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
  first_name: string;
  last_name: string;
  full_name: string;
  job_title: string;
  phone: string;
  email: string;
  pending_email?: string | null;
  employee_id: string;
  national_id?: string;
  language: string;

  // 2. Associated Mosque Data
  mosque_id: number | string;
  mosque_name: string;
  mosque_image?: string;
  mosque_code: string;
  imam_name?: string;
  khatib_name?: string;
  city: string;
  district: string;
  address: string;
  mosque_status: 'active' | 'inactive' | string;
  appointment_date?: string;

  // 3. Account Security & Details
  username: string;
  created_at: string;
  last_login?: string;
  account_status: 'active' | 'suspended' | string;
  verification_level: 'verified' | 'unverified' | string;
  is_email_verified: boolean;
  two_factor_enabled: boolean;

  // 4. Activity Log
  activities: ActivityLogItem[];

  _rawResponse?: any;
}

export interface UpdateProfilePayload {
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  language?: string;
}

export interface ConfirmEmailPayload {
  otp: string;
}
