import { IDonationRepository } from "../../repositories/IDonationRepository";

export class GetCampaignStatsUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(): Promise<any> {
    return await this.donationRepository.getCampaignStats();
  }
}
