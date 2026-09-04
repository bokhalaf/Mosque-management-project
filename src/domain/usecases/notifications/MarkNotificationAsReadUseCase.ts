import { INotificationRepository } from "../../repositories/INotificationRepository";

export class MarkNotificationAsReadUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(id: number | string): Promise<boolean> {
    return await this.notificationRepository.markAsRead(id);
  }
}
