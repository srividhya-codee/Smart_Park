import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Clock, 
  Compass, 
  ArrowRight, 
  Leaf, 
  HelpCircle, 
  Bot, 
  Car, 
  ChevronRight 
} from 'lucide-react';
import type { ParkingSpot, ParkMateAIRecommendation } from '../types';

interface ParkMateViewProps {
  onLockSpot: (spot: ParkingSpot) => void;
  onReserveSpot: (spot: ParkingSpot) => void;
}

export const ParkMateView: React.FC<ParkMateViewProps> = ({
  onLockSpot,
  onReserveSpot
}) => {
  const [query, setQuery] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ParkMateAIRecommendation[] | null>(null);
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const samplePrompts = [
    {
      title: 'T. Nagar Shopping & EV',
      prompt: 'Need a safe roadside parking spot near Pondy Bazaar for 2 hours with EV fast charging under ₹100'
    },
    {
      title: "Elliot's Beach Evening Walk",
      prompt: "Looking for well-lit, high-safety roadside parking near Elliot's Beach Besant Nagar for family dinner"
    },
    {
      title: 'Anna Nagar 2nd Avenue SUV',
      prompt: 'Find parking near Anna Nagar Roundtana / 2nd Ave for an SUV with easy walking distance'
    },
    {
      title: 'Mylapore Temple Visit',
      prompt: 'Affordable two-wheeler or car parking near Kapaleeshwarar Temple Sannidhi Street under ₹40'
    },
    {
      title: 'OMR IT Corridor Full Day',
      prompt: 'Tech park roadside bay in OMR Thoraipakkam for 6 hours with FASTag payment'
    }
  ];

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/parkmate/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          userVehicleType: vehicleType,
          userLat: 13.0827,
          userLng: 80.2707
        })
      });

      const data = await res.json();
      if (data.success && data.results) {
        setRecommendations(data.results);
        setParsedIntent(data.parsedIntent);
      } else {
        setErrorMessage(data.error || 'Failed to get recommendations');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error connecting to ParkMate AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="parkmate-view-container" className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              ParkMate AI • Powered by Gemini 2.5
            </span>
            <span className="text-xs text-slate-500 font-medium">Chennai Roadside Neural Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tell ParkMate what you need in plain Tamil or English
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Specify your destination in Chennai (e.g. Pondy Bazaar, KNK Road, Elliot's Beach, Luz), expected duration, budget in ₹ INR, EV charging needs, or safety preferences. ParkMate analyzes real-time GCC sensor telemetry to recommend optimal bays.
          </p>

          {/* Prompt Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="mt-6"
          >
            <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-xs focus-within:border-emerald-600 focus-within:bg-white transition-all">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <input
                  id="input-parkmate-query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Need safe roadside parking near Pondy Bazaar for 2 hrs with EV fast charger under ₹100"
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none py-2"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="bg-white text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
                >
                  <option value="car">🚗 Car / Sedan</option>
                  <option value="suv">🚙 SUV / Creta / Thar</option>
                  <option value="two_wheeler">🛵 Two-Wheeler / Bike</option>
                  <option value="ev_car">⚡ Electric Car (EV)</option>
                </select>

                <button
                  id="btn-submit-parkmate-ai"
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Find Best Bay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Preset Prompts Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1">Try asking:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(p.prompt);
                  handleSearch(p.prompt);
                }}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all text-left"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Results Section */}
      {recommendations && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              ParkMate Recommendations for Chennai
            </h2>
            <span className="text-xs text-slate-500">
              Ranked by Safety, Proximity, Price in ₹, and Sensor Vacancy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendations.map((rec, index) => {
              const spot = rec.spot;
              return (
                <div
                  key={spot.id}
                  id={`rec-card-${spot.id}`}
                  className={`relative rounded-3xl p-6 border flex flex-col justify-between transition-all bg-white ${
                    index === 0
                      ? 'border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Top Rank Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          index === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          #{index + 1}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          {rec.matchScore}% Match
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">₹{rec.estimatedCostINR}</span>
                        <span className="text-[10px] text-slate-500 block">Est. Total</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{spot.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {spot.streetAddress}
                    </p>

                    {/* Best Suited For Tag */}
                    <div className="mt-3 inline-block px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
                      🎯 {rec.bestSuitedFor}
                    </div>

                    {/* Why this spot: AI Analysis */}
                    <div className="mt-4 space-y-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Why ParkMate chose this:</div>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {rec.reasons.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Safety Highlights */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-[10px] font-bold text-sky-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Safety & Illumination
                      </div>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        {rec.safetyHighlights.map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chennai Local Tips */}
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                      <strong>💡 Chennai Tip:</strong> {rec.chennaiLocalTips}
                    </div>

                    {/* Walking & Eco Impact */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {rec.walkingRecommendation}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Leaf className="w-3 h-3" />
                        {rec.co2SavedGrams}g CO2 saved
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onLockSpot(spot)}
                      disabled={spot.status !== 'available'}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold transition-all disabled:opacity-40"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>120s Hold</span>
                    </button>

                    <button
                      onClick={() => onReserveSpot(spot)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reserve (₹{rec.estimatedCostINR})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
