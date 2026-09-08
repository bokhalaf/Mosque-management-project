import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';

interface ForgotPasswordSectionProps {
  onBackToLogin: () => void;
  onSubmit: () => void;
}

export function ForgotPasswordSection({ onBackToLogin, onSubmit }: ForgotPasswordSectionProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-foreground">نسيت كلمة المرور؟</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          أدخل بريدك الإلكتروني المسجل لدينا وسنقوم بإرسال رابط لاستعادة كلمة المرور الخاصة بك.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 mt-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground px-1">البريد الإلكتروني</label>
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="email" 
              placeholder="admin@alfalah.com" 
              required
              className="w-full h-12 pr-12 pl-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              dir="ltr"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground rounded-xl text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          إرسال رابط الاستعادة
        </button>

        <button 
          type="button" 
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center gap-2 h-12 bg-transparent text-muted-foreground hover:text-foreground rounded-xl text-sm font-bold hover:bg-muted/50 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لتسجيل الدخول
        </button>
      </form>
    </div>
  );
}
