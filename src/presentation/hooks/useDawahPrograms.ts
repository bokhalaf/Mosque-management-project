// ==============================
// Presentation Hook — useDawahPrograms
// ==============================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DawahProgram,
  ProgramSchedule,
  DawahProgramStats,
  CreateDawahProgramPayload,
  UpdateDawahProgramPayload,
  CreateProgramSchedulePayload,
  UpdateProgramSchedulePayload,
  MosqueSpace,
  MyMosqueDetails,
} from '../../domain/entities/DawahProgram';
import { DawahProgramRepositoryImpl } from '../../data/repositories/DawahProgramRepositoryImpl';
import { GetDawahProgramsUseCase } from '../../domain/usecases/dawah/GetDawahProgramsUseCase';
import { CreateDawahProgramUseCase } from '../../domain/usecases/dawah/CreateDawahProgramUseCase';
import { UpdateDawahProgramUseCase } from '../../domain/usecases/dawah/UpdateDawahProgramUseCase';
import { GetDawahProgramByIdUseCase } from '../../domain/usecases/dawah/GetDawahProgramByIdUseCase';
import { DeleteDawahProgramUseCase } from '../../domain/usecases/dawah/DeleteDawahProgramUseCase';
import { GetProgramSchedulesUseCase } from '../../domain/usecases/dawah/GetProgramSchedulesUseCase';
import { AddProgramScheduleUseCase } from '../../domain/usecases/dawah/AddProgramScheduleUseCase';
import { UpdateProgramScheduleUseCase } from '../../domain/usecases/dawah/UpdateProgramScheduleUseCase';
import { DeleteProgramScheduleUseCase } from '../../domain/usecases/dawah/DeleteProgramScheduleUseCase';
import { GetDawahStatsUseCase } from '../../domain/usecases/dawah/GetDawahStatsUseCase';
import { GetMyMosqueUseCase } from '../../domain/usecases/dawah/GetMyMosqueUseCase';
import { GetMosqueSpacesUseCase } from '../../domain/usecases/dawah/GetMosqueSpacesUseCase';

export interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function useDawahPrograms() {
  const [programs, setPrograms] = useState<DawahProgram[]>([]);
  const [myMosque, setMyMosque] = useState<MyMosqueDetails | null>(null);
  const [spaces, setSpaces] = useState<MosqueSpace[]>([]);
  const [stats, setStats] = useState<DawahProgramStats>({
    total_programs: 0,
    active_programs: 0,
    total_lectures: 0,
    total_courses: 0,
    total_competitions: 0,
    featured_count: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Debug Box state
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const repository = useMemo(() => new DawahProgramRepositoryImpl(), []);

  const getProgramsUC = useMemo(() => new GetDawahProgramsUseCase(repository), [repository]);
  const createProgramUC = useMemo(() => new CreateDawahProgramUseCase(repository), [repository]);
  const updateProgramUC = useMemo(() => new UpdateDawahProgramUseCase(repository), [repository]);
  const getProgramByIdUC = useMemo(() => new GetDawahProgramByIdUseCase(repository), [repository]);
  const deleteProgramUC = useMemo(() => new DeleteDawahProgramUseCase(repository), [repository]);
  const getSchedulesUC = useMemo(() => new GetProgramSchedulesUseCase(repository), [repository]);
  const addScheduleUC = useMemo(() => new AddProgramScheduleUseCase(repository), [repository]);
  const updateScheduleUC = useMemo(() => new UpdateProgramScheduleUseCase(repository), [repository]);
  const deleteScheduleUC = useMemo(() => new DeleteProgramScheduleUseCase(repository), [repository]);
  const getStatsUC = useMemo(() => new GetDawahStatsUseCase(repository), [repository]);
  const getMyMosqueUC = useMemo(() => new GetMyMosqueUseCase(repository), [repository]);
  const getMosqueSpacesUC = useMemo(() => new GetMosqueSpacesUseCase(repository), [repository]);

  const addDebugLog = useCallback((action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev.slice(0, 15),
    ]);
  }, []);

  const clearDebugLogs = useCallback(() => setDebugLogs([]), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [programsData, statsData, mosqueData] = await Promise.all([
        getProgramsUC.execute({ type: selectedType, q: searchQuery }),
        getStatsUC.execute(),
        getMyMosqueUC.execute(),
      ]);

      setPrograms(programsData);
      setStats(statsData);
      if (mosqueData) {
        setMyMosque(mosqueData);
        if (mosqueData.spaces && mosqueData.spaces.length > 0) {
          setSpaces(mosqueData.spaces);
        } else {
          const fetchedSpaces = await getMosqueSpacesUC.execute(mosqueData.id);
          setSpaces(fetchedSpaces);
        }
      }

      addDebugLog(
        "GET /api/program/mosques/{mosque}/dawah_programs",
        `https://mms-backend-rose.vercel.app/api/program/mosques/${mosqueData?.id || 1}/dawah_programs`,
        200,
        {
          status: true,
          message: "تم جلب البرامج بنجاح من السيرفر",
          data: programsData,
          total: programsData.length,
          stats: statsData,
          myMosque: mosqueData,
        }
      );
    } catch (err: any) {
      setError(err.message || "تعذر تحميل البرامج الدعوية من السيرفر");
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchQuery, getProgramsUC, getStatsUC, getMyMosqueUC, getMosqueSpacesUC, addDebugLog]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createProgram = async (payload: CreateDawahProgramPayload): Promise<DawahProgram> => {
    const created = await createProgramUC.execute(payload);
    addDebugLog(
      "POST /api/program/mosques/dawah_programs",
      `https://mms-backend-rose.vercel.app/api/program/mosques/${created.mosque_id}/dawah_programs`,
      200,
      created
    );
    await loadData();
    return created;
  };

  const updateProgram = async (id: number | string, payload: UpdateDawahProgramPayload): Promise<DawahProgram> => {
    const updated = await updateProgramUC.execute(id, payload);
    addDebugLog(
      "POST /api/program/mosques/dawah_programs/{id}",
      `https://mms-backend-rose.vercel.app/api/program/mosques/${updated.mosque_id}/dawah_programs/${id}`,
      200,
      updated
    );
    await loadData();
    return updated;
  };

  const deleteProgram = async (id: number | string): Promise<boolean> => {
    const success = await deleteProgramUC.execute(id);
    addDebugLog(
      "DELETE /api/program/mosques/dawah_programs/{id}",
      `https://mms-backend-rose.vercel.app/api/program/mosques/dawah_programs/${id}`,
      200,
      { deleted_id: id }
    );
    await loadData();
    return success;
  };

  const getSchedules = async (programId: number | string): Promise<ProgramSchedule[]> => {
    return await getSchedulesUC.execute(programId);
  };

  const addSchedule = async (programId: number | string, schedule: CreateProgramSchedulePayload): Promise<ProgramSchedule> => {
    const added = await addScheduleUC.execute(programId, schedule);
    addDebugLog(
      "POST /api/program/mosques/dawah_programs/schedules",
      `https://mms-backend-rose.vercel.app/api/program/mosques/dawah_programs/${programId}/schedules`,
      200,
      added
    );
    await loadData();
    return added;
  };

  const updateSchedule = async (programId: number | string, scheduleId: number | string, schedule: UpdateProgramSchedulePayload): Promise<ProgramSchedule> => {
    const updated = await updateScheduleUC.execute(programId, scheduleId, schedule);
    addDebugLog(
      "PUT /api/program/mosques/dawah_programs/schedules/{id}",
      `https://mms-backend-rose.vercel.app/api/program/mosques/dawah_programs/${programId}/schedules/${scheduleId}`,
      200,
      updated
    );
    await loadData();
    return updated;
  };

  const deleteSchedule = async (programId: number | string, scheduleId: number | string): Promise<boolean> => {
    const success = await deleteScheduleUC.execute(programId, scheduleId);
    addDebugLog(
      "DELETE /api/program/mosques/dawah_programs/schedules/{id}",
      `https://mms-backend-rose.vercel.app/api/program/mosques/dawah_programs/${programId}/schedules/${scheduleId}`,
      200,
      { program_id: programId, schedule_id: scheduleId }
    );
    await loadData();
    return success;
  };

  const getMosqueSpaces = async (mosqueId?: number): Promise<MosqueSpace[]> => {
    return await getMosqueSpacesUC.execute(mosqueId);
  };

  return {
    programs,
    myMosque,
    spaces,
    stats,
    loading,
    error,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    loadData,
    createProgram,
    updateProgram,
    deleteProgram,
    getSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getMosqueSpaces,
    getProgramById: getProgramByIdUC.execute.bind(getProgramByIdUC),
    debugLogs,
    addDebugLog,
    clearDebugLogs,
    showDebugTerminal,
    setShowDebugTerminal,
  };
}
