'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import { 
  BookOpen, Plus, Play, Pause, Volume2, Calendar, User, CheckCircle2, 
  Search, Radio, Send, FileText, Sparkles, Filter, Check, Clock, Eye, Share2, UploadCloud, RefreshCw, AlertCircle
} from 'lucide-react';
import { SermonRepositoryImpl } from "../../data/repositories/SermonRepositoryImpl";
import { Sermon } from "../../domain/entities/Sermon";

const sermonRepo = new SermonRepositoryImpl();

interface KhutbahsListSectionProps {
  onNavigateToAdd?: () => void;
  onViewDetails?: (id: string | number) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'جميع الخطب' },
  { id: 'faith', label: 'عقيدة وإيمانيات' },
  { id: 'fiqh', label: 'فقه وأحكام' },
  { id: 'ethics', label: 'أخلاق وسلوك' },
  { id: 'contemporary', label: 'قضايا معاصرة' },
];

export function KhutbahsListSection({ onNavigateToAdd, onViewDetails }: KhutbahsListSectionProps) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | number | null>(null);

  const fetchSermons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sermonRepo.getSermons();
      setSermons(data);
    } catch (err: any) {
      console.error("Error fetching sermons list:", err);
      setError(err.message || "تعذر تحميل مكتبة الخطب");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSermons();
  }, [fetchSermons]);

  const fridaySermon = sermons.find(s => s.isPublishedForFriday || s.status === 'Scheduled') || sermons[0];

  const handleSetFridaySermon = (id: string | number) => {
    setSermons(prev => prev.map(s => ({
      ...s,
      isPublishedForFriday: String(s.id) === String(id),
      status: String(s.id) === String(id) ? 'Scheduled' : (s.status === 'Scheduled' ? 'approved' : s.status),
    })));

    const selected = sermons.find(s => String(s.id) === String(id));
    alert(`تم اختيار وتحديد خطبة "${selected?.title}" كخطبة رسمية معتمدة للجمعة القادمة!`);
  };

  const filteredSermons = sermons.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    const speaker = s.speaker_name || s.preacher || '';
    if (searchQuery && !s.title.includes(searchQuery) && !speaker.includes(searchQuery)) return false;
    return true;
  });

  const toggleAudioPlay = (id: string | number) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="مكتبة خطب المسجد"
        description="استعراض واختيار خطبة الجمعة القادمة أو إضافة وتسجيل خطبة جديدة للمسجد."
        breadcrumbs={[
          { label: "إدارة المسجد" },
          { label: "خطب المسجد", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchSermons}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="تحديث البيانات"
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-bold">جاري تحميل الخطب من السيرفر المباشر...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-bold text-foreground">{error}</h3>
            <button 
              onClick={fetchSermons}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {/* ── SECTION 1: Active Friday Sermon Hero Banner ── */}
            {fridaySermon && (
              <div className="bg-gradient-to-l from-primary/15 via-card to-card border border-primary/30 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-black rounded-full flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                        خطبة الجمعة القادمة المعتمدة
                      </span>
                      <span className="text-xs text-muted-foreground font-bold">
                        تاريخ: {fridaySermon.sermon_date || fridaySermon.date || 'الجمعة القادمة'}
                      </span>
                    </div>
                    <h2 
                      onClick={() => onViewDetails && onViewDetails(fridaySermon.id)}
                      className="text-xl md:text-2xl font-black text-foreground hover:text-primary cursor-pointer transition-colors"
                    >
                      {fridaySermon.title}
                    </h2>
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary" /> {fridaySermon.speaker_name || fridaySermon.preacher || 'الشيخ الخطيب'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleAudioPlay(fridaySermon.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                      {playingId === fridaySermon.id ? (
                        <>
                          <Pause className="w-4 h-4" /> <span>إيقاف الاستماع</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" /> <span>استماع للتسجيل الصوتي</span>
                        </>
                      )}
                    </button>
                    {onViewDetails && (
                      <button 
                        onClick={() => onViewDetails(fridaySermon.id)}
                        className="p-3 bg-card border border-border text-foreground hover:bg-muted rounded-2xl transition-all"
                        title="عرض تفاصيل الخطبة"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {playingId === fridaySermon.id && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-primary animate-bounce" />
                      <span className="text-xs font-bold text-primary">جاري تشغيل التسجيل الصوتي للخطبة ({fridaySermon.duration || '24 دقيقة'})...</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-6 bg-primary rounded-full animate-pulse" />
                      <div className="w-1.5 h-4 bg-primary/70 rounded-full animate-pulse" />
                      <div className="w-1.5 h-8 bg-primary rounded-full animate-pulse" />
                      <div className="w-1.5 h-5 bg-primary/80 rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SECTION 2: Search & Filter Bar ── */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن خطبة أو اسم الشيخ الخطيب..."
                    className="w-full pl-4 pr-10 py-2.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedCategory === cat.id 
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/60 border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* ── SECTION 3: Sermons Catalog Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSermons.map(sermon => {
                const isFriday = sermon.isPublishedForFriday || sermon.status === 'Scheduled';
                const isPlaying = playingId === sermon.id;
                const speakerName = sermon.speaker_name || sermon.preacher || 'الشيخ الخطيب';

                return (
                  <div 
                    key={sermon.id}
                    className={`bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative group transition-all ${
                      isFriday ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold border bg-muted text-muted-foreground border-border">
                          {sermon.duration || '20 دقيقة'}
                        </span>
                        {isFriday && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            معتمدة للجمعة
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
                        onClick={() => toggleAudioPlay(sermon.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isPlaying ? 'bg-amber-500 text-white' : 'bg-muted text-foreground hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isPlaying ? 'إيقاف' : 'استماع'}</span>
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

                        {!isFriday && (
                          <button 
                            onClick={() => handleSetFridaySermon(sermon.id)}
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
          </>
        )}

      </div>
    </div>
  );
}
