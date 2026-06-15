import React from 'react';
import { Sparkles, Moon, Sun } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleDark: () => void;
}

export function AuthLayout({ children, isDark, onToggleDark }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative p-4" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onToggleDark}
          className="p-3 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm transition-all active:scale-95"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>
      </div>

      {/* Content Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black text-foreground">مسجد الفلاح</h1>
          <p className="text-sm font-bold text-primary mt-1 uppercase tracking-wider">بوابة الإدارة الذكية</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-lg shadow-black/5">
          {children}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} مسجد الفلاح. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}
