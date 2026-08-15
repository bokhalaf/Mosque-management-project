// ==============================
// 1️⃣ طبقة Domain — Entities
// تعريف شكل البيانات فقط، لا منطق
// ==============================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  status: string;
  email_verified_at: string;
  roles: string[];
  permissions: string[];
  mosque_id?: number | null;
  mosque?: {
    id: number;
    name: string;
    city?: string;
    image_url?: string | null;
  } | null;
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}
