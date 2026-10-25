import React, { useState } from 'react';
import { QuickBiteApi } from '../services/api';
import { UserRole } from '../types';
import { X, Lock, Mail, User as UserIcon, Phone, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await QuickBiteApi.register({
          username,
          email,
          password,
          role,
          phone,
          first_name: username
        });
      } else {
        await QuickBiteApi.login(username, password);
      }
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.username?.[0] ||
          'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-1 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-amber-500 flex items-center justify-center text-white mx-auto shadow-md font-extrabold text-xl">
            Q
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isRegister ? 'Join QuickBite Kerala' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Get ₹100 Welcome BitePoints on your first order'
              : 'Sign in to access your orders, saved addresses & BitePoints'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Username / Mobile</label>
            <div className="relative">
              <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Username or email"
                className="w-full bg-slate-50 p-2.5 pl-9 rounded-xl border border-slate-200 outline-none focus:border-[#FF5A36]"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 p-2.5 pl-9 rounded-xl border border-slate-200 outline-none focus:border-[#FF5A36]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone (Kerala)</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98470 12345"
                    className="w-full bg-slate-50 p-2.5 pl-9 rounded-xl border border-slate-200 outline-none focus:border-[#FF5A36]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 outline-none font-semibold text-slate-800"
                >
                  <option value="customer">Customer (Order Food & Track)</option>
                  <option value="restaurant_owner">Restaurant Owner (KOT & Menu)</option>
                  <option value="rider">Delivery Partner (Trips & Navigation)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 p-2.5 pl-9 rounded-xl border border-slate-200 outline-none focus:border-[#FF5A36]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF5A36] hover:bg-[#e04826] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer shadow-md shadow-orange-500/20 disabled:opacity-60"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isRegister ? 'Create QuickBite Account' : 'Sign In'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="font-bold text-[#FF5A36] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="font-bold text-[#FF5A36] hover:underline cursor-pointer"
              >
                Register Here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
