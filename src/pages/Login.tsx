import React, { useState } from 'react';
import { Car, Eye, EyeOff, Lock, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'user' | 'admin') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    onLogin(email === 'admin@smartpark.com' ? 'admin' : 'user');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl shadow-lg mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            SmartPark
          </h1>

          <p className="text-slate-500 mt-2">
            Smart parking made simple
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">

          <h2 className="text-2xl font-bold text-slate-900 text-center">
            Welcome Back!
          </h2>

          <p className="text-sm text-slate-500 text-center mt-2 mb-6">
            Login to continue to SmartPark
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-emerald-800 text-center">
               Demo Access — No signup required
            </p>

            <p className="text-xs text-slate-600 text-center mt-2">
              👤 User: Enter any valid email and password
            </p>

            <p className="text-xs text-slate-600 text-center mt-1">
              🛡️ Admin: Use admin@smartpark.com and any password
            </p>
</div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                className="text-emerald-600 font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Login
            </button>

          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Demo version • No signup required
          </p>

        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 SmartPark
        </p>

      </div>
    </div>
  );
}