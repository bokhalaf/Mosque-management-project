// ==============================
// Maintenance — MaintenanceDebugBox Component
// صندوق معاينة رد السيرفر الموحد (GET, POST, PUT, DELETE)
// ==============================

import React from 'react';
import { Terminal, Copy, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { MaintenanceOperationDebugResponse, MaintenanceRecentDebugResponse } from '../../../../data/repositories/MaintenanceRepositoryImpl';

interface MaintenanceDebugBoxProps {
  debugData: MaintenanceOperationDebugResponse | MaintenanceRecentDebugResponse | null;
  copiedDebug: boolean;
  onCopy: () => void;
  onClose: () => void;
}

export function MaintenanceDebugBox({ debugData, copiedDebug, onCopy, onClose }: MaintenanceDebugBoxProps) {
  if (!debugData) return null;

  const isOperationDebug = 'operationType' in debugData;
  const method = isOperationDebug ? (debugData as MaintenanceOperationDebugResponse).operationType : 'GET';
  const label = isOperationDebug ? (debugData as MaintenanceOperationDebugResponse).operationLabel : 'جلب أحدث طلبات الصيانة';
  const httpStatus = debugData.httpStatus;
  const endpointUrl = debugData.endpointUrl;
  const rawResponse = debugData.rawResponse;
  const isSuccess = isOperationDebug ? (debugData as MaintenanceOperationDebugResponse).isSuccess : (httpStatus >= 200 && httpStatus < 300);
  const payload = isOperationDebug ? (debugData as MaintenanceOperationDebugResponse).requestPayloadSent : null;
  const timestamp = isOperationDebug ? (debugData as MaintenanceOperationDebugResponse).timestamp : '';

  const getMethodBadgeClass = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'POST': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'PUT': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className={`p-6 bg-slate-900 border rounded-2xl shadow-2xl space-y-4 animate-in fade-in transition-all ${
      isSuccess ? 'border-emerald-500/40 text-emerald-400' : 'border-red-500/40 text-red-400'
    }`}>
      {/* Box Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Terminal className={`w-5 h-5 ${isSuccess ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-black border ${getMethodBadgeClass(method)}`}>
              {method}
            </span>
            <h4 className="text-sm font-black text-white font-['Cairo']">
              معاين رد السيرفر: {label} (HTTP {httpStatus})
            </h4>
          </div>
          {timestamp && <span className="text-[10px] text-slate-400 font-mono">[{timestamp}]</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all border border-slate-700"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedDebug ? 'تم النسخ!' : 'نسخ الـ JSON'}</span>
          </button>
          <X className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" onClick={onClose} />
        </div>
      </div>

      {/* Info Row */}
      <div className="space-y-3 text-xs font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-300">
          <span><strong>Endpoint URL:</strong> <code className="text-blue-300">{endpointUrl}</code></span>
          <span className="flex items-center gap-1">
            <strong>الحالة:</strong>
            {isSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> {httpStatus} SUCCESS</span>
            ) : (
              <span className="text-red-400 flex items-center gap-1 font-bold"><AlertCircle className="w-3.5 h-3.5" /> {httpStatus} ERROR</span>
            )}
          </span>
        </div>

        {/* Payload Sent (if POST / PUT) */}
        {payload && Object.keys(payload).length > 0 && (
          <div>
            <span className="text-slate-400 block mb-1"><strong>Request Payload Sent (البيانات المرسلة للسيرفر):</strong></span>
            <pre className="p-3 bg-slate-950 text-amber-300 rounded-xl overflow-x-auto text-[11px] dir-ltr border border-amber-900/40 font-mono">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}

        {/* Server Raw JSON Output */}
        <div>
          <span className="text-slate-400 block mb-1"><strong>Server Returned Body Output (مخرج الـ JSON المرجَع من السيرفر):</strong></span>
          <pre className={`p-4 rounded-xl overflow-x-auto text-[11px] dir-ltr border font-mono max-h-72 ${
            isSuccess ? 'bg-slate-950 text-emerald-300 border-emerald-900/50' : 'bg-slate-950 text-red-300 border-red-900/50'
          }`}>
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
