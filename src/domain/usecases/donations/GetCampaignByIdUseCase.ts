import { Campaign } from "../../entities/Donation";
import { IDonationRepository } from "../../repositories/IDonationRepository";

export class GetCampaignByIdUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(id: string | number): Promise<Campaign> {
    return await this.donationRepository.getCampaignById(id);
  }
}
