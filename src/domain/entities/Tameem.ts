// ==============================
// Domain Entity — Tameem (Circulars / التعاميم)
// ==============================

export interface TameemRecipient {
  id: number | string;
  name?: string;
  email?: string;
  role?: string;
  is_read?: boolean;
  read_at?: string | null;
}

export interface Tameem {
  id: string | number;
  title: string;
  content: string;
  sender_id?: number | string;
  sender_name?: string;
  recipients?: TameemRecipient[];
  target_role?: string; // e.g. 'mosque_manager' | 'all'
  mosque_id?: string | number;
  mosque_name?: string;
  created_at?: string;
  updated_at?: string;
  is_read?: boolean; // Managed by current user
  read_at?: string | null;
  attachments?: string[];
  priority?: 'high' | 'normal' | 'urgent';
}

export interface CreateTameemPayload {
  title: string;
  content: string;
  recipient_ids?: number[];
  all_mosque_managers?: boolean;
  priority?: 'high' | 'normal' | 'urgent';
  target_role?: string;
  mosque_id?: string | number;
  attachments?: File[];
}

export interface CreateTameemForMosquePayload {
  title: string;
  content: string;
  recipient_ids?: number[];
  all_staff?: boolean;
  all_teachers?: boolean;
  all_supervisors?: boolean;
  priority?: 'high' | 'normal' | 'urgent';
}

export interface UpdateTameemPayload {
  title?: string;
  content?: string;
  recipient_ids?: number[];
  all_mosque_managers?: boolean;
  priority?: 'high' | 'normal' | 'urgent';
}
