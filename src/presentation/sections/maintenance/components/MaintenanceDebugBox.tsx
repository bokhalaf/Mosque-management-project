// ==============================
// Maintenance — MaintenanceDebugBox Component
// صندوق معاينة رد السيرفر الموحد (GET, POST, PUT, DELETE)
// يدعم التبديل بين إحصائيات الكاردات وقائمة طلبات الصيانة
// ==============================

import React, { useState } from 'react';
import { Terminal, Copy, X, CheckCircle2, AlertCircle, BarChart2, Wrench } from 'lucide-react';
import { MaintenanceOperationDebugResponse, MaintenanceRecentDebugResponse } from '../../../../data/repositories/MaintenanceRepositoryImpl';

interface MaintenanceDebugBoxProps {
  debugData: MaintenanceOperationDebugResponse | MaintenanceRecentDebugResponse | null;
  statsDebugData?: MaintenanceOperationDebugResponse | null;
  copiedDebug: boolean;
  onCopy: () => void;
  onClose: () => void;
}

export function MaintenanceDebugBox({ debugData, statsDebugData, copiedDebug, onCopy, onClose }: MaintenanceDebugBoxProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'requests'>('stats');

  const currentData = activeTab === 'stats' ? (statsDebugData || debugData) : (debugData || statsDebugData);
  if (!currentData) return null;

  const isOperationDebug = 'operationType' in currentData;
  const method = isOperationDebug ? (currentData as MaintenanceOperationDebugResponse).operationType : 'GET';
  const label = isOperationDebug ? (currentData as MaintenanceOperationDebugResponse).operationLabel : 'جلب أحدث طلبات الصيانة';
  const httpStatus = currentData.httpStatus;
  const endpointUrl = currentData.endpointUrl;
  const rawResponse = currentData.rawResponse;
  const isSuccess = isOperationDebug ? (currentData as MaintenanceOperationDebugResponse).isSuccess : (httpStatus >= 200 && httpStatus < 300);
  const payload = isOperationDebug ? (currentData as MaintenanceOperationDebugResponse).requestPayloadSent : null;
  const timestamp = isOperationDebug ? (currentData as MaintenanceOperationDebugResponse).timestamp : '';

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
    <div className={`p-6 bg-slate-900 border rounded-2xl shadow-2xl space-y-4 animate-in fade-in transition-all font-['Cairo'] ${
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {statsDebugData && (
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>إحصائيات الكاردات</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              statsDebugData.isSuccess ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'
            }`}>
              {statsDebugData.httpStatus}
            </span>
          </button>
        )}
        {debugData && (
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>طلبات ومهام الصيانة</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              ('isSuccess' in debugData ? debugData.isSuccess : debugData.httpStatus === 200) ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'
            }`}>
              {debugData.httpStatus}
            </span>
          </button>
        )}
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
