"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { AuthLayout } from "./components/layouts/AuthLayout";
import { LoginSection } from "./components/sections/auth/LoginSection";
import { ForgotPasswordSection } from "./components/sections/auth/ForgotPasswordSection";
import { ResetPasswordSection } from "./components/sections/auth/ResetPasswordSection";
import { ToastProvider, useToast } from "./components/ui/Toast";
import { useLogout } from "../presentation/hooks/useLogout";
import { AuthUser } from "../domain/entities/Auth";
import { usePathname } from "next/navigation";

type AuthRoute = "login" | "forgot-password" | "reset-password";

// ── Inner layout (has access to ToastProvider context) ──
function InnerLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRoute, setAuthRoute] = useState<AuthRoute>("login");
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { showToast } = useToast();
  const { logout, loading: logoutLoading } = useLogout();

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  // Keyboard: Alt+D = toggle dark
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "d") setIsDark((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Handlers ──────────────────────────────────────────
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await logout();
    showToast("تم تسجيل الخروج بنجاح. إلى اللقاء! 👋", "success");
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthRoute("login");
  };

  // ── Auth screens ──────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className={isDark ? "dark" : ""} style={{ fontFamily: "'Cairo', sans-serif" }}>
        <AuthLayout isDark={isDark} onToggleDark={() => setIsDark((v) => !v)}>
          {authRoute === "login" && (
            <LoginSection
              onLogin={handleLogin}
              onNavigateToForgot={() => setAuthRoute("forgot-password")}
            />
          )}
          {authRoute === "forgot-password" && (
            <ForgotPasswordSection
              onBackToLogin={() => setAuthRoute("login")}
              onSubmit={() => setAuthRoute("reset-password")}
            />
          )}
          {authRoute === "reset-password" && (
            <ResetPasswordSection
              onBackToLogin={() => setAuthRoute("login")}
              onSubmit={() => setIsAuthenticated(true)}
            />
          )}
        </AuthLayout>
      </div>
    );
  }

  // ── Authenticated dashboard ────────────────────────────
  return (
    <div className={isDark ? "dark" : ""} style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div
        className="flex min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden"
        dir="rtl"
      >
        {/* Background glow effects */}
        <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        {/* Sidebar */}
        <Sidebar
          isDark={isDark}
          onToggleDark={() => setIsDark((v) => !v)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={currentUser}
          onLogout={handleLogout}
          logoutLoading={logoutLoading}
        />

        {/* Main Content */}
        <main
          className="flex-1 flex flex-col min-w-0 overflow-x-hidden"
          style={{ height: "100dvh" }}
        >
          <TopBar
            onMenuClick={() => setIsSidebarOpen(true)}
            user={
              currentUser
                ? {
                    name: currentUser.name,
                    role: currentUser.roles?.[0] ?? "مستخدم",
                    initials: currentUser.name?.charAt(0) ?? "م",
                  }
                : undefined
            }
          />

          <div ref={mainRef} className="flex-1 overflow-y-auto">
            <div className="px-4 lg:px-8 py-6 relative z-10 w-full max-w-[1600px] mx-auto min-h-full flex flex-col">
              <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-0">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Public export: wraps everything in ToastProvider ──
export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <InnerLayout>{children}</InnerLayout>
    </ToastProvider>
  );
}
