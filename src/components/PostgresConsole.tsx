import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Terminal, 
  Play, 
  Table, 
  Key, 
  Layers, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Copy 
} from 'lucide-react';
import type { PostgresTableMeta } from '../types';

export const PostgresConsole: React.FC = () => {
  const [tables, setTables] = useState<PostgresTableMeta[]>([]);
  const [query, setQuery] = useState<string>("SELECT code, name, zone, hourly_rate_inr, status, is_ev_charging FROM parking_spots WHERE status = 'available';");
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTableTab, setActiveTableTab] = useState<string>('parking_spots');

  useEffect(() => {
    fetch('/api/sql/tables')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.tables) {
          setTables(data.tables);
        }
      })
      .catch(console.error);
  }, []);

  const handleExecuteSQL = async (sqlToRun?: string) => {
    const q = sqlToRun || query;
    if (!q.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/sql/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (e: any) {
      setQueryResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    {
      title: 'Vacant EV Roadside Bays in Chennai',
      sql: "SELECT code, name, zone, hourly_rate_inr, ev_charger_power_kw FROM parking_spots WHERE is_ev_charging = true AND status = 'available';"
    },
    {
      title: 'Active Chennai Reservations & Total Invoiced (₹)',
      sql: 'SELECT id, spot_id, user_name, vehicle_plate, total_fee_inr, payment_method, status FROM reservations;'
    },
    {
      title: 'Current Redis Mutex Lock Keys with TTL',
      sql: 'SELECT key, spot_id, user_name, ttl_seconds, lock_state FROM redis_locks;'
    },
    {
      title: 'Aggregate GCC Revenue & Parking Count',
      sql: 'SELECT COUNT(*) as total_spots, AVG(hourly_rate_inr) as avg_rate_inr, SUM(total_fee_inr) as total_revenue_inr FROM parking_spots;'
    }
  ];

  return (
    <div id="postgres-console-container" className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
            <Database className="w-3.5 h-3.5 text-sky-600" />
            PostgreSQL 16 Relational Engine
          </span>
          <span className="text-xs text-slate-500 font-medium">Chennai Geospatial & Invoicing Store</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Interactive SQL Console & Relational Schema Explorer
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Inspect relational tables (`parking_spots`, `reservations`, `redis_locks`, `community_reports`), test dynamic queries, join statements, and verify ACID transactions.
        </p>
      </div>

      {/* SQL Editor Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            PostgreSQL Query Editor
          </h2>

          {/* Quick Query Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-500 mr-1 font-semibold shrink-0">Presets:</span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sq.sql);
                  handleExecuteSQL(sq.sql);
                }}
                className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 whitespace-nowrap transition-colors"
              >
                {sq.title}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 text-slate-800 font-mono text-xs p-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:bg-white shadow-inner"
            placeholder="Write standard SQL statements (SELECT, INSERT, UPDATE, JOIN)..."
          />
          <button
            id="btn-execute-sql"
            onClick={() => handleExecuteSQL()}
            disabled={loading || !query.trim()}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>Execute SQL</span>
          </button>
        </div>

        {/* Query Result Viewer */}
        {queryResult && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Query Execution Success: <strong className="text-slate-900">{queryResult.rowsAffected || 0} rows</strong> returned
              </span>
              <span className="font-mono text-slate-500">
                Latency: <strong className="text-emerald-700">{queryResult.executionTimeMs || 0.8} ms</strong>
              </span>
            </div>

            {queryResult.error ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {queryResult.error}
              </div>
            ) : queryResult.rows && queryResult.rows.length > 0 ? (
              <div className="overflow-x-auto bg-slate-50 rounded-2xl border border-slate-200 max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                    <tr className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                      {Object.keys(queryResult.rows[0]).map(col => (
                        <th key={col} className="p-2.5 font-mono">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {queryResult.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="text-slate-700 hover:bg-slate-100/70">
                        {Object.values(row).map((val: any, cIdx: number) => (
                          <td key={cIdx} className="p-2.5 truncate max-w-xs">
                            {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') :
                             typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">
                Query returned 0 rows.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Relational Schema Browser */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Table className="w-4 h-4 text-sky-600" />
          Database Schema & Table Catalogs
        </h2>

        {/* Table Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
          {tables.map(t => (
            <button
              key={t.tableName}
              onClick={() => setActiveTableTab(t.tableName)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTableTab === t.tableName
                  ? 'bg-sky-50 text-sky-800 border border-sky-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{t.tableName}</span>
              <span className="text-[10px] px-1.5 rounded bg-slate-200 text-slate-700">
                {t.rowCount}
              </span>
            </button>
          ))}
        </div>

        {/* Active Table Schema Details */}
        {tables.find(t => t.tableName === activeTableTab) && (() => {
          const t = tables.find(tab => tab.tableName === activeTableTab)!;
          return (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-500">{t.description}</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="pb-2 pl-2">Column Name</th>
                      <th className="pb-2">PostgreSQL Data Type</th>
                      <th className="pb-2">Constraint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {t.columns.map(col => (
                      <tr key={col.name} className="text-slate-700">
                        <td className="py-2.5 pl-2 font-bold text-slate-900 flex items-center gap-1.5">
                          {col.isPrimary && <Key className="w-3 h-3 text-amber-600" />}
                          {col.name}
                        </td>
                        <td className="py-2.5 text-sky-700">{col.type}</td>
                        <td className="py-2.5">
                          {col.isPrimary && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">PRIMARY KEY</span>}
                          {col.isForeign && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">FOREIGN KEY</span>}
                          {!col.isPrimary && !col.isForeign && <span className="text-slate-400 text-[11px]">NULLABLE</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
