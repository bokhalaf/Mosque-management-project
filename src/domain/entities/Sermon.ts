// ==============================
// Domain Entity — Sermon / Khutbah
// ==============================

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  category: 'faith' | 'fiqh' | 'ethics' | 'contemporary' | 'occasions' | string;
  date?: string;
  duration?: string;
  audioUrl?: string;
  audioBlob?: Blob;
  content: string;
  isPublishedForFriday?: boolean;
  status: 'draft' | 'approved' | 'scheduled_for_friday';
  createdAt: string;
}

export interface CreateSermonPayload {
  title: string;
  preacher: string;
  category: string;
  date?: string;
  content: string;
  audioFile?: File | Blob;
  publishForFriday?: boolean;
}
