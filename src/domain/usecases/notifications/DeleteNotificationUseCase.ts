import { INotificationRepository } from "../../repositories/INotificationRepository";

export class DeleteNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(id: number | string): Promise<boolean> {
    return await this.notificationRepository.deleteNotification(id);
  }
}
