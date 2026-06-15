"use client";

import React, { useState } from "react";
import { Mail, Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useLogin } from "../../../../presentation/hooks/useLogin";
import { useToast } from "../../ui/Toast";
import { AuthUser } from "../../../../domain/entities/Auth";

interface LoginSectionProps {
  onLogin: (user: AuthUser) => void;
  onNavigateToForgot: () => void;
}

export function LoginSection({ onLogin, onNavigateToForgot }: LoginSectionProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useLogin();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result) {
      showToast(`مرحباً ${result.user.name}! تم تسجيل الدخول بنجاح ✅`, "success");
      onLogin(result.user);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-foreground">تسجيل الدخول</h2>
        <p className="text-sm text-muted-foreground mt-2">مرحباً بك مجدداً في لوحة تحكم المسجد</p>
      </div>

      {/* رسالة الخطأ من الـ API */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground px-1">البريد الإلكتروني</label>
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="admin@test.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full h-12 pr-12 pl-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground px-1">كلمة المرور</label>
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full h-12 pr-12 pl-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 bg-background"
            />
            <span className="text-sm font-medium text-muted-foreground">تذكرني</span>
          </label>
          <button
            type="button"
            onClick={onNavigateToForgot}
            className="text-sm font-bold text-primary hover:underline"
          >
            نسيت كلمة المرور؟
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground rounded-xl text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري تسجيل الدخول...
            </>
          ) : (
            <>
              دخول
              <ArrowLeft className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
