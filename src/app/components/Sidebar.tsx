import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gem, Box, LayoutDashboard, ChevronDown, Moon, Sun, Sparkles,
  Palette, Type, Ruler, Circle, Layers, Zap,
  Square, AlignJustify, Navigation, MessageSquare, Table, BarChart3,
  Plus, Users, GraduationCap, Wrench, Activity, Coins,
  Settings, UserPlus, Target, FileText,
  ChevronLeft, MessageSquareWarning, CalendarDays, ListTodo,
  LogOut, Loader2, BookOpen, Mic, HeartHandshake, Award, Clock, Building2
} from "lucide-react";
import { AuthUser } from "../../domain/entities/Auth";

type NavItem = { id: string; label: string; href: string };
type NavSection = {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  href?: string;
};

const NAV: NavSection[] = [
  {
    id: "dashboard",
    label: "لوحة القيادة",
    icon: LayoutDashboard,
    href: "/",
    items: [],
  },
  {
    id: "mosques",
    label: "دليل المساجد",
    icon: Building2,
    items: [
      { id: "all-mosques", label: "كافة المساجد", href: "/mosques" },
      { id: "create-mosque", label: "إضافة مسجد جديد", href: "/mosques/create" },
    ],
  },
  {
    id: "tameems",
    label: "التعاميم والقرارات",
    icon: FileText,
    href: "/tameems",
    items: [],
  },
  {
    id: "people",
    label: "إدارة الكوادر",
    icon: Users,
    href: "/students",
    items: [],
  },
  {
    id: "volunteers",
    label: "إدارة المتطوعين",
    icon: HeartHandshake,
    items: [
      { id: "all-opportunities", label: "الفرص التطوعية", href: "/volunteers/opportunities" },
      { id: "create-opportunity", label: "إنشاء فرصة جديدة", href: "/volunteers/opportunities/create" },
      { id: "all-applications", label: "طلبات التقديم", href: "/volunteers/applications" },
      { id: "assign-tasks", label: "إسناد المهام", href: "/volunteers/tasks" },
      { id: "log-hours", label: "تسجيل الساعات والتقييم", href: "/volunteers/logs" },
      { id: "certificates", label: "إصدار الشهادات", href: "/volunteers/certificates" },
    ],
  },
  {
    id: "donations",
    label: "إدارة التبرعات",
    icon: Coins,
    items: [
      { id: "overview", label: "نظرة عامة", href: "/donations" },
      { id: "add-donation", label: "إضافة تبرع", href: "/donations/add" },
      { id: "campaigns", label: "الحملات", href: "/donations/campaigns" },
      { id: "create-campaign", label: "إنشاء حملة", href: "/donations/campaigns/create" },
      { id: "reports", label: "التقارير", href: "/donations/reports" },
    ],
  },
  {
    id: "sermons",
    label: "خطب المسجد",
    icon: BookOpen,
    items: [
      { id: "all-sermons", label: "مكتبة الخطب", href: "/sermons" },
      { id: "add-sermon", label: "إضافة خطبة جديدة", href: "/sermons/create" },
    ],
  },
  {
    id: "dawah",
    label: "البرامج الدعوية",
    icon: Sparkles,
    href: "/dawah",
    items: [],
  },
  {
    id: "maintenance",
    label: "إدارة الصيانة",
    icon: Wrench,
    items: [
      { id: "maintenance-tasks", label: "طلبات ومهام الصيانة", href: "/maintenance/tasks" },
      { id: "create-task", label: "طلب صيانة جديد", href: "/maintenance/tasks/create" },
    ],
  },
  {
    id: "complaints",
    label: "البلاغات والشكاوى",
    icon: MessageSquareWarning,
    href: "/maintenance/complaints",
    items: [],
  },
  {
    id: "tasks",
    label: "مهام المسجد",
    icon: CalendarDays,
    href: "/tasks",
    items: [],
  },
  {
    id: "design-system",
    label: "نظام التصميم",
    icon: Palette,
    items: [
      { id: "foundation", label: "الأسس", href: "/design-system/foundation" },
      { id: "components", label: "المكونات", href: "/design-system/components" },
    ],
  },
];

const SECTION_ICONS: Record<string, React.ElementType> = {
  // Mosques
  "all-mosques": Building2,
  "create-mosque": Plus,
  // Volunteers
  "all-opportunities": HeartHandshake,
  "create-opportunity": Plus,
  "all-applications": Users,
  "assign-tasks": Layers,
  "log-hours": Clock,
  certificates: Award,
  // Donations
  overview: LayoutDashboard,
  "add-donation": UserPlus,
  campaigns: Target,
  "create-campaign": Plus,
  reports: FileText,
  // People (Kader)
  "all-students": Users,
  // Sermons
  "all-sermons": BookOpen,
  "add-sermon": Mic,
  // Maintenance
  "maintenance-tasks": Wrench,
  "create-task": Plus,
  // Complaints
  complaints: MessageSquareWarning,
  // Tasks
  tasks: CalendarDays,
  // Design System
  foundation: Gem,
  components: Layers,
};


interface SidebarProps {
  isDark?: boolean;
  onToggleDark?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  logoutLoading?: boolean;
  user?: AuthUser | null;
  onWheelScroll?: (deltaY: number) => void;
}

export function Sidebar({
  isDark,
  onToggleDark,
  isOpen,
  onClose,
  onLogout,
  logoutLoading,
  user,
  onWheelScroll,
}: SidebarProps) {
  const pathname = usePathname() || "/";
  const [expanded, setExpanded] = useState<string[]>(["volunteers", "donations", "sermons", "maintenance", "tasks"]);

  useEffect(() => {
    const currentSection = NAV.find(s => s.href === pathname || s.items.some(i => pathname.startsWith(i.href)));
    if (currentSection && !expanded.includes(currentSection.id)) {
      setExpanded((prev) => [...prev, currentSection.id]);
    }
  }, [pathname]);

  const toggle = (id: string) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleWheel = (e: React.WheelEvent) => {
    if (onWheelScroll) {
      onWheelScroll(e.deltaY);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-[285px] max-w-[85vw] h-[100dvh] max-h-[100dvh] lg:sticky lg:top-0 lg:h-screen lg:max-h-screen flex shrink-0 flex-col bg-card border-l border-border transition-transform duration-300 shadow-2xl lg:shadow-none overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
        role="navigation"
        aria-label="التنقل الرئيسي"
      >
        {/* Brand & Mobile Close */}
        <div className="h-16 flex items-center justify-between gap-4 px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="وصل" className="h-12 w-auto object-contain drop-shadow-md" />
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all"
            aria-label="إغلاق القائمة"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto min-h-0 p-4 space-y-1.5 scrollbar-thin touch-auto" aria-label="أقسام النظام">
          {NAV.map((section) => {
            const userRoles = user?.roles || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth_user") || "{}")?.roles : []) || [];
            const isSuperAdmin = userRoles.includes("super_admin") || Boolean(typeof window !== "undefined" && JSON.parse(localStorage.getItem("auth_user") || "{}")?.is_super_admin);

            if (section.id === "mosques" && !isSuperAdmin) return null;

            const visibleItems = section.items.filter((i) => !(isSuperAdmin && i.id === "create-task"));
            const isActive = section.href === pathname || visibleItems.some(i => pathname.startsWith(i.href));
            const isExpanded = expanded.includes(section.id);
            const Icon = section.icon;

            return (
              <div key={section.id}>
                {visibleItems.length === 0 ? (
                  <Link
                    href={section.href || "/"}
                    onClick={onClose}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    <div className="flex items-center gap-3 text-right">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
                      <span>{section.label}</span>
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={() => toggle(section.id)}
                    aria-expanded={isExpanded}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${isActive && !isExpanded
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    <div className="flex items-center gap-3 text-right">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
                      <span>{section.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                )}

                {visibleItems.length > 0 && isExpanded && (
                  <div className="mr-6 mt-1 space-y-1 border-r border-border pr-4">
                    {visibleItems.map((item) => {
                      const isItemActive = pathname === item.href;
                      const ItemIcon = SECTION_ICONS[item.id];
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={onClose}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] transition-all duration-200 ${isItemActive
                              ? "text-primary font-black bg-primary/5"
                              : "text-muted-foreground font-medium hover:text-foreground hover:bg-muted"
                            }`}
                        >
                          {ItemIcon && <ItemIcon className="w-4 h-4 shrink-0" />}
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border shrink-0 space-y-2">
          {/* Dark Mode Toggle */}
          {onToggleDark && (
            <button
              onClick={onToggleDark}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500" />
              )}
              <span>{isDark ? "الوضع الفاتح" : "الوضع الداكن"}</span>
            </button>
          )}

          {/* User Card */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-primary/20">
                {user.name?.charAt(0) ?? "م"}
              </div>
              <div className="min-w-0 flex-1 text-right">
                <p className="text-[11px] font-black text-foreground truncate leading-none">{user.name}</p>
                <p className="text-[9px] text-primary font-bold mt-1 leading-none truncate">
                  {user.roles?.[0] ?? "مستخدم"}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              disabled={logoutLoading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-60 group"
            >
              {logoutLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              )}
              <span>{logoutLoading ? "جاري الخروج..." : "تسجيل الخروج"}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
