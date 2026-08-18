// ==============================
// Domain Repository Interface — IMosqueTaskRepository
// ==============================

import {
  MosqueTask,
  CreateMosqueTaskPayload,
  UpdateMosqueTaskPayload,
  MosqueTaskDateTab,
} from '../entities/MosqueTask';

export interface IMosqueTaskRepository {
  getMosqueTasks(params?: { mosque_id?: number; category?: string; date?: string; status?: string }): Promise<MosqueTask[]>;
  getDateTabs(): Promise<MosqueTaskDateTab[]>;
  getNextWeekTasks(): Promise<MosqueTask[]>;
  getFridayTasks(): Promise<MosqueTask[]>;
  createMosqueTask(payload: CreateMosqueTaskPayload): Promise<MosqueTask>;
  updateMosqueTask(id: number | string, payload: UpdateMosqueTaskPayload): Promise<MosqueTask>;
  toggleTaskComplete(id: number | string): Promise<MosqueTask>;
  deleteMosqueTask(id: number | string): Promise<boolean>;
}
