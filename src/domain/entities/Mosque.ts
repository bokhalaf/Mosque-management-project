// ==============================
// Domain Entity — Mosque, Spaces & Facilities
// ==============================

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
  status: 'active' | 'inactive';
  is_featured?: boolean;
  city?: string;
  district?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  imam: string;
  khatib: string;
  spaces?: MosqueSpace[];
  facilities?: MosqueFacility[];
  updated_at?: string;
}

export interface UpdateMosquePayload {
  name?: string;
  working_hours?: string;
  status?: 'active' | 'inactive';
  imam?: string;
  khatib?: string;
  city?: string;
  district?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  facilities?: MosqueFacility[];
}

export interface CreateSpacePayload {
  name: string;
  capacity?: number;
  description?: string;
}
