import { AddCampaignPayload } from "../../entities/Donation";
import { IDonationRepository } from "../../repositories/IDonationRepository";

export class AddCampaignUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(payload: AddCampaignPayload): Promise<any> {
    return await this.donationRepository.addCampaign(payload);
  }
}
