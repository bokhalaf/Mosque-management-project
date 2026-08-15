import { PaginatedCampaigns } from "../../entities/Donation";
import { IDonationRepository } from "../../repositories/IDonationRepository";

export class GetCampaignsUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(page: number = 1, limit: number = 4, search?: string, status?: string, priority?: string): Promise<PaginatedCampaigns> {
    return await this.donationRepository.getCampaigns(page, limit, search, status, priority);
  }
}
