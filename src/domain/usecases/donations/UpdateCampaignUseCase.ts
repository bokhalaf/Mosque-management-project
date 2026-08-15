import { IDonationRepository } from "../../repositories/IDonationRepository";
import { Campaign, UpdateCampaignPayload } from "../../entities/Donation";

export class UpdateCampaignUseCase {
  constructor(private repository: IDonationRepository) {}

  async execute(id: string | number, payload: UpdateCampaignPayload): Promise<Campaign> {
    return await this.repository.updateCampaign(id, payload);
  }
}
