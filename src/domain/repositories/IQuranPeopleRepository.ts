// ==============================
// Domain Repository Interface — IQuranPeopleRepository
// ==============================

import { QuranPerson, SendInvitationPayload, QuranPeopleStats } from "../entities/QuranPeople";

export interface IQuranPeopleRepository {
  getPeople(params?: { role?: string; status?: string; q?: string; page?: number; per_page?: number }): Promise<{ data: QuranPerson[]; pagination: { currentPage: number; lastPage: number; total: number; perPage: number } }>;
  getStats(): Promise<QuranPeopleStats>;
  sendInvitation(payload: SendInvitationPayload): Promise<{ success: boolean; message: string; invitation?: any }>;
  getInvitations(status?: string): Promise<{ data: any[]; rawResponse?: any }>;
  resendInvitation(id: string | number): Promise<void>;
  resendInvitationApi(invitationId: string | number): Promise<{ success: boolean; message: string; rawResponse?: any }>;
  deleteInvitationApi(invitationId: string | number): Promise<{ success: boolean; message: string; rawResponse?: any }>;
  updatePersonStatus(id: string | number, status: 'active' | 'pending_invitation' | 'inactive'): Promise<boolean>;
  changeUserStatus(userId: string | number, status: 'active' | 'inactive'): Promise<{ success: boolean; message: string; rawResponse?: any }>;
  deletePerson(id: string | number): Promise<boolean>;
}
