import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Zap, 
  Activity, 
  Sliders, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  RefreshCw, 
  Car 
} from 'lucide-react';
import type { AdminMetrics, ParkingSpot } from '../types';

interface AdminDashboardProps {
  spots: ParkingSpot[];
  onToggleSpot: (spotId: string, status: ParkingSpot['status']) => void;
  onSimulateRush: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  spots,
  onToggleSpot,
  onSimulateRush
}) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="admin-dashboard-container" className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              Greater Chennai Corporation (GCC) Traffic Operations
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Smart Roadside Parking Surveillance & Analytics Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live monitoring of curb occupancy rates across Chennai zones, smart meter revenue, sensor health, and automated congestion controls.
          </p>
        </div>
          <button
            onClick={fetchMetrics}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      

      {/* Top KPI Cards in ₹ INR */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Total Roadside Bays</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.totalSpots}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {metrics.availableSpots} currently vacant
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <div className="text-xs text-slate-500 font-medium">City Occupancy Rate</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              {metrics.occupancyRate}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {metrics.occupiedSpots + metrics.reservedSpots} bays occupied / reserved
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Today's Revenue (₹ INR)</div>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
              ₹{metrics.todayRevenueINR.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              FASTag & UPI Smart Invoicing
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <div className="text-xs text-slate-500 font-medium">IoT Sensor Health</div>
            <div className="text-2xl font-bold text-sky-700 mt-1">
              {metrics.sensorHealthPct}%
            </div>
            <div className="text-[10px] text-sky-800 font-medium mt-1">
              100% GCC Kerb Cameras Active
            </div>
          </div>
        </div>
      )}

      {/* Chennai Zone Occupancy Meters */}
      {metrics && (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            Zone-wise Roadside Density (Chennai Municipal Wards)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.zoneOccupancies.map(zoneData => (
              <div
                key={zoneData.zone}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{zoneData.zone}</h4>
                    <span className="text-[10px] text-slate-500">
                      {zoneData.available} of {zoneData.count} bays open
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${
                    zoneData.rate > 75 ? 'text-rose-700' :
                    zoneData.rate > 45 ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {zoneData.rate}% Occ
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      zoneData.rate > 75 ? 'bg-rose-500' :
                      zoneData.rate > 45 ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.max(10, zoneData.rate)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Roadside Bays Override Table */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-600" />
          Roadside Bay Sensor Overrides & Status Manager
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Bay Code</th>
                <th className="pb-3">Bay Location & Landmark</th>
                <th className="pb-3">Rate (₹/hr)</th>
                <th className="pb-3">Sensor Health</th>
                <th className="pb-3">Current Status</th>
                <th className="pb-3 text-right pr-2">Quick Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {spots.map(s => (
                <tr key={s.id} className="text-slate-700 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-2 font-mono font-bold text-emerald-700">{s.code}</td>
                  <td className="py-3">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[10px] text-slate-500">{s.zone}</div>
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-900">₹{s.hourlyRateINR}</td>
                  <td className="py-3">
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                      🔋 {s.sensorBatteryPct}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      s.status === 'available' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      s.status === 'locked' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      s.status === 'occupied' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}>
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-2 space-x-1">
                    <button
                      onClick={() => onToggleSpot(s.id, 'available')}
                      className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-semibold transition-all"
                    >
                      Free
                    </button>
                    <button
                      onClick={() => onToggleSpot(s.id, 'occupied')}
                      className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-semibold transition-all"
                    >
                      Occupy
                    </button>
                    <button
                      onClick={() => onToggleSpot(s.id, 'maintenance')}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-semibold transition-all"
                    >
                      Service
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
