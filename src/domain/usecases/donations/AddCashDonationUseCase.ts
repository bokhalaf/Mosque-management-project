import { AddCashDonationPayload } from "../../entities/Donation";
import { IDonationRepository } from "../../repositories/IDonationRepository";

export class AddCashDonationUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(payload: AddCashDonationPayload): Promise<any> {
    return await this.donationRepository.addCashDonation(payload);
  }
}
