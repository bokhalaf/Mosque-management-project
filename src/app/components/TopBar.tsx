import { Search, Bell, Menu } from "lucide-react";

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
        <button className="relative p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
        </button>
        
        <div className="h-8 w-px bg-border mx-2" />
        
        <button className="flex items-center gap-3 p-1.5 hover:bg-muted/50 rounded-xl transition-all">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground leading-none">{user.name}</p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-none">{user.role}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-800 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
            {user.initials}
          </div>
        </button>
      </div>
    </div>
  );
}
