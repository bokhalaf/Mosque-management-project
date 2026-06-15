import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gem, Box, LayoutDashboard, ChevronDown, Moon, Sun, Sparkles,
  Palette, Type, Ruler, Circle, Layers, Zap,
  Square, AlignJustify, Navigation, MessageSquare, Table, BarChart3,
  Plus, Users, GraduationCap, Wrench, Activity, Heart,
  Settings, UserPlus, Target, FileText,
  ChevronLeft, MessageSquareWarning, CalendarDays, ListTodo,
  LogOut, Loader2
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
    icon: Activity,
    href: "/",
    items: [],
  },
  {
    id: "students",
    label: "إدارة الطلاب",
    icon: GraduationCap,
    items: [
      { id: "all-students", label: "كل الطلاب", href: "/students" },
      { id: "attendance", label: "سجل الحضور", href: "/students/attendance" },
      { id: "rings", label: "الحلقات القرآنية", href: "/students/rings" },
    ],
  },
  {
    id: "teachers",
    label: "إدارة المعلمين",
    icon: Users,
    items: [
      { id: "all-teachers", label: "كل المعلمين", href: "/teachers" },
      { id: "schedule", label: "الجدول الأسبوعي", href: "/teachers/schedule" },
    ],
  },
  {
    id: "donations",
    label: "إدارة التبرعات",
    icon: Heart,
    items: [
      { id: "overview", label: "نظرة عامة", href: "/donations" },
      { id: "add-donation", label: "إضافة تبرع", href: "/donations/add" },
      { id: "campaigns", label: "الحملات", href: "/donations/campaigns" },
      { id: "create-campaign", label: "إنشاء حملة", href: "/donations/campaigns/create" },
      { id: "reports", label: "التقارير", href: "/donations/reports" },
    ],
  },
  {
    id: "maintenance",
    label: "الصيانة والخدمات",
    icon: Wrench,
    items: [
      { id: "complaints", label: "الشكاوى والطلبات", href: "/maintenance/complaints" },
      { id: "maintenance-tasks", label: "مهام الصيانة", href: "/maintenance/tasks" },
      { id: "create-task", label: "إنشاء طلب صيانة", href: "/maintenance/tasks/create" },
    ],
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
  // Donations
  overview: LayoutDashboard,
  "add-donation": UserPlus,
  campaigns: Target,
  "create-campaign": Plus,
  reports: FileText,
  // Students
  "all-students": Users,
  attendance: Activity,
  rings: Box,
  // Teachers
  "all-teachers": Users,
  schedule: Table,
  // Maintenance
  complaints: MessageSquareWarning,
  "maintenance-tasks": Wrench,
  "create-task": Plus,
  // Tasks
  tasks: ListTodo,
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
}

export function Sidebar({
  isDark,
  onToggleDark,
  isOpen,
  onClose,
  onLogout,
  logoutLoading,
  user,
}: SidebarProps) {
  const pathname = usePathname() || "/";
  const [expanded, setExpanded] = useState<string[]>(["donations", "students", "maintenance", "tasks"]);

  // Automatically expand section based on current path
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

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-50 w-[280px] lg:static lg:flex shrink-0 h-full flex-col bg-card border-l border-border transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      role="navigation"
      aria-label="التنقل الرئيسي"
    >
      {/* Brand & Mobile Close */}
      <div className="h-16 flex items-center justify-between gap-4 px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0 text-right">
            <p className="text-sm font-black text-foreground">مسجد الفلاح</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">بوابة الإدارة الذكية</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5" aria-label="أقسام النظام">
        {NAV.map((section) => {
          const isActive = section.href === pathname || section.items.some(i => pathname.startsWith(i.href));
          const isExpanded = expanded.includes(section.id);
          const Icon = section.icon;

          return (
            <div key={section.id}>
              {section.items.length === 0 ? (
                <Link
                  href={section.href || "/"}
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

              {section.items.length > 0 && isExpanded && (
                <div className="mr-6 mt-1 space-y-1 border-r border-border pr-4">
                  {section.items.map((item) => {
                    const isItemActive = pathname === item.href;
                    const ItemIcon = SECTION_ICONS[item.id];
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
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
  );
}
