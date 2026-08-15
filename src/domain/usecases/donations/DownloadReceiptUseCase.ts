import { IDonationRepository } from "../../repositories/IDonationRepository";

export class DownloadReceiptUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(reference: string | number): Promise<string> {
    return await this.donationRepository.downloadReceipt(reference);
  }
}
