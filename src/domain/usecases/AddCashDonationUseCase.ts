import { IDonationRepository } from "../repositories/IDonationRepository";
import { AddCashDonationPayload } from "../entities/Donation";

export class AddCashDonationUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(payload: AddCashDonationPayload): Promise<any> {
    return await this.donationRepository.addCashDonation(payload);
  }
}
