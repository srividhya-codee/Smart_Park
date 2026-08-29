import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Car, 
  Download, 
  Share2, 
  AlertCircle, 
  LogOut, 
  LogIn 
} from 'lucide-react';
import type { Reservation } from '../types';

interface PassModalProps {
  reservation: Reservation;
  onClose: () => void;
  onCheckIn: (resId: string) => void;
  onCheckOut: (resId: string) => void;
  onOpenGuardian: () => void;
}

export const PassModal: React.FC<PassModalProps> = ({
  reservation,
  onClose,
  onCheckIn,
  onCheckOut,
  onOpenGuardian
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(
      `SmartPark Chennai Pass: ${reservation.spotCode} (${reservation.spotName})\nPlate: ${reservation.vehiclePlate}\nPIN: ${reservation.pinCode}\nTotal: ₹${reservation.totalFeeINR}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompleted = reservation.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xl overflow-hidden my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="text-center pb-4 border-b border-slate-200">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {isCompleted ? 'Pass Completed' : 'GCC Valid Roadside Parking Pass'}
          </div>
          <h2 className="text-lg font-bold text-slate-900">SmartPark Digital Pass</h2>
          <p className="text-xs text-slate-500 font-mono">ID: {reservation.id}</p>
        </div>

        {/* QR Code & PIN Container */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex flex-col items-center justify-center shadow-xs">
          {/* Simulated SVG QR Code */}
          <div className="w-40 h-40 bg-slate-900 p-2 rounded-xl flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400">
              <rect x="5" y="5" width="25" height="25" fill="#10b981" rx="2" />
              <rect x="10" y="10" width="15" height="15" fill="#020617" rx="1" />
              <rect x="70" y="5" width="25" height="25" fill="#10b981" rx="2" />
              <rect x="75" y="10" width="15" height="15" fill="#020617" rx="1" />
              <rect x="5" y="70" width="25" height="25" fill="#10b981" rx="2" />
              <rect x="10" y="75" width="15" height="15" fill="#020617" rx="1" />
              {/* Pattern bits */}
              <circle cx="40" cy="20" r="3" fill="#10b981" />
              <circle cx="55" cy="20" r="3" fill="#10b981" />
              <circle cx="45" cy="35" r="3" fill="#10b981" />
              <circle cx="25" cy="50" r="3" fill="#10b981" />
              <circle cx="40" cy="50" r="3" fill="#10b981" />
              <circle cx="60" cy="50" r="3" fill="#10b981" />
              <circle cx="75" cy="50" r="3" fill="#10b981" />
              <circle cx="50" cy="65" r="3" fill="#10b981" />
              <circle cx="65" cy="75" r="3" fill="#10b981" />
              <circle cx="85" cy="80" r="3" fill="#10b981" />
              <circle cx="40" cy="85" r="3" fill="#10b981" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-slate-900 text-emerald-400 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/50">
                GCC
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-slate-800">
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Pass PIN</div>
              <div className="text-xl font-mono font-bold tracking-widest text-emerald-700">
                {reservation.pinCode}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Plate Number</div>
              <div className="text-sm font-mono font-bold text-slate-900">
                {reservation.vehiclePlate}
              </div>
            </div>
          </div>
        </div>

        {/* Bay & Timing Details */}
        <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Bay Name & Code</span>
              <span className="font-bold text-slate-900 text-sm">{reservation.spotName}</span>
              <span className="font-mono text-emerald-700 block text-xs mt-0.5">{reservation.spotCode}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Paid in ₹</span>
              <span className="text-slate-900 font-extrabold text-base font-mono">₹{reservation.totalFeeINR}</span>
              <span className="text-[10px] text-slate-500 block">{reservation.paymentMethod}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Duration: {reservation.durationHours} hrs
            </span>
            <span>
              Expires: {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Guardian Quick Link */}
        <div className="mt-4 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="text-xs font-bold text-slate-900">Virtual Guardian Active</div>
              <div className="text-[10px] text-indigo-700">Live CCTV & Chennai Police SOS</div>
            </div>
          </div>
          <button
            onClick={onOpenGuardian}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs"
          >
            Monitor
          </button>
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          {!isCompleted ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onCheckIn(reservation.id)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify In-Bay</span>
              </button>

              <button
                onClick={() => onCheckOut(reservation.id)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Check-Out (Leave)</span>
              </button>
            </div>
          ) : (
            <div className="p-2.5 text-center text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl">
              Roadside bay was vacated and released
            </div>
          )}

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Pass Details Copied to Clipboard!' : 'Share Pass on WhatsApp / SMS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
