'use client';

// ==============================
// Presentation Component — MosqueTaskDebugTerminal
// ==============================

import React from 'react';
import { Terminal, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { MosqueTaskDebugLog } from '../../../hooks/useMosqueTasks';

interface MosqueTaskDebugTerminalProps {
  logs: MosqueTaskDebugLog[];
  onClear: () => void;
  onClose: () => void;
}

export function MosqueTaskDebugTerminal({
  logs,
  onClear,
  onClose,
}: MosqueTaskDebugTerminalProps) {
  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 font-mono text-xs shadow-2xl border border-slate-800 space-y-3 font-['Cairo'] my-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">مراقب شبكة مهام المسجد (API Terminal)</span>
          <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-sans">
            {logs.length} طلبات
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
            title="مسح السجل"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
            title="إغلاق المراقب"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 dir-ltr text-left pr-1 scrollbar-thin">
        {logs.length === 0 ? (
          <p className="text-slate-500 text-center py-6 text-xs font-sans">
            لم يتم تسجيل أي طلبات شبكة بعد. قم بإضافة أو تنفيذ مهمة لمراقبة الاتصال بالمزيد من الوظائف.
          </p>
        ) : (
          logs.map((log) => {
            const isSuccess = log.status && log.status >= 200 && log.status < 300;
            return (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-sans">{log.time}</span>
                    <span
                      className={`font-black px-1.5 py-0.5 rounded ${
                        log.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-400'
                          : log.method === 'POST'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.method === 'PUT'
                          ? 'bg-amber-500/20 text-amber-400'
                          : log.method === 'PATCH'
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {log.method}
                    </span>
                    <span className="text-slate-300 font-medium truncate max-w-xs">{log.url}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSuccess ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{log.status} OK</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
                        <AlertCircle className="w-3 h-3" />
                        <span>{log.status || 'ERR'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {log.requestBody && (
                  <div className="text-[10px] text-slate-400 bg-slate-950/80 p-2 rounded-lg border border-slate-800/50 overflow-x-auto">
                    <span className="text-slate-500 font-bold block mb-0.5">Payload:</span>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(log.requestBody, null, 2)}</pre>
                  </div>
                )}

                {log.responseBody && (
                  <div className="text-[10px] text-slate-300 bg-slate-950/90 p-2 rounded-lg border border-slate-800/60 overflow-x-auto">
                    <span className="text-emerald-500/80 font-bold block mb-0.5">Response:</span>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(log.responseBody, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
