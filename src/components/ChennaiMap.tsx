import React, { useState } from 'react';
import { 
  MapPin, 
  Zap, 
  Shield, 
  Navigation, 
  Info, 
  Layers, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Lock 
} from 'lucide-react';
import type { ParkingSpot } from '../types';

interface ChennaiMapProps {
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSelectSpot: (spot: ParkingSpot) => void;
  onLockSpot: (spot: ParkingSpot) => void;
  onReserveSpot: (spot: ParkingSpot) => void;
}

export const ChennaiMap: React.FC<ChennaiMapProps> = ({
  spots,
  selectedSpot,
  onSelectSpot,
  onLockSpot,
  onReserveSpot
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'ev' | 'safe'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [userLocation, setUserLocation] = useState<{
  lat: number;
  lng: number;
} | null>(null);

const [locationError, setLocationError] = useState('');
const [locationName, setLocationName] = useState('');

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    setLocationError('Location is not supported by your browser.');
    return;
  }

  setLocationError('');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setUserLocation({
        lat,
        lng,
      });

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        if (!response.ok) {
          throw new Error('Failed to find location name');
        }

        const data = await response.json();
        const address = data.address || {};

        const name =
          address.suburb ||
          address.neighbourhood ||
          address.city_district ||
          address.city ||
          address.town ||
          address.village ||
          'Your current location';

        setLocationName(name);
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setLocationName('Current location');
      }
    },
    () => {
      setLocationError(
        'Please allow location access to find nearby parking.'
      );
    }
  );
};
  // Map Chennai Lat/Lng (12.92 to 13.12 Lat, 80.18 to 80.30 Lng) into 800x600 SVG Coordinate Space
  const minLat = 12.92;
  const maxLat = 13.11;
  const minLng = 80.19;
  const maxLng = 80.29;

  const latLngToXY = (lat: number, lng: number) => {
    // Invert lat for SVG Y
    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 520 + 40;
    return { x: Math.max(30, Math.min(770, x)), y: Math.max(40, Math.min(560, y)) };
  };

  const filteredSpots = spots.filter(s => {
    if (activeFilter === 'available') return s.status === 'available';
    if (activeFilter === 'ev') return s.isEVCharging;
    if (activeFilter === 'safe') return s.safetyScore >= 90;
    return true;
  });

  const getStatusColor = (status: ParkingSpot['status']) => {
    switch (status) {
      case 'available':
        return '#10b981'; // emerald-500
      case 'locked':
        return '#f59e0b'; // amber-500
      case 'occupied':
        return '#ef4444'; // rose-500
      case 'reserved':
        return '#6366f1'; // indigo-500
      default:
        return '#64748b';
    }
  };

  return (
    <div id="chennai-map-container" className="relative w-full bg-slate-900 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Map Control Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Quick Filters */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm pointer-events-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              activeFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Bays ({spots.length})
          </button>
          <button
            onClick={getCurrentLocation}
            className="px-3 py-1 text-xs rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700"
>
            {locationName || 'My Location'}
          </button>
          <button
            onClick={() => setActiveFilter('available')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              activeFilter === 'available' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Vacant ({spots.filter(s => s.status === 'available').length})
          </button>
          <button
            onClick={() => setActiveFilter('ev')}
            className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              activeFilter === 'ev' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            EV Charger
          </button>
          <button
            onClick={() => setActiveFilter('safe')}
            className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              activeFilter === 'safe' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3 h-3 text-indigo-400" />
            90+ Safe
          </button>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-700 shadow-sm pointer-events-auto font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Redis Locked
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Occupied
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Reserved
          </span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="w-full h-[450px] sm:h-[540px] relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full select-none"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.3s ease' }}
        >
          <defs>
            {/* Bay of Bengal Coastline Gradient */}
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="gridGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="1" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="800" height="600" fill="url(#gridGrad)" />

          {/* Bay of Bengal (East Coast of Chennai) */}
          <path
            d="M 690 0 C 670 120, 680 250, 710 380 C 725 450, 730 520, 740 600 L 800 600 L 800 0 Z"
            fill="url(#oceanGrad)"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="735" y="280" fill="#38bdf8" fontSize="12" fontWeight="600" letterSpacing="3" transform="rotate(90 735 280)" opacity="0.6">
            BAY OF BENGAL
          </text>

          {/* Marina Beach Promenade */}
          <path
            d="M 685 180 Q 695 240 705 320"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          <text x="635" y="240" fill="#fbbf24" fontSize="10" fontWeight="bold">Marina Beach</text>

          {/* Elliot's Beach Besant Nagar */}
          <path
            d="M 708 410 Q 715 450 722 490"
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          <text x="635" y="450" fill="#fbbf24" fontSize="10" fontWeight="bold">Elliot's Beach</text>

          {/* Cooum River */}
          <path
            d="M 120 180 Q 300 170 480 200 T 695 210"
            stroke="#0284c7"
            strokeWidth="3"
            fill="none"
            opacity="0.4"
          />
          <text x="320" y="175" fill="#38bdf8" fontSize="9" opacity="0.5">Cooum River</text>

          {/* Adyar River */}
          <path
            d="M 160 460 Q 380 430 540 435 T 715 425"
            stroke="#0284c7"
            strokeWidth="3.5"
            fill="none"
            opacity="0.45"
          />
          <text x="360" y="445" fill="#38bdf8" fontSize="9" opacity="0.5">Adyar River / Estuary</text>

          {/* Major Chennai Arterial Corridors */}
          {/* Anna Salai / Mount Road */}
          <path
            d="M 220 540 L 360 410 L 480 280 L 610 160 L 670 120"
            stroke="#475569"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          <text x="400" y="325" fill="#94a3b8" fontSize="9" transform="rotate(-40 400 325)">
            Anna Salai (Mount Rd)
          </text>

          {/* Poonamallee High Road */}
          <path
            d="M 60 140 L 250 140 L 450 150 L 640 140"
            stroke="#475569"
            strokeWidth="4"
            fill="none"
            opacity="0.5"
          />
          <text x="180" y="132" fill="#94a3b8" fontSize="9">Poonamallee High Rd</text>

          {/* OMR Rajiv Gandhi Salai */}
          <path
            d="M 520 440 L 530 500 L 540 590"
            stroke="#475569"
            strokeWidth="6"
            fill="none"
            opacity="0.6"
          />
          <text x="548" y="525" fill="#94a3b8" fontSize="9" transform="rotate(80 548 525)">
            OMR IT Expressway
          </text>

          {/* Velachery 100 Ft Road */}
          <path
            d="M 380 480 L 470 485 L 530 495"
            stroke="#475569"
            strokeWidth="4"
            fill="none"
            opacity="0.5"
          />
          <text x="410" y="475" fill="#94a3b8" fontSize="8">Velachery 100 Ft Rd</text>

          {/* Zone Clusters & Polygon Highlights */}
          {/* T. Nagar Area */}
          <rect x="340" y="270" width="130" height="90" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="1.5" opacity="0.8" />
          <text x="350" y="288" fill="#e2e8f0" fontSize="11" fontWeight="bold">T. NAGAR</text>
          <text x="350" y="302" fill="#94a3b8" fontSize="8.5">Pondy Bazaar • Usman Rd</text>

          {/* Anna Nagar Area */}
          <rect x="180" y="100" width="140" height="85" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="1.5" opacity="0.8" />
          <text x="190" y="118" fill="#e2e8f0" fontSize="11" fontWeight="bold">ANNA NAGAR</text>
          <text x="190" y="132" fill="#94a3b8" fontSize="8.5">2nd Ave • Shanthi Colony</text>

          {/* Nungambakkam Area */}
          <rect x="420" y="190" width="135" height="75" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="1.5" opacity="0.8" />
          <text x="430" y="208" fill="#e2e8f0" fontSize="11" fontWeight="bold">NUNGAMBAKKAM</text>
          <text x="430" y="222" fill="#94a3b8" fontSize="8.5">KNK Rd • Sterling Rd</text>

          {/* Mylapore Area */}
          <rect x="520" y="280" width="130" height="85" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="1.5" opacity="0.8" />
          <text x="530" y="298" fill="#e2e8f0" fontSize="11" fontWeight="bold">MYLAPORE</text>
          <text x="530" y="312" fill="#94a3b8" fontSize="8.5">Luz • Kapaleeshwarar</text>

          {/* Besant Nagar & Adyar Area */}
          <rect x="530" y="390" width="140" height="90" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="1.5" opacity="0.8" />
          <text x="540" y="408" fill="#e2e8f0" fontSize="11" fontWeight="bold">BESANT NAGAR & ADYAR</text>
          <text x="540" y="422" fill="#94a3b8" fontSize="8.5">Elliot's Beach • Kasturibai</text>

          {/* Velachery Area */}
          <rect x="360" y="470" width="125" height="70" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="1.5" opacity="0.8" />
          <text x="370" y="488" fill="#e2e8f0" fontSize="11" fontWeight="bold">VELACHERY</text>
          <text x="370" y="502" fill="#94a3b8" fontSize="8.5">Phoenix Mall • 100ft Rd</text>

          {/* Render Parking Spots Markers */}
          {filteredSpots.map(spot => {
            const { x, y } = latLngToXY(spot.lat, spot.lng);
            const isSelected = selectedSpot?.id === spot.id;
            const markerColor = getStatusColor(spot.status);

            return (
              <g
                key={spot.id}
                id={`map-pin-${spot.id}`}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => onSelectSpot(spot)}
                style={{ transformOrigin: `${x}px ${y}px` }}
              >
                {/* Selection Halo */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  />
                )}

                {/* Pulse for Available spots */}
                {spot.status === 'available' && (
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill="#10b981"
                    opacity="0.25"
                    className="animate-ping"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  />
                )}

                {/* EV Outer Ring */}
                {spot.isEVCharging && (
                  <circle
                    cx={x}
                    cy={y}
                    r="15"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="2 1"
                  />
                )}

                {/* Main Pin Base */}
                <circle
                  cx={x}
                  cy={y}
                  r="11"
                  fill={markerColor}
                  stroke="#0f172a"
                  strokeWidth="2"
                  filter="url(#glow)"
                />

                {/* Pin Icon / Symbol */}
                <text
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {spot.status === 'locked' ? '🔒' : `₹${spot.hourlyRateINR}`}
                </text>

                {/* Spot Label Tag */}
                <g transform={`translate(${x - 40}, ${y + 14})`}>
                  <rect
                    width="80"
                    height="17"
                    rx="4"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="40"
                    y="12"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="8"
                    fontWeight="600"
                  >
                    {spot.code} • ₹{spot.hourlyRateINR}/h
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Selected Spot Floating Card on Map */}
        {selectedSpot && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-xl z-30 transition-all text-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    selectedSpot.status === 'available' ? 'bg-emerald-500 animate-pulse' :
                    selectedSpot.status === 'locked' ? 'bg-amber-500' :
                    selectedSpot.status === 'occupied' ? 'bg-rose-500' : 'bg-indigo-500'
                  }`} />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                    {selectedSpot.code} • {selectedSpot.status.toUpperCase()}
                  </span>
                  {selectedSpot.isEVCharging && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                      <Zap className="w-2.5 h-2.5" />
                      {selectedSpot.evChargerPowerKw}kW EV
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{selectedSpot.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{selectedSpot.streetAddress}</p>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-slate-900">₹{selectedSpot.hourlyRateINR}</div>
                <div className="text-[10px] text-slate-400">per hour</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 my-3 pt-2 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">Safety Score</div>
                <div className="text-xs font-bold text-sky-700">{selectedSpot.safetyScore}/100</div>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">Bay Style</div>
                <div className="text-xs font-bold text-amber-700 capitalize">{selectedSpot.bayType}</div>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">Walk Time</div>
                <div className="text-xs font-bold text-emerald-700">{selectedSpot.walkTimeMinutes} min ({selectedSpot.distanceMeters}m)</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onLockSpot(selectedSpot)}
                disabled={selectedSpot.status !== 'available'}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>120s Redis Hold</span>
              </button>

              <button
                onClick={() => onReserveSpot(selectedSpot)}
                disabled={selectedSpot.status === 'occupied'}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reserve Bay</span>
              </button>
            </div>
          </div>
        )}

        {/* Map Zoom Controls */}
        <div className="absolute bottom-4 right-4 hidden sm:flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm z-20">
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.2))}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-lg font-bold"
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium"
          >
            1x
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-lg font-bold"
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
};
