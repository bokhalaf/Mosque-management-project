// ==============================
// Domain Repository Interface — IMosqueRepository
// ==============================

import { MosqueDetail, UpdateMosquePayload, GeoGovernorate } from "../entities/Mosque";

export interface PaginatedMosques {
  data: MosqueDetail[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateMosquePayload {
  name: string;
  image?: File | string | null;
  city_id?: number;
  district_id?: number;
  city?: string;
  district?: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
  working_hours?: string;
  status?: 'active' | 'inactive' | 'maintenance' | 'closed';
  is_featured?: boolean;
  imam?: string;
  khatib?: string;
  manager_id?: number;
}

export interface MosqueFilterOptions {
  page?: number;
  limit?: number; // per_page
  search?: string;
  status?: 'active' | 'maintenance' | 'closed' | 'inactive' | 'all';
  is_featured?: boolean;
  city_id?: number | string;
  district_id?: number | string;
  min_rating?: number;
  sort_by?: 'name' | 'city' | 'district' | 'average_rating' | 'reviews_count' | 'created_at';
  sort_order?: 'asc' | 'desc';
  facility_id?: number;
}

export interface IMosqueRepository {
  getMosques(options?: MosqueFilterOptions | number, limit?: number): Promise<PaginatedMosques>;
  searchMosques(query: string, page?: number, limit?: number, filters?: Partial<MosqueFilterOptions>): Promise<PaginatedMosques>;
  getMosqueById(id: string | number): Promise<MosqueDetail>;
  getFeaturedMosques(): Promise<MosqueDetail[]>;
  createMosque(payload: CreateMosquePayload): Promise<MosqueDetail>;
  updateMosque(id: string | number, payload: UpdateMosquePayload): Promise<MosqueDetail>;
  deleteMosque(id: string | number): Promise<void>;
  updateMosqueStatus(id: string | number, status: 'active' | 'inactive' | 'maintenance' | 'closed'): Promise<void>;
  toggleMosqueFeatured(id: string | number): Promise<boolean>;
  updateMosqueRating(id: string | number, rating: number): Promise<void>;
  getGeoCatalog(): Promise<GeoGovernorate[]>;
}

