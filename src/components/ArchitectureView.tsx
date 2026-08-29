import React, { useState } from 'react';
import { 
  Layers, 
  Server, 
  Database, 
  Lock, 
  Sparkles, 
  Cpu, 
  Terminal, 
  Copy, 
  Check, 
  Code, 
  ExternalLink 
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/parkmate/query',
      desc: 'Ask ParkMate AI natural-language parking needs for Chennai in INR (₹)',
      curl: `curl -X POST http://localhost:3000/api/parkmate/query \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Need safe parking near Pondy Bazaar for 2 hours with EV charger under ₹100", "userVehicleType": "ev_car"}'`
    },
    {
      method: 'GET',
      path: '/api/spots?zone=T.+Nagar',
      desc: 'Fetch Chennai roadside spots with filter params (evOnly, maxPrice, status)',
      curl: `curl -X GET "http://localhost:3000/api/spots?zone=T.%20Nagar%20(Pondy%20Bazaar%20/%20Usman%20Rd)&evOnly=true"`
    },
    {
      method: 'POST',
      path: '/api/spots/spot-tnagar-01/lock',
      desc: 'Acquire 120-second Redis atomic mutex lock on roadside bay',
      curl: `curl -X POST http://localhost:3000/api/spots/spot-tnagar-01/lock \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "usr-chennai-1", "userName": "Srividhya"}'`
    },
    {
      method: 'POST',
      path: '/api/spots/spot-tnagar-01/reserve',
      desc: 'Confirm reservation, generate digital pass, QR code, PIN, and calculate ₹ fee',
      curl: `curl -X POST http://localhost:3000/api/spots/spot-tnagar-01/reserve \\
  -H "Content-Type: application/json" \\
  -d '{"durationHours": 2, "vehiclePlate": "TN-09-CB-4821", "paymentMethod": "UPI"}'`
    },
    {
      method: 'POST',
      path: '/api/guardian/guard-ses-101/trigger-sos',
      desc: 'Trigger emergency SOS broadcast to Greater Chennai Police Control (100 / 112)',
      curl: `curl -X POST http://localhost:3000/api/guardian/guard-ses-101/trigger-sos`
    },
    {
      method: 'POST',
      path: '/api/sql/query',
      desc: 'Execute dynamic SQL against PostgreSQL relational engine',
      curl: `curl -X POST http://localhost:3000/api/sql/query \\
  -H "Content-Type: application/json" \\
  -d '{"query": "SELECT code, name, hourly_rate_inr FROM parking_spots WHERE status = \\'available\\';"}'`
    }
  ];

  const handleCopy = (curl: string, index: number) => {
    navigator.clipboard.writeText(curl);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div id="architecture-view-container" className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            System Architecture & REST Endpoints
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Full-Stack SmartPark Engineering Blueprint
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          React + TypeScript, Node.js + Express, PostgreSQL 16 Relational Engine, Redis Distributed Mutex Locks, Gemini 2.5 Flash, Docker and REST API interfaces.
        </p>
      </div>

      {/* Architecture Modules Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Frontend Layer */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Cpu className="w-4 h-4 text-emerald-600" />
            Client-Side Presentation
          </div>
          <p className="text-xs text-slate-500">
            React 19, TypeScript, Tailwind CSS v4, Motion animations, Interactive Chennai Vector Map, and Digital QR Pass generator.
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-700 space-y-1 font-mono">
            <div>• Real-time IST Chennai Clock</div>
            <div>• 120s Redis Countdown Timers</div>
            <div>• INR (₹) Dynamic Fee Calculator</div>
            <div>• Mobile-responsive Grid / Map Sync</div>
          </div>
        </div>

        {/* Backend & AI Layer */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
            <Server className="w-4 h-4 text-sky-600" />
            Node.js & Gemini AI Backend
          </div>
          <p className="text-xs text-slate-500">
            Express REST APIs + Gemini 2.5 Flash SDK (`@google/genai`) parsing user natural language requests for Chennai localities.
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-700 space-y-1 font-mono">
            <div>• ParkMate AI NLP Pipeline</div>
            <div>• Multi-Criteria Bayesian Spot Scoring</div>
            <div>• Virtual Guardian Telemetry</div>
            <div>• GCC Incident Aggregator</div>
          </div>
        </div>

        {/* Persistence & Redis Mutex */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <Database className="w-4 h-4 text-amber-600" />
            PostgreSQL & Redis Storage
          </div>
          <p className="text-xs text-slate-500">
            PostgreSQL 16 relational store with ACID guarantees paired with an in-memory Redis mutex lock manager for zero double-booking.
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-700 space-y-1 font-mono">
            <div>• `parking_spots` Geospatial Table</div>
            <div>• `reservations` Invoicing Table (₹)</div>
            <div>• Redis `SETNX` 120s Mutex Hold</div>
            <div>• Dynamic SQL Execution Engine</div>
          </div>
        </div>
      </div>

      {/* REST API Documentation with cURL Examples */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Code className="w-4 h-4 text-emerald-600" />
          REST API Interface & cURL Specifications
        </h2>

        <div className="space-y-4">
          {apiEndpoints.map((ep, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono border ${
                    ep.method === 'POST' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-sky-50 text-sky-800 border-sky-200'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">{ep.path}</span>
                </div>

                <button
                  onClick={() => handleCopy(ep.curl, idx)}
                  className="self-start sm:self-auto flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIdx === idx ? 'Copied cURL' : 'Copy cURL'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">{ep.desc}</p>

              <pre className="bg-white p-3 rounded-xl text-[11px] font-mono text-slate-800 overflow-x-auto border border-slate-200">
                {ep.curl}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
