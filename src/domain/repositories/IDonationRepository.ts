import { Donation, PaginatedDonations, Campaign, FinancialStats, AddCashDonationPayload, AddCampaignPayload, DailySummary } from "../entities/Donation";

export interface IDonationRepository {
  getDonations(page?: number, limit?: number, search?: string, type?: string, status?: string): Promise<PaginatedDonations>;
  getCampaigns(): Promise<Campaign[]>;
  getStats(): Promise<FinancialStats>;
  getDailySummary(): Promise<DailySummary>;
  addCashDonation(payload: AddCashDonationPayload): Promise<any>;
  getDonationByReference(reference: string): Promise<Donation>;
  downloadReceipt(reference: string): Promise<Blob>;
  getCampaignStats(): Promise<any>;
  getCampaignById(id: string): Promise<Campaign>;
  addCampaign(payload: AddCampaignPayload): Promise<any>;
}
