// ==============================
// Domain Repository Interface — ISermonRepository
// ==============================

import {
  Sermon,
  CreateSermonPayload,
  SermonSelection,
  StoreSermonSelectionPayload,
  PaginatedSermons
} from "../entities/Sermon";

export interface ISermonRepository {
  getSermons(page?: number, limit?: number): Promise<PaginatedSermons>;
  getArchivedSermons(page?: number, limit?: number): Promise<PaginatedSermons>;
  getPendingSermons(page?: number, limit?: number): Promise<PaginatedSermons>;
  searchSermons(query?: string, page?: number, limit?: number, category?: string): Promise<PaginatedSermons>;
  getSermonById(id: string | number): Promise<Sermon>;
  createSermon(payload: CreateSermonPayload): Promise<Sermon>;
  deleteSermon(id: string | number): Promise<void>;
  
  // Admin Actions for Sermons (Super Admin)
  getMostSelectedSermons(): Promise<Sermon | Sermon[] | null>;
  approveSermon(id: string | number): Promise<void>;
  rejectSermon(id: string | number): Promise<void>;

  // Sermon Selections API
  getSermonSelections(params?: { from_date?: string; to_date?: string }): Promise<SermonSelection[]>;
  getUpcomingSermonSelection(): Promise<SermonSelection | null>;
  storeSermonSelection(payload: StoreSermonSelectionPayload): Promise<SermonSelection>;
  deleteSermonSelection(id: string | number): Promise<void>;
}
