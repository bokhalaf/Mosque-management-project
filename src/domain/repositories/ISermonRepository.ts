// ==============================
// Domain Repository Interface — ISermonRepository
// ==============================

import { Sermon, CreateSermonPayload } from "../entities/Sermon";

export interface ISermonRepository {
  getSermons(): Promise<Sermon[]>;
  getSermonById(id: string | number): Promise<Sermon>;
  createSermon(payload: CreateSermonPayload): Promise<Sermon>;
}
