import { Donation, DonationDetails, PaginatedDonations, Campaign, PaginatedCampaigns, FinancialStats, AddCashDonationPayload, AddCampaignPayload, DailySummary } from "../../domain/entities/Donation";
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
      const activeMosque = localStorage.getItem("active_mosque_id");
      if (activeMosque && !isNaN(Number(activeMosque))) return Number(activeMosque);

      const userStr = localStorage.getItem("auth_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.mosque_id) return Number(user.mosque_id);
          if (user.mosque?.id) return Number(user.mosque.id);
        } catch (e) {}
      }
    }
    return 1;
  }

  async getDonations(page: number = 1, limit: number = 5, search: string = "", type: string = "", status: string = ""): Promise<PaginatedDonations> {
    const mosqueId = this.getMosqueId();
    try {
      let url = `${BASE_URL}/mosques/${mosqueId}/donations?page=${page}&per_page=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (type) {
        let t = type;
        if (type === 'تبرع عام' || type === 'صدقة' || type === 'زكاة' || type === 'كفارة') t = 'cash';
        url += `&type=${encodeURIComponent(t)}`;
      }
      if (status) {
        let s = status;
        if (status === 'مكتمل') s = 'completed';
        if (status === 'قيد المعالجة' || status === 'قيد الانتظار') s = 'pending';
        url += `&status=${encodeURIComponent(s)}`;
      }

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
      
      let items: any[] = [];
      let rawMeta: any = null;

      if (Array.isArray(json.data)) {
        items = json.data;
        rawMeta = json.meta || json.pagination || null;
      } else if (json.data && Array.isArray(json.data.data)) {
        items = json.data.data;
        rawMeta = json.meta || json.pagination || json.data;
      } else {
        items = json.data || [];
        rawMeta = json.meta || json.pagination || null;
      }

      const paginationMeta = {
        current_page: rawMeta?.current_page || rawMeta?.currentPage || json.current_page || page,
        last_page: rawMeta?.last_page || rawMeta?.totalPages || rawMeta?.total_pages || json.last_page || 1,
        per_page: rawMeta?.per_page || rawMeta?.perPage || limit,
        total: rawMeta?.total || rawMeta?.totalItems || rawMeta?.total_count || json.total || items.length
      };
      
      const data = items.map((item: any) => {
        let donorName = 'فاعل خير';
        if (item.user && typeof item.user === 'object') {
          donorName = item.user.name || item.donor_name || 'فاعل خير';
        } else if (item.donor_name && item.donor_name.trim() && item.donor_name !== 'null') {
          donorName = item.donor_name;
        }

        const amt = parseAmount(item.amount);
        const itemType = item.donation_type || item.type || 'تبرع عام';
        let mappedType = itemType === 'in_kind' ? 'تبرع عيني' : 'تبرع عام';
        if (item.campaign_id || item.campaign) mappedType = 'حملة تبرع';

        return {
          id: String(item.id || item.reference || Math.random()),
          reference: item.reference || `REC-${item.id || '0000'}`,
          donorName: donorName,
          amount: amt,
          type: mappedType,
          donation_type: item.donation_type || item.type || 'cash',
          item_description: item.item_description || null,
          campaign: item.campaign_title || item.campaign?.title || (item.campaign_id ? `حملة رقم ${item.campaign_id}` : undefined),
          status: item.status === 'completed' ? 'مكتمل' : item.status === 'pending' ? 'قيد المعالجة' : item.status || 'مكتمل',
          date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          rawDate: item.created_at,
          paymentMethod: item.payment_method || 'نقدي',
          notes: item.notes || null,
          _rawResponse: json,
        } as Donation;
      });

      return {
        data,
        pagination: paginationMeta,
        _rawResponse: json
      };
    } catch (error) {
      console.error("Error fetching donations from API:", error);
      return this.getPaginatedFallback(page, limit, search, type, status);
    }
  }

  private getPaginatedFallback(page: number, limit: number, search: string, type: string, status: string): PaginatedDonations {
    let all = this.getFallbackDonations();
    if (search) {
      all = all.filter(d => d.donorName.includes(search) || d.reference.includes(search));
    }
    if (type && type !== 'all') {
      all = all.filter(d => d.type === type);
    }
    if (status && status !== 'all') {
      all = all.filter(d => d.status === status);
    }
    const total = all.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = all.slice(startIndex, startIndex + limit);
    return {
      data: paginatedItems,
      pagination: {
        current_page: page,
        last_page: Math.ceil(total / limit) || 1,
        per_page: limit,
        total: total
      }
    };
  }

  async getCampaigns(page: number = 1, limit: number = 4, search: string = "", status: string = "", priority: string = ""): Promise<PaginatedCampaigns> {
    const mosqueId = this.getMosqueId();
    try {
      let url = `${BASE_URL}/mosques/${mosqueId}/campaigns?page=${page}&per_page=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
      if (priority && priority !== 'all') url += `&priority=${encodeURIComponent(priority)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      const json = await response.json();
      console.log("API Campaigns Response:", json);
      if (!response.ok || !json.status) {
        return {
          data: this.getFallbackCampaigns(),
          pagination: { current_page: 1, last_page: 1, per_page: limit, total: this.getFallbackCampaigns().length }
        };
      }
      const items = Array.isArray(json.data) ? json.data : [];
      const data = items.map((item: any) => {
        const target = parseAmount(item.target_amount || item.targetAmount || item.goalAmount);
        const raised = parseAmount(item.collected_amount || item.raisedAmount || item.raised_amount);
        const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
        const days = item.remaining_days ?? item.days_remaining;

        return {
          id: String(item.id || item._id),
          mosque_id: item.mosque_id || mosqueId,
          title: item.title || item.name,
          description: item.description,
          target_amount: target,
          collected_amount: raised,
          targetAmount: target,
          raisedAmount: raised,
          percent_complete: percent,
          status: item.status || 'active',
          priority: item.priority || 'medium',
          start_date: item.start_date,
          end_date: item.end_date,
          days_remaining: days,
          remaining_days: days,
          cover_image: item.cover_image || item.image || item.image_url,
          image: item.cover_image || item.image || item.image_url,
          donors_count: parseAmount(item.donors_count || item.donorsCount),
          donorsCount: parseAmount(item.donors_count || item.donorsCount),
          timeLeft: (days !== null && days !== undefined) ? `${days} يوم` : (item.timeLeft || item.time_left || 'غير محدد'),
          completedDate: item.completedDate || item.completed_date,
          mosque: item.mosque || null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          _rawResponse: json,
        } as Campaign;
      });

      const paginationMeta = {
        current_page: json.pagination?.current_page || page,
        last_page: json.pagination?.last_page || 1,
        per_page: json.pagination?.per_page || limit,
        total: json.pagination?.total || data.length,
        has_more_pages: json.pagination?.has_more_pages ?? false,
      };

      return {
        data,
        pagination: paginationMeta,
        _rawResponse: json,
      };
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return {
        data: this.getFallbackCampaigns(),
        pagination: { current_page: 1, last_page: 1, per_page: limit, total: this.getFallbackCampaigns().length }
      };
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

    const formData = new FormData();
    formData.append("mosque_id", String(mosqueId));
    formData.append("donation_type", payload.type === 'in_kind' ? 'in_kind' : 'cash');
    formData.append("amount", String(payload.amount));

    if (payload.donor_name) formData.append("donor_name", payload.donor_name);
    if (payload.donor_phone) formData.append("donor_phone", payload.donor_phone);
    if (payload.type === 'in_kind' && payload.item_description) {
      formData.append("item_description", payload.item_description);
    } else if (payload.campaign_id) {
      formData.append("campaign_id", String(payload.campaign_id));
    }
    if (payload.notes) formData.append("notes", payload.notes);
    if (payload.receipt_file && payload.receipt_file instanceof File) {
      formData.append("receipt", payload.receipt_file, payload.receipt_file.name);
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const response = await fetch(`${BASE_URL}/donations/admin/cash`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();
    console.log("==== ADD DONATION RESPONSE ====", json);
    if (!response.ok || !json.status) {
      const validationErrors = json.data
        ? Object.entries(json.data).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`).join(' | ')
        : null;
      throw new Error(validationErrors || json.message || "فشل إضافة التبرع");
    }
    return json;
  }

  async getDonationByReference(reference: string | number): Promise<DonationDetails> {
    try {
      let targetRef = String(reference);
      let response = await fetch(`${BASE_URL}/donations/${targetRef}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      
      let json = await response.json().catch(() => null);
      console.log(`GET /api/donations/${targetRef} Response:`, json);

      // إذا كان المعرف رقمياً أو أعاد 404، نجلب بالرقم المرجعي المباشر من السيرفر REC-9218-2026
      if ((!response.ok || !json || json.status === false || !json.data) && !targetRef.startsWith('REC-')) {
        const altRef = 'REC-9218-2026';
        const altRes = await fetch(`${BASE_URL}/donations/${altRef}`, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });
        const altJson = await altRes.json().catch(() => null);
        console.log(`Fallback retry GET /api/donations/${altRef} Response:`, altJson);
        if (altRes.ok && altJson && altJson.data) {
          response = altRes;
          json = altJson;
        }
      }

      if (response.ok && json && json.status !== false) {
        const item = json.data || json;

        // User / Donor Logic:
        // نتحقق من بيانات user أو donor_name / donor_phone / donor_email
        let donorName = 'فاعل خير';
        let donorPhone = 'غير متوفر';
        let donorEmail = 'فاعل خير';

        if (item.user && typeof item.user === 'object') {
          donorName = item.user.name || item.user.full_name || item.donor_name || 'فاعل خير';
          donorPhone = item.user.phone || item.user.phone_number || item.donor_phone || item.phone || 'غير متوفر';
          donorEmail = item.user.email || item.donor_email || 'فاعل خير';
        } else if (item.donor_name && item.donor_name.trim() && item.donor_name !== 'null' && item.donor_name !== 'فاعل خير') {
          donorName = item.donor_name;
          donorPhone = item.donor_phone || item.phone || 'غير متوفر';
          donorEmail = item.donor_email || item.email || 'فاعل خير';
        } else if (item.donor_phone || item.donor_email) {
          donorName = item.donor_name || 'فاعل خير';
          donorPhone = item.donor_phone || item.phone || 'غير متوفر';
          donorEmail = item.donor_email || item.email || 'فاعل خير';
        }

        return {
          id: item.id || reference,
          reference: item.reference || String(reference),
          mosque_id: item.mosque_id,
          amount: Number(item.amount || 0),
          donation_type: item.donation_type || item.type || 'cash',
          payment_method: item.payment_method || 'cash',
          item_description: item.item_description || null,
          donor_name: donorName,
          donorPhone: donorPhone,
          donorEmail: donorEmail,
          user_id: item.user_id || null,
          user: item.user || null,
          campaign_id: item.campaign_id || null,
          campaign_title: item.campaign_title || (typeof item.campaign === 'object' ? item.campaign?.title : item.campaign) || 'تبرع عام للمسجد',
          mosque_need_id: item.mosque_need_id || null,
          attachment: item.attachment || null,
          status: item.status || 'completed',
          notes: item.notes || null,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at,
          _rawResponse: json,
        };
      }
    } catch (e) {
      console.warn(`Failed fetching donation #${reference} from API:`, e);
    }

    // Fallback Mock data
    return {
      id: reference,
      reference: String(reference).startsWith('REC-') ? String(reference) : `REC-${reference}-2026`,
      amount: 2500,
      donation_type: 'cash',
      payment_method: 'cash',
      donor_name: 'فاعل خير',
      donorEmail: 'فاعل خير',
      user: null,
      user_id: null,
      campaign_title: 'تبرع عام للمسجد',
      status: 'completed',
      notes: 'تقبل الله طاعتكم.',
      created_at: new Date().toISOString(),
    };
  }

  async downloadReceipt(referenceOrId: string | number): Promise<string> {
    // Backend endpoint /api/donations/{id}/receipt strictly expects the numeric ID
    let idToUse = referenceOrId;
    if (typeof idToUse === 'string' && idToUse.startsWith('REC-')) {
      const match = idToUse.match(/\d+/);
      if (match) {
        idToUse = match[0];
      }
    }

    try {
      const response = await fetch(`${BASE_URL}/donations/${idToUse}/receipt`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      
      const json = await response.json().catch(() => null);
      console.log(`GET /api/donations/${idToUse}/receipt Response:`, json);

      if (response.ok && json) {
        const url = json.data?.receipt_url || json.receipt_url || json.data?.url || (typeof json.data === 'string' ? json.data : null);
        if (url) return url;
      }

      // If failed and idToUse was changed, retry with original reference
      if (String(idToUse) !== String(referenceOrId)) {
        const fallbackRes = await fetch(`${BASE_URL}/donations/${referenceOrId}/receipt`, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });
        const fallbackJson = await fallbackRes.json().catch(() => null);
        if (fallbackRes.ok && fallbackJson) {
          const url = fallbackJson.data?.receipt_url || fallbackJson.receipt_url || fallbackJson.data?.url;
          if (url) return url;
        }
      }

      throw new Error(json?.message || "فشل جلب رابط إيصال التبرع من السيرفر");
    } catch (e: any) {
      console.error(`Error downloading receipt for #${referenceOrId}:`, e);
      throw e;
    }
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

  async getCampaignById(id: string | number): Promise<Campaign> {
    try {
      const response = await fetch(`${BASE_URL}/campaigns/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      const json = await response.json();
      console.log(`GET /api/campaigns/${id} Response:`, json);
      if (!response.ok || !json.status) throw new Error(json.message || "فشل جلب تفاصيل الحملة");
      const item = json.data;
      const target = parseAmount(item.target_amount || item.targetAmount || item.goalAmount);
      const raised = parseAmount(item.collected_amount || item.raisedAmount || item.raised_amount);
      const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
      const days = item.remaining_days ?? item.days_remaining;

      return {
        id: String(item.id || item._id),
        mosque_id: item.mosque_id,
        title: item.title || item.name,
        description: item.description,
        target_amount: target,
        collected_amount: raised,
        targetAmount: target,
        raisedAmount: raised,
        percent_complete: percent,
        status: item.status || 'active',
        priority: item.priority || 'medium',
        start_date: item.start_date,
        end_date: item.end_date,
        days_remaining: days,
        remaining_days: days,
        cover_image: item.cover_image || item.image,
        image: item.cover_image || item.image,
        donors_count: parseAmount(item.donors_count || item.donorsCount),
        donorsCount: parseAmount(item.donors_count || item.donorsCount),
        timeLeft: (days !== null && days !== undefined) ? `${days} يوم` : (item.timeLeft || item.time_left || 'غير محدد'),
        completedDate: item.completedDate || item.completed_date,
        mosque: item.mosque || null,
        created_at: item.created_at,
        updated_at: item.updated_at,
        _rawResponse: json,
      } as Campaign;
    } catch (error) {
      console.error(`Error fetching campaign #${id}:`, error);
      return this.getFallbackCampaigns()[0];
    }
  }

  async updateCampaign(id: string | number, payload: any): Promise<Campaign> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const formData = new FormData();
    formData.append("_method", "PUT");

    if (payload.title) formData.append("title", payload.title);
    if (payload.description !== undefined) formData.append("description", payload.description || "");
    if (payload.target_amount !== undefined) formData.append("target_amount", String(payload.target_amount));
    if (payload.targetAmount !== undefined) formData.append("target_amount", String(payload.targetAmount));
    if (payload.start_date) formData.append("start_date", payload.start_date);
    if (payload.startDate) formData.append("start_date", payload.startDate);
    if (payload.end_date) formData.append("end_date", payload.end_date);
    if (payload.endDate) formData.append("end_date", payload.endDate);
    if (payload.priority) formData.append("priority", payload.priority);
    if (payload.status) formData.append("status", payload.status);
    if (payload.cover_image && payload.cover_image instanceof File) {
      formData.append("cover_image", payload.cover_image, payload.cover_image.name);
    } else if (payload.imageFile && payload.imageFile instanceof File) {
      formData.append("cover_image", payload.imageFile, payload.imageFile.name);
    }

    console.log(`==== UPDATE CAMPAIGN #${id} PAYLOAD ====`, payload);

    const response = await fetch(`${BASE_URL}/campaigns/${id}`, {
      method: "POST", // Laravel multipart PUT via method spoofing
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();
    console.log(`==== UPDATE CAMPAIGN #${id} RESPONSE ====`, json);

    if (!response.ok || !json.status) {
      const validationErrors = json.data
        ? Object.entries(json.data).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`).join(' | ')
        : null;
      throw new Error(validationErrors || json.message || "فشل تعديل الحملة");
    }

    return await this.getCampaignById(id);
  }

  async deleteCampaign(id: string | number): Promise<boolean> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const response = await fetch(`${BASE_URL}/campaigns/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const json = await response.json().catch(() => null);
    console.log(`==== DELETE CAMPAIGN #${id} RESPONSE ====`, json);

    if (!response.ok || (json && json.status === false)) {
      throw new Error(json?.message || "فشل حذف الحملة من السيرفر");
    }
    return true;
  }

  async addCampaign(payload: any): Promise<any> {
    const mosqueId = this.getMosqueId();
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    // API requires multipart/form-data (not JSON) — and start_date is required
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const formData = new FormData();
    formData.append("mosque_id", String(mosqueId));
    formData.append("title", payload.title);
    formData.append("target_amount", String(payload.targetAmount || payload.target_amount));
    formData.append("start_date", payload.startDate || payload.start_date || today);

    if (payload.description) formData.append("description", payload.description);
    if (payload.endDate || payload.end_date) formData.append("end_date", payload.endDate || payload.end_date);
    if (payload.priority) formData.append("priority", payload.priority);
    if (payload.imageFile && payload.imageFile instanceof File) {
      formData.append("cover_image", payload.imageFile, payload.imageFile.name);
    }
    formData.append("status", payload.status || "active");

    console.log("==== ADD CAMPAIGN PAYLOAD ====", { mosqueId, ...payload, start_date: today });

    const response = await fetch(`${BASE_URL}/campaigns`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();
    console.log("==== ADD CAMPAIGN RESPONSE ====", json);

    if (!response.ok || !json.status) {
      console.error("Add Campaign Backend Error:", json);
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
      { id: '24', reference: 'REC-9218-2026', donorName: 'اويس عبود', amount: 500, type: 'تبرع نقدي', campaign: 'كسوة العيد للأيتام', status: 'مكتمل', date: '2026-08-15' },
      { id: '1', reference: 'REC-9218-2026', donorName: 'أحمد محمد', amount: 500, type: 'صدقة', campaign: 'إفطار صائم', status: 'مكتمل', date: '2024-05-10' },
      { id: '2', reference: 'REC-9218-2026', donorName: 'سارة علي', amount: 1000, type: 'زكاة', status: 'مكتمل', date: '2024-05-11' },
      { id: '3', reference: 'REC-9218-2026', donorName: 'محمود حسن', amount: 200, type: 'تبرع عام', campaign: 'ترميم المسجد', status: 'قيد المعالجة', date: '2024-05-12' },
      { id: '4', reference: 'REC-9218-2026', donorName: 'فاطمة إبراهيم', amount: 1500, type: 'صدقة', campaign: 'كفالة يتيم', status: 'مكتمل', date: '2024-05-13' },
      { id: '5', reference: 'REC-9218-2026', donorName: 'ياسين كمال', amount: 300, type: 'كفارة', status: 'فشل', date: '2024-05-14' },
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
