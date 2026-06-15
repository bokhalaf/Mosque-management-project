export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  type: 'صدقة' | 'زكاة' | 'كفارة' | 'تبرع عام';
  campaign?: string;
  status: 'مكتمل' | 'قيد المعالجة' | 'فشل';
  date: string;
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  raisedAmount: number;
  status: 'active' | 'completed' | 'urgent';
  image?: string;
  donorsCount?: number;
  timeLeft?: string;
  completedDate?: string;
  lastDonations?: { name: string; amount: number; time: string }[];
}

export interface AddCampaignPayload {
  title: string;
  description: string;
  targetAmount: number;
  image?: string;
  [key: string]: any;
}

export interface FinancialStats {
  totalDonations: number;
  monthlyDonations: number;
  activeCampaigns: number;
  pendingReceipts: number;
  growthPercentage: number;
}

export interface AddCashDonationPayload {
  amount: number;
  donor_name?: string;
  donor_phone?: string;
  campaign_id?: number | string;
  notes?: string;
  type?: string;
  [key: string]: any;
}
