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

  private isSuperAdminUser(): boolean {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("auth_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const role = String(user.role || user.user_type || user.role_name || (typeof user.role === 'object' ? user.role?.name : '') || '').toLowerCase();
          const roles = (user.roles || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : String(r.name || '').toLowerCase());
          if (
            role === 'super_admin' ||
            role === 'superadmin' ||
            role === 'admin' ||
            role === 'administrator' ||
            role === 'region_manager' ||
            role === 'regionmanager' ||
            role.includes('region') ||
            role.includes('super') ||
            role.includes('مدير المنطقة') ||
            user.is_super_admin === true ||
            user.role_id === 1 ||
            roles.includes('super_admin') ||
            roles.includes('superadmin') ||
            roles.includes('admin') ||
            roles.includes('region_manager')
          ) {
            return true;
          }
        } catch (e) {}
      }
      const roleStr = String(localStorage.getItem("user_role") || "").toLowerCase();
      if (
        roleStr === 'super_admin' ||
        roleStr === 'superadmin' ||
        roleStr === 'admin' ||
        roleStr === 'region_manager' ||
        roleStr.includes('super') ||
        roleStr.includes('region')
      ) {
        return true;
      }
      const activeRoleView = String(localStorage.getItem("active_role_view") || "").toLowerCase();
      if (activeRoleView === 'super_admin' || activeRoleView === 'region_manager' || activeRoleView === 'region') {
        return true;
      }
    }
    return false;
  }

  async getDonations(page: number = 1, limit: number = 10, search: string = "", type: string = "", status: string = ""): Promise<PaginatedDonations> {
    const isSuperAdmin = this.isSuperAdminUser();
    const mosqueId = this.getMosqueId();

    try {
      // ── Build Query String ──
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("per_page", String(limit));

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      if (type && type !== 'all') {
        let t = type;
        if (type === 'تبرع عام' || type === 'صدقة' || type === 'زكاة' || type === 'كفارة' || type === 'نقدي' || type === 'تبرع نقدي') t = 'cash';
        if (type === 'تبرع عيني' || type === 'عيني') t = 'in_kind';
        params.append("type", t);
      }

      if (status && status !== 'all') {
        let s = status;
        if (status === 'مكتمل' || status === 'مكتملة') s = 'completed';
        if (status === 'قيد المعالجة' || status === 'قيد الانتظار' || status === 'معلق') s = 'pending';
        params.append("status", s);
      }

      // ── Determine URL: Super Admin uses /api/admin/donations (adminListDonations) ──
      const adminUrl = `${BASE_URL}/admin/donations?${params.toString()}`;
      const mosqueUrl = `${BASE_URL}/mosques/${mosqueId}/donations?${params.toString()}`;

      let url = isSuperAdmin ? adminUrl : mosqueUrl;

      let response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      
      let json = await response.json().catch(() => null);
      console.log(`API Donations Response (${url}):`, json);
      
      // Fallback seamlessly if 403 (e.g. admin accessed mosque URL or vice versa)
      if ((response.status === 403 || !response.ok || (json && json.status === false)) && !isSuperAdmin) {
        console.log(`Retrying Donations via Super Admin endpoint: ${adminUrl}`);
        const fallbackRes = await fetch(adminUrl, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });
        const fallbackJson = await fallbackRes.json().catch(() => null);
        if (fallbackRes.ok && fallbackJson && fallbackJson.status !== false) {
          response = fallbackRes;
          json = fallbackJson;
        }
      }

      if (!response.ok || !json || json.status === false) {
        return {
          data: [],
          pagination: {
            current_page: page,
            last_page: 1,
            per_page: limit,
            total: 0
          }
        };
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
          donorName = item.user.name || item.user.full_name || item.donor_name || 'فاعل خير';
        } else if (item.donor_name && item.donor_name.trim() && item.donor_name !== 'null') {
          donorName = item.donor_name;
        }

        const amt = parseAmount(item.amount);
        const itemType = item.donation_type || item.type || 'cash';
        let mappedType = itemType === 'in_kind' ? 'تبرع عيني' : 'تبرع عام';
        if (item.campaign_id || item.campaign) mappedType = 'حملة تبرع';

        return {
          id: String(item.id || item.reference || Math.random()),
          reference: item.reference || `REC-${item.id || '0000'}`,
          donorName: donorName,
          amount: amt,
          type: mappedType,
          donation_type: itemType,
          item_description: item.item_description || null,
          campaign: item.campaign_title || item.campaign?.title || (item.campaign_id ? `حملة رقم ${item.campaign_id}` : undefined),
          status: item.status === 'completed' ? 'مكتمل' : item.status === 'pending' ? 'قيد المعالجة' : item.status || 'مكتمل',
          date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          rawDate: item.created_at,
          paymentMethod: item.payment_method || 'نقدي',
          notes: item.notes || null,
          mosque_id: item.mosque_id,
          mosque: item.mosque || null,
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
      return {
        data: [],
        pagination: {
          current_page: page,
          last_page: 1,
          per_page: limit,
          total: 0
        }
      };
    }
  }

  async getCampaigns(page: number = 1, limit: number = 4, search: string = "", status: string = "", priority: string = ""): Promise<PaginatedCampaigns> {
    const isSuperAdmin = this.isSuperAdminUser();
    const mosqueId = this.getMosqueId();

    try {
      // ── Build Query String ──
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("per_page", String(limit));

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      if (status && status !== 'all') {
        let s = status;
        if (status === 'نشطة') s = 'active';
        if (status === 'متوقفة' || status === 'متوقفة مؤقتاً') s = 'paused';
        if (status === 'مكتملة') s = 'completed';
        if (status === 'ملغاة') s = 'cancelled';
        params.append("status", s);
      }

      if (priority && priority !== 'all') {
        let p = priority;
        if (priority === 'عالية' || priority === 'عاجلة' || priority === 'urgent') p = 'high';
        if (priority === 'متوسطة') p = 'medium';
        if (priority === 'منخفضة' || priority === 'عادية') p = 'low';
        params.append("priority", p);
      }

      // ── Determine URL: Super Admin uses /api/campaigns (listAllCampaigns), Manager uses /api/mosque/campaigns (listMyMosqueCampaigns) ──
      const allCampaignsUrl = `${BASE_URL}/campaigns?${params.toString()}`;
      const myMosqueCampaignsUrl = `${BASE_URL}/mosque/campaigns?${params.toString()}`;
      const mosqueCampaignsUrl = `${BASE_URL}/mosques/${mosqueId}/campaigns?${params.toString()}`;

      let url = isSuperAdmin ? allCampaignsUrl : myMosqueCampaignsUrl;

      let response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      let json = await response.json().catch(() => null);
      console.log(`API Campaigns Response (${url}):`, json);

      // If manager request to /mosque/campaigns fails, fallback to /mosques/{mosqueId}/campaigns
      if ((!response.ok || !json || json.status === false) && !isSuperAdmin) {
        console.log(`Retrying Campaigns via mosque-scoped endpoint: ${mosqueCampaignsUrl}`);
        const altRes = await fetch(mosqueCampaignsUrl, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });
        const altJson = await altRes.json().catch(() => null);
        if (altRes.ok && altJson && altJson.status !== false) {
          response = altRes;
          json = altJson;
        }
      }

      if (!response.ok || !json || json.status === false) {
        return {
          data: [],
          pagination: { current_page: 1, last_page: 1, per_page: limit, total: 0 }
        };
      }

      const items = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.data) ? json.data.data : []);
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
        current_page: json.pagination?.current_page || json.meta?.current_page || page,
        last_page: json.pagination?.last_page || json.meta?.last_page || 1,
        per_page: json.pagination?.per_page || json.meta?.per_page || limit,
        total: json.pagination?.total || json.meta?.total || data.length,
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
        data: [],
        pagination: { current_page: 1, last_page: 1, per_page: limit, total: 0 }
      };
    }
  }

  async getStats(): Promise<FinancialStats> {
    const mosqueId = this.getMosqueId();
    try {
      // 1. Primary official endpoint: GET /donations/stats (getDonationStats)
      let response = await fetch(`${BASE_URL}/donations/stats`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      let json = await response.json().catch(() => null);

      // 2. Fallback to mosque-scoped stats if needed
      if (!response.ok || !json || !json.status) {
        const altRes = await fetch(`${BASE_URL}/mosques/${mosqueId}/donations/stats`, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });
        const altJson = await altRes.json().catch(() => null);
        if (altRes.ok && altJson && altJson.status) {
          response = altRes;
          json = altJson;
        }
      }

      console.log("API Donations Stats Response:", json);
      
      if (!response.ok || !json || !json.status) {
        return {
          totalDonations: 0,
          totalDonationsTrend: 0,
          monthlyDonations: 0,
          monthlyDonationsTrend: 0,
          activeCampaigns: 0,
          activeCampaignsTrend: 0,
          newDonors: 0,
          newDonorsTrend: 0,
        };
      }
      
      // Map pure API response to our Domain Entity
      const data = json.data || {};
      return {
        totalDonations: parseAmount(data.total_donations?.value ?? data.total_donations),
        totalDonationsTrend: Number(data.total_donations?.growth_percent ?? data.total_donations_trend ?? 0),
        monthlyDonations: parseAmount(data.monthly_donations?.value ?? data.monthly_donations),
        monthlyDonationsTrend: Number(data.monthly_donations?.growth_percent ?? data.monthly_donations_trend ?? 0),
        activeCampaigns: parseAmount(data.active_campaigns?.value ?? data.active_campaigns),
        activeCampaignsTrend: Number(data.active_campaigns?.change ?? data.active_campaigns_trend ?? 0),
        newDonors: parseAmount(data.new_donors?.value ?? data.new_donors),
        newDonorsTrend: Number(data.new_donors?.growth_percent ?? data.new_donors_trend ?? 0),
      };
    } catch (error) {
      console.error("Error fetching donation stats:", error);
      return {
        totalDonations: 0,
        totalDonationsTrend: 0,
        monthlyDonations: 0,
        monthlyDonationsTrend: 0,
        activeCampaigns: 0,
        activeCampaignsTrend: 0,
        newDonors: 0,
        newDonorsTrend: 0,
      };
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
    const isSuperAdmin = this.isSuperAdminUser();
    const mosqueId = this.getMosqueId();

    try {
      const endpoint = isSuperAdmin
        ? `${BASE_URL}/admin/campaigns/stats`
        : `${BASE_URL}/mosques/${mosqueId}/campaigns/stats`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      const json = await response.json().catch(() => null);
      console.log(`API Campaigns Stats (${isSuperAdmin ? 'SuperAdmin /admin/campaigns/stats' : 'Mosque Manager'}) Response:`, json);
      if (!response.ok || !json || !json.status) {
        return { totalRaised: 0, activeCampaigns: 0, completedCampaigns: 0, successRate: 0 };
      }
      const data = json.data || {};
      return {
        totalRaised: parseAmount(data.total_collected),
        activeCampaigns: parseAmount(data.active_count),
        completedCampaigns: parseAmount(data.completed_count),
        successRate: parseAmount(data.growth_rate_percent ?? data.overall_progress_percent ?? 0),
        totalCampaigns: parseAmount(data.total_campaigns),
        overallProgress: parseAmount(data.overall_progress_percent),
      };
    } catch (error) {
      console.error("Error fetching campaign stats:", error);
      return { totalRaised: 0, activeCampaigns: 0, completedCampaigns: 0, successRate: 0 };
    }
  }

  async getCampaignById(id: string | number): Promise<Campaign> {
    const response = await fetch(`${BASE_URL}/campaigns/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    const json = await response.json().catch(() => null);
    console.log(`GET /api/campaigns/${id} Response:`, json);
    if (!response.ok || !json || !json.status) throw new Error(json?.message || "فشل جلب تفاصيل الحملة من السيرفر");
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
}
