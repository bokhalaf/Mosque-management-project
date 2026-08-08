// ==============================
// Domain Repository Interface — IMosqueRepository
// ==============================

import {
  MosqueDetail,
  UpdateMosquePayload,
  MosqueSpace,
  CreateSpacePayload,
  MosqueFacility,
} from "../entities/Mosque";

export interface IMosqueRepository {
  getMosqueDetails(mosqueId?: number | string): Promise<MosqueDetail>;
  updateMosqueDetails(mosqueId: number | string, payload: UpdateMosquePayload): Promise<MosqueDetail>;
  
  getSpaces(mosqueId: number | string): Promise<MosqueSpace[]>;
  createSpace(mosqueId: number | string, payload: CreateSpacePayload): Promise<MosqueSpace>;
  deleteSpace(mosqueId: number | string, spaceId: number | string): Promise<boolean>;

  getFacilities(mosqueId: number | string): Promise<MosqueFacility[]>;
  syncFacilities(mosqueId: number | string, facilityIds: (number | string)[]): Promise<boolean>;
}
