import { Donation, Campaign, FinancialStats, AddCashDonationPayload, AddCampaignPayload } from "../entities/Donation";

export interface IDonationRepository {
  getDonations(): Promise<Donation[]>;
  getCampaigns(): Promise<Campaign[]>;
  getStats(): Promise<FinancialStats>;
  addCashDonation(payload: AddCashDonationPayload): Promise<any>;
  getDonationByReference(reference: string): Promise<Donation>;
  downloadReceipt(reference: string): Promise<Blob>;
  getCampaignStats(): Promise<any>;
  getCampaignById(id: string): Promise<Campaign>;
  addCampaign(payload: AddCampaignPayload): Promise<any>;
}
