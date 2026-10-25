import React, { useState, useEffect } from 'react';
import { QuickBiteApi } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Bike,
  Power,
  Navigation,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const RiderDashboardView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'delivery' | 'earnings'>('delivery');
  const [otpInput, setOtpInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await QuickBiteApi.getRiderDashboard();
      setData(res);
      if (res?.profile) {
        setIsOnline(res.profile.is_online);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      await QuickBiteApi.toggleRiderStatus(newStatus);
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePickupOrder = async (orderNumber: string) => {
    setActionLoading(true);
    try {
      await QuickBiteApi.updateOrderStatus(orderNumber, 'PICKED_UP');
      await QuickBiteApi.updateOrderStatus(orderNumber, 'OUT_FOR_DELIVERY');
      loadDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteDelivery = async (orderNumber: string) => {
    setActionLoading(true);
    try {
      await QuickBiteApi.updateOrderStatus(orderNumber, 'DELIVERED');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      loadDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-2">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Connecting to Rider Terminal...</p>
      </div>
    );
  }

  const profile = data?.profile;
  const activeDelivery = data?.active_delivery;
  const availableRequests = data?.available_requests || [];
  const metrics = data?.metrics;
  const earningsHistory = data?.earnings_history || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Rider Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
            🏍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">
                {profile?.rider_name || 'Amal Jose'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Verified Rider
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile?.vehicle_type} ({profile?.vehicle_number}) • Rating: {profile?.rating} ★
            </p>
          </div>
        </div>

        {/* Online / Offline Toggle */}
        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs transition-all cursor-pointer shadow-md ${
            isOnline
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              : 'bg-rose-600 text-white hover:bg-rose-700'
          }`}
        >
          <Power size={15} />
          <span>{isOnline ? 'YOU ARE ONLINE' : 'YOU ARE OFFLINE'}</span>
        </button>
      </div>

      {/* Rider KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 font-medium block">Today's Earnings</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
            ₹{metrics?.total_earnings?.toLocaleString() || '450'}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">+ Tips & Incentives</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 font-medium block">Completed Trips</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            {metrics?.completed_trips || '148'}
          </span>
          <span className="text-[10px] text-slate-500">100% on-time record</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 font-medium block">Rider Rating</span>
          <span className="text-xl font-extrabold text-amber-600 mt-1 block">
            {profile?.rating || '4.88'} ★
          </span>
          <span className="text-[10px] text-slate-500">Customer feedback</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 font-medium block">Wallet Balance</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            ₹{profile?.wallet_balance?.toLocaleString() || '1,840'}
          </span>
          <span className="text-[10px] text-blue-600 font-bold">Ready for withdrawal</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('delivery')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'delivery'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Deliveries & Incoming Requests
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'earnings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daily Trip Earnings Ledger
        </button>
      </div>

      {/* ACTIVE DELIVERY TAB */}
      {activeTab === 'delivery' && (
        <div className="space-y-5">
          {!isOnline && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>You are currently OFFLINE. Toggle online above to receive delivery orders.</span>
            </div>
          )}

          {/* ACTIVE ASSIGNED DELIVERY CARD */}
          {activeDelivery ? (
            <div className="p-6 rounded-3xl bg-white border-2 border-blue-500 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-800 uppercase">
                  ACTIVE DELIVERY IN PROGRESS
                </span>
                <span className="font-mono font-bold text-xs text-slate-900">
                  {activeDelivery.order_number}
                </span>
              </div>

              {/* Waypoint 1: Restaurant Pickup */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                      Step 1: Pickup from Kitchen
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      {activeDelivery.restaurant_name}
                    </h3>
                    <p className="text-xs text-slate-500">{activeDelivery.restaurant_address}</p>
                  </div>

                  <a
                    href={`tel:${activeDelivery.restaurant_phone || '+914842368800'}`}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Phone size={14} />
                  </a>
                </div>

                {activeDelivery.status !== 'OUT_FOR_DELIVERY' &&
                  activeDelivery.status !== 'DELIVERED' && (
                    <button
                      onClick={() => handlePickupOrder(activeDelivery.order_number)}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-2"
                    >
                      {actionLoading ? 'Updating...' : '✓ Confirm Pickup at Restaurant'}
                    </button>
                  )}
              </div>

              {/* Waypoint 2: Customer Delivery Destination */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      Step 2: Deliver to Customer
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      {activeDelivery.customer_name || 'Rahul Nair'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activeDelivery.delivery_address?.address_line1 || 'Skyline Imperial, Marine Drive'}
                    </p>
                  </div>

                  <a
                    href={`tel:${activeDelivery.customer_phone || '+919847012345'}`}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Phone size={14} />
                  </a>
                </div>

                {activeDelivery.status === 'OUT_FOR_DELIVERY' && (
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleCompleteDelivery(activeDelivery.order_number)}
                      disabled={actionLoading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-transform active:scale-98 cursor-pointer shadow-md"
                    >
                      {actionLoading ? 'Finalizing...' : '✓ Confirm Handover & Complete Delivery'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
              <Bike size={32} className="mx-auto text-slate-300" />
              <h3 className="font-bold text-sm text-slate-800">No Active Delivery Right Now</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You are currently queued for high-priority dispatches around Marine Drive, MG Road & Kakkanad.
              </p>
            </div>
          )}
        </div>
      )}

      {/* EARNINGS HISTORY TAB */}
      {activeTab === 'earnings' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Trip Earnings & Payout Ledger</h3>

          <div className="space-y-2">
            {earningsHistory.map((entry: any) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{entry.description}</h4>
                  <p className="text-[10px] text-slate-400">
                    {new Date(entry.created_at).toLocaleDateString()} • {entry.earning_type.replace('_', ' ')}
                  </p>
                </div>

                <span className="font-extrabold text-sm text-emerald-700">
                  +₹{entry.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
