// ==============================
// Domain Repository Interface — IQuranPeopleRepository
// ==============================

import { QuranPerson, SendInvitationPayload, QuranPeopleStats } from "../entities/QuranPeople";

export interface IQuranPeopleRepository {
  getPeople(params?: { role?: string; q?: string }): Promise<QuranPerson[]>;
  getStats(): Promise<QuranPeopleStats>;
  sendInvitation(payload: SendInvitationPayload): Promise<{ success: boolean; message: string; invitation?: any }>;
  resendInvitation(id: string | number): Promise<void>;
}
