import { IDonationRepository } from "../repositories/IDonationRepository";
import { AddCampaignPayload } from "../entities/Donation";

export class AddCampaignUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(payload: AddCampaignPayload): Promise<any> {
    return await this.donationRepository.addCampaign(payload);
  }
}
