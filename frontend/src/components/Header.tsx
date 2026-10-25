import React, { useState } from 'react';
import { User, CartItem } from '../types';
import {
  MapPin,
  Search,
  Sparkles,
  Percent,
  Users,
  ShoppingBag,
  Coins,
  Calendar,
  User as UserIcon,
  Clock,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface Props {
  currentUser: User | null;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartItems: CartItem[];
  bitePoints: number;
  onOpenSmartBite: () => void;
  onOpenBudgetMode: () => void;
  onOpenGroupBite: () => void;
  onOpenMealPass: () => void;
  onOpenCart: () => void;
  onOpenBitePoints: () => void;
  onOpenOrders: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
}

export const Header: React.FC<Props> = ({
  currentUser,
  selectedCity,
  onSelectCity,
  searchQuery,
  onSearchChange,
  cartItems,
  bitePoints,
  onOpenSmartBite,
  onOpenBudgetMode,
  onOpenGroupBite,
  onOpenMealPass,
  onOpenCart,
  onOpenBitePoints,
  onOpenOrders,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  onLogoClick
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cities = ['Kochi', 'Trivandrum', 'Kozhikode', 'Thrissur'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={onLogoClick}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5A36] to-[#FF7A59] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-xl tracking-tight">Q</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-[#FF5A36] transition-colors">
                    Quick<span className="text-[#FF5A36]">Bite</span>
                  </span>
                  <span className="text-[10px] bg-orange-100 text-[#FF5A36] font-bold px-1.5 py-0.5 rounded-full uppercase">
                    Kerala
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  Fast • Fresh • Authentic
                </span>
              </div>
            </button>

            {/* City Selector */}
            <div className="relative hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors">
              <MapPin size={15} className="text-[#FF5A36]" />
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-1"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}, Kerala
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search restaurants, Malabar biryani, meals..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white pl-10 pr-4 py-2 text-xs font-medium rounded-full border border-slate-200 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 transition-all outline-none"
              />
            </div>
          </div>

          {/* Action Pills & Features */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* SmartBite AI button */}
            <button
              onClick={onOpenSmartBite}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 text-orange-700 border border-orange-200 hover:border-orange-400 hover:shadow-xs transition-all cursor-pointer"
            >
              <Sparkles size={14} className="text-orange-600 animate-pulse" />
              <span className="hidden sm:inline">SmartBite</span>
              <span className="font-bold">AI</span>
            </button>

            {/* QuickBite Budget Mode */}
            <button
              onClick={onOpenBudgetMode}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer"
            >
              <Percent size={14} className="text-emerald-600" />
              <span>Budget Mode</span>
            </button>

            {/* GroupBite */}
            <button
              onClick={onOpenGroupBite}
              title="Group Order with Friends"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Users size={14} className="text-slate-600" />
              <span>GroupBite</span>
            </button>

            {/* MealPass */}
            <button
              onClick={onOpenMealPass}
              title="Daily Kerala Meal Subscriptions"
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Calendar size={14} className="text-slate-600" />
              <span>MealPass</span>
            </button>

            {/* BitePoints Reward Pill */}
            {currentUser && (
              <button
                onClick={onOpenBitePoints}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Coins size={14} className="text-amber-500" />
                <span>{bitePoints}</span>
                <span className="hidden md:inline font-medium text-amber-600">pts</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2.5 rounded-full bg-slate-900 text-white hover:bg-black transition-colors cursor-pointer shadow-sm"
            >
              <ShoppingBag size={18} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5A36] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FF5A36] text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                    {currentUser.profile_photo ? (
                      <img
                        src={currentUser.profile_photo}
                        alt={currentUser.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUser.first_name?.[0] || currentUser.username[0]
                    )}
                  </div>
                  <ChevronDown size={14} className="text-slate-500" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">
                        {currentUser.first_name} {currentUser.last_name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 bg-orange-100 text-[#FF5A36] rounded-md">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon size={14} className="text-slate-500" />
                      <span>My Profile & Addresses</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenOrders();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Clock size={14} className="text-slate-500" />
                      <span>Order History & Tracking</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenBitePoints();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Coins size={14} className="text-amber-500" />
                      <span>BitePoints Rewards ({bitePoints} pts)</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-bold rounded-full bg-[#FF5A36] text-white hover:bg-[#e04826] transition-colors cursor-pointer shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="pb-3 lg:hidden">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search restaurants, dishes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-full border border-slate-200 focus:border-[#FF5A36] outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
