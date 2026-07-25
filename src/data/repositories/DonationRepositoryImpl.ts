import { Donation, PaginatedDonations, Campaign, FinancialStats, AddCashDonationPayload, AddCampaignPayload, DailySummary } from "../../domain/entities/Donation";
import { IDonationRepository } from "../../domain/repositories/IDonationRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

const parseAmount = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  if (typeof val === 'object' && val.value !== undefined) return parseAmount(val.value);
  const cleaned = String(val).replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

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

  async getDonations(page: number = 1, limit: number = 10, search: string = "", type: string = "", status: string = ""): Promise<PaginatedDonations> {
    const mosqueId = this.getMosqueId();
    try {
      let url = `${BASE_URL}/mosques/${mosqueId}/donations?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (type) url += `&type=${encodeURIComponent(type)}`;
      if (status) url += `&status=${encodeURIComponent(status)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      
      const json = await response.json();
      console.log("API Donations Response:", json);
      
      if (!response.ok || json.status === false) {
        console.warn("Failed to fetch donations, returning fallback data.", json?.message || response.statusText);
        return this.getPaginatedFallback(page, limit, search, type, status);
      }
      
      let items = [];
      let rawMeta = null;

      if (Array.isArray(json.data)) {
        items = json.data;
        rawMeta = json.pagination || json.meta || null;
      } else if (json.data && Array.isArray(json.data.data)) {
        items = json.data.data;
        rawMeta = json.pagination || json.meta || json.data;
      } else {
        items = json.data || [];
        rawMeta = json.pagination || json.meta || null;
      }

      const paginationMeta = {
        current_page: rawMeta?.current_page || rawMeta?.currentPage || json.current_page || 1,
        last_page: rawMeta?.last_page || rawMeta?.totalPages || rawMeta?.total_pages || json.last_page || json.total_pages || 1,
        per_page: rawMeta?.per_page || rawMeta?.perPage || rawMeta?.limit || json.per_page || 10,
        total: rawMeta?.total || rawMeta?.totalItems || rawMeta?.total_count || json.total || json.totalCount || items.length
      };
      
      // Map API response to our Domain Entity
      const data = items.map((item: any) => ({
        id: String(item.id || item._id),
        donorName: item.donorName || item.donor_name || 'فاعل خير',
        amount: item.amount || 0,
        type: item.type || 'تبرع عام',
        campaign: typeof item.campaign === 'object' && item.campaign ? item.campaign.title : (item.campaign || item.campaign_name),
        status: item.status || 'مكتمل',
        date: item.date || item.created_at || new Date().toISOString().split('T')[0],
      })) as Donation[];

      return {
        data,
        pagination: paginationMeta || { current_page: 1, last_page: 1, per_page: data.length, total: data.length }
      };
    } catch (error) {
      console.error("Error fetching donations:", error);
      return this.getPaginatedFallback(page, limit, search, type, status);
    }
  }

  private getPaginatedFallback(page: number, limit: number, search: string, type: string, status: string): PaginatedDonations {
    let fallback = this.getFallbackDonations();
    
    if (search) {
      fallback = fallback.filter(d => d.donorName.includes(search) || String(d.amount).includes(search));
    }
    if (type) {
      const mappedType = type === 'cash' ? 'تبرع عام' : 'صدقة';
      fallback = fallback.filter(d => d.type === mappedType || d.type === 'زكاة' || d.type === 'كفارة');
    }
    if (status) {
      const mappedStatus = status === 'completed' ? 'مكتمل' : 'قيد المعالجة';
      fallback = fallback.filter(d => d.status === mappedStatus);
    }

    const total = fallback.length;
    const last_page = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paginated = fallback.slice(start, start + limit);

    return {
      data: paginated,
      pagination: {
        current_page: page,
        last_page: last_page,
        per_page: limit,
        total: total
      }
    };
  }

  async getCampaigns(): Promise<Campaign[]> {
    const mosqueId = this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/mosques/${mosqueId}/campaigns`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      const json = await response.json();
      console.log("API Campaigns Response:", json);
      if (!response.ok || !json.status) {
        return this.getFallbackCampaigns();
      }
      return json.data.map((item: any) => ({
        id: String(item.id || item._id),
        title: item.title || item.name,
        description: item.description,
        targetAmount: parseAmount(item.targetAmount || item.target_amount || item.goalAmount),
        raisedAmount: parseAmount(item.collected_amount || item.raisedAmount || item.raised_amount),
        status: item.status || 'active',
        image: item.cover_image || item.image,
        donorsCount: parseAmount(item.donorsCount || item.donors_count),
        timeLeft: (item.days_remaining !== null && item.days_remaining !== undefined) ? `${item.days_remaining} يوم` : (item.timeLeft || item.time_left || item.daysRemaining || 'غير محدد'),
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
        totalDonations: parseAmount(data.total_donations),
        totalDonationsTrend: data.total_donations?.growth_percent ?? 0,
        monthlyDonations: parseAmount(data.monthly_donations),
        monthlyDonationsTrend: data.monthly_donations?.growth_percent ?? 0,
        activeCampaigns: parseAmount(data.active_campaigns),
        activeCampaignsTrend: data.active_campaigns?.change ?? 0,
        newDonors: parseAmount(data.new_donors),
        newDonorsTrend: data.new_donors?.growth_percent ?? 0,
      };
    } catch (error) {
      console.error("Error fetching donation stats:", error);
      return this.getFallbackStats();
    }
  }

  async getDailySummary(): Promise<DailySummary> {
    const mosqueId = this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/mosques/${mosqueId}/donations/summary`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok || !json.status) {
        return { totalToday: 0, operationsCount: 0 };
      }
      return {
        totalToday: json.data?.total_today || 0,
        operationsCount: json.data?.operations_count || 0,
      };
    } catch (error) {
      return { totalToday: 0, operationsCount: 0 };
    }
  }

  async addCashDonation(payload: AddCashDonationPayload): Promise<any> {
    const mosqueId = this.getMosqueId();

    // API requires multipart/form-data (not JSON)
    const formData = new FormData();
    formData.append("mosque_id", String(mosqueId));
    formData.append("donation_type", "cash");
    formData.append("amount", String(payload.amount));

    if (payload.donor_name) formData.append("donor_name", payload.donor_name);
    if (payload.campaign_id) formData.append("campaign_id", String(payload.campaign_id));
    if (payload.notes) formData.append("notes", payload.notes);
    if (payload.donation_date) formData.append("donation_date", payload.donation_date);

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const response = await fetch(`${BASE_URL}/donations/admin/cash`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // ❌ لا تضع Content-Type هنا — المتصفح يضعها تلقائياً مع الـ boundary
      },
      body: formData,
    });

    const json = await response.json();
    console.log("==== ADD CASH DONATION RESPONSE ====", json);
    if (!response.ok || !json.status) {
      const validationErrors = json.data
        ? Object.entries(json.data).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`).join(' | ')
        : null;
      throw new Error(validationErrors || json.message || "فشل إضافة التبرع");
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
      console.log("API Campaigns Stats Response:", json);
      if (!response.ok || !json.status) throw new Error("فشل جلب إحصائيات الحملات");
      const data = json.data || {};
      return {
        totalRaised: parseAmount(data.total_collected),
        activeCampaigns: parseAmount(data.active_count),
        completedCampaigns: parseAmount(data.completed_count),
        successRate: parseAmount(data.growth_rate_percent)
      };
    } catch (error) {
      console.error("Error fetching campaign stats:", error);
      return { totalRaised: 55000, activeCampaigns: 3, completedCampaigns: 2, successRate: 85 };
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
        targetAmount: parseAmount(item.targetAmount || item.target_amount || item.goalAmount),
        raisedAmount: parseAmount(item.collected_amount || item.raisedAmount || item.raised_amount),
        status: item.status || 'active',
        image: item.cover_image || item.image,
        donorsCount: parseAmount(item.donorsCount || item.donors_count),
        timeLeft: (item.days_remaining !== null && item.days_remaining !== undefined) ? `${item.days_remaining} يوم` : (item.timeLeft || item.time_left || item.daysRemaining || 'غير محدد'),
        completedDate: item.completedDate || item.completed_date,
        lastDonations: item.lastDonations || item.last_donations || [],
      } as Campaign;
    } catch (error) {
      return this.getFallbackCampaigns()[0];
    }
  }

  async addCampaign(payload: any): Promise<any> {
    const mosqueId = this.getMosqueId();
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    // API requires multipart/form-data (not JSON) — and start_date is required
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const formData = new FormData();
    formData.append("mosque_id", String(mosqueId));
    formData.append("title", payload.title);
    formData.append("target_amount", String(payload.targetAmount));
    formData.append("start_date", today); // مطلوب — يبدأ اليوم

    if (payload.description) formData.append("description", payload.description);
    if (payload.endDate)     formData.append("end_date", payload.endDate);
    if (payload.imageFile)   formData.append("cover_image", payload.imageFile, payload.imageFile.name);
    formData.append("status", "active");

    console.log("==== ADD CAMPAIGN PAYLOAD ====", { mosqueId, ...payload, start_date: today });

    const response = await fetch(`${BASE_URL}/campaigns`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // لا تضع Content-Type يدوياً — المتصفح يضعه تلقائياً مع boundary
      },
      body: formData,
    });

    const json = await response.json();
    console.log("==== ADD CAMPAIGN RESPONSE ====", json);

    if (!response.ok || !json.status) {
      console.error("Add Campaign Backend Error:", json);
      // عرض أخطاء التحقق بشكل مفهوم
      const validationErrors = json.data
        ? Object.entries(json.data).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`).join(' | ')
        : null;
      throw new Error(validationErrors || json.message || "فشل إضافة الحملة");
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
      newDonors: 28,
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
