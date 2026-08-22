'use client';

// ==============================
// UI Component — InteractiveMapLocationPicker
// منتقي مواقع تفاعلي على الخريطة مع Leaflet Click-to-Place وبحث Nominatim وتحديد GPS وإحداثيات فورية
// ==============================

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Search, LocateFixed, Loader2, Navigation,
  ExternalLink, ZoomIn, ZoomOut, Compass, X
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
  const latNum = parseFloat(String(latitude)) || 24.7136;
  const lngNum = parseFloat(String(longitude)) || 46.6753;

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Leaflet Bootstrap ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initLeaflet = async () => {
      // Load CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!mapRef.current || leafletMapRef.current) return;

      // Create map
      const map = L.map(mapRef.current, {
        center: [latNum, lngNum],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Custom icon
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:36px;height:36px;
          background:linear-gradient(135deg,#ef4444,#dc2626);
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid white;
          box-shadow:0 4px 14px rgba(239,68,68,0.5);
          display:flex;align-items:center;justify-content:center;
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([latNum, lngNum], {
        icon,
        draggable: true,
      }).addTo(map);

      // Drag end → update coords
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
      });

      // Click on map → move marker + update coords
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onChange(lat.toFixed(6), lng.toFixed(6));
      });

      leafletMapRef.current = map;
      markerRef.current = marker;
      setMapReady(true);
    };

    initLeaflet().catch(err => console.warn('Leaflet init failed:', err));

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // ── Sync external lat/lng → map/marker ──
  useEffect(() => {
    if (!leafletMapRef.current || !markerRef.current) return;
    const newLat = parseFloat(String(latitude)) || 24.7136;
    const newLng = parseFloat(String(longitude)) || 46.6753;
    markerRef.current.setLatLng([newLat, newLng]);
    leafletMapRef.current.setView([newLat, newLng], leafletMapRef.current.getZoom());
  }, [latitude, longitude]);

  // ── Search using Nominatim ──
  const handleSearch = async (query: string) => {
    if (!query.trim()) { setSearchResults([]); setShowResults(false); return; }
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
    searchTimeoutRef.current = setTimeout(() => handleSearch(val), 450);
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

  // ── GPS Current Location ──
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

  // ── Zoom Controls ──
  const handleZoom = (dir: 'in' | 'out') => {
    if (!leafletMapRef.current) return;
    if (dir === 'in') leafletMapRef.current.zoomIn();
    else leafletMapRef.current.zoomOut();
  };

  return (
    <div className="space-y-4 font-['Cairo']">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
            placeholder="ابحث عن مدينة، حي، شارع، أو مسجد على الخريطة..."
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

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGetGPSLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
            <span>موقعي (GPS)</span>
          </button>

          <a
            href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 bg-card hover:bg-muted text-muted-foreground hover:text-primary border border-border rounded-xl text-xs font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>

      {/* Hint */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <MapPin className="w-3 h-3 text-primary shrink-0" />
        <span>اضغط على أي مكان في الخريطة لتحديد موقع المسجد، أو اسحب الدبوس الأحمر لضبط الموقع بدقة</span>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-inner bg-muted" style={{ height: '300px' }}>
        {/* Leaflet will mount here */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Loading overlay until map is ready */}
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">جاري تحميل الخريطة...</span>
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={() => handleZoom('in')}
            className="w-8 h-8 rounded-xl bg-card/95 backdrop-blur-md border border-border text-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center shadow-md transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom('out')}
            className="w-8 h-8 rounded-xl bg-card/95 backdrop-blur-md border border-border text-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center shadow-md transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Live Coordinates Badge */}
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/75 backdrop-blur-md text-white rounded-xl text-xs font-mono flex items-center gap-2 border border-white/10 z-20">
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
            placeholder="مثال: 24.7136"
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
            placeholder="مثال: 46.6753"
            className="w-full px-3.5 py-2.5 bg-card border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground font-mono"
          />
        </div>
      </div>
    </div>
  );
}
