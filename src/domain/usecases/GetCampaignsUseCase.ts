import { Campaign } from "../entities/Donation";
import { IDonationRepository } from "../repositories/IDonationRepository";

export class GetCampaignsUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(): Promise<Campaign[]> {
    return await this.donationRepository.getCampaigns();
  }
}
