import { 
  Donation, 
  DonationDetails, 
  PaginatedDonations, 
  Campaign, 
  PaginatedCampaigns,
  FinancialStats, 
  AddCashDonationPayload, 
  AddCampaignPayload, 
  UpdateCampaignPayload,
  DailySummary 
} from "../entities/Donation";

export interface IDonationRepository {
  getDonations(page?: number, limit?: number, search?: string, type?: string, status?: string): Promise<PaginatedDonations>;
  getCampaigns(page?: number, limit?: number, search?: string, status?: string, priority?: string): Promise<PaginatedCampaigns>;
  getStats(): Promise<FinancialStats>;
  getDailySummary(): Promise<DailySummary>;
  addCashDonation(payload: AddCashDonationPayload): Promise<any>;
  getDonationByReference(reference: string | number): Promise<DonationDetails>;
  downloadReceipt(reference: string | number): Promise<string>;
  getCampaignStats(): Promise<any>;
  getCampaignById(id: string | number): Promise<Campaign>;
  addCampaign(payload: AddCampaignPayload): Promise<any>;
  updateCampaign(id: string | number, payload: UpdateCampaignPayload): Promise<Campaign>;
  deleteCampaign(id: string | number): Promise<boolean>;
}
