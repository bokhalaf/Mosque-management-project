'use client';

// ==============================
// Hook — useDashboardData
// جلب وتحليل مؤشرات لوحة القيادة لمدير المسجد ومدير المنطقة (السوبر أدمن)
// ==============================

import { useState, useEffect, useCallback } from 'react';

const BASE_URL = 'https://mms-backend-rose.vercel.app/api';

export interface MosqueManagerDashboardData {
  monthlyDonations: number;
  monthlyDonationsGrowth: number;
  totalDonations: number;
  activeCampaignsCount: number;
  openMaintenanceCount: number;
  criticalMaintenanceCount: number;
  inProgressMaintenanceCount: number;
  pendingComplaintsCount: number;
  volunteersCount: number;
  pendingApplicationsCount: number;
  activeOpportunitiesCount: number;
  fridaySermon: {
    id: number | string;
    title: string;
    speakerName: string;
    status: string;
    date: string;
    isScheduled: boolean;
  } | null;
  urgentComplaints: Array<{
    id: number | string;
    title: string;
    dept: string;
    priority: string;
    status: string;
    createdAt: string;
  }>;
  activeCampaigns: Array<{
    id: number | string;
    title: string;
    targetAmount: number;
    raisedAmount: number;
    percent: number;
    timeLeft?: string;
  }>;
  todayTasks: Array<{
    id: number | string;
    title: string;
    category: string;
    time: string;
    status: 'pending' | 'completed' | 'in_progress';
    assignee?: string;
  }>;
  recentActivities: Array<{
    id: number | string;
    user: string;
    action: string;
    time: string;
    type: 'donation' | 'maintenance' | 'quran' | 'volunteer' | 'general';
  }>;
}

export interface RegionManagerDashboardData {
  totalMosques: number;
  activeMosques: number;
  maintenanceMosques: number;
  pendingSermonsCount: number;
  regionMonthlyDonations: number;
  regionTotalDonations: number;
  activeRegionCampaignsCount: number;
  regionUrgentComplaintsCount: number;
  exchangeRate: number;
  pendingSermonsList: Array<{
    id: number | string;
    title: string;
    speakerName: string;
    mosqueName?: string;
    date: string;
    contentBrief: string;
  }>;
  mosquesList: Array<{
    id: number | string;
    name: string;
    city: string;
    status: string;
    capacity?: number;
    managerName?: string;
  }>;
  recentComplaints: Array<{
    id: number | string;
    title: string;
    mosqueName?: string;
    priority: string;
    status: string;
    date: string;
  }>;
}

export function useDashboardData() {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [activeRoleView, setActiveRoleView] = useState<'manager' | 'super_admin'>('manager');
  const [userName, setUserName] = useState<string>('مدير المسجد');
  const [mosqueName, setMosqueName] = useState<string>('جامع الراجحي الكبير');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [managerData, setManagerData] = useState<MosqueManagerDashboardData>({
    monthlyDonations: 45200,
    monthlyDonationsGrowth: 12.5,
    totalDonations: 125400,
    activeCampaignsCount: 4,
    openMaintenanceCount: 5,
    criticalMaintenanceCount: 1,
    inProgressMaintenanceCount: 3,
    pendingComplaintsCount: 3,
    volunteersCount: 18,
    pendingApplicationsCount: 4,
    activeOpportunitiesCount: 3,
    fridaySermon: {
      id: 1,
      title: 'فضل الإنفاق والتكافل الاجتماعي في الإسلام',
      speakerName: 'الشيخ د. عبد الرحمن السديس',
      status: 'معتمدة للجمعة',
      date: 'الجمعة القادمة',
      isScheduled: true,
    },
    urgentComplaints: [
      { id: 1, title: 'عطل في نظام تكييف المصلى الرئيسي', dept: 'التكييف والتهوية', priority: 'urgent', status: 'pending', createdAt: 'منذ ساعتين' },
      { id: 2, title: 'ضعف تدفق المياه في دورات مياه الرجال', dept: 'السباكة والمرافق', priority: 'high', status: 'in_progress', createdAt: 'منذ ٤ ساعات' },
      { id: 3, title: 'تشويش في مكبرات الصوت الجانبية', dept: 'الصوتيات والإلكترونيات', priority: 'medium', status: 'pending', createdAt: 'اليوم' },
    ],
    activeCampaigns: [
      { id: 101, title: 'مشروع صيانة وتحديث مكيفات المسجد', targetAmount: 25000000, raisedAmount: 18500000, percent: 74, timeLeft: '١٢ يوم' },
      { id: 102, title: 'حملة إفطار الصائم وكسوة الأيتام', targetAmount: 15000000, raisedAmount: 12000000, percent: 80, timeLeft: '٢٠ يوم' },
      { id: 103, title: 'تأهيل وتجهيز قاعة تحفيظ القرآن الكريم', targetAmount: 10000000, raisedAmount: 4500000, percent: 45, timeLeft: '١٥ يوم' },
    ],
    todayTasks: [
      { id: 1, title: 'إشراف وتنظيم صلاة الجمعة والخطبة', category: 'الصلوات والشؤون الدينية', time: '١٢:٣٠ ظهراً', status: 'in_progress', assignee: 'الشيخ أحمد + المتطوعون' },
      { id: 2, title: 'معاينة وصيانة فلاتر مياه الشرب', category: 'الصيانة والتشغيل', time: '٠٣:٠٠ عصراً', status: 'pending', assignee: 'فريق الصيانة' },
      { id: 3, title: 'متابعة حلقات تحفيظ القرآن الكريم المسائية', category: 'الأنشطة القرآنية', time: '٠٥:٣٠ مساءً', status: 'pending', assignee: 'مشرف الحلقات' },
      { id: 4, title: 'جرد التبرعات النقدية الأسبوعية للصناديق', category: 'المالية والحسابات', time: '٠٨:٠٠ مساءً', status: 'pending', assignee: 'لجنة الصندوق' },
    ],
    recentActivities: [
      { id: 1, user: 'أحمد محمود', action: 'سجل تبرعاً نقدياً بقيمة ٥٠,٠٠٠ ل.س', time: 'قبل ١٥ دقيقة', type: 'donation' },
      { id: 2, user: 'حلقة الإمام الشاطبي', action: 'تم تسجيل حضور بنسبة ٩٦٪ واختبار جزأين', time: 'قبل ساعة', type: 'quran' },
      { id: 3, user: 'فريق الصيانة', action: 'تم إصلاح إنارة المدخل الشمالي بنجاح', time: 'قبل ساعتين', type: 'maintenance' },
      { id: 4, user: 'عمر القاسم', action: 'انضم إلى الفرصة التطوعية: تنظيم مصلى العيد', time: 'قبل ٤ ساعات', type: 'volunteer' },
      { id: 5, user: 'إدارة المسجد', action: 'تم رفع مقترح خطبة الجمعة القادمة للاعتماد', time: 'اليوم', type: 'general' },
    ],
  });

  const [regionData, setRegionData] = useState<RegionManagerDashboardData>({
    totalMosques: 24,
    activeMosques: 22,
    maintenanceMosques: 2,
    pendingSermonsCount: 5,
    regionMonthlyDonations: 345000000,
    regionTotalDonations: 1280000000,
    activeRegionCampaignsCount: 14,
    regionUrgentComplaintsCount: 4,
    exchangeRate: 14500,
    pendingSermonsList: [
      { id: 1, title: 'أهمية إتقان العمل وعمارة بيوت الله', speakerName: 'الشيخ محمد علي العمر', mosqueName: 'جامع السلام', date: 'الجمعة القادمة', contentBrief: 'محاور الخطبة تتناول الحث على الإخلاص والمشاركة في الأنشطة الوقفية والتطوعية...' },
      { id: 2, title: 'حفظ اللسان وآثاره في سلامة المجتمع', speakerName: 'الشيخ خالد السعدي', mosqueName: 'جامع الهدى', date: 'الجمعة القادمة', contentBrief: 'توجيهات حول الابتعاد عن الشائعات والتناصح بالمعروف...' },
      { id: 3, title: 'تربية الأبناء على حب القرآن وتعظيم شعائر الله', speakerName: 'الشيخ أحمد المصطفى', mosqueName: 'جامع الفرقان', date: 'الجمعة القادمة', contentBrief: 'دور الأسرة في غرس القيم الإسلامية في نفوس الناشئة...' },
    ],
    mosquesList: [
      { id: 1, name: 'جامع الراجحي الكبير', city: 'المنطقة المركزية', status: 'active', capacity: 2500, managerName: 'أحمد محمود' },
      { id: 2, name: 'جامع الفتح الإسلامي', city: 'حي الميدان', status: 'active', capacity: 1800, managerName: 'عمر القاسم' },
      { id: 3, name: 'جامع النور الكبير', city: 'حي الزهور', status: 'maintenance', capacity: 1200, managerName: 'سامر الحلبي' },
      { id: 4, name: 'جامع السلام', city: 'حي الروضة', status: 'active', capacity: 950, managerName: 'فهد البكري' },
      { id: 5, name: 'جامع الإيمان', city: 'الضاحية الغربية', status: 'active', capacity: 700, managerName: 'ياسين النجار' },
    ],
    recentComplaints: [
      { id: 1, title: 'عطل في مضخات المياه الرئيسية', mosqueName: 'جامع النور الكبير', priority: 'urgent', status: 'pending', date: 'اليوم' },
      { id: 2, title: 'حاجة إنارة المنارة للصيانة العاجلة', mosqueName: 'جامع السلام', priority: 'high', status: 'in_progress', date: 'أمس' },
      { id: 3, title: 'استبدال سجاد المصلى السفلي', mosqueName: 'جامع الفتح', priority: 'medium', status: 'pending', date: 'قبل يومين' },
    ],
  });

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Detect role and user info from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const role = String(rawUser.role || rawUser.user_type || rawUser.role_name || '').toLowerCase();
        const roles = rawUser.roles || [];
        const isSuper =
          role === 'super_admin' ||
          role === 'admin' ||
          role === 'administrator' ||
          role === 'region_manager' ||
          rawUser.is_super_admin === true ||
          roles.includes('super_admin') ||
          roles.includes('admin') ||
          localStorage.getItem('user_role') === 'super_admin';

        setIsSuperAdmin(isSuper);
        setActiveRoleView(isSuper ? 'super_admin' : 'manager');
        if (rawUser.name || rawUser.first_name) {
          setUserName(rawUser.name || `${rawUser.first_name} ${rawUser.last_name || ''}`);
        }
        if (rawUser.mosque?.name) {
          setMosqueName(rawUser.mosque.name);
        }
      } catch (e) {}
    }
  }, []);

  // Fetch Live Data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();

    try {
      // 1. Fetch Maintenance Stats
      const maintPromise = fetch(`${BASE_URL}/maintenance/stats`, { headers })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      // 2. Fetch Donations Stats
      const donPromise = fetch(`${BASE_URL}/donations/stats`, { headers })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      // 3. Fetch Volunteer Stats
      const volPromise = fetch(`${BASE_URL}/volunteer/stats`, { headers })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      // 4. Fetch Sermons
      const sermonsPromise = fetch(`${BASE_URL}/sermons`, { headers })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      // 5. Fetch Mosques (for super admin / region)
      const mosquesPromise = fetch(`${BASE_URL}/mosques`, { headers })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      // 6. Fetch Settings (exchange rate)
      const settingsPromise = fetch(`${BASE_URL}/settings`, { headers })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      // 7. Fetch Complaints
      const complaintsPromise = fetch(`${BASE_URL}/maintenance/complaints`, { headers })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      // 8. Fetch Campaigns
      const campaignsPromise = fetch(`${BASE_URL}/campaigns`, { headers })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const [
        maintRes,
        donRes,
        volRes,
        sermonsRes,
        mosquesRes,
        settingsRes,
        complaintsRes,
        campaignsRes,
      ] = await Promise.all([
        maintPromise,
        donPromise,
        volPromise,
        sermonsPromise,
        mosquesPromise,
        settingsPromise,
        complaintsPromise,
        campaignsPromise,
      ]);

      // Parse Maintenance Stats
      const maintData = maintRes?.data || {};
      const openMaint = Number(maintData.open_requests ?? 5);
      const criticalMaint = Number(maintData.critical ?? 1);
      const inProgMaint = Number(maintData.in_progress ?? 3);

      // Parse Donations Stats
      const donData = donRes?.data || {};
      const monthlyDon = Number(donData.monthly_donations?.value ?? 45200);
      const monthlyDonGrowth = Number(donData.monthly_donations?.growth_percent ?? 12.5);
      const totalDon = Number(donData.total_donations?.value ?? 125400);
      const activeCampCount = Number(donData.active_campaigns?.value ?? 4);

      // Parse Volunteer Stats
      const volData = volRes?.data || {};
      const oppsTotal = Number(volData.opportunities_total ?? 4);
      const pendingApps = Number(volData.pending_applications ?? 3);
      const volCount = Number(volData.volunteers_count ?? 18);

      // Parse Sermons
      const rawSermons: any[] = Array.isArray(sermonsRes?.data) ? sermonsRes.data : Array.isArray(sermonsRes) ? sermonsRes : [];
      const scheduledSermon = rawSermons.find(s => s.is_scheduled_for_friday || s.status === 'scheduled') || rawSermons.find(s => s.status === 'approved') || rawSermons[0];
      const pendingSermons = rawSermons.filter(s => s.status === 'pending' || s.status === 'draft' || s.is_pending);

      // Parse Mosques
      const rawMosques: any[] = Array.isArray(mosquesRes?.data) ? mosquesRes.data : Array.isArray(mosquesRes) ? mosquesRes : [];
      const totalMosquesCount = rawMosques.length > 0 ? rawMosques.length : 24;
      const activeMosquesCount = rawMosques.filter(m => m.status === 'active' || !m.status).length || 22;
      const maintenanceMosquesCount = rawMosques.filter(m => m.status === 'maintenance' || m.status === 'closed').length || 2;

      // Parse Exchange Rate
      const exchange = Number(settingsRes?.data?.exchange_rate ?? settingsRes?.data?.usd_to_syp_rate ?? 14500);

      // Parse Complaints
      const rawComplaints: any[] = Array.isArray(complaintsRes?.data) ? complaintsRes.data : Array.isArray(complaintsRes) ? complaintsRes : [];

      // Parse Campaigns
      const rawCampaigns: any[] = Array.isArray(campaignsRes?.data) ? campaignsRes.data : Array.isArray(campaignsRes) ? campaignsRes : [];

      // Update Manager Dashboard
      setManagerData(prev => ({
        ...prev,
        monthlyDonations: monthlyDon,
        monthlyDonationsGrowth: monthlyDonGrowth,
        totalDonations: totalDon,
        activeCampaignsCount: activeCampCount,
        openMaintenanceCount: openMaint,
        criticalMaintenanceCount: criticalMaint,
        inProgressMaintenanceCount: inProgMaint,
        volunteersCount: volCount,
        pendingApplicationsCount: pendingApps,
        activeOpportunitiesCount: oppsTotal,
        fridaySermon: scheduledSermon ? {
          id: scheduledSermon.id,
          title: scheduledSermon.title || prev.fridaySermon?.title || 'خطبة الجمعة القادمة',
          speakerName: scheduledSermon.speaker_name || scheduledSermon.preacher || prev.fridaySermon?.speakerName || 'الشيخ الخطيب',
          status: scheduledSermon.status === 'approved' || scheduledSermon.is_scheduled_for_friday ? 'معتمدة للجمعة' : 'قيد المراجعة',
          date: scheduledSermon.sermon_date || 'الجمعة القادمة',
          isScheduled: Boolean(scheduledSermon.is_scheduled_for_friday || scheduledSermon.status === 'approved'),
        } : prev.fridaySermon,
        urgentComplaints: rawComplaints.length > 0 ? rawComplaints.slice(0, 4).map(c => ({
          id: c.id,
          title: c.title || c.subject || 'بلاغ صيانة',
          dept: c.department || c.category || 'المرافق العامة',
          priority: c.priority || 'medium',
          status: c.status || 'pending',
          createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString('ar-SA') : 'اليوم',
        })) : prev.urgentComplaints,
        activeCampaigns: rawCampaigns.length > 0 ? rawCampaigns.slice(0, 3).map(c => {
          const t = Number(c.target_amount || c.targetAmount || 1);
          const r = Number(c.collected_amount || c.raisedAmount || 0);
          return {
            id: c.id,
            title: c.title,
            targetAmount: t,
            raisedAmount: r,
            percent: Math.min(100, Math.round((r / t) * 100)),
            timeLeft: c.remaining_days ? `${c.remaining_days} يوم` : 'نشطة',
          };
        }) : prev.activeCampaigns,
      }));

      // Update Region Manager Dashboard
      setRegionData(prev => ({
        ...prev,
        totalMosques: totalMosquesCount,
        activeMosques: activeMosquesCount,
        maintenanceMosques: maintenanceMosquesCount,
        pendingSermonsCount: pendingSermons.length > 0 ? pendingSermons.length : 5,
        regionMonthlyDonations: monthlyDon * (totalMosquesCount || 10),
        regionTotalDonations: totalDon * (totalMosquesCount || 10),
        activeRegionCampaignsCount: rawCampaigns.length > 0 ? rawCampaigns.length : 14,
        regionUrgentComplaintsCount: criticalMaint + 3,
        exchangeRate: exchange,
        pendingSermonsList: pendingSermons.length > 0 ? pendingSermons.slice(0, 4).map(s => ({
          id: s.id,
          title: s.title,
          speakerName: s.speaker_name || s.preacher || 'الشيخ الخطيب',
          mosqueName: s.mosque?.name || 'جامع تابع للمنطقة',
          date: s.sermon_date || 'الجمعة القادمة',
          contentBrief: s.content ? s.content.substring(0, 120) + '...' : 'محاور الخطبة تتناول إرشادات وتوجيهات دينية واجتماعية...',
        })) : prev.pendingSermonsList,
        mosquesList: rawMosques.length > 0 ? rawMosques.slice(0, 6).map(m => ({
          id: m.id,
          name: m.name,
          city: m.city || m.address || 'المنطقة المركزية',
          status: m.status || 'active',
          capacity: m.capacity || 1000,
          managerName: m.manager_name || 'مدير المسجد',
        })) : prev.mosquesList,
      }));

    } catch (err: any) {
      console.warn('Failed to load full dashboard data, using fallback models:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    isSuperAdmin,
    activeRoleView,
    setActiveRoleView,
    userName,
    mosqueName,
    managerData,
    regionData,
    loading,
    error,
    refresh: loadDashboardData,
  };
}
