import { INotificationRepository } from "../../repositories/INotificationRepository";

export class MarkAllNotificationsAsReadUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(): Promise<boolean> {
    return await this.notificationRepository.markAllAsRead();
  }
}
