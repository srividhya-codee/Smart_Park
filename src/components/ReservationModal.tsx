import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Lock, 
  Car, 
  Smartphone, 
  Radio 
} from 'lucide-react';
import type { ParkingSpot, VehicleType } from '../types';

interface ReservationModalProps {
  spot: ParkingSpot;
  onClose: () => void;
  onConfirm: (bookingDetails: {
    durationHours: number;
    vehiclePlate: string;
    vehicleType: VehicleType;
    paymentMethod: 'UPI' | 'FASTag' | 'Card' | 'NetBanking' | 'Cash on Bay';
    userName: string;
    userPhone: string;
  }) => void;
  lockExpiresAt?: number;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  spot,
  onClose,
  onConfirm,
  lockExpiresAt
}) => {
  const [durationHours, setDurationHours] = useState(2);
  const [vehiclePlate, setVehiclePlate] = useState('TN-09-CB-4821');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'FASTag' | 'Card' | 'NetBanking' | 'Cash on Bay'>('UPI');
  const [userName, setUserName] = useState('Srividhya N');
  const [userPhone, setUserPhone] = useState('+91 98401 54321');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fee calculation in ₹ INR
  const baseFee = spot.hourlyRateINR * durationHours;
  const convenienceFee = 5; // ₹5 GCC smart sensor infra fee
  const discount = durationHours >= 4 ? 15 : 0;
  const totalFee = baseFee + convenienceFee - discount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm({
        durationHours,
        vehiclePlate,
        vehicleType,
        paymentMethod,
        userName,
        userPhone
      });
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {spot.code}
          </span>
          <span className="text-xs text-slate-500 font-medium">GCC Smart Roadside Bay</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{spot.name}</h2>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {spot.streetAddress}
        </p>

        {/* Redis Hold Status */}
        {lockExpiresAt && (
          <div className="mt-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center gap-1.5 font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Redis Mutex Lock Active
            </span>
            <span className="font-mono font-bold text-amber-700">120s Hold Guaranteed</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Duration of Stay (Hours)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[1, 2, 3, 4, 6, 8].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setDurationHours(h)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                    durationHours === h
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {h} {h === 1 ? 'hr' : 'hrs'}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Registration Plate (TN)
              </label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="e.g. TN-09-CB-4821"
                required
                className="w-full bg-slate-50 text-slate-900 font-mono text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Category
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-600"
              >
                <option value="car">Car (Sedan / Hatchback)</option>
                <option value="suv">SUV (Creta, XUV, Thar)</option>
                <option value="two_wheeler">Two-Wheeler (Motorcycle / Scooter)</option>
                <option value="ev_car">Electric Vehicle (EV Car)</option>
                <option value="ev_scooter">Electric Scooter (Ather/Ola)</option>
              </select>
            </div>
          </div>

          {/* Driver Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full bg-slate-50 text-slate-900 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (SMS / WhatsApp Pass)
              </label>
              <input
                type="text"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                required
                className="w-full bg-slate-50 text-slate-900 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Payment Method (Indian Rupee ₹)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI', label: 'UPI (GPay / PhonePe)', icon: Smartphone },
                { id: 'FASTag', label: 'FASTag Auto-Debit', icon: Radio },
                { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard }
              ].map(method => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Breakdown in ₹ INR */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Roadside Bay Fee ({durationHours} hrs × ₹{spot.hourlyRateINR})</span>
              <span className="font-mono text-slate-900 font-semibold">₹{baseFee}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>GCC Smart Infrastructure & Sensor Fee</span>
              <span className="font-mono text-slate-900 font-semibold">₹{convenienceFee}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span>Long-Stay Discount (4+ hrs)</span>
                <span className="font-mono">-₹{discount}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Total Payable Amount</span>
              <span className="text-emerald-700 font-mono text-base">₹{totalFee}</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            id="btn-confirm-pay-pass"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing GCC Roadside Pass...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Pay ₹{totalFee} & Generate Digital Pass</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
