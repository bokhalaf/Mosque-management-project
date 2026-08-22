'use client';

// ==============================
// UI Component — MosqueVolunteerLoader
// مؤشر تحميل بهوية إسلامية ومسجد متحرك ثلاثي الأبعاد مع نبضات زمردية
// ==============================

import React from 'react';
import { Sparkles } from 'lucide-react';

interface MosqueVolunteerLoaderProps {
  message?: string;
  subMessage?: string;
  minHeight?: string;
}

export function MosqueVolunteerLoader({
  message = 'جاري جلب بيانات المتطوعين والفرص من السيرفر...',
  subMessage = 'يرجى الانتظار لحظات للتحقق وتحديث القوائم',
  minHeight = 'min-h-[380px]',
}: MosqueVolunteerLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-card/60 backdrop-blur-sm border border-border/80 rounded-3xl shadow-sm ${minHeight} font-['Cairo'] relative overflow-hidden animate-in fade-in duration-300`}>
      {/* Background Islamic Radial Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      {/* Mosque Animated Icon Graphic */}
      <div className="relative mb-6">
        {/* Outer Rotating Pulse Ring */}
        <div className="absolute -inset-4 rounded-full border-2 border-dashed border-primary/30 animate-[spin_12s_linear_infinite]" />
        
        {/* Inner Glowing Aura */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 via-emerald-500/15 to-primary/5 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10 relative overflow-hidden group">
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

          {/* SVG Mosque Dome & Minaret */}
          <svg
            className="w-12 h-12 text-primary drop-shadow-md animate-bounce"
            style={{ animationDuration: '2.5s' }}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Crescent on top */}
            <path
              d="M32 6C33.5 6 35 7.2 35 9C35 10.8 33.5 12 32 12C30.5 12 29.5 10.8 29.5 9.5C30.8 9.5 31.8 8.5 31.8 7.2C31.8 6.6 31.5 6.2 32 6Z"
              fill="currentColor"
            />
            {/* Center Finial Spire */}
            <path d="M32 11V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            
            {/* Main Dome */}
            <path
              d="M32 16C24 16 19 24 19 32H45C45 24 40 16 32 16Z"
              fill="currentColor"
              fillOpacity="0.25"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Mosque Center Arch Door */}
            <path
              d="M28 48V38C28 35.8 29.8 34 32 34C34.2 34 36 35.8 36 38V48"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Dome Base & Wall */}
            <path
              d="M17 32H47V48H17V32Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Left Minaret */}
            <path
              d="M10 24L13 20L16 24V48H10V24Z"
              fill="currentColor"
              fillOpacity="0.15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M13 17V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

            {/* Right Minaret */}
            <path
              d="M48 24L51 20L54 24V48H48V24Z"
              fill="currentColor"
              fillOpacity="0.15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M51 17V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

            {/* Ground Base */}
            <path d="M6 48H58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Small floating sparkles */}
        <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
        <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-1 -left-1 animate-ping" />
      </div>

      {/* Loading Texts */}
      <div className="text-center space-y-1.5 z-10">
        <h4 className="text-sm sm:text-base font-black text-foreground flex items-center justify-center gap-2">
          <span>{message}</span>
        </h4>
        {subMessage && (
          <p className="text-xs text-muted-foreground font-medium max-w-sm">
            {subMessage}
          </p>
        )}
      </div>

      {/* Animated Loading Dots bar */}
      <div className="flex items-center gap-1.5 mt-5">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
