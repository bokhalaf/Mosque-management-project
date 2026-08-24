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
  regionMonthlyDonationsCount: number;
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
  recentOperations: Array<{
    id: number | string;
    module: string;
    action: string;
    title: string;
    description?: string;
    mosque_name?: string;
    user_name?: string;
    created_at: string;
    amount?: number;
    currency?: string;
    old_status?: string | null;
    new_status?: string | null;
  }>;
}

export interface DashboardDebugLog {
  time: string;
  action: string;
  url: string;
  status: number;
  response: any;
}

export function useDashboardData() {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [activeRoleView, setActiveRoleView] = useState<'manager' | 'super_admin'>('manager');
  const [userName, setUserName] = useState<string>('مدير المسجد');
  const [mosqueName, setMosqueName] = useState<string>('جامع الراجحي الكبير');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<DashboardDebugLog[]>([]);

  const addDebugLog = (action: string, url: string, status: number, response: any) => {
    const time = new Date().toLocaleTimeString('ar-SA');
    setDebugLogs((prev) => [{ time, action, url, status, response }, ...prev]);
  };

  const clearDebugLogs = () => setDebugLogs([]);

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
    regionMonthlyDonationsCount: 0,
    regionTotalDonations: 1280000000,
    activeRegionCampaignsCount: 14,
    regionUrgentComplaintsCount: 4,
    exchangeRate: 14500,
    pendingSermonsList: [
      { id: 1, title: 'أهمية إتقان العمل وعمارة بيوت الله', speakerName: 'الشيخ محمد علي العمر', mosqueName: 'جامع السلام', date: 'الجمعة القادمة', contentBrief: 'محاور الخطبة تتناول الحث على الإخلاص والمشاركة في الأنشطة الوقفية والتطوعية...' },
      { id: 2, title: 'حفظ اللسان وآثاره في سلامة المجتمع', speakerName: 'الشيخ خالد السعدي', mosqueName: 'جامع الهدى', date: 'الجمعة القادمة', contentBrief: 'توجيهات حول الابتعاد عن الشائعات والتناصح بالمعروف...' },
      { id: 3, title: 'تربية الأبناء على حب القرآن وتعظيم شعائر الله', speakerName: 'الشيخ أحمد المصطفى', mosqueName: 'جامع الفرقان', date: 'الجمعة القادمة', contentBrief: 'دور الأسرة في غرس القيم الإسلامية في نفوس الناشئة...' },
    ],
    recentOperations: [
      { id: 1, module: 'donations', action: 'تسجيل تبرع', title: 'تبرع نقدي لصندوق إفطار صائم', mosque_name: 'جامع الراجحي الكبير', user_name: 'أحمد محمود', created_at: new Date().toISOString(), amount: 50000, currency: 'ل.س' },
      { id: 2, module: 'maintenance', action: 'تغيير حالة صيانة', title: 'إصلاح إنارة المنارة والمصلى الشمالي', mosque_name: 'جامع السلام', user_name: 'فريق الصيانة', created_at: new Date().toISOString(), old_status: 'قيد الانتظار', new_status: 'تم الإصلاح' },
      { id: 3, module: 'sermons', action: 'اعتماد خطبة الجمعة', title: 'فضل الإنفاق والتكافل الاجتماعي', mosque_name: 'جامع الفرقان', user_name: 'مدير المنطقة', created_at: new Date().toISOString() },
      { id: 4, module: 'complaints', action: 'معالجة بلاغ', title: 'معالجة مشكلة تكييف المصلى الرئيسي', mosque_name: 'جامع النور الكبير', user_name: 'سامر الحلبي', created_at: new Date().toISOString(), old_status: 'مفتوح', new_status: 'تمت المعالجة' },
      { id: 5, module: 'mosques', action: 'إضافة مسجد', title: 'تسجيل واعتماد جامع الإيمان الجديد', mosque_name: 'جامع الإيمان', user_name: 'المهندس ياسين', created_at: new Date().toISOString() },
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

    // Re-check role dynamically at call time
    let isSuper = false;
    if (typeof window !== 'undefined') {
      try {
        const rawUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const role = String(rawUser.role || rawUser.user_type || rawUser.role_name || '').toLowerCase();
        const roles = rawUser.roles || [];
        isSuper =
          role === 'super_admin' ||
          role === 'admin' ||
          role === 'administrator' ||
          role === 'region_manager' ||
          rawUser.is_super_admin === true ||
          roles.includes('super_admin') ||
          roles.includes('admin') ||
          localStorage.getItem('user_role') === 'super_admin';
      } catch {}
    }

    try {
      if (isSuper) {
        // ── Super Admin: ONLY fetch super-dashboard, mosque-operations, and settings ──
        const [superDashRes, operationsRes, settingsRes] = await Promise.all([
          fetch(`${BASE_URL}/admin/super-dashboard`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
          fetch(`${BASE_URL}/admin/mosque-operations?per_page=5`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
          fetch(`${BASE_URL}/settings`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
        ]);

        // Parse Live Mosque Operations (Top 5 for dashboard)
        const rawOps: any[] = Array.isArray(operationsRes?.data?.data)
          ? operationsRes.data.data
          : Array.isArray(operationsRes?.data)
          ? operationsRes.data
          : Array.isArray(operationsRes)
          ? operationsRes
          : [];

        const parsedOperations = rawOps.slice(0, 5).map((op: any, idx: number) => ({
          id: op.id || idx + 1,
          module: op.module || op.type || 'general',
          action: op.action || op.event || 'تحديث سجل',
          title: op.title || op.name || op.description || 'عملية مسجلة',
          description: op.description || op.note || op.notes || '',
          mosque_name: op.mosque_name || op.mosque?.name || 'جامع المنطقة',
          user_name: op.user_name || op.user?.name || op.changed_by || 'مدير النظام',
          created_at: op.created_at || op.changed_at || op.date || new Date().toISOString(),
          amount: op.amount ? Number(op.amount) : undefined,
          currency: op.currency || 'ل.س',
          old_status: op.old_status,
          new_status: op.new_status,
        }));

        // Parse Super Admin Dedicated Dashboard Data strictly from GET /admin/super-dashboard
        // Actual API structure: { region_mosques: { total, items }, pending_sermons: { total, items }, region_donations_this_month: { count, total_amount }, ... }
        const sDash = superDashRes?.data || superDashRes || {};

        // ── Mosques ──
        const mosquesObj = sDash.region_mosques || {};
        const mosquesItems: any[] = Array.isArray(mosquesObj.items) ? mosquesObj.items : Array.isArray(sDash.mosques) ? sDash.mosques : [];
        const sTotalMosques = Number(mosquesObj.total ?? sDash.total_mosques ?? mosquesItems.length ?? 0);
        const sActiveMosques = Number(
          sDash.active_mosques ??
          mosquesItems.filter((m: any) => String(m.status || '').toLowerCase() === 'active').length
        );
        const sMaintMosques = Number(
          sDash.maintenance_mosques ??
          mosquesItems.filter((m: any) => ['maintenance', 'under_maintenance', 'closed'].includes(String(m.status || '').toLowerCase())).length
        );

        // ── Pending Sermons ──
        const sermonsObj = sDash.pending_sermons || {};
        const sPendingSermons: any[] = Array.isArray(sermonsObj.items) ? sermonsObj.items : Array.isArray(sDash.pending_sermons) ? sDash.pending_sermons : [];
        const sPendingSermonsCount = Number(sermonsObj.total ?? sDash.pending_sermons_count ?? sPendingSermons.length ?? 0);

        // ── Donations ──
        const donationsObj = sDash.region_donations_this_month || sDash.monthly_donations_obj || {};
        const sMonthlyDonations = Number(
          donationsObj.total_amount ?? donationsObj.amount ?? donationsObj.count ??
          sDash.monthly_donations ?? sDash.region_monthly_donations ?? 0
        );
        const sTotalDonations = Number(
          sDash.total_donations ?? sDash.region_total_donations ??
          (sDash.region_donations_total || {}).total_amount ?? 0
        );
        const sMonthlyDonationsCount = Number(donationsObj.count ?? 0);

        // ── Campaigns ──
        const sCampaignsCount = Number(
          sDash.active_campaigns_count ?? sDash.active_campaigns ??
          (Array.isArray(sDash.campaigns) ? sDash.campaigns.length : 0)
        );

        // ── Complaints ──
        const sUrgentComplaints = Number(
          sDash.urgent_complaints_count ?? sDash.critical_complaints_count ??
          (sDash.complaints || {}).urgent ?? (sDash.complaints || {}).critical ??
          (Array.isArray(sDash.urgent_complaints) ? sDash.urgent_complaints.length : 0)
        );

        // ── Exchange Rate ──
        const sExchangeRate = Number(settingsRes?.data?.exchange_rate ?? settingsRes?.data?.usd_to_syp_rate ?? sDash.exchange_rate ?? 14500);

        // Update Region Manager Dashboard
        setRegionData(prev => ({
          ...prev,
          totalMosques: sTotalMosques || prev.totalMosques,
          activeMosques: sActiveMosques || prev.activeMosques,
          maintenanceMosques: sMaintMosques || prev.maintenanceMosques,
          pendingSermonsCount: sPendingSermonsCount || prev.pendingSermonsCount,
          regionMonthlyDonations: sMonthlyDonations,
          regionTotalDonations: sTotalDonations,
          regionMonthlyDonationsCount: sMonthlyDonationsCount,
          activeRegionCampaignsCount: sCampaignsCount || prev.activeRegionCampaignsCount,
          regionUrgentComplaintsCount: sUrgentComplaints,
          exchangeRate: sExchangeRate,
          pendingSermonsList: sPendingSermons.length > 0 ? sPendingSermons.slice(0, 3).map((s: any) => ({
            id: s.id,
            title: s.title,
            // API returns speaker_name directly on sermon object
            speakerName: s.speaker_name || s.mosque_manager?.name || s.preacher || 'الشيخ الخطيب',
            // mosque comes from mosque_manager relation
            mosqueName: s.mosque?.name || s.mosque_name || s.mosque_manager?.name || 'جامع تابع للمنطقة',
            date: s.sermon_date || s.date || 'الجمعة القادمة',
            contentBrief: s.content ? s.content.substring(0, 120) + '...' : s.brief || 'محاور الخطبة تتناول إرشادات وتوجيهات دينية واجتماعية...',
          })) : prev.pendingSermonsList,
          recentOperations: parsedOperations.length > 0 ? parsedOperations : prev.recentOperations,
        }));

        // Log ONLY Super Admin Server Responses to Debug Terminal
        if (superDashRes) {
          addDebugLog('استدعاء لوحة تحكم السوبر أدمن (Super Dashboard)', `${BASE_URL}/admin/super-dashboard`, 200, superDashRes);
        }
        if (operationsRes) {
          addDebugLog('استدعاء سجل العمليات الحية (Mosque Operations)', `${BASE_URL}/admin/mosque-operations?per_page=5`, 200, operationsRes);
        }
        if (settingsRes) {
          addDebugLog('استدعاء السياسة المالية وسعر الصرف (Settings)', `${BASE_URL}/settings`, 200, settingsRes);
        }
      } else {
        // ── Mosque Manager: Fetch primary dashboard and sub-endpoints ──
        const [
          managerDashRes,
          managerStatsRes,
          managerOpsRes,
          sermonsRes,
          campaignsRes,
        ] = await Promise.all([
          fetch(`${BASE_URL}/dashboard/mosque-manager`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
          fetch(`${BASE_URL}/dashboard/mosque-manager/statistics`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
          fetch(`${BASE_URL}/dashboard/mosque-manager/mosque-operations?per_page=5`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
          fetch(`${BASE_URL}/sermons`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
          fetch(`${BASE_URL}/campaigns`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
        ]);

        const mDash = managerDashRes?.data || managerDashRes || {};
        const kpi = mDash?.kpi_cards || {};
        const statsData = managerStatsRes?.data || managerStatsRes || {};

        // Parse KPIs from /dashboard/mosque-manager & /statistics
        const monthlyDon = Number(kpi.monthly_donations?.value ?? statsData.donations ?? 45000);
        const monthlyDonGrowth = Number(parseFloat(kpi.monthly_donations?.percentage_change || '12.5'));
        const openMaint = Number(kpi.open_maintenance_requests?.value ?? statsData.open_maintenance_requests ?? 4);
        const pendingComplaints = Number(kpi.complaints?.value ?? statsData.complaints ?? 6);
        const accreditedVolunteers = Number(kpi.accredited_volunteers?.value ?? statsData.accredited_volunteers ?? statsData.total_volunteers ?? 10);

        // Parse Recent Activities
        const rawActivities: any[] = Array.isArray(mDash.recent_activities) && mDash.recent_activities.length > 0
          ? mDash.recent_activities
          : Array.isArray(managerOpsRes?.data?.data)
          ? managerOpsRes.data.data
          : Array.isArray(managerOpsRes?.data)
          ? managerOpsRes.data
          : [];

        // Parse Today Tasks
        const rawTodayTasks: any[] = Array.isArray(mDash.today_tasks)
          ? mDash.today_tasks
          : Array.isArray(mDash.today_tasks?.tasks)
          ? mDash.today_tasks.tasks
          : [];

        // Parse Latest Tickets / Complaints
        const rawTickets: any[] = Array.isArray(mDash.latest_tickets)
          ? mDash.latest_tickets
          : [];

        // Parse Sermons
        const rawSermons: any[] = Array.isArray(sermonsRes?.data) ? sermonsRes.data : Array.isArray(sermonsRes) ? sermonsRes : [];
        const scheduledSermon = rawSermons.find(s => s.is_scheduled_for_friday || s.status === 'scheduled') || rawSermons.find(s => s.status === 'approved') || rawSermons[0];

        // Parse Campaigns
        const rawCampaigns: any[] = Array.isArray(campaignsRes?.data) ? campaignsRes.data : Array.isArray(campaignsRes) ? campaignsRes : [];

        // Update Manager Dashboard
        setManagerData(prev => ({
          ...prev,
          monthlyDonations: monthlyDon,
          monthlyDonationsGrowth: monthlyDonGrowth,
          totalDonations: Number(statsData.donations || monthlyDon * 3 || 125400),
          activeCampaignsCount: rawCampaigns.length > 0 ? rawCampaigns.length : prev.activeCampaignsCount,
          openMaintenanceCount: openMaint,
          criticalMaintenanceCount: Number(kpi.open_maintenance_requests?.critical ?? 1),
          inProgressMaintenanceCount: Number(kpi.open_maintenance_requests?.in_progress ?? 2),
          pendingComplaintsCount: pendingComplaints,
          volunteersCount: accreditedVolunteers,
          pendingApplicationsCount: Number(statsData.pending_invitations ?? 3),
          activeOpportunitiesCount: prev.activeOpportunitiesCount,
          fridaySermon: scheduledSermon ? {
            id: scheduledSermon.id,
            title: scheduledSermon.title || prev.fridaySermon?.title || 'خطبة الجمعة القادمة',
            speakerName: scheduledSermon.speaker_name || scheduledSermon.preacher || prev.fridaySermon?.speakerName || 'الشيخ الخطيب',
            status: scheduledSermon.status === 'approved' || scheduledSermon.is_scheduled_for_friday ? 'معتمدة للجمعة' : 'قيد المراجعة',
            date: scheduledSermon.sermon_date || 'الجمعة القادمة',
            isScheduled: Boolean(scheduledSermon.is_scheduled_for_friday || scheduledSermon.status === 'approved'),
          } : prev.fridaySermon,
          urgentComplaints: rawTickets.length > 0 ? rawTickets.slice(0, 4).map((c: any) => ({
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
          recentActivities: rawActivities.length > 0 ? rawActivities.slice(0, 5).map((a: any, idx: number) => ({
            id: a.id || idx + 1,
            user: a.user_name || a.user?.name || a.user || 'مدير المسجد',
            action: a.action || a.title || a.description || 'نشاط مسجل',
            time: a.created_at ? new Date(a.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'مؤخراً',
            type: a.type || a.module || 'general',
          })) : prev.recentActivities,
          todayTasks: rawTodayTasks.length > 0 ? rawTodayTasks.map((t: any, idx: number) => ({
            id: t.id || idx + 1,
            title: t.title || t.name || 'مهمة متابعة',
            category: t.category || 'عام',
            time: t.time || '10:00 ص',
            status: t.status || 'pending',
            assignee: t.assignee || t.user_name,
          })) : prev.todayTasks,
        }));

        if (managerDashRes) addDebugLog('بيانات لوحة تحكم مدير المسجد (getMosqueManagerDashboard)', `${BASE_URL}/dashboard/mosque-manager`, 200, managerDashRes);
        if (managerStatsRes) addDebugLog('إحصائيات المسجد لمدير المسجد (getMosqueManagerStatistics)', `${BASE_URL}/dashboard/mosque-manager/statistics`, 200, managerStatsRes);
      }

    } catch (err: any) {
      console.warn('Failed to load full dashboard data, using fallback models:', err);
      addDebugLog('خطأ أثناء جلب بيانات لوحة التحكم', `${BASE_URL}/admin/super-dashboard`, 500, { error: err.message });
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
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
  };
}
