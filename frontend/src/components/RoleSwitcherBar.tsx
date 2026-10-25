import React from 'react';
import { User, UserRole } from '../types';
import { Shield, ChefHat, Bike, User as UserIcon, CheckCircle2 } from 'lucide-react';

interface Props {
  currentUser: User | null;
  onSwitchRole: (role: UserRole) => void;
  loadingRole: boolean;
}

export const RoleSwitcherBar: React.FC<Props> = ({ currentUser, onSwitchRole, loadingRole }) => {
  const roles: Array<{ role: UserRole; label: string; icon: any; color: string; desc: string }> = [
    {
      role: 'customer',
      label: 'Customer',
      icon: UserIcon,
      color: 'bg-emerald-600',
      desc: 'Order food, SmartBite AI, Budget Mode, Live Track'
    },
    {
      role: 'restaurant_owner',
      label: 'Restaurant Owner',
      icon: ChefHat,
      color: 'bg-orange-600',
      desc: 'Live Kitchen KOT, Menu Stock, Sales Copilot'
    },
    {
      role: 'rider',
      label: 'Delivery Partner',
      icon: Bike,
      color: 'bg-blue-600',
      desc: 'Accept deliveries, Navigation, Daily Earnings'
    },
    {
      role: 'admin',
      label: 'Administrator',
      icon: Shield,
      color: 'bg-purple-700',
      desc: 'Platform GMV, Restaurant & Rider Approvals'
    }
  ];

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-orange-400 tracking-wide uppercase text-[10px] bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60">
            QuickBite Ecosystem Role Switcher
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Active: <strong className="text-white capitalize">{currentUser?.role.replace('_', ' ') || 'Guest'}</strong> ({currentUser?.first_name || currentUser?.username})
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = currentUser?.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => onSwitchRole(r.role)}
                disabled={loadingRole}
                title={r.desc}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  isActive
                    ? `${r.color} text-white shadow-md ring-2 ring-white/20`
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                } ${loadingRole ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Icon size={13} />
                <span>{r.label}</span>
                {isActive && <CheckCircle2 size={12} className="text-white" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
