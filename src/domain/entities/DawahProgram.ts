// ==============================
// Domain Entity — Dawah Programs & Program Schedules
// ==============================

export type DawahProgramType = 'lecture' | 'course' | 'competition' | 'compition' | 'other';
export type DawahProgramStatus = 'active' | 'inactive';
export type DawahProgramLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ProgramSchedule {
  id: number | string;
  dawah_program_id: number | string;
  title?: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  created_at?: string;
  updated_at?: string;
}

export interface DawahProgram {
  id: number | string;
  mosque_id: number;
  mosque_name?: string;
  mosque?: {
    id: number;
    name: string;
    image?: string | null;
    status?: string;
    is_featured?: boolean;
    city?: string | null;
    district?: string | null;
  };
  space_id?: number;
  space_name?: string;
  program_name: string;
  description?: string;
  type: DawahProgramType;
  image?: string;
  presenter: string;
  presenter_image?: string;
  is_featured: boolean;
  status: DawahProgramStatus;
  level: DawahProgramLevel;
  schedules?: ProgramSchedule[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateDawahProgramPayload {
  mosque_id?: number;
  space_id?: number;
  program_name: string;
  description?: string;
  type: DawahProgramType;
  presenter: string;
  is_featured?: boolean;
  status?: DawahProgramStatus;
  level?: DawahProgramLevel;
  image?: string;
  presenter_image?: string;
  schedules?: {
    title?: string;
    notes?: string;
    date: string;
    start_time: string;
    end_time: string;
  }[];
}

export interface UpdateDawahProgramPayload extends Partial<CreateDawahProgramPayload> {}

export interface CreateProgramSchedulePayload {
  dawah_program_id?: number | string;
  title?: string;
  notes?: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface UpdateProgramSchedulePayload extends Partial<CreateProgramSchedulePayload> {}

export interface DawahProgramStats {
  total_programs: number;
  active_programs: number;
  total_lectures: number;
  total_courses: number;
  total_competitions: number;
  featured_count: number;
}

export interface MosqueSpace {
  id: number | string;
  name: string;
  type?: string;
  capacity?: number;
}

export interface MyMosqueDetails {
  id: number;
  name: string;
  city?: string;
  district?: string;
  spaces?: MosqueSpace[];
}

export interface DawahPaginatedResponse {
  data: DawahProgram[];
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  };
}
