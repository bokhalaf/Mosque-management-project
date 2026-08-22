import { MosqueSpace, CreateSpacePayload, UpdateSpacePayload } from '../entities/Space';

export interface ISpaceRepository {
  getMosqueSpaces(mosqueId: number | string): Promise<MosqueSpace[]>;
  getSingleSpace(mosqueId: number | string, spaceId: number | string): Promise<MosqueSpace>;
  createSpace(mosqueId: number | string, payload: CreateSpacePayload): Promise<MosqueSpace>;
  updateSpace(mosqueId: number | string, spaceId: number | string, payload: UpdateSpacePayload): Promise<MosqueSpace>;
  deleteSpace(mosqueId: number | string, spaceId: number | string): Promise<boolean>;
}
