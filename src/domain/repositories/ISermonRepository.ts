// ==============================
// Domain Repository Interface — ISermonRepository
// ==============================

import { Sermon, CreateSermonPayload, SermonSelection, StoreSermonSelectionPayload } from "../entities/Sermon";

export interface ISermonRepository {
  getSermons(): Promise<Sermon[]>;
  getArchivedSermons(): Promise<Sermon[]>;
  getPendingSermons(): Promise<Sermon[]>;
  searchSermons(query: string): Promise<Sermon[]>;
  getSermonById(id: string | number): Promise<Sermon>;
  createSermon(payload: CreateSermonPayload): Promise<Sermon>;
  
  // Sermon Selections API
  getSermonSelections(): Promise<SermonSelection[]>;
  getUpcomingSermonSelection(): Promise<SermonSelection | null>;
  storeSermonSelection(payload: StoreSermonSelectionPayload): Promise<SermonSelection>;
  deleteSermonSelection(id: string | number): Promise<void>;
}
