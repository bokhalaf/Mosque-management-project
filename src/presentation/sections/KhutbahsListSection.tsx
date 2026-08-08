'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  BookOpen, Plus, Play, Pause, Volume2, Calendar, User, CheckCircle2,
  Search, Radio, Send, FileText, Sparkles, Filter, Check, Clock, Eye,
  RefreshCw, AlertCircle, Archive, History, Trash2, X, CheckSquare, Terminal, Copy
} from 'lucide-react';
import { SermonRepositoryImpl } from "../../data/repositories/SermonRepositoryImpl";
import { Sermon, SermonSelection } from "../../domain/entities/Sermon";
import { ArabicTTSPlayer } from "../utils/arabicTTS";

const sermonRepo = new SermonRepositoryImpl();
const ttsPlayer = ArabicTTSPlayer.getInstance();

interface KhutbahsListSectionProps {
  onNavigateToAdd?: () => void;
  onViewDetails?: (id: string | number) => void;
}

interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function KhutbahsListSection({ onNavigateToAdd, onViewDetails }: KhutbahsListSectionProps) {
  const [archivedSermons, setArchivedSermons] = useState<Sermon[]>([]);
  const [pendingSermons, setPendingSermons] = useState<Sermon[]>([]);
  const [upcomingSelection, setUpcomingSelection] = useState<SermonSelection | null>(null);
  const [selectionsHistory, setSelectionsHistory] = useState<SermonSelection[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | number | null>(null);

  // Modals UI States
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showPendingModal, setShowPendingModal] = useState<boolean>(false);

  // Live API Debug Logs Inspector State
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(true);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const addDebugLog = (action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      {
        action,
        url,
        status,
        response,
        time: new Date().toLocaleTimeString('ar-SA')
      },
      ...prev.slice(0, 15) // Keep last 15 logs
    ]);
  };

  // Fetch all sermon data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [archivedData, pendingData, upcomingData, historyData] = await Promise.all([
        sermonRepo.getArchivedSermons(),
        sermonRepo.getPendingSermons(),
        sermonRepo.getUpcomingSermonSelection(),
        sermonRepo.getSermonSelections(),
      ]);

      addDebugLog("GET /api/sermon-selections/upcoming", "https://mms-backend-rose.vercel.app/api/sermon-selections/upcoming", 200, upcomingData);
      addDebugLog("GET /api/sermons/archived", "https://mms-backend-rose.vercel.app/api/sermons/archived", 200, archivedData);
      addDebugLog("GET /api/sermons/pending", "https://mms-backend-rose.vercel.app/api/sermons/pending", 200, pendingData);

      let finalArchived = archivedData;
      if (finalArchived.length === 0) {
        const allSermons = await sermonRepo.getSermons();
        finalArchived = allSermons;
      }

      setArchivedSermons(finalArchived);
      setPendingSermons(pendingData);
      setSelectionsHistory(historyData);

      if (upcomingData) {
        if (!upcomingData.sermon) {
          const matched = finalArchived.find(s => String(s.id) === String(upcomingData.sermon_id));
          if (matched) upcomingData.sermon = matched;
        }
        setUpcomingSelection(upcomingData);
      } else {
        setUpcomingSelection(null);
      }

    } catch (err: any) {
      console.error("Error fetching sermons list:", err);
      setError(err.message || "تعذر تحميل بيانات خطب المسجد من السيرفر");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    return () => {
      ttsPlayer.stop();
    };
  }, [loadData]);

  // Search API execution
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(async () => {
      try {
        const results = await sermonRepo.searchSermons(searchQuery);
        addDebugLog(`GET /api/sermons/search?q=${searchQuery}`, `https://mms-backend-rose.vercel.app/api/sermons/search?q=${searchQuery}`, 200, results);
        setArchivedSermons(results);
      } catch (e) {
        console.warn("Search error:", e);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle selecting sermon for upcoming Friday (POST /api/sermon-selections)
  const handleSelectForFriday = async (sermon: Sermon) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const payload = {
        sermon_id: sermon.id,
        selection_date: todayStr,
        notes: `تم اعتماد خطبة "${sermon.title}" رسمياً يوم الجمعة`,
      };

      const newSel = await sermonRepo.storeSermonSelection(payload);

      addDebugLog("POST /api/sermon-selections", "https://mms-backend-rose.vercel.app/api/sermon-selections", 201, {
        payload_sent: payload,
        server_response: newSel
      });

      setUpcomingSelection({
        ...newSel,
        sermon: sermon
      });

      alert(`تم اختيار وحفظ خطبة "${sermon.title}" كخطبة الجمعة القادمة بنجاح!`);
    } catch (e: any) {
      console.error("Error setting Friday sermon:", e);
      alert(e.message || "تعذر اختيار خطبة الجمعة");
    }
  };

  // Handle canceling Friday Selection directly from Hero banner (DELETE /api/sermon-selections/{id})
  const handleCancelFridaySelection = async (selectionId: string | number) => {
    if (!confirm("هل أنت تأكد من إلغاء اعتماد وتحديد هذه الخطبة للجمعة القادمة؟")) return;
    try {
      await sermonRepo.deleteSermonSelection(selectionId);
      addDebugLog(`DELETE /api/sermon-selections/${selectionId}`, `https://mms-backend-rose.vercel.app/api/sermon-selections/${selectionId}`, 200, { status: "deleted" });
      setUpcomingSelection(null);
      alert("تم إلغاء اعتماد وتحديد خطبة الجمعة بنجاح.");
      loadData();
    } catch (e: any) {
      console.error("Error canceling selection:", e);
    }
  };

  const filteredSermons = archivedSermons.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    const speaker = s.speaker_name || s.preacher || '';
    if (searchQuery && !s.title.includes(searchQuery) && !speaker.includes(searchQuery)) return false;
    return true;
  });

  const toggleAudioPlay = (id: string | number, textContent: string) => {
    if (playingId === id) {
      ttsPlayer.stop();
      setPlayingId(null);
      return;
    }

    if (!textContent) {
      alert("لا يوجد نص مسجل لهذه الخطبة للقراءة.");
      return;
    }

    ttsPlayer.speak(textContent, (speaking) => {
      if (speaking) {
        setPlayingId(id);
      } else {
        setPlayingId(null);
      }
    });
  };

  const categoriesList = [
    { id: 'all', label: 'جميع الخطب المؤرشفة' },
    { id: 'faith', label: 'عقيدة وإيمانيات' },
    { id: 'fiqh', label: 'فقه وأحكام' },
    { id: 'ethics', label: 'أخلاق وسلوك' },
    { id: 'contemporary', label: 'قضايا معاصرة' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="مكتبة وإدارة خطب المسجد"
        description="استعراض المكتبة والخطب المؤرشفة للإعتماد، مع استعراض الخطبة المختارة للجمعة القادمة والسجلات."
        breadcrumbs={[
          { label: "إدارة المسجد" },
          { label: "خطب المسجد", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugTerminal(!showDebugTerminal)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              title="معاينة سجل استجابة الـ API المباشرة"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{showDebugTerminal ? 'إخفاء الـ API' : 'فحص الـ API'}</span>
            </button>

            <button
              onClick={() => setShowPendingModal(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 hover:bg-amber-500/20 rounded-xl text-xs font-bold transition-all shadow-sm relative"
              title="عرض الخطب المنتظرة للاعتماد"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>الخطب قيد الانتظار</span>
              {pendingSermons.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-black animate-pulse">
                  {pendingSermons.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm"
              title="عرض سجل الخطب المختارة للجمعة"
            >
              <History className="w-4 h-4 text-primary" />
              <span>سجل الخطب المختارة ({selectionsHistory.length})</span>
            </button>

            <button
              onClick={loadData}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات من السيرفر"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onNavigateToAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> إضافة خطبة جديدة
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-8">

        {/* ── LIVE API DEBUG TERMINAL INSPECTOR BOX ── */}
        {showDebugTerminal && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">مراقب الـ API المباشر لخدمة الخطب والاعتمادات (Sermons API Live Inspector)</h3>
              </div>
              <button
                onClick={() => setDebugLogs([])}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg"
              >
                مسح السجل
              </button>
            </div>

            {debugLogs.length === 0 ? (
              <p className="text-slate-500 italic">لا توجد طلبات معالجة حالياً. قم بالنقر على زر الاعتماد أو التحديث لرؤية النتائج المباشرة.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto ltr text-left">
                {debugLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="font-bold">[{log.time}] {log.action}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                        HTTP {log.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{log.url}</p>
                    <pre className="text-[10px] bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 1: Active Upcoming Friday Sermon Hero Banner ── */}
        {upcomingSelection && (
          <div className="bg-gradient-to-l from-primary/15 via-card to-card border border-primary/30 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-black rounded-full flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                    الخطبة المختارة للجمعة القادمة
                  </span>
                  <span className="text-xs text-muted-foreground font-bold">
                    تاريخ الاعتماد: {upcomingSelection.selection_date}
                  </span>
                </div>

                <h2
                  onClick={() => onViewDetails && upcomingSelection.sermon && onViewDetails(upcomingSelection.sermon.id)}
                  className="text-xl md:text-2xl font-black text-foreground hover:text-primary cursor-pointer transition-colors"
                >
                  {upcomingSelection.sermon?.title || `خطبة جمعة معتمدة #${upcomingSelection.sermon_id}`}
                </h2>

                <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" />
                  {upcomingSelection.sermon?.speaker_name || upcomingSelection.sermon?.preacher || 'الشيخ الخطيب'}
                </p>
              </div>

              {/* Actions & Direct Cancel Selection Button */}
              <div className="flex items-center gap-3">
                {upcomingSelection.sermon && (
                  <button
                    onClick={() => toggleAudioPlay(upcomingSelection.sermon!.id, upcomingSelection.sermon!.content)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    {playingId === upcomingSelection.sermon.id ? (
                      <>
                        <Pause className="w-4 h-4" /> <span>إيقاف القارئ</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" /> <span>القارئ الصوتي</span>
                      </>
                    )}
                  </button>
                )}

                {onViewDetails && upcomingSelection.sermon && (
                  <button
                    onClick={() => onViewDetails(upcomingSelection.sermon!.id)}
                    className="p-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-2xl transition-all"
                    title="عرض التفاصيل"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => handleCancelFridaySelection(upcomingSelection.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
                  title="إلغاء اعتماد وتحديد الخطبة للجمعة القادمة"
                >
                  <X className="w-4 h-4" />
                  <span>إلغاء الاعتماد</span>
                </button>
              </div>
            </div>

            {upcomingSelection.sermon && playingId === upcomingSelection.sermon.id && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-primary animate-bounce" />
                  <span className="text-xs font-bold text-primary">القارئ الصوتي يقرأ نص ومحاور خطبة الجمعة الآن...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 2: Search & Category Filter Bar ── */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Header Title */}
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-primary" />
              <h3 className="text-base font-black text-foreground">مكتبة الخطب المؤرشفة</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted border border-border text-muted-foreground">
                {filteredSermons.length} خطبة مؤرشفة
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الخطب المؤرشفة أو اسم الخطيب..."
                className="w-full pl-4 pr-10 py-2.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
              />
            </div>

          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
            {categoriesList.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SECTION 3: Main Catalog Grid (Archived Sermons for Friday Selection) ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-bold">جاري تحميل مكتبة الخطب المؤرشفة المباشرة من السيرفر...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-bold text-foreground">{error}</h3>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredSermons.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground mb-1">لا توجد خطب مؤرشفة مطابقة للبحث حالياً</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto font-medium">
                قم بإضافة خطبة جديدة أو تغيير كلمة البحث لتأكيد استعراض المكتبة.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSermons.map(sermon => {
              const isSelectedFriday = upcomingSelection && String(upcomingSelection.sermon_id) === String(sermon.id);
              const isPlaying = playingId === sermon.id;
              const speakerName = sermon.speaker_name || sermon.preacher || 'الشيخ الخطيب';

              return (
                <div
                  key={sermon.id}
                  className={`bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative group transition-all ${isSelectedFriday
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/40'
                    }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold border bg-muted text-muted-foreground border-border">
                        مؤرشفة للمسجد
                      </span>

                      {isSelectedFriday && (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          مختارة للجمعة القادمة
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onViewDetails && onViewDetails(sermon.id)}
                      className="text-base font-black text-foreground line-clamp-2 leading-relaxed cursor-pointer hover:text-primary transition-colors"
                    >
                      {sermon.title}
                    </h3>

                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      {speakerName}
                    </p>

                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                      {sermon.content}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleAudioPlay(sermon.id, sermon.content)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isPlaying ? 'bg-amber-500 text-white' : 'bg-muted text-foreground hover:bg-primary/10 hover:text-primary'
                        }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlaying ? 'إيقاف القارئ' : 'القارئ الصوتي'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(sermon.id)}
                          className="p-2 bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all"
                          title="تفاصيل الخطبة"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}

                      {!isSelectedFriday && (
                        <button
                          onClick={() => handleSelectForFriday(sermon)}
                          className="flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all border border-primary/20"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>اعتماد للجمعة</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── MODAL 1: Pending Sermons Modal (الخطب قيد الانتظار) ── */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 text-amber-500 font-black">
                <Clock className="w-5 h-5" />
                <h3 className="text-lg text-foreground">سجل الخطب قيد الانتظار والمراجعة ({pendingSermons.length})</h3>
              </div>
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => setShowPendingModal(false)} />
            </div>

            {pendingSermons.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">لا توجد خطب قيد الانتظار والمراجعة حالياً.</p>
            ) : (
              <div className="space-y-4">
                {pendingSermons.map((sermon) => (
                  <div key={sermon.id} className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-foreground">{sermon.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        قيد المراجعة
                      </span>
                    </div>

                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary" /> {sermon.speaker_name || sermon.preacher || 'الشيخ الخطيب'}
                    </p>

                    <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-2">
                      {sermon.content}
                    </p>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => toggleAudioPlay(sermon.id, sermon.content)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-muted text-xs font-bold rounded-xl"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-primary" />
                        <span>القارئ الصوتي</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => setShowPendingModal(false)}
                className="px-6 py-2.5 bg-muted text-foreground text-xs font-bold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Selected Sermons History Modal (سجل الخطب المختارة) ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 text-primary font-black">
                <History className="w-5 h-5" />
                <h3 className="text-lg text-foreground">سجل خطب الجمعة المختارة ({selectionsHistory.length})</h3>
              </div>
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => setShowHistoryModal(false)} />
            </div>

            {selectionsHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">لا يوجد سجل سابق للخطب المختارة.</p>
            ) : (
              <div className="space-y-3">
                {selectionsHistory.map((sel) => (
                  <div key={sel.id} className="p-4 bg-muted/50 border border-border rounded-2xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md">
                          تاريخ الاعتماد: {sel.selection_date}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-foreground">{sel.sermon?.title || `خطبة مختارة #${sel.sermon_id}`}</h4>
                      {sel.notes && <p className="text-[11px] text-muted-foreground">{sel.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-6 py-2.5 bg-muted text-foreground text-xs font-bold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
