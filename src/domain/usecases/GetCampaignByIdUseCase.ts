import { IDonationRepository } from "../repositories/IDonationRepository";
import { Campaign } from "../entities/Donation";

export class GetCampaignByIdUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(id: string): Promise<Campaign> {
    return await this.donationRepository.getCampaignById(id);
  }
}
