"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

// ── Types ──────────────────────────────────────────────
type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

// ── Context ────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ───────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // إزالة تلقائية بعد 3.5 ثانية
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 items-center pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border
              backdrop-blur-md min-w-[280px] max-w-sm
              animate-in slide-in-from-bottom-4 fade-in duration-300
              ${toast.type === "success"
                ? "bg-emerald-500/95 border-emerald-400/30 text-white"
                : "bg-red-500/95 border-red-400/30 text-white"
              }
            `}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-bold flex-1 text-right">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="p-1 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
