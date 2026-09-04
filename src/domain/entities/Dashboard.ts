// ==============================
// Domain Entity — Dashboard
// أنواع بيانات لوحة القيادة لمدير المسجد ومدير المنطقة (السوبر أدمن)
// Promoted verbatim from the local interfaces previously defined inline in
// src/presentation/hooks/useDashboardData.ts
// ==============================

export interface MosqueManagerDashboardData {
  monthlyDonations: number;
  monthlyDonationsGrowth: number;
  monthlyDonationsIsIncrease: boolean;
  formattedMonthlyDonations?: string;
  totalDonations: number;
  activeCampaignsCount: number;
  openMaintenanceCount: number;
  criticalMaintenanceCount: number;
  inProgressMaintenanceCount: number;
  pendingComplaintsCount: number;
  volunteersCount: number;
  pendingApplicationsCount: number;
  activeOpportunitiesCount: number;
  totalStudents: number;
  totalTeachers: number;
  totalVolunteers: number;
  pendingInvitations: number;
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
