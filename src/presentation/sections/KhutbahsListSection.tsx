'use client';
import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import { 
  BookOpen, Plus, Play, Pause, Volume2, Calendar, User, CheckCircle2, 
  Search, Radio, Send, FileText, Sparkles, Filter, Check, Clock, Eye, Share2, UploadCloud
} from 'lucide-react';
import { Sermon } from "../../domain/entities/Sermon";

interface KhutbahsListSectionProps {
  onNavigateToAdd?: () => void;
}

const INITIAL_SERMONS: Sermon[] = [
  {
    id: '1',
    title: 'فضل الصدق وأثره في طمأنينة القلوب',
    preacher: 'الشيخ د. عبد الرحمن السديس',
    category: 'ethics',
    date: '2026-07-31',
    duration: '24:15',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    content: 'الحمد لله الذي أقام السموات والأرضين بالعدل والحق. أما بعد: فإن الصدق يهدي إلى البر، وإن البر يهدي إلى الجنة...\n١. أهمية الصدق في التعاملات.\n٢. أثر الأمانة والشفافية في بناء المجتمع.\n٣. النماذج المشرقة من السيرة النبوية.',
    isPublishedForFriday: true,
    status: 'scheduled_for_friday',
    createdAt: '2026-07-20',
  },
  {
    id: '2',
    title: 'أحكام الطهارة وعمارة بيوت الله',
    preacher: 'الشيخ د. سعود الشريم',
    category: 'fiqh',
    date: '2026-07-24',
    duration: '21:40',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    content: 'إن المساجد لله فلا تدعوا مع الله أحداً. حث الإسلام على النظافة والطهور وعمارة بيوت الله حساً ومعنى...',
    isPublishedForFriday: false,
    status: 'approved',
    createdAt: '2026-07-15',
  },
  {
    id: '3',
    title: 'بر الوالدين وحقوق ذوي القربى',
    preacher: 'الشيخ د. ماهر المعيقلي',
    category: 'faith',
    date: '2026-07-17',
    duration: '19:50',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    content: 'وقضى ربك ألا تعبدوا إلا إياه وبالوالدين إحسانا. خفض الجناح للوالدين والإحسان إليهما في حياتهما وبعد مماتهما...',
    isPublishedForFriday: false,
    status: 'approved',
    createdAt: '2026-07-10',
  },
  {
    id: '4',
    title: 'الأمانة في العمل والمسؤولية المجتمعية',
    preacher: 'الشيخ خالد النعيم',
    category: 'contemporary',
    date: '2026-07-10',
    duration: '22:10',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    content: 'إن الله يأمركم أن تؤدوا الأمانات إلى أهلها. إتقان العمل وإخراج الواجبات بأكمل وجه مظهر من مظاهر الإيمان...',
    isPublishedForFriday: false,
    status: 'approved',
    createdAt: '2026-07-05',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'جميع الخطب' },
  { id: 'faith', label: 'عقيدة وإيمانيات' },
  { id: 'fiqh', label: 'فقه وأحكام' },
  { id: 'ethics', label: 'أخلاق وسلوك' },
  { id: 'contemporary', label: 'قضايا معاصرة' },
];

export function KhutbahsListSection({ onNavigateToAdd }: KhutbahsListSectionProps) {
  const [sermons, setSermons] = useState<Sermon[]>(INITIAL_SERMONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSermonForView, setSelectedSermonForView] = useState<Sermon | null>(null);

  // Active Friday Sermon
  const fridaySermon = sermons.find(s => s.isPublishedForFriday) || sermons[0];

  const handleSetFridaySermon = (id: string) => {
    setSermons(prev => prev.map(s => ({
      ...s,
      isPublishedForFriday: s.id === id,
      status: s.id === id ? 'scheduled_for_friday' : 'approved',
    })));

    const selected = sermons.find(s => s.id === id);
    alert(`تم اختيار وتحديد خطبة "${selected?.title}" كخطبة رسمية معتمدة للجمعة القادمة!`);
  };

  const filteredSermons = sermons.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (searchQuery && !s.title.includes(searchQuery) && !s.preacher.includes(searchQuery)) return false;
    return true;
  });

  const toggleAudioPlay = (id: string) => {
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
          <button 
            onClick={onNavigateToAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> إضافة خطبة جديدة
          </button>
        }
      />

      <div className="px-4 md:px-8 py-4 space-y-8">

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
                    تاريخ: {fridaySermon.date || 'الجمعة القادمة'}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground">{fridaySermon.title}</h2>
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" /> {fridaySermon.preacher}
                </p>
              </div>

              {/* Action: Listen to Audio */}
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
                <button 
                  onClick={() => setSelectedSermonForView(fridaySermon)}
                  className="p-3 bg-card border border-border text-foreground hover:bg-muted rounded-2xl transition-all"
                  title="عرض نص الخطبة"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Audio Wave Bar Simulation */}
            {playingId === fridaySermon.id && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-primary animate-bounce" />
                  <span className="text-xs font-bold text-primary">جاري تشغيل التسجيل الصوتي للخطبة ({fridaySermon.duration})...</span>
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
            const isFriday = sermon.isPublishedForFriday;
            const isPlaying = playingId === sermon.id;

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

                  <h3 className="text-base font-black text-foreground line-clamp-2 leading-relaxed">
                    {sermon.title}
                  </h3>

                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    {sermon.preacher}
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
                    <button 
                      onClick={() => setSelectedSermonForView(sermon)}
                      className="p-2 bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all"
                      title="معاينة النطاق والتفاصيل"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

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

      </div>

      {/* Sermon Outline Preview Modal */}
      {selectedSermonForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-black text-foreground">{selectedSermonForView.title}</h3>
                <p className="text-xs text-muted-foreground font-bold mt-0.5">{selectedSermonForView.preacher}</p>
              </div>
              <button 
                onClick={() => setSelectedSermonForView(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                إغلاق
              </button>
            </div>

            <div className="p-5 bg-muted/60 border border-border rounded-2xl space-y-3 max-h-80 overflow-y-auto">
              <span className="text-xs font-bold text-primary block">عناصر ونص الخطبة:</span>
              <p className="text-sm font-medium text-foreground leading-loose whitespace-pre-wrap">
                {selectedSermonForView.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  handleSetFridaySermon(selectedSermonForView.id);
                  setSelectedSermonForView(null);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" /> اعتماد كخطبة الجمعة القادمة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
