import { DonationDetails } from "../../entities/Donation";
import { IDonationRepository } from "../../repositories/IDonationRepository";

export class GetDonationByReferenceUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(reference: string | number): Promise<DonationDetails> {
    return await this.donationRepository.getDonationByReference(reference);
  }
}
