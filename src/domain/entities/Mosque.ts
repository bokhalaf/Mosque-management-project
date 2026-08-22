// ==============================
// Domain Entity — Mosque, Spaces & Facilities
// ==============================

export interface GeoDistrict {
  id: number;
  name: string;
  lat?: number;
  lng?: number;
}

export interface GeoCity {
  id: number;
  name: string;
  lat?: number;
  lng?: number;
  districts?: GeoDistrict[];
}

export interface GeoGovernorate {
  id: number;
  name: string;
  lat?: number;
  lng?: number;
  cities: GeoCity[];
}

export interface MosqueSpace {
  id: number | string;
  mosque_id: number | string;
  name: string;
  capacity?: number;
  description?: string;
  created_at?: string;
}

export interface MosqueFacility {
  id: number | string;
  name: string;
  icon?: string;
  description?: string;
  is_enabled?: boolean;
}

export interface MosqueDetail {
  id: number | string;
  name: string;
  image?: string;
  image_url?: string;
  working_hours: string;
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
  is_featured?: boolean;
  city_id?: number;
  district_id?: number;
  city?: string;
  district?: string;
  address?: string;
  latitude?: string | number;
  longitude?: string | number;
  imam: string;
  khatib: string;
  manager_id?: number;
  average_rating?: number;
  reviews_count?: number;
  created_at?: string;
  updated_at?: string;
  spaces?: MosqueSpace[];
  facilities?: MosqueFacility[];
}

export interface UpdateMosquePayload {
  name?: string;
  image?: File | string | null;
  working_hours?: string | string[];
  status?: 'active' | 'maintenance' | 'closed' | 'inactive';
  is_featured?: boolean;
  city_id?: number;
  district_id?: number;
  city?: string;
  district?: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
  imam?: string;
  khatib?: string;
  manager_id?: number;
  facilities?: MosqueFacility[];
  _method?: string;
}

export interface CreateSpacePayload {
  name: string;
  capacity?: number;
  description?: string;
}

