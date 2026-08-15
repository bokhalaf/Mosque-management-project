import { FinancialStats } from "../../entities/Donation";
import { IDonationRepository } from "../../repositories/IDonationRepository";

export class GetDonationStatsUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(): Promise<FinancialStats> {
    return await this.donationRepository.getStats();
  }
}
