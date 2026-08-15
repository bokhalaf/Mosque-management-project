// ==============================
// Profile — ProfileDebugBox Component
// صندوق مراقب استجابة السيرفر وطلبات الـ API المباشرة لملف المستخدم
// ==============================

import React, { useState } from 'react';
import { Terminal, X, Copy, Check } from 'lucide-react';

export interface ProfileApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

interface ProfileDebugBoxProps {
  debugLogs: ProfileApiDebugLog[];
  onClear: () => void;
  onClose: () => void;
}

export function ProfileDebugBox({ debugLogs, onClear, onClose }: ProfileDebugBoxProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyLog = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="text-xs font-black text-slate-200 tracking-wide font-mono dir-ltr">
            LIVE PROFILE API INSPECTOR — HTTP REQUEST LOGS
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[11px] font-bold transition-all"
          >
            مسح السجل
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {debugLogs.length === 0 ? (
        <p className="text-xs text-slate-500 font-mono py-4 text-center">لا توجد طلبات مسجلة حالياً...</p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-right font-mono scrollbar-thin">
          {debugLogs.map((log, idx) => {
            const jsonStr = JSON.stringify(log.response, null, 2);
            return (
              <div key={idx} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 dir-ltr font-bold">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-slate-300 text-[11px] truncate max-w-md">{log.url}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">{log.time}</span>
                    <button
                      onClick={() => handleCopyLog(jsonStr, idx)}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-slate-300 hover:text-white rounded text-[10px] transition-all"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === idx ? 'تم النسخ' : 'نسخ JSON'}</span>
                    </button>
                  </div>
                </div>
                <pre className="bg-slate-950 p-2.5 rounded-lg text-[11px] text-emerald-400/90 overflow-x-auto max-h-36 dir-ltr text-left">
                  {jsonStr}
                </pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
