'use client';

import Link from "next/link";
import { Search, Bell, Menu } from "lucide-react";
import { useNotifications } from "../../presentation/hooks/useNotifications";

interface TopBarProps {
  user?: {
    name: string;
    role: string;
    initials: string;
  };
  onMenuClick?: () => void;
}

export function TopBar({ 
  user = { name: "أحمد المدير", role: "إدارة المسجد", initials: "أ" },
  onMenuClick 
}: TopBarProps) {
  const { unreadCount } = useNotifications();

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-8 bg-card/80 backdrop-blur-md border-b border-border transition-all">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative group max-w-md w-full hidden sm:block">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            placeholder="بحث في النظام..."
            className="w-full pr-11 pl-4 py-2.5 bg-muted/50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all text-right"
            dir="rtl"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Bell Link */}
        <Link
          href="/notifications"
          className="relative p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all group"
          title="عرض الإشعارات والتنبيهات"
        >
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 text-[10px] font-black bg-destructive text-white rounded-full flex items-center justify-center min-w-[18px] h-[18px] border-2 border-card shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        
        <div className="h-8 w-px bg-border mx-2" />
        
        {/* Profile Link */}
        <Link 
          href="/profile"
          className="flex items-center gap-3 p-1.5 hover:bg-muted/50 rounded-xl transition-all group cursor-pointer"
          title="عرض الملف الشخصي لمدير المسجد"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-none">{user.name}</p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-none">{user.role}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-800 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            {user.initials}
          </div>
        </Link>
      </div>
    </div>
  );
}

