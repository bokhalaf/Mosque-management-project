import { AppNotification } from "../../entities/AppNotification";
import { INotificationRepository } from "../../repositories/INotificationRepository";

export class GetNotificationsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(): Promise<AppNotification[]> {
    return await this.notificationRepository.getNotifications();
  }
}
