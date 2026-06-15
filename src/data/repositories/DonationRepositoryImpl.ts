import { Donation, Campaign, FinancialStats } from "../../domain/entities/Donation";
import { IDonationRepository } from "../../domain/repositories/IDonationRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

export class DonationRepositoryImpl implements IDonationRepository {
  
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private getMosqueId(): number {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("auth_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.mosque_id || 1; 
        } catch (e) {
          return 1;
        }
      }
    }
    return 1;
  }

  async getDonations(): Promise<Donation[]> {
    const mosqueId = this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/mosques/${mosqueId}/donations/recent`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      
      const json = await response.json();
      console.log("API Recent Donations Response:", json);
      
      if (!response.ok || !json.status) {
        console.warn("Failed to fetch donations, returning fallback data.", json.message);
        return this.getFallbackDonations();
      }
      
      // Map API response to our Domain Entity
      // Assuming API returns an array of objects similar to `Donation` interface, 
      // but we handle potential missing fields gracefully
      return json.data.map((item: any) => ({
        id: String(item.id || item._id),
        donorName: item.donorName || item.donor_name || 'فاعل خير',
        amount: item.amount || 0,
        type: item.type || 'تبرع عام',
        campaign: typeof item.campaign === 'object' && item.campaign ? item.campaign.title : (item.campaign || item.campaign_name),
        status: item.status || 'مكتمل',
        date: item.date || item.created_at || new Date().toISOString().split('T')[0],
      })) as Donation[];
    } catch (error) {
      console.error("Error fetching recent donations:", error);
      return this.getFallbackDonations();
    }
  }

  async getCampaigns(): Promise<Campaign[]> {
    const mosqueId = this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/mosques/${mosqueId}/campaigns`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok || !json.status) {
        return this.getFallbackCampaigns();
      }
      return json.data.map((item: any) => ({
        id: String(item.id || item._id),
        title: item.title || item.name,
        description: item.description,
        targetAmount: item.targetAmount || item.target_amount || item.goalAmount || 0,
        raisedAmount: item.raisedAmount || item.raised_amount || 0,
        status: item.status || 'active',
        image: item.image,
        donorsCount: item.donorsCount || item.donors_count || 0,
        timeLeft: item.days_remaining ? `${item.days_remaining} يوم` : (item.timeLeft || item.time_left || item.daysRemaining),
        completedDate: item.completedDate || item.completed_date,
        lastDonations: item.lastDonations || item.last_donations || [],
      })) as Campaign[];
    } catch (error) {
      return this.getFallbackCampaigns();
    }
  }

  async getStats(): Promise<FinancialStats> {
    const mosqueId = this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/mosques/${mosqueId}/donations/stats`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      
      const json = await response.json();
      console.log("API Donations Stats Response:", json);
      
      if (!response.ok || !json.status) {
        console.warn("Failed to fetch donation stats, returning fallback data.", json.message);
        return this.getFallbackStats();
      }
      
      // Map API response to our Domain Entity
      const data = json.data || {};
      return {
        totalDonations: data.totalDonations || data.total_donations || 0,
        monthlyDonations: data.monthlyDonations || data.monthly_donations || 0,
        activeCampaigns: data.activeCampaigns || data.active_campaigns || 0,
        pendingReceipts: data.pendingReceipts || data.pending_receipts || 0,
        growthPercentage: data.growthPercentage || data.growth_percentage || 0,
      };
    } catch (error) {
      console.error("Error fetching donation stats:", error);
      return this.getFallbackStats();
    }
  }

  async addCashDonation(payload: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/admin/cash`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    const json = await response.json();
    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل إضافة التبرع");
    }
    return json;
  }

  async getDonationByReference(reference: string): Promise<Donation> {
    const response = await fetch(`${BASE_URL}/donations/${reference}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    
    const json = await response.json();
    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل جلب تفاصيل التبرع");
    }
    
    const item = json.data;
    return {
      id: String(item.id || item._id || item.reference),
      donorName: item.donorName || item.donor_name || 'فاعل خير',
      amount: item.amount || 0,
      type: item.type || 'تبرع عام',
      campaign: typeof item.campaign === 'object' && item.campaign ? item.campaign.title : (item.campaign || item.campaign_name),
      status: item.status || 'مكتمل',
      date: item.date || item.created_at || new Date().toISOString().split('T')[0],
    } as Donation;
  }

  async downloadReceipt(reference: string): Promise<Blob> {
    const response = await fetch(`${BASE_URL}/donations/${reference}/receipt`, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
        "Accept": "application/pdf, application/octet-stream, */*",
      },
    });
    
    if (!response.ok) {
      throw new Error("فشل تحميل الإيصال");
    }
    
    return await response.blob();
  }

  async getCampaignStats(): Promise<any> {
    const mosqueId = this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/mosques/${mosqueId}/campaigns/stats`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok || !json.status) throw new Error("فشل جلب إحصائيات الحملات");
      return json.data;
    } catch (error) {
      return { totalCampaigns: 5, activeCampaigns: 3, totalRaised: 55000, targetAmount: 100000 };
    }
  }

  async getCampaignById(id: string): Promise<Campaign> {
    try {
      const response = await fetch(`${BASE_URL}/campaigns/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok || !json.status) throw new Error("فشل جلب تفاصيل الحملة");
      const item = json.data;
      return {
        id: String(item.id || item._id),
        title: item.title || item.name,
        description: item.description,
        targetAmount: item.targetAmount || item.target_amount || item.goalAmount || 0,
        raisedAmount: item.raisedAmount || item.raised_amount || 0,
        status: item.status || 'active',
        image: item.image,
        donorsCount: item.donorsCount || item.donors_count || 0,
        timeLeft: item.days_remaining ? `${item.days_remaining} يوم` : (item.timeLeft || item.time_left || item.daysRemaining),
        completedDate: item.completedDate || item.completed_date,
        lastDonations: item.lastDonations || item.last_donations || [],
      } as Campaign;
    } catch (error) {
      return this.getFallbackCampaigns()[0];
    }
  }

  async addCampaign(payload: any): Promise<any> {
    const mosqueId = this.getMosqueId();
    const mappedPayload = {
      mosque_id: mosqueId,
      title: payload.title,
      description: payload.description,
      target_amount: payload.targetAmount,
      end_date: payload.endDate,
      category: payload.category,
      image: payload.image,
      status: 'active'
    };

    console.log("==== ADD CAMPAIGN PAYLOAD ====", mappedPayload);

    const response = await fetch(`${BASE_URL}/campaigns`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(mappedPayload),
    });
    
    const json = await response.json();
    console.log("==== ADD CAMPAIGN RESPONSE ====", json);

    if (!response.ok || !json.status) {
      console.error("Add Campaign Backend Error:", json);
      throw new Error(json.message || JSON.stringify(json.errors) || "فشل إضافة الحملة");
    }
    return json;
  }

  // Fallback methods for resilience
  private getFallbackDonations(): Donation[] {
    return [
      { id: '1', donorName: 'أحمد محمد', amount: 500, type: 'صدقة', campaign: 'إفطار صائم', status: 'مكتمل', date: '2024-05-10' },
      { id: '2', donorName: 'سارة علي', amount: 1000, type: 'زكاة', status: 'مكتمل', date: '2024-05-11' },
      { id: '3', donorName: 'محمود حسن', amount: 200, type: 'تبرع عام', campaign: 'ترميم المسجد', status: 'قيد المعالجة', date: '2024-05-12' },
      { id: '4', donorName: 'فاطمة إبراهيم', amount: 1500, type: 'صدقة', campaign: 'كفالة يتيم', status: 'مكتمل', date: '2024-05-13' },
      { id: '5', donorName: 'ياسين كمال', amount: 300, type: 'كفارة', status: 'فشل', date: '2024-05-14' },
    ];
  }

  private getFallbackStats(): FinancialStats {
    return {
      totalDonations: 125400,
      monthlyDonations: 15200,
      activeCampaigns: 4,
      pendingReceipts: 12,
      growthPercentage: 15.5,
    };
  }

  private getFallbackCampaigns(): Campaign[] {
    return [
      { id: '1', title: 'ترميم مئذنة المسجد', description: 'حملة لترميم المئذنة', targetAmount: 50000, raisedAmount: 35000, status: 'active' },
      { id: '2', title: 'إفطار صائم 2024', description: 'توفير وجبات', targetAmount: 20000, raisedAmount: 20000, status: 'completed' },
      { id: '3', title: 'كفالة طلاب العلم', description: 'كفالة 10 طلاب', targetAmount: 15000, raisedAmount: 4500, status: 'urgent' },
    ];
  }
}
