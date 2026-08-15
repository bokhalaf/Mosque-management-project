import { DailySummary } from "../../entities/Donation";
import { IDonationRepository } from "../../repositories/IDonationRepository";

export class GetDailySummaryUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(): Promise<DailySummary> {
    return await this.donationRepository.getDailySummary();
  }
}
