// ==============================
// Presentation Hook — useMosque
// ==============================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MosqueDetail, UpdateMosquePayload, CreateSpacePayload } from "../../domain/entities/Mosque";
import { getMosqueRepository } from "../../data/factories/repositoryFactory";
import {
  GetMosqueDetailsUseCase,
  UpdateMosqueDetailsUseCase,
  CreateSpaceUseCase,
  DeleteSpaceUseCase,
} from "../../domain/usecases/mosques";

export function useMosque(mosqueId: number | string = 20) {
  const repository = useMemo(() => getMosqueRepository(), []);
  const getMosqueDetailsUC = useMemo(() => new GetMosqueDetailsUseCase(repository), [repository]);
  const updateMosqueDetailsUC = useMemo(() => new UpdateMosqueDetailsUseCase(repository), [repository]);
  const createSpaceUC = useMemo(() => new CreateSpaceUseCase(repository), [repository]);
  const deleteSpaceUC = useMemo(() => new DeleteSpaceUseCase(repository), [repository]);

  const [mosque, setMosque] = useState<MosqueDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMosque = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMosqueDetailsUC.execute(mosqueId);
      setMosque(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل بيانات المسجد");
    } finally {
      setLoading(false);
    }
  }, [mosqueId, getMosqueDetailsUC]);

  useEffect(() => {
    fetchMosque();
  }, [fetchMosque]);

  const updateMosque = useCallback(async (payload: UpdateMosquePayload) => {
    try {
      const updated = await updateMosqueDetailsUC.execute(mosqueId, payload);
      setMosque(updated);
      return updated;
    } catch (err: any) {
      throw new Error(err.message || "فشل تحديث بيانات المسجد");
    }
  }, [mosqueId, updateMosqueDetailsUC]);

  const addSpace = useCallback(async (payload: CreateSpacePayload) => {
    try {
      const newSpace = await createSpaceUC.execute(mosqueId, payload);
      setMosque(prev => prev ? { ...prev, spaces: [newSpace, ...(prev.spaces || [])] } : prev);
      return newSpace;
    } catch (err: any) {
      throw new Error(err.message || "فشل إضافة القاعة/المرفق");
    }
  }, [mosqueId, createSpaceUC]);

  const deleteSpace = useCallback(async (spaceId: number | string) => {
    try {
      await deleteSpaceUC.execute(mosqueId, spaceId);
      setMosque(prev => prev ? {
        ...prev,
        spaces: (prev.spaces || []).filter(s => String(s.id) !== String(spaceId))
      } : prev);
    } catch (err: any) {
      throw new Error(err.message || "فشل حذف المرفق");
    }
  }, [mosqueId, deleteSpaceUC]);

  return {
    mosque,
    loading,
    error,
    fetchMosque,
    updateMosque,
    addSpace,
    deleteSpace,
  };
}
