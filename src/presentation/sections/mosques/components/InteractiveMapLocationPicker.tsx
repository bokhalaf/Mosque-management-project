'use client';

// ==============================
// UI Component — InteractiveMapLocationPicker
// منتقي مواقع تفاعلي على الخريطة مع بحث جغرافي وتحديد GPS وإحداثيات فورية
// ==============================

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Search, LocateFixed, Loader2, Navigation,
  ExternalLink, ZoomIn, ZoomOut, Compass, Sparkles, Check, X, RotateCcw
} from 'lucide-react';

interface InteractiveMapLocationPickerProps {
  latitude: string | number;
  longitude: string | number;
  onChange: (lat: string, lng: string) => void;
  address?: string;
  onAddressSelect?: (address: string) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function InteractiveMapLocationPicker({
  latitude,
  longitude,
  onChange,
  address,
  onAddressSelect,
}: InteractiveMapLocationPickerProps) {
  const latNum = parseFloat(String(latitude)) || 33.5138;
  const lngNum = parseFloat(String(longitude)) || 36.2765;

  const [zoomDelta, setZoomDelta] = useState<number>(0.015);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Search using OpenStreetMap Nominatim
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=ar`,
        { headers: { 'Accept-Language': 'ar' } }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (e) {
      console.warn('Geocoding search failed:', e);
    } finally {
      setSearching(false);
    }
  };

  const onSearchInputChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(val);
    }, 450);
  };

  const handleSelectPlace = (place: SearchResult) => {
    const newLat = parseFloat(place.lat).toFixed(6);
    const newLng = parseFloat(place.lon).toFixed(6);
    onChange(newLat, newLng);
    if (onAddressSelect && place.display_name) {
      onAddressSelect(place.display_name);
    }
    setShowResults(false);
    setSearchQuery(place.display_name.split(',')[0]);
  };

  // GPS Current Location
  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع الجغرافي غير مدعومة في متصفحك.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        onChange(lat, lng);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('تعذر الوصول إلى الموقع الجغرافي: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Adjust coordinates by offset (e.g. clicking on map compass/controls)
  const adjustCoords = (dLat: number, dLng: number) => {
    const newLat = (latNum + dLat).toFixed(6);
    const newLng = (lngNum + dLng).toFixed(6);
    onChange(newLat, newLng);
  };

  // Zoom in / out
  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setZoomDelta((prev) => Math.max(0.003, prev / 1.8));
    } else {
      setZoomDelta((prev) => Math.min(0.1, prev * 1.8));
    }
  };

  // Quick City Presets
  const CITY_PRESETS = [
    { name: 'دمشق', lat: '33.5138', lng: '36.2765' },
    { name: 'حلب', lat: '36.2021', lng: '37.1343' },
    { name: 'حمص', lat: '34.7324', lng: '36.7137' },
    { name: 'اللاذقية', lat: '35.5317', lng: '35.7901' },
    { name: 'الرياض', lat: '24.7136', lng: '46.6753' },
    { name: 'مكة المكرمة', lat: '21.4225', lng: '39.8262' },
    { name: 'المدينة المنورة', lat: '24.4672', lng: '39.6111' },
  ];

  return (
    <div className="space-y-4 font-['Cairo']">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Nominatim Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
            placeholder="ابحث عن اسم المدينة، الحي، الشارع، أو اسم المسجد على الخريطة..."
            className="w-full pl-9 pr-9 py-2 bg-card border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground"
          />
          {searching ? (
            <Loader2 className="w-3.5 h-3.5 text-primary absolute left-3 top-1/2 -translate-y-1/2 animate-spin" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          ) : null}

          {/* Search Dropdown Results */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-1.5 bg-card border border-border rounded-2xl shadow-xl z-30 overflow-hidden divide-y divide-border/50 max-h-56 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => handleSelectPlace(item)}
                  className="w-full text-right p-2.5 hover:bg-muted/70 flex items-start gap-2 text-xs transition-colors"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium line-clamp-2 leading-relaxed">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls: GPS & Google Maps */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGetGPSLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            title="جلب إحداثيات موقعك الحالي عبر GPS"
          >
            {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
            <span>موقعي (GPS)</span>
          </button>

          <a
            href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 bg-card hover:bg-muted text-muted-foreground hover:text-primary border border-border rounded-xl text-xs font-bold transition-all"
            title="معاينة في خرائط Google"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>

      {/* Quick City Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
          <Compass className="w-3 h-3 text-primary" />
          <span>مدن سريعة:</span>
        </span>
        {CITY_PRESETS.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => onChange(city.lat, city.lng)}
            className="px-2.5 py-1 bg-muted/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border rounded-lg text-[11px] font-medium text-foreground transition-all shrink-0"
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-inner bg-slate-950 h-64 sm:h-72 group">
        {/* Map iframe from OpenStreetMap */}
        <iframe
          title="Interactive Mosque Map"
          width="100%"
          height="100%"
          style={{ border: 0, opacity: 0.9 }}
          loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lngNum - zoomDelta}%2C${latNum - zoomDelta}%2C${lngNum + zoomDelta}%2C${latNum + zoomDelta}&layer=mapnik&marker=${latNum}%2C${lngNum}`}
        />

        {/* Center Target Crosshair */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Animated Target Aura */}
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary animate-ping opacity-30 absolute" />
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center shadow-lg shadow-primary/40">
              <MapPin className="w-5 h-5 text-red-500 drop-shadow-md" />
            </div>
          </div>
        </div>

        {/* Floating Zoom & Pan Controls on Map */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={() => handleZoom('in')}
            className="w-8 h-8 rounded-xl bg-card/90 backdrop-blur-md border border-border text-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center shadow-md transition-all"
            title="تكبير الخريطة"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom('out')}
            className="w-8 h-8 rounded-xl bg-card/90 backdrop-blur-md border border-border text-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center shadow-md transition-all"
            title="تصغير الخريطة"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Fine Coordinate Adjustment Arrows */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 z-10 bg-card/90 backdrop-blur-md border border-border rounded-xl p-1 shadow-md">
          <button
            type="button"
            onClick={() => adjustCoords(0.001, 0)}
            className="p-1 hover:bg-muted rounded text-[10px] font-bold text-foreground"
            title="تحريك شمالاً"
          >
            ▲ شمال
          </button>
          <button
            type="button"
            onClick={() => adjustCoords(-0.001, 0)}
            className="p-1 hover:bg-muted rounded text-[10px] font-bold text-foreground"
            title="تحريك جنوباً"
          >
            ▼ جنوب
          </button>
          <button
            type="button"
            onClick={() => adjustCoords(0, 0.001)}
            className="p-1 hover:bg-muted rounded text-[10px] font-bold text-foreground"
            title="تحريك شرقاً"
          >
            ▶ شرق
          </button>
          <button
            type="button"
            onClick={() => adjustCoords(0, -0.001)}
            className="p-1 hover:bg-muted rounded text-[10px] font-bold text-foreground"
            title="تحريك غرباً"
          >
            ◀ غرب
          </button>
        </div>

        {/* Coordinates Overlay Badge */}
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/75 backdrop-blur-md text-white rounded-xl text-xs font-mono flex items-center gap-2 border border-white/10 z-10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{latNum.toFixed(6)}, {lngNum.toFixed(6)}</span>
        </div>
      </div>

      {/* Direct Numeric Coordinate Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span>خط العرض (Latitude)</span>
          </label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => onChange(e.target.value, String(longitude))}
            placeholder="مثال: 33.5138"
            className="w-full px-3.5 py-2.5 bg-card border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span>خط الطول (Longitude)</span>
          </label>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => onChange(String(latitude), e.target.value)}
            placeholder="مثال: 36.2765"
            className="w-full px-3.5 py-2.5 bg-card border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground font-mono"
          />
        </div>
      </div>
    </div>
  );
}
