// ==============================
// Domain Repository Interface — IManagerProfileRepository
// ==============================

import {
  ManagerProfile,
  UpdateProfilePayload,
  ConfirmEmailPayload,
  UserProfileData,
} from "../entities/ManagerProfile";

export interface IManagerProfileRepository {
  getProfile(): Promise<ManagerProfile>;
  updateProfile(payload: UpdateProfilePayload): Promise<ManagerProfile>;
  confirmEmail(payload: ConfirmEmailPayload): Promise<boolean>;
  changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string): Promise<boolean>;
  toggleTwoFactor(): Promise<boolean>;
}
