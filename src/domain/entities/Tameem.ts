// ==============================
// Domain Entity — Tameem (Circulars / التعاميم)
// ==============================

export interface Tameem {
  id: string | number;
  title: string;
  content: string;
  target_role?: string; // e.g. 'mosque_manager' | 'all'
  mosque_id?: string | number;
  mosque_name?: string;
  created_at?: string;
  updated_at?: string;
  is_read?: boolean; // Managed by mosque_manager
  read_at?: string;
  attachments?: string[];
  priority?: 'high' | 'normal' | 'urgent';
}

export interface CreateTameemPayload {
  title: string;
  content: string;
  target_role?: string;
  recipient_ids?: number[];
  mosque_id?: string | number;
  priority?: 'high' | 'normal' | 'urgent';
  attachments?: File[];
}

export interface UpdateTameemPayload {
  title?: string;
  content?: string;
  target_role?: string;
  recipient_ids?: number[];
  mosque_id?: string | number;
  priority?: 'high' | 'normal' | 'urgent';
}
