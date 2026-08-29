import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import {
   Navbar 
} from './components/Navbar';
import { 
  ChennaiMap 
} from './components/ChennaiMap';
import { 
  SpotCard 
} from './components/SpotCard';
import { 
  ParkMateView 
} from './components/ParkMateView';
import { 
  GuardianView 
} from './components/GuardianView';
import { 
  CommunityReportsView 
} from './components/CommunityReportsView';
import { 
  RedisLockManagerView 
} from './components/RedisLockManagerView';
import { 
  AdminDashboard 
} from './components/AdminDashboard';
import { 
  PostgresConsole 
} from './components/PostgresConsole';
import { 
  ArchitectureView 
} from './components/ArchitectureView';
import { 
  ReservationModal 
} from './components/ReservationModal';
import { 
  PassModal 
} from './components/PassModal';
import { 
  ForecastModal 
} from './components/ForecastModal';
import { 
  MapPin, 
  Filter, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  Grid, 
  Map as MapIcon, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  Clock, 
  Car 
} from 'lucide-react';
import type { 
  ParkingSpot, 
  RedisLock, 
  Reservation, 
  SafetyGuardianSession, 
  CommunityReport, 
  EcoImpactMetrics, 
  ChennaiZone 
} from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [activeTab, setActiveTab] = useState<string>('spots');
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guardianSessions, setGuardianSessions] = useState<SafetyGuardianSession[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [ecoMetrics, setEcoMetrics] = useState<EcoImpactMetrics | null>(null);
  const [activeLocks, setActiveLocks] = useState<RedisLock[]>([]);

  // Filtering State
  const [selectedZone, setSelectedZone] = useState<string>('All Zones');
  const [evOnly, setEvOnly] = useState(false);
  const [handicapOnly, setHandicapOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(80);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'split' | 'grid' | 'map'>('split');

  // Modals
  const [bookingSpot, setBookingSpot] = useState<ParkingSpot | null>(null);
  const [activePass, setActivePass] = useState<Reservation | null>(null);
  const [forecastSpot, setForecastSpot] = useState<ParkingSpot | null>(null);

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Spots
  const fetchSpots = async () => {
    try {
      let url = `/api/spots?maxPrice=${maxPrice}`;
      if (selectedZone !== 'All Zones') url += `&zone=${encodeURIComponent(selectedZone)}`;
      if (evOnly) url += '&evOnly=true';
      if (handicapOnly) url += '&handicapOnly=true';
      if (vehicleTypeFilter !== 'all') url += `&vehicleType=${vehicleTypeFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSpots(data.data);
      }
    } catch (e) {
      console.error('Error fetching parking spots:', e);
    }
  };

  // Fetch Auxiliary Data
  const fetchData = async () => {
    try {
      const [resRes, gRes, repRes, ecoRes, redisRes] = await Promise.all([
        fetch('/api/reservations').then(r => r.json()),
        fetch('/api/guardian/active').then(r => r.json()),
        fetch('/api/reports').then(r => r.json()),
        fetch('/api/eco-impact').then(r => r.json()),
        fetch('/api/redis/state').then(r => r.json())
      ]);

      if (resRes.success) setReservations(resRes.data);
      if (gRes.success) setGuardianSessions(gRes.data);
      if (repRes.success) setCommunityReports(repRes.data);
      if (ecoRes.success) setEcoMetrics(ecoRes.data);
      if (redisRes.success) {
        const now = Date.now();
        setActiveLocks(redisRes.keys.filter((k: any) => k.expiresAt > now && k.lockState === 'active'));
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, [selectedZone, evOnly, handicapOnly, maxPrice, vehicleTypeFilter]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, []);

  // Lock Spot (120s Redis Mutex)
  const handleLockSpot = async (spot: ParkingSpot) => {
    try {
      const res = await fetch(`/api/spots/${spot.id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr-driver-chennai', userName: 'Srividhya N' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🔒 120s Redis Mutex Lock acquired on ${spot.name}. Bay is held exclusively for you!`, 'success');
        fetchSpots();
        fetchData();
      } else {
        showToast(`⚠️ ${data.error || 'Failed to acquire Redis lock'}`, 'warning');
      }
    } catch (e: any) {
      showToast(e.message, 'warning');
    }
  };

  // Release Lock
  const handleUnlockSpot = async (spotId: string) => {
    try {
      const res = await fetch(`/api/spots/${spotId}/lock`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr-driver-chennai' })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Redis mutex lock released successfully', 'info');
        fetchSpots();
        fetchData();
      }
    } catch (e: any) {
      showToast(e.message, 'warning');
    }
  };

  // Open Reservation Modal
  const handleReservePrompt = (spot: ParkingSpot) => {
    setBookingSpot(spot);
  };

  // Confirm Reservation
  const handleConfirmReservation = async (bookingDetails: any) => {
    if (!bookingSpot) return;
    try {
      const res = await fetch(`/api/spots/${bookingSpot.id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingDetails,
          userId: 'usr-driver-chennai'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 Roadside Parking Pass generated for ${bookingSpot.name} (Total: ₹${data.reservation.totalFeeINR})`, 'success');
        setBookingSpot(null);
        setActivePass(data.reservation);
        fetchSpots();
        fetchData();
      } else {
        showToast(`⚠️ ${data.error || 'Reservation failed'}`, 'warning');
      }
    } catch (e: any) {
      showToast(e.message, 'warning');
    }
  };

  // Check In / Check Out
  const handleCheckIn = async (resId: string) => {
    try {
      const res = await fetch(`/api/reservations/${resId}/checkin`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Verified check-in at Chennai roadside bay!', 'success');
        fetchSpots();
        fetchData();
        if (activePass && activePass.id === resId) {
          setActivePass(data.reservation);
        }
      }
    } catch (e: any) {
      showToast(e.message, 'warning');
    }
  };

  const handleCheckOut = async (resId: string) => {
    try {
      const res = await fetch(`/api/reservations/${resId}/checkout`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Checked out. Roadside bay released back to Chennai drivers.', 'success');
        fetchSpots();
        fetchData();
        if (activePass && activePass.id === resId) {
          setActivePass(data.reservation);
        }
      }
    } catch (e: any) {
      showToast(e.message, 'warning');
    }
  };

  // SOS Trigger
  const handleTriggerSOS = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/guardian/${sessionId}/trigger-sos`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('🚨 SOS broadcasted! Greater Chennai Police (112) alerted with GPS coordinates.', 'warning');
        fetchData();
      }
    } catch (e: any) {
      showToast(e.message, 'warning');
    }
  };

  // Sensor Ping
  const handlePingSensor = async (sessionId: string, params: any) => {
    try {
      const res = await fetch(`/api/guardian/${sessionId}/sensor-ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Perimeter sensor telemetry updated', 'info');
        fetchData();
      }
    } catch (e: any) {
      showToast(e.message, 'warning');
    }
  };

  // Community Reports Vote & Submit
  const handleVoteReport = async (reportId: string, type: 'upvote' | 'downvote') => {
    try {
      const res = await fetch(`/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReport = async (newReport: any) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Roadside intel report published across Chennai network', 'success');
        fetchData();
      }
    } catch (e: any) {
      showToast(e.message, 'warning');
    }
  };

  // Admin Controls
  const handleToggleSpot = async (spotId: string, status: ParkingSpot['status']) => {
    try {
      const res = await fetch('/api/admin/toggle-spot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotId, status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Bay status overridden to ${status}`, 'info');
        fetchSpots();
        fetchData();
      }
    } catch (e: any) {
      showToast(e.message, 'warning');
    }
  };

  const handleSimulateRush = async () => {
    try {
      const res = await fetch('/api/admin/simulate-rush', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Rush hour simulated: Available roadside bays filled', 'warning');
        fetchSpots();
        fetchData();
      }
    } catch (e: any) {
      showToast(e.message, 'warning');
    }
  };
  
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={(role) => {
          setUserRole(role);
          setIsLoggedIn(true);
        }}
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-md">
          <div className={`p-4 rounded-2xl border shadow-xl backdrop-blur-xl flex items-center gap-3 text-xs font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-white border-emerald-300 text-emerald-900 shadow-emerald-500/5'
              : toastMessage.type === 'warning'
              ? 'bg-white border-amber-300 text-amber-900 shadow-amber-500/5'
              : 'bg-white border-slate-200 text-slate-800 shadow-slate-500/5'
          }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              toastMessage.type === 'success' ? 'bg-emerald-500 animate-ping' :
              toastMessage.type === 'warning' ? 'bg-amber-500 animate-ping' : 'bg-slate-400'
            }`} />
            <p className="flex-1">{toastMessage.text}</p>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeLocks={activeLocks}
        ecoMetrics={ecoMetrics}
        onOpenParkMate={() => setActiveTab('parkmate')}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
         {activeTab === 'admin' ? (
          <AdminDashboard
            spots={spots}
            onToggleSpot={handleToggleSpot}
            onSimulateRush={handleSimulateRush}
          />
      ) : (
        <>
        {/* VIEW 1: Roadside Spots & Interactive Map */}
        {activeTab === 'spots' && (
          <div className="space-y-6">
            {/* Filter and Control Bar */}
            <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Zone Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Locality:</span>
                </div>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
                >
                  <option value="All Zones">All Chennai Localities ({spots.length})</option>
                  <option value="T. Nagar (Pondy Bazaar / Usman Rd)">T. Nagar (Pondy Bazaar / Usman Rd)</option>
                  <option value="Anna Nagar (2nd Ave / Shanthi Colony)">Anna Nagar (2nd Ave / Shanthi Colony)</option>
                  <option value="Nungambakkam (Khader Nawaz Khan Rd)">Nungambakkam (Khader Nawaz Khan Rd)</option>
                  <option value="Mylapore (Luz / Kapaleeshwarar)">Mylapore (Luz / Kapaleeshwarar)</option>
                  <option value="Besant Nagar & Adyar (Elliot's Beach)">Besant Nagar & Adyar (Elliot's Beach)</option>
                  <option value="Velachery (100 Ft Bypass Rd)">Velachery (100 Ft Bypass Rd)</option>
                  <option value="OMR IT Corridor (Perungudi / Thoraipakkam)">OMR IT Corridor (Perungudi / Thoraipakkam)</option>
                  <option value="Marina Beach (Kamarajar Salai)">Marina Beach (Kamarajar Salai)</option>
                  <option value="Alwarpet & RA Puram (TTK Rd)">Alwarpet & RA Puram (TTK Rd)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setEvOnly(!evOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    evOnly
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-600" />
                  <span>EV Fast Charger</span>
                </button>

                <button
                  onClick={() => setHandicapOnly(!handicapOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    handicapOnly
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Accessible Ramp</span>
                </button>

                {/* Price Slider in ₹ */}
                <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-500">Max ₹:</span>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-16 accent-emerald-600 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-emerald-700">₹{maxPrice}/h</span>
                </div>
              </div>

              {/* View Layout Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setViewLayout('split')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    viewLayout === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    viewLayout === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewLayout('map')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    viewLayout === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Full Map
                </button>
              </div>
            </div>

            {/* Split / Map / Grid Layout Display */}
            {viewLayout === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Map */}
                <div className="lg:col-span-7">
                  <ChennaiMap
                    spots={spots}
                    selectedSpot={selectedSpot}
                    onSelectSpot={setSelectedSpot}
                    onLockSpot={handleLockSpot}
                    onReserveSpot={handleReservePrompt}
                  />
                </div>

                {/* Right: Spot Cards List */}
                <div className="lg:col-span-5 space-y-4 max-h-[540px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Showing {spots.length} Roadside Spots</span>
                    <span>Click on map or card to inspect</span>
                  </div>
                  {spots.map(spot => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      isSelected={selectedSpot?.id === spot.id}
                      onSelect={(s) => setSelectedSpot(s)}
                      onLock={handleLockSpot}
                      onReserve={handleReservePrompt}
                      onViewForecast={(s) => setForecastSpot(s)}
                    />
                  ))}
                </div>
              </div>
            )}

            {viewLayout === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {spots.map(spot => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    isSelected={selectedSpot?.id === spot.id}
                    onSelect={(s) => setSelectedSpot(s)}
                    onLock={handleLockSpot}
                    onReserve={handleReservePrompt}
                    onViewForecast={(s) => setForecastSpot(s)}
                  />
                ))}
              </div>
            )}

            {viewLayout === 'map' && (
              <div>
                <ChennaiMap
                  spots={spots}
                  selectedSpot={selectedSpot}
                  onSelectSpot={setSelectedSpot}
                  onLockSpot={handleLockSpot}
                  onReserveSpot={handleReservePrompt}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ParkMate AI Assistant */}
        {activeTab === 'parkmate' && (
          <ParkMateView
            onLockSpot={handleLockSpot}
            onReserveSpot={handleReservePrompt}
          />
        )}

        {/* VIEW 3: Virtual Guardian & Safety */}
        {activeTab === 'guardian' && (
          <GuardianView
            sessions={guardianSessions}
            onTriggerSOS={handleTriggerSOS}
            onPingSensor={handlePingSensor}
          />
        )}

        {/* VIEW 4: Roadside Intel & Community Reports */}
        {activeTab === 'reports' && (
          <CommunityReportsView
            reports={communityReports}
            onVote={handleVoteReport}
            onSubmitReport={handleSubmitReport}
          />
        )}

        {/* VIEW 5: My Bookings & Digital Pass */}
        {activeTab === 'passes' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">My Smart Parking Passes (Chennai GCC)</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Digital QR passes with live PIN verification, check-in, check-out, and roadside fee invoicing in ₹ INR.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {reservations.map(res => (
                <div
                  key={res.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {res.spotCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        res.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {res.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{res.spotName}</h3>
                    <p className="text-xs text-slate-500">{res.streetAddress}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                      <span>Plate: <strong className="text-slate-900 font-mono">{res.vehiclePlate}</strong></span>
                      <span>PIN: <strong className="text-emerald-700 font-mono">{res.pinCode}</strong></span>
                      <span>Total: <strong className="text-emerald-700 font-mono font-bold">₹{res.totalFeeINR}</strong> ({res.paymentMethod})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setActivePass(res)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs"
                    >
                      View Digital Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: Redis Lock Manager */}
        {activeTab === 'redis' && ( 
          <RedisLockManagerView
            onUnlockSpot={handleUnlockSpot}
            onRefresh={fetchData}
          />
        )}

        

        {/* VIEW 8: PostgreSQL Console */}
        {activeTab=== 'sql' && (
          <PostgresConsole />
        )}

        {/* VIEW 9: Architecture & API */}
        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
        </>
      )}
      </main>

      {/* MODAL: Reservation Drawer */}
      {bookingSpot && (
        <ReservationModal
          spot={bookingSpot}
          onClose={() => setBookingSpot(null)}
          onConfirm={handleConfirmReservation}
          lockExpiresAt={bookingSpot.currentLockExpiresAt}
        />
      )}

      {/* MODAL: Digital Smart Pass */}
      {activePass && (
        <PassModal
          reservation={activePass}
          onClose={() => setActivePass(null)}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onOpenGuardian={() => {
            setActivePass(null);
            setActiveTab('guardian');
          }}
        />
      )}

      {/* MODAL: AI Availability Forecast */}
      {forecastSpot && (
        <ForecastModal
          spot={forecastSpot}
          onClose={() => setForecastSpot(null)}
          onReserve={handleReservePrompt}
        />
      )}
    </div>
  );
}
