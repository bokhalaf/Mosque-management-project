// ==============================
// Presentation — Hook
// useMosqueSpaces: إدارة القاعات والمساحات التابعة للمسجد عبر usecases
// مخصص للاستخدام من MosqueSpacesSection بدل استدعاء الـ repository مباشرة.
// ==============================

import { useMemo } from 'react';
import { getSpaceRepository } from '../../data/factories/repositoryFactory';
import { GetMosqueSpacesUseCase } from '../../domain/usecases/spaces/GetMosqueSpacesUseCase';
import { CreateSpaceUseCase } from '../../domain/usecases/spaces/CreateSpaceUseCase';
import { UpdateSpaceUseCase } from '../../domain/usecases/spaces/UpdateSpaceUseCase';
import { DeleteSpaceUseCase } from '../../domain/usecases/spaces/DeleteSpaceUseCase';
import { MosqueSpace, CreateSpacePayload, UpdateSpacePayload } from '../../domain/entities/Space';

export function useMosqueSpaces() {
  const repository = useMemo(() => getSpaceRepository(), []);
  const getMosqueSpacesUseCase = useMemo(() => new GetMosqueSpacesUseCase(repository), [repository]);
  const createSpaceUseCase = useMemo(() => new CreateSpaceUseCase(repository), [repository]);
  const updateSpaceUseCase = useMemo(() => new UpdateSpaceUseCase(repository), [repository]);
  const deleteSpaceUseCase = useMemo(() => new DeleteSpaceUseCase(repository), [repository]);

  const getMosqueSpaces = (mosqueId: number | string): Promise<MosqueSpace[]> =>
    getMosqueSpacesUseCase.execute(mosqueId);

  const createSpace = (mosqueId: number | string, payload: CreateSpacePayload): Promise<MosqueSpace> =>
    createSpaceUseCase.execute(mosqueId, payload);

  const updateSpace = (
    mosqueId: number | string,
    spaceId: number | string,
    payload: UpdateSpacePayload
  ): Promise<MosqueSpace> => updateSpaceUseCase.execute(mosqueId, spaceId, payload);

  const deleteSpace = (mosqueId: number | string, spaceId: number | string): Promise<boolean> =>
    deleteSpaceUseCase.execute(mosqueId, spaceId);

  return { getMosqueSpaces, createSpace, updateSpace, deleteSpace };
}
