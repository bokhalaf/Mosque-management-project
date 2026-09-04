// ==============================
// Presentation — Hook
// useManagerProfile: جلب وتحديث بيانات ملف مدير المسجد عبر usecases
// مخصص للاستخدام من MosqueManagerProfileSection بدل استدعاء الـ repository مباشرة.
// ==============================

import { useMemo } from 'react';
import { getManagerProfileRepository } from '../../data/factories/repositoryFactory';
import { GetManagerProfileUseCase } from '../../domain/usecases/manager-profile/GetManagerProfileUseCase';
import { UpdateManagerProfileUseCase } from '../../domain/usecases/manager-profile/UpdateManagerProfileUseCase';
import { ChangeManagerPasswordUseCase } from '../../domain/usecases/manager-profile/ChangeManagerPasswordUseCase';
import { ConfirmManagerEmailUseCase } from '../../domain/usecases/manager-profile/ConfirmManagerEmailUseCase';
import {
  ManagerProfile,
  UpdateProfilePayload,
  ConfirmEmailPayload,
} from '../../domain/entities/ManagerProfile';

export function useManagerProfile() {
  const repository = useMemo(() => getManagerProfileRepository(), []);
  const getProfileUseCase = useMemo(() => new GetManagerProfileUseCase(repository), [repository]);
  const updateProfileUseCase = useMemo(() => new UpdateManagerProfileUseCase(repository), [repository]);
  const changePasswordUseCase = useMemo(() => new ChangeManagerPasswordUseCase(repository), [repository]);
  const confirmEmailUseCase = useMemo(() => new ConfirmManagerEmailUseCase(repository), [repository]);

  const getProfile = (): Promise<ManagerProfile> => getProfileUseCase.execute();

  const updateProfile = (payload: UpdateProfilePayload): Promise<ManagerProfile> =>
    updateProfileUseCase.execute(payload);

  const changePassword = (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ): Promise<boolean> => changePasswordUseCase.execute(currentPassword, newPassword, newPasswordConfirmation);

  const confirmEmail = (payload: ConfirmEmailPayload): Promise<boolean> =>
    confirmEmailUseCase.execute(payload);

  return { getProfile, updateProfile, changePassword, confirmEmail };
}
