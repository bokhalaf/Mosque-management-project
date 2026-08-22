// ==============================
// Domain Repository Interface — ITameemRepository
// ==============================

import { 
  Tameem, 
  CreateTameemPayload, 
  CreateTameemForMosquePayload, 
  UpdateTameemPayload 
} from "../entities/Tameem";

export interface PaginatedTameems {
  data: Tameem[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ITameemRepository {
  getTameems(page?: number, limit?: number): Promise<PaginatedTameems>;
  getMyTameems(page?: number, limit?: number): Promise<PaginatedTameems>;
  getSentTameems(page?: number, limit?: number): Promise<PaginatedTameems>;
  getTameemById(id: string | number): Promise<Tameem>;
  createTameem(payload: CreateTameemPayload): Promise<Tameem>;
  createTameemForMosque(payload: CreateTameemForMosquePayload): Promise<Tameem>;
  updateTameem(id: string | number, payload: UpdateTameemPayload): Promise<Tameem>;
  deleteTameem(id: string | number): Promise<void>;
  markTameemAsRead(id: string | number): Promise<void>;
}
