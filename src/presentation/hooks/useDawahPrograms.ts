'use client';

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
  const [allPrograms, setAllPrograms] = useState<DawahProgram[]>([]);
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

  // Filters & Pagination
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const perPage = 6;

  // Debug Box state
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 6,
  });

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
      const [paginatedResult, statsData, mosqueData] = await Promise.all([
        repository.getDawahProgramsPaginated({
          page,
          per_page: 6,
          type: selectedType,
          q: searchQuery,
        }),
        getStatsUC.execute(),
        getMyMosqueUC.execute(),
      ]);

      setAllPrograms(paginatedResult.data);
      setPagination(paginatedResult.pagination);
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
        `https://mms-backend-rose.vercel.app/api/program/mosques/${mosqueData?.id || 1}/dawah_programs?page=${page}&per_page=6`,
        200,
        {
          status: true,
          message: "تم جلب البرامج المرقّمة من السيرفر بنجاح",
          data: paginatedResult.data,
          pagination: paginatedResult.pagination,
          stats: statsData,
          myMosque: mosqueData,
        }
      );
    } catch (err: any) {
      setError(err.message || "تعذر تحميل البرامج الدعوية من السيرفر");
    } finally {
      setLoading(false);
    }
  }, [page, selectedType, searchQuery, repository, getStatsUC, getMyMosqueUC, getMosqueSpacesUC, addDebugLog]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalCount = pagination.total || allPrograms.length;
  const lastPage = Math.max(1, pagination.lastPage);
  const paginatedPrograms = allPrograms;

  const createProgram = async (payload: CreateDawahProgramPayload): Promise<DawahProgram> => {
    const created = await createProgramUC.execute(payload);
    addDebugLog(
      "POST /api/program/mosques/dawah_programs",
      `https://mms-backend-rose.vercel.app/api/program/mosques/${created.mosque_id}/dawah_programs`,
      200,
      created
    );
    setAllPrograms(prev => [created, ...prev]);
    return created;
  };

  const updateProgram = async (id: number | string, payload: UpdateDawahProgramPayload): Promise<DawahProgram> => {
    const updated = await updateProgramUC.execute(id, payload);
    addDebugLog(
      "POST /api/program/mosques/dawah_programs/{id}",
      `https://mms-backend-rose.vercel.app/api/program/mosques/dawah_programs/${id}`,
      200,
      updated
    );
    setAllPrograms(prev => prev.map(p => String(p.id) === String(id) ? { ...p, ...updated } : p));
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
    setAllPrograms(prev => prev.filter(p => String(p.id) !== String(id)));
    return success;
  };

  const getSchedules = async (programId: number | string): Promise<ProgramSchedule[]> => {
    return await getSchedulesUC.execute(programId);
  };

  // Single-update Schedule methods (updates in-place once upon server response)
  const addSchedule = async (programId: number | string, schedule: CreateProgramSchedulePayload): Promise<ProgramSchedule> => {
    const added = await addScheduleUC.execute(programId, schedule);
    addDebugLog(
      "POST /api/program/mosques/dawah_programs/schedules",
      `https://mms-backend-rose.vercel.app/api/program/mosques/dawah_programs/${programId}/schedules`,
      200,
      added
    );
    // Update local program schedules in-place once
    setAllPrograms(prev =>
      prev.map(p => {
        if (String(p.id) === String(programId)) {
          const currentSchedules = p.schedules || [];
          return {
            ...p,
            schedules: [...currentSchedules, added],
          };
        }
        return p;
      })
    );
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
    setAllPrograms(prev =>
      prev.map(p => {
        if (String(p.id) === String(programId)) {
          const currentSchedules = p.schedules || [];
          return {
            ...p,
            schedules: currentSchedules.map(s => String(s.id) === String(scheduleId) ? { ...s, ...updated } : s),
          };
        }
        return p;
      })
    );
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
    setAllPrograms(prev =>
      prev.map(p => {
        if (String(p.id) === String(programId)) {
          const currentSchedules = p.schedules || [];
          return {
            ...p,
            schedules: currentSchedules.filter(s => String(s.id) !== String(scheduleId)),
          };
        }
        return p;
      })
    );
    return success;
  };

  const getMosqueSpaces = async (mosqueId?: number): Promise<MosqueSpace[]> => {
    return await getMosqueSpacesUC.execute(mosqueId);
  };

  return {
    programs: paginatedPrograms,
    allPrograms,
    filteredPrograms: allPrograms,
    myMosque,
    spaces,
    stats,
    loading,
    error,
    page,
    setPage,
    lastPage,
    totalCount,
    pagination: {
      currentPage: page,
      lastPage,
      total: totalCount,
      perPage,
    },
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
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  };
}
