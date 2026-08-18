'use client';

import React from 'react';
import { Terminal, Trash2, X, CheckCircle2, XCircle, Clock3 } from 'lucide-react';
import { VolunteerDebugLog } from '../../../hooks/useVolunteers';

interface VolunteerDebugTerminalProps {
  show: boolean;
  onClose: () => void;
  logs: VolunteerDebugLog[];
  onClear: () => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-sky-400',
  POST: 'text-emerald-400',
  PUT: 'text-amber-400',
  PATCH: 'text-amber-400',
  DELETE: 'text-rose-400',
};

export function VolunteerDebugTerminal({
  show,
  onClose,
  logs,
  onClear,
}: VolunteerDebugTerminalProps) {
  if (!show) return null;

  return (
    <div className="mb-6 bg-slate-950 text-emerald-400 border border-slate-800 rounded-2xl p-4 shadow-xl font-mono text-xs overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">
            مراقب API المباشر — Volunteer API Monitor
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 rounded-full">
            {logs.length} طلب
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-[11px] border border-slate-700 transition-all"
            title="مسح السجلات"
          >
            <Trash2 className="w-3 h-3" />
            <span>مسح</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
        {logs.length === 0 ? (
          <div className="text-slate-500 py-6 text-center flex flex-col items-center gap-2">
            <Terminal className="w-6 h-6 opacity-40" />
            <span>لا توجد طلبات API مسجلة بعد.</span>
            <span className="text-[10px]">يتم التسجيل تلقائياً عند أي تفاعل مع السيرفر.</span>
          </div>
        ) : (
          logs.map((log, i) => {
            const isSuccess = String(log.status).startsWith('2');
            const isErr = log.status === 'ERR' || String(log.status).startsWith('4') || String(log.status).startsWith('5');
            return (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1.5"
              >
                {/* Row 1: method + path + status + time */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`font-black text-[11px] shrink-0 ${METHOD_COLORS[log.method] || 'text-slate-300'}`}>
                      {log.method}
                    </span>
                    <span className="text-slate-300 truncate text-[11px]">
                      {log.action.replace(log.method + ' ', '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isSuccess ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        {log.status}
                      </span>
                    ) : isErr ? (
                      <span className="flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                        <XCircle className="w-3 h-3" />
                        {log.status}
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold text-[11px]">{log.status}</span>
                    )}
                    <span className="text-slate-600 text-[10px] flex items-center gap-1">
                      <Clock3 className="w-2.5 h-2.5" />
                      {log.duration}
                    </span>
                    <span className="text-slate-600 text-[10px]">{log.time}</span>
                  </div>
                </div>

                {/* Row 2: Response preview */}
                {log.response && (
                  <pre className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg overflow-x-auto max-h-20 leading-4">
                    {typeof log.response === 'string'
                      ? log.response
                      : JSON.stringify(log.response, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
