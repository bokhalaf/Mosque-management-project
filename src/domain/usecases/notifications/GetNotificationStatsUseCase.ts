import { NotificationStats } from "../../entities/AppNotification";
import { INotificationRepository } from "../../repositories/INotificationRepository";

export class GetNotificationStatsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(): Promise<NotificationStats> {
    return await this.notificationRepository.getStats();
  }
}
