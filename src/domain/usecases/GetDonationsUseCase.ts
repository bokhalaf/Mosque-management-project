import { Donation } from "../entities/Donation";
import { IDonationRepository } from "../repositories/IDonationRepository";

export class GetDonationsUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(): Promise<Donation[]> {
    return await this.donationRepository.getDonations();
  }
}
