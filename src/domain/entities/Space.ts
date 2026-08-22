// ==============================
// Domain Entity — MosqueSpace
// القاعات والمساحات التابعة للمسجد
// ==============================

export interface MosqueSpace {
  id: number;
  mosque_id: number;
  name: string;
  capacity: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSpacePayload {
  name: string;
  capacity: number;
}

export interface UpdateSpacePayload {
  name?: string;
  capacity?: number;
}
