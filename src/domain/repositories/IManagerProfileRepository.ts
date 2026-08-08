// ==============================
// Domain Repository Interface — IManagerProfileRepository
// ==============================

import {
  ManagerProfile,
  UpdatePersonalProfilePayload,
  ChangePasswordPayload,
} from "../entities/ManagerProfile";

export interface IManagerProfileRepository {
  getProfile(): Promise<ManagerProfile>;
  updateProfile(payload: UpdatePersonalProfilePayload): Promise<ManagerProfile>;
  changePassword(payload: ChangePasswordPayload): Promise<boolean>;
  toggleTwoFactor(): Promise<boolean>;
}
