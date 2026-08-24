'use client';

import React, { useState, useEffect } from 'react';
import { X, Award, Download, Printer, RefreshCw, AlertCircle } from 'lucide-react';
import { VolunteerCertificate } from '../../../../domain/entities/Volunteer';

interface CertificatePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: VolunteerCertificate | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function CertificatePdfModal({
  isOpen,
  onClose,
  certificate,
  loading = false,
  error = null,
  onRetry,
}: CertificatePdfModalProps) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);

  useEffect(() => {
    let activeUrl: string | null = null;

    if (isOpen && certificate?.certificate_url) {
      setLoadingPdf(true);

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      fetch(certificate.certificate_url, { headers })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`تعذر تحميل ملف الشهادة (HTTP ${res.status})`);
          }
          const blob = await res.blob();
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          activeUrl = URL.createObjectURL(pdfBlob);
          setPdfBlobUrl(activeUrl);
        })
        .catch((err) => {
          console.warn('PDF stream fetch fallback:', err);
          // Fallback to direct stream URL
          setPdfBlobUrl(certificate.certificate_url);
        })
        .finally(() => {
          setLoadingPdf(false);
        });
    } else {
      setPdfBlobUrl(null);
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [isOpen, certificate]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!pdfBlobUrl && !certificate?.certificate_url) return;
    const link = document.createElement('a');
    link.href = pdfBlobUrl || certificate?.certificate_url || '';
    link.download = `شهادة_تطوع_${certificate?.volunteer_name || 'متطوع'}_${certificate?.id || Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (pdfBlobUrl) {
      const printWindow = window.open(pdfBlobUrl);
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-['Cairo'] animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                شهادة العمل التطوعي المعتمدة
              </h2>
              <p className="text-xs text-muted-foreground">
                {certificate ? `المتطوع: ${certificate.volunteer_name}` : 'جاري معالجة الشهادة...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {certificate && !loading && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  title="تحميل الشهادة PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تحميل PDF</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border"
                  title="طباعة الشهادة"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">طباعة</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[400px] flex flex-col items-center justify-center bg-muted/10">
          {loading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-16 animate-in fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 animate-pulse">
                  <Award className="w-8 h-8" />
                </div>
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin absolute -bottom-1 -right-1" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-foreground">جاري توليد وإصدار شهادة التطوع...</h3>
                <p className="text-xs text-muted-foreground">
                  يتم استخراج البيانات واعتماد الساعات وتوليد وثيقة PDF الرسمية
                </p>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-foreground">تعذر إصدار الشهادة</h3>
                <p className="text-xs text-rose-600">{error}</p>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  إعادة المحاولة
                </button>
              )}
            </div>
          ) : certificate ? (
            /* Certificate Preview */
            <div className="w-full flex flex-col items-center space-y-4">
              {/* PDF Viewer / Embed */}
              {pdfBlobUrl ? (
                <div className="w-full h-[520px] rounded-2xl border border-border overflow-hidden shadow-inner bg-slate-900">
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                    title="شهادة التطوع"
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                /* Fallback Certificate Visual Template */
                <div className="w-full max-w-2xl bg-card border-4 border-double border-emerald-600/30 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-card via-card to-emerald-500/5">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm">
                    <Award className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                      شهادة شكر وتقدير للعمل التطوعي
                    </span>
                    <h3 className="text-2xl font-black text-foreground">
                      {certificate.volunteer_name}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
                    تقديراً لجهوده المتميزة ومشاركته الفعالة في إنجاز مهام الفرصة التطوعية:
                    <br />
                    <strong className="text-foreground font-bold text-base mt-1 inline-block">
                      {certificate.opportunity_title || 'خدمة بيوت الله'}
                    </strong>
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/80 text-xs">
                    <div className="text-right">
                      <span className="text-muted-foreground block text-[11px]">تاريخ الإصدار:</span>
                      <span className="font-bold text-foreground font-mono">
                        {certificate.issued_at?.split('T')[0] || new Date().toISOString().split('T')[0]}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-muted-foreground block text-[11px]">رقم الاعتماد:</span>
                      <span className="font-bold text-emerald-600 font-mono">
                        #CERT-{certificate.id}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
