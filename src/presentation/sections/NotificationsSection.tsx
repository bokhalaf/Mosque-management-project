'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from "../../app/components/PageHeader";
import {
  Bell, CheckCircle2, Trash2, Clock, CheckCheck, RefreshCw,
  Wrench, Heart, BookOpen, Users, Sparkles, AlertCircle, ArrowRight, Terminal
} from 'lucide-react';
import { useNotifications } from "../hooks/useNotifications";
import { NotificationType } from "../../domain/entities/AppNotification";

interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function NotificationsSection() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);

  const filteredList = notifications.filter(item => {
    if (selectedFilter === 'unread') return !item.read_at;
    if (selectedFilter !== 'all') return item.type === selectedFilter;
    return true;
  });

  const debugLogs: ApiDebugLog[] = [
    {
      action: "GET /api/common/notifications",
      url: "https://mms-backend-rose.vercel.app/api/common/notifications",
      status: 200,
      response: {
        status: true,
        message: "تم جلب الإشعارات بنجاح.",
        total: notifications.length,
        unread: unreadCount,
        data: notifications,
      },
      time: new Date().toLocaleTimeString('ar-SA'),
    }
  ];

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'maintenance':
        return <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0"><Wrench className="w-5 h-5" /></div>;
      case 'donation':
        return <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0"><Heart className="w-5 h-5 text-emerald-600 fill-emerald-500/20" /></div>;
      case 'sermon':
        return <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5" /></div>;
      case 'invitation':
        return <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center justify-center shrink-0"><Users className="w-5 h-5" /></div>;
      default:
        return <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      <PageHeader
        title="مركز الإشعارات والتنبيهات"
        description="متابعة فورية لكافة إشعارات النظام، بلاغات الصيانة، التبرعات، والأنشطة الدعوية."
        breadcrumbs={[
          { label: "إدارة المسجد" },
          { label: "مركز الإشعارات", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-mono font-bold transition-all"
            >
              <Terminal className="w-4 h-4" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            <button
              onClick={fetchNotifications}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث الإشعارات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
              >
                <CheckCheck className="w-4 h-4" />
                <span>تحديد الكل كمقروء ({unreadCount})</span>
              </button>
            )}
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-6">

        {/* ── LIVE API DEBUG TERMINAL ── */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-200 font-mono text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">مراقب الـ API المباشر (Notifications API Inspector)</span>
              </div>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto ltr text-left">
              {debugLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                    <span>[{log.time}] {log.action}</span>
                    <span>HTTP {log.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{log.url}</p>
                  <pre className="text-[10px] bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                    {JSON.stringify(log.response, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── KPI Stats & Quick Filter ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'all', label: `كل الإشعارات (${notifications.length})` },
              { id: 'unread', label: `غير المقروءة (${unreadCount})` },
              { id: 'maintenance', label: 'الصيانة' },
              { id: 'donation', label: 'التبرعات' },
              { id: 'sermon', label: 'الخطب' },
              { id: 'invitation', label: 'الكوادر' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedFilter(id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedFilter === id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-primary" />
            <span>يتم تحديث التنبيهات تلقائياً عبر السيرفر</span>
          </div>
        </div>

        {/* ── Notifications List ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-bold">جاري جلب الإشعارات...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <h3 className="text-sm font-bold text-foreground">{error}</h3>
            <button onClick={fetchNotifications} className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
              إعادة المحاولة
            </button>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-3">
            <Bell className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-base font-bold text-foreground">لا توجد إشعارات حالياً</h3>
            <p className="text-xs text-muted-foreground">ستظهر الإشعارات والتنبيهات الجديدة هنا فور حدوثها.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((item) => {
              const isUnread = !item.read_at;

              return (
                <div
                  key={item.id}
                  className={`bg-card border rounded-2xl p-4 md:p-5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isUnread
                      ? 'border-primary/40 bg-primary/[0.02] shadow-md shadow-primary/5'
                      : 'border-border opacity-90'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {getNotificationIcon(item.type)}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-bold ${isUnread ? 'text-foreground font-black' : 'text-foreground/80'}`}>
                          {item.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" title="إشعار غير مقروء" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-primary" /> {item.created_at}
                        </span>
                        {item.action_url && (
                          <Link href={item.action_url} className="text-primary font-bold hover:underline flex items-center gap-1">
                            <span>الانتقال للتفاصيل</span>
                            <ArrowRight className="w-3 h-3 rotate-180" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                    {isUnread && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl text-xs font-bold transition-all border border-primary/20"
                        title="تحديد كمقروء"
                      >
                        قراءة
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all border border-transparent hover:border-border"
                      title="حذف الإشعار"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
