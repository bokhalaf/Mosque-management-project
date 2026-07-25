import { IDonationRepository } from "../repositories/IDonationRepository";
import { DailySummary } from "../entities/Donation";

export class GetDailySummaryUseCase {
  constructor(private repository: IDonationRepository) {}

  async execute(): Promise<DailySummary> {
    return this.repository.getDailySummary();
  }
}
