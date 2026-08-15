import { PaginatedDonations } from "../../entities/Donation";
import { IDonationRepository } from "../../repositories/IDonationRepository";

export class GetDonationsUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(page: number = 1, limit: number = 5, search: string = "", type: string = "", status: string = ""): Promise<PaginatedDonations> {
    return await this.donationRepository.getDonations(page, limit, search, type, status);
  }
}
