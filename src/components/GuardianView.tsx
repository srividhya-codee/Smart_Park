import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  PhoneCall, 
  Video, 
  Sun, 
  Activity, 
  Radio, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Compass, 
  Eye 
} from 'lucide-react';
import type { SafetyGuardianSession } from '../types';

interface GuardianViewProps {
  sessions: SafetyGuardianSession[];
  onTriggerSOS: (sessionId: string) => void;
  onPingSensor: (sessionId: string, params: { motionDetected?: boolean; vibrationTamper?: boolean }) => void;
}

export const GuardianView: React.FC<GuardianViewProps> = ({
  sessions,
  onTriggerSOS,
  onPingSensor
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  const [sosTriggered, setSosTriggered] = useState(false);
  const [safeWalkTimer, setSafeWalkTimer] = useState<number>(300); // 5 min safe walk countdown
  const [isSafeWalkActive, setIsSafeWalkActive] = useState(false);

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSafeWalkActive && safeWalkTimer > 0) {
      interval = setInterval(() => {
        setSafeWalkTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSafeWalkActive, safeWalkTimer]);

  const handleSOS = () => {
    if (!activeSession) return;
    setSosTriggered(true);
    onTriggerSOS(activeSession.id);
  };

  return (
    <div id="guardian-view-container" className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Virtual Guardian & Safety Shield
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs text-emerald-700 font-semibold">24x7 GCC & Chennai Police Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Roadside Vehicle & Personal Safety Sentinel
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Real-time illumination tracking, perimeter vibration sensors, GCC Dome CCTV coverage, and 1-click GPS SOS dispatch to Greater Chennai Police Control Room (100 / 112).
            </p>
          </div>

          {/* Emergency SOS Button */}
          <button
            id="btn-trigger-sos-chennai"
            onClick={handleSOS}
            className={`shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xs ${
              sosTriggered
                ? 'bg-rose-700 text-white animate-bounce'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-95'
            }`}
          >
            <PhoneCall className="w-5 h-5" />
            <span>{sosTriggered ? 'SOS DISPATCHED (112)' : 'EMERGENCY SOS (112)'}</span>
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-xs">
          <ShieldCheck className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Active Guardian Session</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Reserve any roadside parking spot in Chennai to automatically activate real-time Virtual Guardian protection for your vehicle.
          </p>
        </div>
      ) : (
        activeSession && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Simulated Live CCTV Stream & Perimeter Status */}
            <div className="lg:col-span-2 space-y-6">
              {/* Simulated CCTV Stream */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      GCC Dome CCTV Feed • {activeSession.spotName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      LIVE 1080P HD
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">CAM-TN-GCC-091</span>
                  </div>
                </div>

                {/* Video Stage Canvas simulation */}
                <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {/* Subtle Grid Lines and Scanlines */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_90%)] opacity-80" />
                  
                  {/* Road & Curb Visual Representation */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="w-full h-16 border-b-2 border-dashed border-amber-400/60 flex items-center justify-center">
                      <span className="text-[10px] font-mono tracking-widest text-amber-300/60 uppercase">
                        Roadside Parking Bay Kerb • Sir Thyagaraya Rd
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Bounding Box */}
                  <div className="relative z-10 w-64 h-32 border-2 border-emerald-400 rounded-lg p-2 bg-emerald-500/5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400">
                      <span>[TAMPER GUARD: SECURE]</span>
                      <span>99.8% CONF</span>
                    </div>
                    <div className="text-center font-mono text-xs font-bold text-white tracking-widest">
                      {activeSession.spotName}
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400">
                      <span>GPS: 13.0416° N, 80.2337° E</span>
                      <span className="animate-pulse">● MOTION DETECT</span>
                    </div>
                  </div>

                  {/* Overlay Watermark */}
                  <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded">
                    GREATER CHENNAI CORPORATION • SMART TRAFFIC SURVEILLANCE
                  </div>
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded">
                    FPS: 30 • LUX: {activeSession.perimeterSensors.ambientLux}
                  </div>
                </div>

                {/* Perimeter Sensor Controls / Diagnostics */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => onPingSensor(activeSession.id, { vibrationTamper: true })}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
                  >
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-amber-600" />
                      Vibration Sensor
                    </div>
                    <div className="text-xs font-bold text-amber-800 mt-0.5">
                      {activeSession.perimeterSensors.vibrationTamper ? 'ALERT: Shock' : 'Normal (No Tamper)'}
                    </div>
                  </button>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-600" />
                      Ambient Lux
                    </div>
                    <div className="text-xs font-bold text-emerald-800 mt-0.5">
                      {activeSession.perimeterSensors.ambientLux} Lux (High Illum)
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-sky-600" />
                      CCTV Health
                    </div>
                    <div className="text-xs font-bold text-sky-800 mt-0.5">
                      Online (Dome PTZ)
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-rose-600" />
                      SOS Dispatch
                    </div>
                    <div className="text-xs font-bold text-rose-800 mt-0.5">
                      112 Police Line
                    </div>
                  </div>
                </div>
              </div>

              {/* Safe-Walk Companion Feature */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Safe-Walk Companion</h3>
                      <p className="text-xs text-slate-500">
                        Walking from your vehicle to your destination? Start a virtual safety timer.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSafeWalkActive(!isSafeWalkActive)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSafeWalkActive
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {isSafeWalkActive ? 'Stop Companion' : 'Start Safe-Walk (5 min)'}
                  </button>
                </div>

                {isSafeWalkActive && (
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span>Virtual Escort Active. Automatic check-in verification in:</span>
                    </div>
                    <div className="font-mono text-base font-bold text-emerald-800">
                      {Math.floor(safeWalkTimer / 60)}:{(safeWalkTimer % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Live Safety Alerts & Telemetry Feed */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Radio className="w-4 h-4 text-indigo-600" />
                  Live Safety Alerts & Patrol Logs
                </h3>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {activeSession.alertsHistory.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-2xl border text-xs ${
                        alert.severity === 'critical'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : alert.severity === 'warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span className="font-bold uppercase tracking-wider">{alert.type.replace('_', ' ')}</span>
                        <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contacts Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chennai Emergency Hotlines
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                    <span>Greater Chennai Police (All Emergency)</span>
                    <strong className="text-rose-700 font-mono">112 / 100</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                    <span>GCC Smart Traffic Control Helpline</span>
                    <strong className="text-sky-700 font-mono">1913</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                    <span>Women Safety Helpline (Chennai)</span>
                    <strong className="text-emerald-700 font-mono">1091</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
