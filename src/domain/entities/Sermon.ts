// ==============================
// Domain Entity — Sermon & Sermon Selection
// ==============================

export interface SermonAttachment {
  id?: number | string;
  url: string;
  file_name?: string;
  file_type?: string;
}

export interface Sermon {
  id: number | string;
  title: string;
  speaker_name?: string;
  preacher?: string;
  sermon_date?: string;
  date?: string;
  category?: 'faith' | 'fiqh' | 'ethics' | 'contemporary' | 'occasions' | string;
  duration?: string;
  audioUrl?: string;
  content: string;
  status: 'pending' | 'Scheduled' | 'approved' | 'rejected' | 'completed' | 'archived' | string;
  notes?: string | null;
  attachments?: (string | SermonAttachment)[];
  isPublishedForFriday?: boolean;
  mosque_manager_id?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
}

export interface CreateSermonPayload {
  title: string;
  speaker_name: string;
  sermon_date: string;
  content: string;
  category?: string;
  notes?: string;
  attachments?: File[];
  audioFile?: File | Blob;
  publishForFriday?: boolean;
}

export interface SermonSelection {
  id: number | string;
  sermon_id: number | string;
  sermon?: Sermon;
  selection_date: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StoreSermonSelectionPayload {
  sermon_id: number | string;
  selection_date?: string;
  notes?: string;
}
