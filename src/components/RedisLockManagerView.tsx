import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Flame, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Server, 
  Key, 
  Zap 
} from 'lucide-react';
import type { RedisLock } from '../types';

interface RedisLockManagerViewProps {
  onUnlockSpot: (spotId: string) => void;
  onRefresh: () => void;
}

export const RedisLockManagerView: React.FC<RedisLockManagerViewProps> = ({
  onUnlockSpot,
  onRefresh
}) => {
  const [redisState, setRedisState] = useState<{
    redisHost: string;
    activeKeysCount: number;
    totalContentionEvents: number;
    keys: (RedisLock & { remainingSeconds: number; isExpired: boolean })[];
  } | null>(null);

  const [raceResults, setRaceResults] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);

  const fetchRedisState = async () => {
    try {
      const res = await fetch('/api/redis/state');
      const data = await res.json();
      if (data.success) {
        setRedisState(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRedisState();
    const interval = setInterval(fetchRedisState, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateRaceCondition = async () => {
    setSimulating(true);
    setRaceResults(null);
    try {
      const res = await fetch('/api/admin/simulate-race-condition', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRaceResults(data);
        fetchRedisState();
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div id="redis-lock-manager-container" className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Redis Distributed Mutex Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">SETNX with 120s TTL</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Temporary Slot Lock & Race Condition Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Prevents multiple drivers in Chennai from reserving the same roadside bay simultaneously. An atomic 120-second mutex lock holds the bay while payment is completed.
          </p>
        </div>

        <button
          id="btn-simulate-race-condition"
          onClick={handleSimulateRaceCondition}
          disabled={simulating}
          className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
        >
          {simulating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running Concurrency Test...</span>
            </>
          ) : (
            <>
              <Flame className="w-4 h-4" />
              <span>Simulate 5-Driver Race Condition</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Row */}
      {redisState && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Server className="w-3.5 h-3.5 text-amber-600" />
              Redis Instance
            </div>
            <div className="text-sm font-mono font-bold text-slate-900 mt-1 truncate">
              {redisState.redisHost}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              Active Slot Locks
            </div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">
              {redisState.activeKeysCount} Mutex Hold{redisState.activeKeysCount === 1 ? '' : 's'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              Lock Contention Collisions Prevented
            </div>
            <div className="text-xl font-bold text-rose-700 mt-0.5">
              {redisState.totalContentionEvents} Double-Bookings Averted
            </div>
          </div>
        </div>
      )}

      {/* Race Condition Simulation Output Box */}
      {raceResults && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              Race Condition Test Results: 5 Drivers Vying for Spot ({raceResults.spot?.code})
            </h3>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Single-Owner Mutex Verified
            </span>
          </div>

          <div className="space-y-2">
            {raceResults.contentionResults.map((res: any, idx: number) => {
              const isWinner = res.status.includes('200');
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isWinner
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isWinner ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900">{res.driver}</span>
                    <span className="text-slate-500 hidden sm:inline">— {res.detail}</span>
                  </div>
                  <span className="font-mono font-bold">{res.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Redis Keys Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-600" />
            Live Redis Key-Value Store (`spot_lock:*`)
          </h2>
          <button
            onClick={fetchRedisState}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>

        {redisState && redisState.keys.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No active Redis locks currently held. Click "120s Lock" on any available Chennai spot to acquire a key.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Redis Key</th>
                  <th className="pb-3">Driver / User</th>
                  <th className="pb-3">TTL Remaining</th>
                  <th className="pb-3">Lock Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {redisState?.keys.map(k => (
                  <tr key={k.key} className="text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pl-2 font-mono font-bold text-amber-700">{k.key}</td>
                    <td className="py-3 font-medium text-slate-900">{k.userName} ({k.userId})</td>
                    <td className="py-3 font-mono font-bold text-emerald-700">
                      {k.remainingSeconds}s
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        k.remainingSeconds > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {k.remainingSeconds > 0 ? 'ACTIVE MUTEX' : 'EXPIRED'}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => onUnlockSpot(k.spotId)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition-all"
                      >
                        Force Release
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
