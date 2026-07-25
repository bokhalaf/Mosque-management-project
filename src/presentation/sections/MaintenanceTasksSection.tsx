import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import { 
  Wrench, CheckCircle2, Clock, AlertTriangle,
  Activity, Plus, Filter, Search, Download, Eye, 
  FileText, RefreshCw, X, Layers, SlidersHorizontal
} from 'lucide-react';
import { MaintenanceRepositoryImpl } from "../../data/repositories/MaintenanceRepositoryImpl";
import { MaintenanceRequestItem, MaintenanceStats } from "../../domain/entities/Maintenance";

const maintenanceRepo = new MaintenanceRepositoryImpl();

// --- Helpers ---
const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'critical':
    case 'urgent': 
      return 'bg-red-500/10 text-red-500 border-red-500/20 font-black';
    case 'high': 
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'medium': 
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'low': 
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'critical':
    case 'urgent': return 'حرجة';
    case 'high': return 'عالية';
    case 'medium': return 'متوسطة';
    case 'low': return 'منخفضة';
    default: return priority || 'عادية';
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    case 'approved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'cancelled':
    case 'delayed': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'قيد الانتظار';
    case 'approved': return 'معتمدة';
    case 'in_progress': return 'جاري العمل';
    case 'completed': return 'مكتملة';
    case 'cancelled': return 'ملغاة';
    case 'delayed': return 'متأخرة';
    default: return status;
  }
};

const getCategoryLabel = (cat?: string) => {
  switch (cat) {
    case 'electrical': return 'أعطال كهربائية';
    case 'plumbing': return 'سباكة ومياه';
    case 'carpentry': return 'نجارة وأثاث';
    case 'cleaning': return 'نظافة وعناية';
    case 'other': return 'أخرى';
    default: return cat || 'عام';
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

export function MaintenanceTasksSection({ 
  onViewTaskDetails, 
  onCreateTask 
}: { 
  onViewTaskDetails?: (id: string) => void,
  onCreateTask?: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [stats, setStats] = useState<MaintenanceStats>({
    open_requests: 0,
    in_progress: 0,
    completed_this_month: 0,
    critical: 0,
  });

  const [requests, setRequests] = useState<MaintenanceRequestItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Stats API
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await maintenanceRepo.getMaintenancePageStats();
      setStats(data);
    } catch (err: any) {
      console.error("Error loading maintenance stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch Maintenance Requests API
  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    setError(null);
    try {
      const result = await maintenanceRepo.getMaintenanceRequests({
        q: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
      });
      setRequests(result.data || []);
    } catch (err: any) {
      console.error("Error loading maintenance requests:", err);
      setError(err.message || "حدث خطأ أثناء جلب طلبات الصيانة");
    } finally {
      setLoadingRequests(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRequests();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadRequests]);

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery.trim() !== '';

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
  };

  const statusTabs = [
    { id: 'all', label: 'الجميع' },
    { id: 'pending', label: 'قيد الانتظار', count: stats.open_requests },
    { id: 'in_progress', label: 'جاري العمل', count: stats.in_progress },
    { id: 'completed', label: 'مكتملة', count: stats.completed_this_month },
    { id: 'cancelled', label: 'ملغاة' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="إدارة المهام والصيانة"
        description="تتبع طلبات الصيانة الدورية والطارئة بكفاءة."
        breadcrumbs={[
          { label: "الإدارة التشغيلية" },
          { label: "مهام الصيانة", active: true }
        ]}
        actions={
          <div className="flex gap-2">
            <button 
              onClick={() => { loadStats(); loadRequests(); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-bold hover:bg-muted transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${(loadingStats || loadingRequests) ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
            <button
              onClick={onCreateTask}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> طلب صيانة جديد
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 pt-4 space-y-8">
        
        {/* SECTION 1: Interactive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="طلبات مفتوحة" 
            value={loadingStats ? "..." : (stats.open_requests ?? 0)} 
            icon={Wrench} 
            colorStyle="bg-primary/10 text-primary border-primary/20" 
            isActive={statusFilter === 'pending'}
            onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
            subtitle="قيد الانتظار"
          />
          <StatCard 
            title="جاري العمل" 
            value={loadingStats ? "..." : (stats.in_progress ?? 0)} 
            icon={Activity} 
            colorStyle="bg-amber-500/10 text-amber-500 border-amber-500/20" 
            isActive={statusFilter === 'in_progress'}
            onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
            subtitle="قيد التنفيذ حالياً"
          />
          <StatCard 
            title="تم إنجازها (الشهر)" 
            value={loadingStats ? "..." : (stats.completed_this_month ?? 0)} 
            icon={CheckCircle2} 
            colorStyle="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
            isActive={statusFilter === 'completed'}
            onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
            subtitle="مكتملة ومغلقة"
          />
          <StatCard 
            title="أعطال حرجة" 
            value={loadingStats ? "..." : (stats.critical ?? 0)} 
            icon={AlertTriangle} 
            colorStyle="bg-red-500/10 text-red-500 border-red-500/20" 
            isActive={priorityFilter === 'urgent' || priorityFilter === 'critical'}
            onClick={() => setPriorityFilter(priorityFilter === 'urgent' ? 'all' : 'urgent')}
            subtitle="أولوية قصوى"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Column */}
          <div className="xl:col-span-9 space-y-6">
            
            {/* SECTION 2: UI/UX Enhanced Search & Filters Bar */}
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

              {/* Row 2: Search + Category + Priority Dropdowns */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="ابحث عن مهمة أو رقم طلب..." 
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

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-muted px-3 py-2 rounded-xl border border-border">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
                    >
                      <option value="all">جميع التصنيفات</option>
                      <option value="electrical">أعطال كهربائية</option>
                      <option value="plumbing">سباكة ومياه</option>
                      <option value="carpentry">نجارة وأثاث</option>
                      <option value="cleaning">نظافة وعناية</option>
                      <option value="other">أخرى</option>
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
                      <option value="urgent">حرجة (Urgent)</option>
                      <option value="high">عالية (High)</option>
                      <option value="medium">متوسطة (Medium)</option>
                      <option value="low">منخفضة (Low)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 3: Active Filters */}
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                      الأولوية: {getPriorityLabel(priorityFilter)}
                      <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => setPriorityFilter('all')} />
                    </span>
                  )}

                  {categoryFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                      التصنيف: {getCategoryLabel(categoryFilter)}
                      <X className="w-3 h-3 cursor-pointer hover:opacity-80" onClick={() => setCategoryFilter('all')} />
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

            {/* SECTION 3: Maintenance Table */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">رقم المهمة</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">التفاصيل والتصنيف</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الأولوية</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingRequests ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                            <span>جاري تحميل طلبات الصيانة...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-red-500 font-bold">
                          {error}
                        </td>
                      </tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground space-y-2">
                          <p className="font-bold text-foreground">لا توجد طلبات صيانة مطابقة للبحث أو التصفية الحالية.</p>
                          {hasActiveFilters && (
                            <button onClick={resetFilters} className="text-xs text-primary underline font-bold">
                              إعادة ضبط الفلاتر لرؤية كل الطلبات
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      requests.map((task) => {
                        const mNumber = task.maintenance_number || `MR-${task.id}`;
                        return (
                          <tr key={task.id} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-black text-foreground">{mNumber}</span>
                              <span className="block text-[10px] text-muted-foreground mt-0.5">{formatDate(task.created_at)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="block text-sm font-bold text-foreground mb-1 line-clamp-1">{task.title}</span>
                              <span className="inline-block text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                                {getCategoryLabel(task.category)} • {task.mosque?.name || 'المسجد الرئيسي'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getPriorityStyles(task.priority)}`}>
                                {getPriorityLabel(task.priority)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyles(task.status)}`}>
                                {getStatusLabel(task.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => onViewTaskDetails && onViewTaskDetails(String(task.id))}
                                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all" 
                                  title="عرض التفاصيل"
                                >
                                  <Eye className="w-4 h-4" />
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
                  عرض {requests.length} من أصل {stats.open_requests + stats.in_progress + stats.completed_this_month} طلب صيانة
                </span>
              </div>
            </div>

          </div>

          {/* Side Column: Activity Timeline */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">أحدث طلبات الصيانة</h3>
              <div className="space-y-6">
                {requests.slice(0, 4).map((task, idx) => (
                  <div key={task.id} className="flex gap-4 relative">
                    {idx !== Math.min(4, requests.length) - 1 && (
                      <div className="absolute right-4 top-10 bottom-[-20px] w-px bg-border"></div>
                    )}
                    <div className="relative z-10 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-card ${
                        task.status === 'completed' ? 'bg-emerald-500 text-white' :
                        task.status === 'in_progress' ? 'bg-amber-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                        {task.status === 'in_progress' && <Activity className="w-4 h-4" />}
                        {task.status === 'pending' && <Clock className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="pt-1.5 pb-2">
                      <p className="text-sm font-bold text-foreground leading-snug line-clamp-1">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(task.created_at)} ({getStatusLabel(task.status)})
                      </p>
                    </div>
                  </div>
                ))}

                {requests.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">لا توجد طلبات صيانة حالياً.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
