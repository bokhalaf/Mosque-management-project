// ==============================
// Domain Entity — Quran People (Students, Teachers, Halaqa Supervisors)
// ==============================

// Exact role values accepted by POST /api/invitations/send (Mosque Manager can invite teacher | halaqa_supervisor)
export type PeopleRole = 'student' | 'teacher' | 'halaqa_supervisor';

export interface QuranPerson {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  role: PeopleRole;
  circle_name?: string;
  status: 'active' | 'pending_invitation' | 'inactive';
  joined_date?: string;
  created_at?: string;
  notes?: string;
  mosque_id?: number;
}

export interface SendInvitationPayload {
  mosque_id: number;
  email: string;
  phone: string;
  role: 'teacher' | 'halaqa_supervisor'; // Exact API role values
  name: string;
  notes?: string;
}

export interface QuranPeopleStats {
  total_students: number;
  total_teachers: number;
  total_supervisors: number;
  pending_invitations: number;
}
