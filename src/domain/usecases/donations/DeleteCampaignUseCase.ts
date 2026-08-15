import { IDonationRepository } from "../../repositories/IDonationRepository";

export class DeleteCampaignUseCase {
  constructor(private repository: IDonationRepository) {}

  async execute(id: string | number): Promise<boolean> {
    return await this.repository.deleteCampaign(id);
  }
}
