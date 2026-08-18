// ==============================
// Domain Repository Interface — ITameemRepository
// ==============================

import { Tameem, CreateTameemPayload, UpdateTameemPayload } from "../entities/Tameem";

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
  getTameemById(id: string | number): Promise<Tameem>;
  createTameem(payload: CreateTameemPayload): Promise<Tameem>;
  updateTameem(id: string | number, payload: UpdateTameemPayload): Promise<Tameem>;
  deleteTameem(id: string | number): Promise<void>;
  markTameemAsRead(id: string | number): Promise<void>;
}
