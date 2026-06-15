import { IDonationRepository } from "../repositories/IDonationRepository";
import { Donation } from "../entities/Donation";

export class GetDonationByReferenceUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(reference: string): Promise<Donation> {
    return await this.donationRepository.getDonationByReference(reference);
  }
}
