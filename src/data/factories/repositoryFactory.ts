// ==============================
// Repository factory
// Single place that constructs repository implementations, so presentation-layer
// hooks stop doing `new XRepositoryImpl()` (and importing the concrete `data`
// class directly) themselves. Each getter returns a cached singleton instance —
// the repositories are stateless (they read auth/session state per-call via
// authStorage), so one instance per app lifetime is safe and avoids
// re-instantiating on every render.
//
// Usage: `const repo = getDonationRepository();` instead of
// `const repo = new DonationRepositoryImpl();` + a direct import from data/repositories.
// ==============================

import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { IDawahProgramRepository } from "../../domain/repositories/IDawahProgramRepository";
import { IDonationRepository } from "../../domain/repositories/IDonationRepository";
import { IMaintenanceRepository } from "../../domain/repositories/IMaintenanceRepository";
import { IManagerProfileRepository } from "../../domain/repositories/IManagerProfileRepository";
import { IMosqueRepository } from "../../domain/repositories/IMosqueRepository";
import { IMosqueTaskRepository } from "../../domain/repositories/IMosqueTaskRepository";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { IQuranPeopleRepository } from "../../domain/repositories/IQuranPeopleRepository";
import { ISermonRepository } from "../../domain/repositories/ISermonRepository";
import { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { ITameemRepository } from "../../domain/repositories/ITameemRepository";
import { IVolunteerRepository } from "../../domain/repositories/IVolunteerRepository";

import { AuthRepositoryImpl } from "../repositories/AuthRepositoryImpl";
import { ComplaintRepositoryImpl } from "../repositories/ComplaintRepositoryImpl";
import { DawahProgramRepositoryImpl } from "../repositories/DawahProgramRepositoryImpl";
import { DonationRepositoryImpl } from "../repositories/DonationRepositoryImpl";
import { MaintenanceRepositoryImpl } from "../repositories/MaintenanceRepositoryImpl";
import { ManagerProfileRepositoryImpl } from "../repositories/ManagerProfileRepositoryImpl";
import { MosqueRepositoryImpl } from "../repositories/MosqueRepositoryImpl";
import { MosqueTaskRepositoryImpl } from "../repositories/MosqueTaskRepositoryImpl";
import { NotificationRepositoryImpl } from "../repositories/NotificationRepositoryImpl";
import { QuranPeopleRepositoryImpl } from "../repositories/QuranPeopleRepositoryImpl";
import { SermonRepositoryImpl } from "../repositories/SermonRepositoryImpl";
import { SettingsRepositoryImpl } from "../repositories/SettingsRepositoryImpl";
import { SpaceRepositoryImpl } from "../repositories/SpaceRepositoryImpl";
import { TameemRepositoryImpl } from "../repositories/TameemRepositoryImpl";
import { VolunteerRepositoryImpl } from "../repositories/VolunteerRepositoryImpl";

let authRepository: IAuthRepository | null = null;
let complaintRepository: IComplaintRepository | null = null;
let dawahProgramRepository: IDawahProgramRepository | null = null;
let donationRepository: IDonationRepository | null = null;
let maintenanceRepository: IMaintenanceRepository | null = null;
let managerProfileRepository: IManagerProfileRepository | null = null;
let mosqueRepository: IMosqueRepository | null = null;
let mosqueTaskRepository: IMosqueTaskRepository | null = null;
let notificationRepository: INotificationRepository | null = null;
let quranPeopleRepository: IQuranPeopleRepository | null = null;
let sermonRepository: ISermonRepository | null = null;
let settingsRepository: ISettingsRepository | null = null;
let spaceRepository: ISpaceRepository | null = null;
let tameemRepository: ITameemRepository | null = null;
let volunteerRepository: IVolunteerRepository | null = null;

export function getAuthRepository(): IAuthRepository {
  if (!authRepository) authRepository = new AuthRepositoryImpl();
  return authRepository;
}

export function getComplaintRepository(): IComplaintRepository {
  if (!complaintRepository) complaintRepository = new ComplaintRepositoryImpl();
  return complaintRepository;
}

export function getDawahProgramRepository(): IDawahProgramRepository {
  if (!dawahProgramRepository) dawahProgramRepository = new DawahProgramRepositoryImpl();
  return dawahProgramRepository;
}

export function getDonationRepository(): IDonationRepository {
  if (!donationRepository) donationRepository = new DonationRepositoryImpl();
  return donationRepository;
}

export function getMaintenanceRepository(): IMaintenanceRepository {
  if (!maintenanceRepository) maintenanceRepository = new MaintenanceRepositoryImpl();
  return maintenanceRepository;
}

export function getManagerProfileRepository(): IManagerProfileRepository {
  if (!managerProfileRepository) managerProfileRepository = new ManagerProfileRepositoryImpl();
  return managerProfileRepository;
}

export function getMosqueRepository(): IMosqueRepository {
  if (!mosqueRepository) mosqueRepository = new MosqueRepositoryImpl();
  return mosqueRepository;
}

export function getMosqueTaskRepository(): IMosqueTaskRepository {
  if (!mosqueTaskRepository) mosqueTaskRepository = new MosqueTaskRepositoryImpl();
  return mosqueTaskRepository;
}

export function getNotificationRepository(): INotificationRepository {
  if (!notificationRepository) notificationRepository = new NotificationRepositoryImpl();
  return notificationRepository;
}

export function getQuranPeopleRepository(): IQuranPeopleRepository {
  if (!quranPeopleRepository) quranPeopleRepository = new QuranPeopleRepositoryImpl();
  return quranPeopleRepository;
}

export function getSermonRepository(): ISermonRepository {
  if (!sermonRepository) sermonRepository = new SermonRepositoryImpl();
  return sermonRepository;
}

export function getSettingsRepository(): ISettingsRepository {
  if (!settingsRepository) settingsRepository = new SettingsRepositoryImpl();
  return settingsRepository;
}

export function getSpaceRepository(): ISpaceRepository {
  if (!spaceRepository) spaceRepository = new SpaceRepositoryImpl();
  return spaceRepository;
}

export function getTameemRepository(): ITameemRepository {
  if (!tameemRepository) tameemRepository = new TameemRepositoryImpl();
  return tameemRepository;
}

export function getVolunteerRepository(): IVolunteerRepository {
  if (!volunteerRepository) volunteerRepository = new VolunteerRepositoryImpl();
  return volunteerRepository;
}
