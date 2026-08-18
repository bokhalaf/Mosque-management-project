// ==============================
// Domain Entity — MosqueTask
// ==============================

export type MosqueTaskCategory = 'prayer_worship' | 'cleaning' | 'maintenance' | 'activity' | 'administrative' | 'prayer' | 'event' | 'admin';
export type MosqueTaskStatus = 'todo' | 'done' | 'overdue' | 'in_progress';
export type MosqueTaskPriority = 'high' | 'medium' | 'low';

export interface MosqueTask {
  id: number | string;
  mosque_id?: number;
  task_name: string;
  title?: string;
  description?: string;
  category: MosqueTaskCategory;
  priority?: MosqueTaskPriority;
  due_date?: string;
  due_time?: string;
  time?: string;
  status: MosqueTaskStatus;
  is_completed?: boolean;
  assigned_to?: string;
  day_offset?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMosqueTaskPayload {
  mosque_id?: number;
  task_name: string;
  title?: string;
  description?: string;
  category: MosqueTaskCategory;
  priority?: MosqueTaskPriority;
  due_date?: string;
  due_time?: string;
  assigned_to?: string;
}

export interface UpdateMosqueTaskPayload {
  task_name?: string;
  title?: string;
  description?: string;
  category?: MosqueTaskCategory;
  priority?: MosqueTaskPriority;
  due_date?: string;
  due_time?: string;
  assigned_to?: string;
  status?: MosqueTaskStatus;
  is_completed?: boolean;
}

export interface MosqueTaskDateTab {
  key: string;
  label: string;
  date: string;
  day_offset: number;
  count: number;
}

export interface MosqueTaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  progress_percent: number;
}
