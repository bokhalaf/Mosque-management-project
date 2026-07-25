import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquareWarning, CheckCircle2, Clock, AlertTriangle,
  Search, Filter, Calendar, Eye, UserPlus, Archive, CheckCircle,
  MessageCircle, Activity, User, Info, RefreshCw, X, Layers, SlidersHorizontal
} from 'lucide-react';
import { PageHeader } from "../../app/components/PageHeader";
import { ComplaintRepositoryImpl } from "../../data/repositories/ComplaintRepositoryImpl";
import { ComplaintItem, ComplaintStats } from "../../domain/entities/Complaint";

const complaintRepo = new ComplaintRepositoryImpl();

// --- Helpers ---
const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high': return 'عالية';
    case 'medium': return 'متوسطة';
    case 'low': return 'عادية';
    default: return priority || 'غير محدد';
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending':
    case 'new': 
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'in_progress':
    case 'review': 
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'resolved': 
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'canceled':
    case 'closed': 
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
    case 'new': 
      return 'جديدة';
    case 'in_progress':
    case 'review': 
      return 'قيد المعالجة';
    case 'resolved': 
      return 'تم الحل';
    case 'canceled':
    case 'closed': 
      return 'مغلقة';
    default:
      return status;
  }
};

const getComplaintTypeLabel = (type?: string) => {
  switch (type) {
    case 'service_missing': return 'خدمة مفقودة';
    case 'power_outage': return 'انقطاع كهرباء/تكييف';
    case 'corruption': return 'بلاغ إداري';
    case 'employee_misconduct': return 'سلوك موظف';
    case 'technical_issue': return 'مشكلة تقنية';
    default: return 'عام';
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

// --- Sub Components ---
const StatCard = ({ title, value, icon: Icon, colorStyle, isActive, onClick, subtitle }: any) => (
  <div 
    onClick={onClick}
    className={`bg-card border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${
      isActive ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/40'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-xl border ${colorStyle} transition-transform group-hover:scale-105`}>
        <Icon className="w-6 h-6" />
      </div>
      {isActive && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
          نشط
        </span>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-black text-foreground mb-1">{value}</h3>
      <p className="text-sm font-bold text-muted-foreground">{title}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground/80 mt-1">{subtitle}</p>}
    </div>
  </div>
);

export function ComplaintsSection({ onViewComplaintDetails }: { onViewComplaintDetails?: (id: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [stats, setStats] = useState<ComplaintStats>({
    total_complaints: 0,
    open_complaints: 0,
    urgent_complaints: 0,
    resolved_this_month: 0,
    avg_response_hours: 0,
  });

  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Stats from API
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const statsData = await complaintRepo.getComplaintPageStats();
      setStats(statsData);
    } catch (err: any) {
      console.error("Error loading complaint page stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch Admin Complaints from API
  const loadComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    setError(null);
    try {
      const result = await complaintRepo.getAdminComplaints({
        q: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        complaint_type: typeFilter,
      });
      setComplaints(result.data || []);
    } catch (err: any) {
      console.error("Error loading admin complaints:", err);
      setError(err.message || "حدث خطأ أثناء جلب قائمة الشكاوى");
    } finally {
      setLoadingComplaints(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, typeFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadComplaints();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadComplaints]);

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all' || searchQuery.trim() !== '';

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setTypeFilter('all');
    setSearchQuery('');
  };

  // Status Tabs config for rapid 1-click filtering
  const statusTabs = [
    { id: 'all', label: 'الجميع', count: stats.total_complaints },
    { id: 'pending', label: 'جديدة', count: stats.open_complaints },
    { id: 'in_progress', label: 'قيد المعالجة' },
    { id: 'resolved', label: 'تم الحل', count: stats.resolved_this_month },
    { id: 'canceled', label: 'مغلقة' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="الشكاوى والاقتراحات"
        description="إدارة ومتابعة شكاوى المصلين والمرافق لضمان تقديم أفضل تجربة للمسجد."
        breadcrumbs={[
          { label: "الإدارة التشغيلية" },
          { label: "الشكاوى والاقتراحات", active: true }
        ]}
        actions={
          <button 
            onClick={() => { loadStats(); loadComplaints(); }}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl text-sm font-bold hover:bg-muted transition-all"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${(loadingStats || loadingComplaints) ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-8">
        
        {/* SECTION 1: Interactive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard 
            title="إجمالي الشكاوى" 
            value={loadingStats ? "..." : (stats.total_complaints ?? 0)} 
            icon={MessageSquareWarning} 
            colorStyle="bg-primary/10 text-primary border-primary/20"
            isActive={statusFilter === 'all' && priorityFilter === 'all'}
            onClick={() => resetFilters()}
            subtitle="عرض كافة الشكاوى"
          />
          <StatCard 
            title="شكاوى مفتوحة" 
            value={loadingStats ? "..." : (stats.open_complaints ?? 0)} 
            icon={AlertTriangle} 
            colorStyle="bg-amber-500/10 text-amber-500 border-amber-500/20"
            isActive={statusFilter === 'pending'}
            onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
            subtitle="اضغط للتصفية"
          />
          <StatCard 
            title="شكاوى عاجلة" 
            value={loadingStats ? "..." : (stats.urgent_complaints ?? 0)} 
            icon={Activity} 
            colorStyle="bg-red-500/10 text-red-500 border-red-500/20"
            isActive={priorityFilter === 'high'}
            onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
            subtitle="أولوية عالية جداً"
          />
          <StatCard 
            title="تم الحل (الشهر)" 
            value={loadingStats ? "..." : (stats.resolved_this_month ?? 0)} 
            icon={CheckCircle2} 
            colorStyle="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            isActive={statusFilter === 'resolved'}
            onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}
            subtitle="مكفولة ومعالجة"
          />
          <StatCard 
            title="متوسط الاستجابة" 
            value={loadingStats ? "..." : `${stats.avg_response_hours ?? 0} ساعات`} 
            icon={Clock} 
            colorStyle="bg-blue-500/10 text-blue-500 border-blue-500/20"
            subtitle="زمن المعالجة"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Column (Filters + Table) */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* SECTION 2: UI/UX Enhanced Filters */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              
              {/* Row 1: Status Segmented Control Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
                <span className="text-xs font-bold text-muted-foreground pl-2 flex items-center gap-1 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> الحالة:
                </span>
                {statusTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                      statusFilter === tab.id
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-1.5 py-0.5 text-[10px] rounded-md ${
                        statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-background text-foreground'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Row 2: Search Bar + Priority Filter + Type Filter */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="ابحث برقم الشكوى، العنوان، أو اسم المرسل..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdowns Group */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  
                  {/* Category / Type Filter */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-muted px-3 py-2 rounded-xl border border-border">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
                    >
                      <option value="all">جميع التصنيفات</option>
                      <option value="service_missing">خدمة مفقودة</option>
                      <option value="power_outage">انقطاع كهرباء / تكييف</option>
                      <option value="corruption">بلاغ إداري</option>
                      <option value="employee_misconduct">سلوك موظف</option>
                      <option value="technical_issue">مشكلة تقنية</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-muted px-3 py-2 rounded-xl border border-border">
                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
                    >
                      <option value="all">جميع الأولويات</option>
                      <option value="high">عالية (High)</option>
                      <option value="medium">متوسطة (Medium)</option>
                      <option value="low">عادية (Low)</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Row 3: Active Filter Chips & Reset */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 animate-in fade-in">
                  <span className="text-[11px] font-bold text-muted-foreground">الفلاتر النشطة:</span>
                  
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                      الحالة: {getStatusLabel(statusFilter)}
                      <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => setStatusFilter('all')} />
                    </span>
                  )}

                  {priorityFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                      الأولوية: {getPriorityLabel(priorityFilter)}
                      <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => setPriorityFilter('all')} />
                    </span>
                  )}

                  {typeFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                      التصنيف: {getComplaintTypeLabel(typeFilter)}
                      <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => setTypeFilter('all')} />
                    </span>
                  )}

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-bold border border-border">
                      بحث: "{searchQuery}"
                      <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => setSearchQuery('')} />
                    </span>
                  )}

                  <button 
                    onClick={resetFilters}
                    className="text-xs font-bold text-red-500 hover:underline mr-auto flex items-center gap-1"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                </div>
              )}

            </div>

            {/* SECTION 3: Complaints Table */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">رقم الشكوى</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">المرسل</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الموضوع / التصنيف</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الأولوية</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingComplaints ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                            <span>جاري تحميل الشكاوى المفلترة...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-red-500 font-bold">
                          {error}
                        </td>
                      </tr>
                    ) : complaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground space-y-2">
                          <p className="font-bold text-foreground">لا توجد شكاوى مطابقة للبحث أو التصفية الحالية.</p>
                          {hasActiveFilters && (
                            <button onClick={resetFilters} className="text-xs text-primary underline font-bold">
                              إعادة ضبط الفلاتر لرؤية كل الشكاوى
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      complaints.map((item) => {
                        const complaintIdStr = item.complaint_number || String(item.id);
                        const senderName = item.is_anonymous 
                          ? "فاعل خير (مجهول)" 
                          : (item.user?.name || item.email || "مصلي / زائر");
                        const senderType = getComplaintTypeLabel(item.complaint_type);

                        return (
                          <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-black text-foreground">{complaintIdStr}</span>
                              <span className="block text-[10px] text-muted-foreground mt-0.5">{formatDate(item.created_at)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                  {senderName[0] || '؟'}
                                </div>
                                <div>
                                  <span className="block text-sm font-bold text-foreground">{senderName}</span>
                                  <span className="block text-[10px] text-muted-foreground">{senderType}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-foreground line-clamp-1 max-w-[220px]" title={item.title || item.description}>
                                {item.title || item.description || "بدون عنوان"}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-bold">{senderType}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getPriorityStyles(item.priority)}`}>
                                {getPriorityLabel(item.priority)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyles(item.status)}`}>
                                {getStatusLabel(item.status)}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => onViewComplaintDetails && onViewComplaintDetails(String(item.id))}
                                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all" 
                                  title="عرض التفاصيل"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {item.status !== 'resolved' && item.status !== 'canceled' && (
                                  <button className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="إسناد / معالجة">
                                    <UserPlus className="w-4 h-4" />
                                  </button>
                                )}
                                <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all" title="أرشفة">
                                  <Archive className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  عرض {complaints.length} من إجمالي {stats.total_complaints ?? complaints.length} شكوى
                </span>
              </div>
            </div>
          </div>

          {/* Side Column (Activity Timeline) */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">أحدث النشاطات</h3>
                <span className="text-xs font-bold text-primary">مباشر</span>
              </div>
              
              <div className="space-y-6">
                {complaints.slice(0, 4).map((item, idx) => (
                  <div key={item.id} className="flex gap-4 relative">
                    {idx !== Math.min(4, complaints.length) - 1 && (
                      <div className="absolute right-4 top-10 bottom-[-20px] w-px bg-border"></div>
                    )}
                    
                    <div className="relative z-10 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-card ${
                        item.status === 'pending' ? 'bg-blue-500 text-white' :
                        item.status === 'resolved' ? 'bg-emerald-500 text-white' :
                        item.status === 'in_progress' ? 'bg-amber-500 text-white' :
                        'bg-primary text-white'
                      }`}>
                        {item.status === 'pending' && <MessageCircle className="w-4 h-4" />}
                        {item.status === 'resolved' && <CheckCircle className="w-4 h-4" />}
                        {item.status === 'in_progress' && <User className="w-4 h-4" />}
                        {item.status === 'canceled' && <Info className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    <div className="pt-1.5 pb-2">
                      <p className="text-sm font-bold text-foreground leading-snug">
                        {item.title || item.description || "تحديث شكوى"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(item.created_at)} ({getStatusLabel(item.status)})
                      </p>
                    </div>
                  </div>
                ))}

                {complaints.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">لا توجد نشاطات حالياً</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
