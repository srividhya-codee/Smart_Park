import React, { useEffect, useState } from 'react';
import { 
  X, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Calendar, 
  BarChart, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin 
} from 'lucide-react';
import type { ParkingSpot, AvailabilityForecast } from '../types';

interface ForecastModalProps {
  spot: ParkingSpot;
  onClose: () => void;
  onReserve: (spot: ParkingSpot) => void;
}

export const ForecastModal: React.FC<ForecastModalProps> = ({
  spot,
  onClose,
  onReserve
}) => {
  const [forecast, setForecast] = useState<AvailabilityForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/spots/${spot.id}/forecast`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setForecast(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [spot.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden my-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
            AI Availability & Congestion Forecast
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mt-1">{spot.name}</h2>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {spot.streetAddress}
        </p>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Computing Chennai Traffic & GCC Sensor Curves...</span>
          </div>
        ) : forecast ? (
          <div className="mt-5 space-y-4">
            {/* Hourly Probability Bars */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Predicted Availability Likelihood (Next 4 Hours)
              </div>
              <div className="space-y-2">
                {forecast.predictions.map((p, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div className="w-24 shrink-0">
                      <div className="font-bold text-slate-900">{p.timeOffset}</div>
                      <div className="text-[10px] text-slate-500">{p.displayTime}</div>
                    </div>

                    {/* Bar */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">{p.rushHourRisk}</span>
                        <span className="font-mono font-bold text-emerald-700">{p.probabilityAvailable}% Chance</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            p.probabilityAvailable > 70 ? 'bg-emerald-600' :
                            p.probabilityAvailable > 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${p.probabilityAvailable}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours & Best Arrival Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Peak Congestion Hours
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {forecast.peakHours.join(', ')}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Optimal Arrival Window
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {forecast.bestTimeToArrive}
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sensor Intelligence Insight</span>
              </div>
              <p className="leading-relaxed">{forecast.aiAnalysis}</p>
            </div>

            {/* Reserve CTA */}
            <button
              onClick={() => {
                onClose();
                onReserve(spot);
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Reserve Now at ₹{spot.hourlyRateINR}/hr</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
