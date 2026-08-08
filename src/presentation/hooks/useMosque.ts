// ==============================
// Presentation Hook — useMosque
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { MosqueDetail, UpdateMosquePayload, CreateSpacePayload } from "../../domain/entities/Mosque";
import { MosqueRepositoryImpl } from "../../data/repositories/MosqueRepositoryImpl";

const repository = new MosqueRepositoryImpl();

export function useMosque(mosqueId: number | string = 20) {
  const [mosque, setMosque] = useState<MosqueDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMosque = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.getMosqueDetails(mosqueId);
      setMosque(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل بيانات المسجد");
    } finally {
      setLoading(false);
    }
  }, [mosqueId]);

  useEffect(() => {
    fetchMosque();
  }, [fetchMosque]);

  const updateMosque = useCallback(async (payload: UpdateMosquePayload) => {
    try {
      const updated = await repository.updateMosqueDetails(mosqueId, payload);
      setMosque(updated);
      return updated;
    } catch (err: any) {
      throw new Error(err.message || "فشل تحديث بيانات المسجد");
    }
  }, [mosqueId]);

  const addSpace = useCallback(async (payload: CreateSpacePayload) => {
    try {
      const newSpace = await repository.createSpace(mosqueId, payload);
      setMosque(prev => prev ? { ...prev, spaces: [newSpace, ...(prev.spaces || [])] } : prev);
      return newSpace;
    } catch (err: any) {
      throw new Error(err.message || "فشل إضافة القاعة/المرفق");
    }
  }, [mosqueId]);

  const deleteSpace = useCallback(async (spaceId: number | string) => {
    try {
      await repository.deleteSpace(mosqueId, spaceId);
      setMosque(prev => prev ? {
        ...prev,
        spaces: (prev.spaces || []).filter(s => String(s.id) !== String(spaceId))
      } : prev);
    } catch (err: any) {
      throw new Error(err.message || "فشل حذف المرفق");
    }
  }, [mosqueId]);

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
