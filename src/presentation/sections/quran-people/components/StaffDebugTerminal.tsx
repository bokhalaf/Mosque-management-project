'use client';

import React from 'react';
import { Terminal, Trash2, X } from 'lucide-react';
import { ApiDebugLog } from '../../../hooks/useQuranPeople';

interface StaffDebugTerminalProps {
  show: boolean;
  onClose: () => void;
  logs: ApiDebugLog[];
  onClear: () => void;
}

export function StaffDebugTerminal({
  show,
  onClose,
  logs,
  onClear,
}: StaffDebugTerminalProps) {
  if (!show) return null;

  return (
    <div className="mb-6 bg-slate-950 text-emerald-400 border border-slate-800 rounded-2xl p-4 shadow-xl font-mono text-xs overflow-hidden animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">
            سجل الاتصال المباشر بإدارة الكوادر (Live Backend API Logs)
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

      <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
        {logs.length === 0 ? (
          <div className="text-slate-500 py-3 text-center">
            لا توجد طلبات مسجلة بعد. قم بتحديث البيانات أو إرسال دعوة لمعاينة استجابة الـ API.
          </div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-400">{log.action}</span>
                <span className="text-slate-500 text-[10px]">{log.time}</span>
              </div>
              <div className="text-slate-400 break-all text-[11px]">
                <span className="text-slate-500">URL: </span>
                {log.url}
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-500">Status: </span>
                <span
                  className={
                    String(log.status).startsWith('2')
                      ? 'text-emerald-400 font-bold'
                      : 'text-rose-400 font-bold'
                  }
                >
                  {log.status}
                </span>
              </div>
              {log.response && (
                <pre className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg overflow-x-auto max-h-24">
                  {typeof log.response === 'string'
                    ? log.response
                    : JSON.stringify(log.response, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
