export interface Donation {
  id: string;
  reference?: string;
  donorName: string;
  amount: number;
  type: 'صدقة' | 'زكاة' | 'كفارة' | 'تبرع عام' | string;
  campaign?: string;
  status: 'مكتمل' | 'قيد المعالجة' | 'فشل' | 'pending' | 'completed' | string;
  date: string;
}

export interface DonationUser {
  id?: number | string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface DonationDetails {
  id: string | number;
  reference: string;
  mosque_id?: number;
  amount: number;
  donation_type: 'cash' | 'in_kind' | string;
  payment_method: 'cash' | 'stripe' | string;
  item_description?: string | null;
  donor_name: string;
  donorPhone?: string;
  donorEmail?: string;
  user_id?: number | null;
  user?: DonationUser | null;
  campaign_id?: number | null;
  campaign_title?: string | null;
  mosque_need_id?: number | null;
  attachment?: string | null;
  status: 'pending' | 'completed' | string;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  _rawResponse?: any;
}

export interface PaginatedDonations {
  data: Donation[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
  _rawResponse?: any;
}

export interface Campaign {
  id: string;
  mosque_id?: number;
  title: string;
  description?: string;
  target_amount?: number;
  collected_amount?: number;
  targetAmount: number;
  raisedAmount: number;
  percent_complete?: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled' | 'urgent' | string;
  priority?: 'high' | 'medium' | 'low' | string;
  start_date?: string;
  end_date?: string | null;
  days_remaining?: number | null;
  remaining_days?: number | null;
  cover_image?: string | null;
  image?: string;
  donors_count?: number;
  donorsCount?: number;
  timeLeft?: string;
  completedDate?: string;
  lastDonations?: { name: string; amount: number; time: string }[];
  mosque?: {
    id: number;
    name: string;
    city?: string;
    image_url?: string | null;
  } | null;
  created_at?: string;
  updated_at?: string;
  _rawResponse?: any;
}

export interface PaginatedCampaigns {
  data: Campaign[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages?: boolean;
  } | null;
  _rawResponse?: any;
}

export interface AddCampaignPayload {
  title: string;
  description?: string;
  targetAmount: number;
  image?: string;
  imageFile?: File | null;
  startDate?: string;
  endDate?: string;
  priority?: string;
  status?: string;
  [key: string]: any;
}

export interface UpdateCampaignPayload {
  title?: string;
  description?: string;
  target_amount?: number;
  start_date?: string;
  end_date?: string;
  priority?: 'high' | 'medium' | 'low' | string;
  status?: 'active' | 'paused' | 'completed' | 'cancelled' | string;
  cover_image?: File | null;
  [key: string]: any;
}

export interface FinancialStats {
  totalDonations: number;
  totalDonationsTrend?: number;
  monthlyDonations: number;
  monthlyDonationsTrend?: number;
  activeCampaigns: number;
  activeCampaignsTrend?: number;
  newDonors: number;
  newDonorsTrend?: number;
}

export interface DailySummary {
  totalToday: number;
  operationsCount: number;
}

export interface AddCashDonationPayload {
  amount: number;
  donor_name?: string;
  donor_phone?: string;
  donor_email?: string;
  campaign_id?: number | string;
  item_description?: string;
  notes?: string;
  type?: 'cash' | 'in_kind' | string;
  receipt_file?: File | null;
  [key: string]: any;
}
