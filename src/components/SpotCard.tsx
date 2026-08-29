import React from 'react';
import {
  MapPin,
  Zap,
  Lock as LockIcon,
  CheckCircle2
} from 'lucide-react';
import type { ParkingSpot } from '../types';

interface SpotCardProps {
  spot: ParkingSpot;
  onSelect: (spot: ParkingSpot) => void;
  onLock: (spot: ParkingSpot) => void;
  onReserve: (spot: ParkingSpot) => void;
  onViewForecast: (spot: ParkingSpot) => void;
  isSelected?: boolean;
}

export const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  onSelect,
  onLock,
  onReserve,
  onViewForecast,
  isSelected = false
}) => {
  const getStatusBadge = () => {
    switch (spot.status) {
      case 'available':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available Now
          </span>
        );
      case 'locked':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <LockIcon className="w-3 h-3 text-amber-600" />
            Redis Lock (120s)
          </span>
        );
      case 'occupied':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Occupied ({spot.currentPlate || 'On-Road'})
          </span>
        );
      case 'reserved':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
            Reserved Pass
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={`spot-card-${spot.id}`}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top Details */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {spot.code}
              </span>
              {getStatusBadge()}
              {spot.isEVCharging && (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                  <Zap className="w-3 h-3 text-cyan-600" />
                  {spot.evChargerPowerKw}kW EV Gun
                </span>
              )}
            </div>

            <h3 className="font-bold text-base text-slate-900 mt-2 group-hover:text-emerald-700 transition-colors">
              {spot.name}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{spot.streetAddress}</span>
            </p>
          </div>

          {/* Pricing in INR ₹ */}
          <div className="text-right shrink-0">
            <div className="text-xl font-extrabold text-slate-900">
              ₹{spot.hourlyRateINR}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">per hour</div>
          </div>
        </div>

        {/* Landmark & Bay Specs */}
        <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between text-slate-700">
          <div className="truncate mr-2">
            <span className="text-slate-400 font-medium">Landmark:</span> {spot.landmark}
          </div>
          <span className="shrink-0 text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 font-medium capitalize border border-slate-200">
            {spot.bayType} bay
          </span>
        </div>

        

        {/* Features Chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {spot.features.slice(0, 3).map((f, i) => (
            <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {f}
            </span>
          ))}
          {spot.cctvMonitored && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              📹 GCC CCTV
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between gap-2">
        

        <div className="flex items-center gap-2">
          

          <button
            id={`btn-reserve-${spot.id}`}
            onClick={() => onReserve(spot)}
            disabled={spot.status === 'occupied'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs hover:scale-102 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{spot.status === 'locked' ? 'Confirm Pass' : 'Reserve (₹)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
