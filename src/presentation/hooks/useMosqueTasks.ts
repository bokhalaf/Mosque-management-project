'use client';

// ==============================
// Presentation Hook — useMosqueTasks
// ==============================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  MosqueTask,
  CreateMosqueTaskPayload,
  UpdateMosqueTaskPayload,
  MosqueTaskDateTab,
  MosqueTaskCategory,
  MosqueTaskStatus,
  MosqueTaskStats,
} from '../../domain/entities/MosqueTask';
import { MosqueTaskRepositoryImpl } from '../../data/repositories/MosqueTaskRepositoryImpl';
import {
  GetMosqueTasksUseCase,
  GetMosqueTaskDateTabsUseCase,
  GetNextWeekTasksUseCase,
  GetFridayTasksUseCase,
  CreateMosqueTaskUseCase,
  UpdateMosqueTaskUseCase,
  ToggleTaskCompleteUseCase,
  DeleteMosqueTaskUseCase,
} from '../../domain/usecases/tasks';

export interface MosqueTaskDebugLog {
  id: string;
  time: string;
  method: string;
  url: string;
  status?: number;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

// Module-level interceptor & listener pool for Debug Terminal
const globalDebugListeners: Array<(log: MosqueTaskDebugLog) => void> = [];
let isInterceptorInstalled = false;

function installFetchInterceptor() {
  if (isInterceptorInstalled || typeof window === 'undefined') return;
  isInterceptorInstalled = true;

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';
    const isMosqueTaskApi = url.includes('/api/mosque/tasks') || url.includes('/api/mosque-tasks');

    if (!isMosqueTaskApi) {
      return originalFetch.apply(this, args);
    }

    const method = (args[1]?.method || 'GET').toUpperCase();
    let requestBody: any = null;
    if (args[1]?.body) {
      try {
        requestBody = JSON.parse(args[1].body as string);
      } catch {
        requestBody = args[1].body;
      }
    }

    const startTime = Date.now();
    try {
      const response = await originalFetch.apply(this, args);
      const cloned = response.clone();

      let responseBody: any = null;
      try {
        responseBody = await cloned.json();
      } catch {
        responseBody = await cloned.text();
      }

      const logItem: MosqueTaskDebugLog = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        time: new Date().toLocaleTimeString('ar-SA'),
        method,
        url,
        status: response.status,
        requestBody,
        responseBody,
      };

      globalDebugListeners.forEach(fn => fn(logItem));
      return response;
    } catch (err: any) {
      const logItem: MosqueTaskDebugLog = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        time: new Date().toLocaleTimeString('ar-SA'),
        method,
        url,
        error: err.message || 'شبكة غير متصلة',
      };
      globalDebugListeners.forEach(fn => fn(logItem));
      throw err;
    }
  };
}



export function useMosqueTasks() {
  const repository = useMemo(() => new MosqueTaskRepositoryImpl(), []);

  const getTasksUC = useMemo(() => new GetMosqueTasksUseCase(repository), [repository]);
  const getDateTabsUC = useMemo(() => new GetMosqueTaskDateTabsUseCase(repository), [repository]);
  const getNextWeekUC = useMemo(() => new GetNextWeekTasksUseCase(repository), [repository]);
  const getFridayUC = useMemo(() => new GetFridayTasksUseCase(repository), [repository]);
  const createTaskUC = useMemo(() => new CreateMosqueTaskUseCase(repository), [repository]);
  const updateTaskUC = useMemo(() => new UpdateMosqueTaskUseCase(repository), [repository]);
  const toggleCompleteUC = useMemo(() => new ToggleTaskCompleteUseCase(repository), [repository]);
  const deleteTaskUC = useMemo(() => new DeleteMosqueTaskUseCase(repository), [repository]);

  const [tasks, setTasks] = useState<MosqueTask[]>([]);
  const [dateTabs, setDateTabs] = useState<MosqueTaskDateTab[]>([]);
  const [nextWeekTasks, setNextWeekTasks] = useState<MosqueTask[]>([]);
  const [fridayTasks, setFridayTasks] = useState<MosqueTask[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeDayOffset, setActiveDayOffset] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<MosqueTaskCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'done'>('all');

  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<MosqueTaskDebugLog[]>([]);

  const listenerRef = useRef<((log: MosqueTaskDebugLog) => void) | null>(null);

  useEffect(() => {
    installFetchInterceptor();

    const listener = (log: MosqueTaskDebugLog) => {
      setDebugLogs(prev => [log, ...prev.slice(0, 29)]);
    };
    listenerRef.current = listener;
    globalDebugListeners.push(listener);

    return () => {
      const idx = globalDebugListeners.indexOf(listener);
      if (idx !== -1) globalDebugListeners.splice(idx, 1);
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allTasks, tabs, nextWk, fri] = await Promise.all([
        getTasksUC.execute(),
        getDateTabsUC.execute(),
        getNextWeekUC.execute(),
        getFridayUC.execute(),
      ]);

      setTasks(allTasks || []);
      setDateTabs(tabs || []);
      setNextWeekTasks(nextWk || []);
      setFridayTasks(fri || []);
    } catch (err: any) {
      setError(err.message || 'تعذر جلب مهام المسجد من السيرفر');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [getTasksUC, getDateTabsUC, getNextWeekUC, getFridayUC]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create Task (Strict server verification, throws error directly on failure)
  const createTask = useCallback(async (payload: CreateMosqueTaskPayload) => {
    const newTask = await createTaskUC.execute(payload);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [createTaskUC]);

  // Update Task (Strict server verification, throws error directly on failure)
  const updateTask = useCallback(async (id: number | string, payload: UpdateMosqueTaskPayload) => {
    const updated = await updateTaskUC.execute(id, payload);
    setTasks(prev => prev.map(t => String(t.id) === String(id) ? { ...t, ...updated } : t));
    return updated;
  }, [updateTaskUC]);

  // Toggle Task Completion (Wait for Server Response First - STRICT server verification)
  const toggleTask = useCallback(async (id: number | string) => {
    const updated = await toggleCompleteUC.execute(id);
    setTasks(prev => prev.map(t => {
      if (String(t.id) === String(id)) {
        const isDone = updated?.is_completed ?? (updated?.status === 'done');
        return {
          ...t,
          ...updated,
          is_completed: isDone,
          status: isDone ? 'done' : 'todo',
        };
      }
      return t;
    }));
    return updated;
  }, [toggleCompleteUC]);

  // Delete Task
  const deleteTask = useCallback(async (id: number | string) => {
    setTasks(prev => prev.filter(t => String(t.id) !== String(id)));
    try {
      await deleteTaskUC.execute(id);
    } catch (err) {
      console.warn("Task delete sync note:", err);
    }
  }, [deleteTaskUC]);

  // Filtered Tasks for Active View
  const currentDayTasks = useMemo(() => {
    return tasks.filter(t => {
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (statusFilter === 'todo' && (t.status === 'done' || t.is_completed)) return false;
      if (statusFilter === 'done' && t.status !== 'done' && !t.is_completed) return false;
      return true;
    });
  }, [tasks, categoryFilter, statusFilter]);

  // Stats calculation
  const stats: MosqueTaskStats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'done' || t.is_completed).length;
    const total = tasks.length;
    const pending = total - completed;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    const progress_percent = total ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, progress_percent };
  }, [tasks]);

  return {
    tasks,
    currentDayTasks,
    dateTabs,
    nextWeekTasks,
    fridayTasks,
    stats,
    loading,
    error,
    activeDayOffset,
    setActiveDayOffset,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs: () => setDebugLogs([]),
    fetchTasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  };
}
