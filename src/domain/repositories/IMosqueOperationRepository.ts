// ==============================
// Domain Repository Interface — IMosqueOperationRepository
// ==============================

import { MosqueOperation, MosqueOperationsStats } from "../entities/MosqueOperation";

export interface GetMosqueOperationsParams {
  isSuperAdmin: boolean;
  page?: number;
  perPage?: number;
  module?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MosqueOperationsResult {
  operations: MosqueOperation[];
  stats: MosqueOperationsStats;
  totalCount: number;
  lastPage: number;
}

export interface IMosqueOperationRepository {
  getMosqueOperations(params: GetMosqueOperationsParams): Promise<MosqueOperationsResult>;
}
