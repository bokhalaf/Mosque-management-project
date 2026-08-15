// ==============================
// Domain Repository Interface — IDawahProgramRepository
// ==============================

import {
  DawahProgram,
  ProgramSchedule,
  CreateDawahProgramPayload,
  UpdateDawahProgramPayload,
  CreateProgramSchedulePayload,
  UpdateProgramSchedulePayload,
  DawahProgramStats,
  MosqueSpace,
  MyMosqueDetails,
} from "../entities/DawahProgram";

export interface IDawahProgramRepository {
  getDawahPrograms(params?: { mosque_id?: number; status?: string; type?: string; q?: string }): Promise<DawahProgram[]>;
  getDawahProgramById(id: number | string): Promise<DawahProgram | null>;
  createDawahProgram(payload: CreateDawahProgramPayload): Promise<DawahProgram>;
  updateDawahProgram(id: number | string, payload: UpdateDawahProgramPayload): Promise<DawahProgram>;
  deleteDawahProgram(id: number | string): Promise<boolean>;
  
  getSchedules(programId: number | string): Promise<ProgramSchedule[]>;
  addSchedule(programId: number | string, payload: CreateProgramSchedulePayload): Promise<ProgramSchedule>;
  updateSchedule(programId: number | string, scheduleId: number | string, payload: UpdateProgramSchedulePayload): Promise<ProgramSchedule>;
  deleteSchedule(programId: number | string, scheduleId: number | string): Promise<boolean>;
  
  getStats(): Promise<DawahProgramStats>;
  getMyMosque(): Promise<MyMosqueDetails | null>;
  getMosqueSpaces(mosqueId?: number): Promise<MosqueSpace[]>;
}
