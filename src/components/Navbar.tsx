import React from 'react';
import { 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Lock, 
  BarChart3, 
  Database, 
  Layers, 
  Clock, 
  Zap, 
  Radio, 
  AlertTriangle 
} from 'lucide-react';
import type { EcoImpactMetrics, RedisLock } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeLocks: RedisLock[];
  ecoMetrics: EcoImpactMetrics | null;
  onOpenParkMate: () => void;
  onOpenRaceModal?: () => void;
  userRole: 'user' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeLocks,
  ecoMetrics,
  onOpenParkMate,
  userRole
}) => {
  const [istTime, setIstTime] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setIstTime(new Intl.DateTimeFormat('en-IN', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'spots', label: 'Roadside Bays & Map', icon: MapPin },
    { id: 'parkmate', label: 'ParkMate AI', icon: Sparkles, badge: 'AI' },
    { id: 'reports', label: 'Road Intel', icon: Radio },
    { id: 'passes', label: 'My Bookings', icon: FileText },
    { id: 'redis', label: 'Redis Locks', icon: Lock, count: activeLocks.length },
    { id: 'admin', label: 'Admin & GCC', icon: BarChart3 },
    { id: 'sql', label: 'PostgreSQL DB', icon: Database },
    { id: 'architecture', label: 'Architecture & API', icon: Layers }
  ];

  return (
    <header id="smartpark-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('spots')}>
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-xs text-white font-black text-lg">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">SmartPark</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Chennai
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">AI Roadside Parking & Virtual Guardian</p>
          </div>
        </div>

        {/* AI Fast Search Button */}
        <button
          id="btn-trigger-parkmate-bar"
          onClick={onOpenParkMate}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium transition-all group"
        >
          <Sparkles className="w-4 h-4 text-emerald-600 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Ask ParkMate AI</span>
          <span className="sm:hidden">AI Search</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-white rounded border border-emerald-200 text-emerald-700 font-mono">
            Natural Lang
          </kbd>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-200 pt-1 pb-1.5">
        {navItems
          .filter(item => {
            if (userRole === 'user') {
              return !['redis', 'admin', 'sql', 'architecture'].includes(item.id);
          }
          return true;
          })
          .map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isActive ? 'bg-slate-800 text-emerald-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && item.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
