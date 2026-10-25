import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { QuickBiteApi } from '../services/api';
import {
  X,
  Clock,
  Bike,
  ShieldCheck,
  AlertTriangle,
  Phone,
  CheckCircle2,
  MapPin,
  RefreshCw,
  RotateCcw
} from 'lucide-react';

interface Props {
  orderNumber: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshOrders?: () => void;
}

export const LiveTrackingModal: React.FC<Props> = ({
  orderNumber,
  isOpen,
  onClose,
  onRefreshOrders
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestingRefund, setRequestingRefund] = useState(false);
  const [refundStatus, setRefundStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderNumber) {
      loadTracking();
      const interval = setInterval(loadTracking, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen, orderNumber]);

  const loadTracking = async () => {
    if (!orderNumber) return;
    try {
      const res = await QuickBiteApi.getOrderTracking(orderNumber);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!orderNumber) return;
    setRequestingRefund(true);
    try {
      const res = await QuickBiteApi.requestRefund(orderNumber, 'Customer initiated cancellation request.');
      setRefundStatus(res.message);
      loadTracking();
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setRequestingRefund(false);
    }
  };

  if (!isOpen || !orderNumber) return null;

  const order: Order | undefined = data?.order;
  const honestTrack = data?.honest_track;

  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', time: 'Just now' },
    { key: 'ACCEPTED', label: 'Restaurant Accepted', time: '2m' },
    { key: 'PREPARING', label: 'Kitchen Preparing', time: '10m' },
    { key: 'READY_FOR_PICKUP', label: 'Food Packed', time: '18m' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', time: '24m' },
    { key: 'DELIVERED', label: 'Delivered', time: '30m' }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PLACED':
      case 'CONFIRMED':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY_FOR_PICKUP':
      case 'PICKED_UP':
        return 3;
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 0;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FF5A36] text-white">
                LIVE TRACKING
              </span>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 font-mono">
                {orderNumber}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              HonestTrack™ Real-Time Delivery Progress
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadTracking}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              title="Refresh tracking status"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading || !order ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-slate-500">Fetching live order status...</p>
          </div>
        ) : (
          <div className="p-5 overflow-y-auto flex-1 space-y-6">
            
            {/* ETA Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-600 via-[#FF5A36] to-amber-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div>
                <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider block">
                  Estimated Delivery Time
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mt-0.5">
                  {order.status === 'DELIVERED' ? 'Order Delivered!' : '25 - 30 Minutes'}
                </h3>
                <p className="text-xs text-white/90 mt-1">
                  Status: <strong className="uppercase">{order.status.replace('_', ' ')}</strong>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium space-y-1">
                <div className="flex items-center gap-1.5 text-amber-200">
                  <ShieldCheck size={14} />
                  <span>HonestTrack Guarantee</span>
                </div>
                <p className="text-[11px] text-white/90">
                  On-time promise: Delayed &gt;15m? Receive ₹50 in BitePoints.
                </p>
              </div>
            </div>

            {/* Simulated Live Route Map View */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 p-4 space-y-3 relative">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#FF5A36]" />
                  <span>Route: {order.restaurant_name} → Marine Drive, Kochi</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                  GPS Active (9.9816° N, 76.2999° E)
                </span>
              </div>

              {/* Graphical Visualizer */}
              <div className="h-28 rounded-xl bg-slate-900 text-white relative overflow-hidden flex items-center justify-between px-6 sm:px-12">
                {/* Background grid lines */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]"></div>

                {/* Restaurant node */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-md">
                    🍳
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 mt-1">Kitchen</span>
                </div>

                {/* Animated rider icon progressing */}
                <div className="flex-1 mx-4 relative flex items-center">
                  <div className="w-full h-1 bg-slate-700 rounded-full relative">
                    <div
                      className="h-1 bg-[#FF5A36] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (currentStepIdx / 5) * 100)}%` }}
                    ></div>
                  </div>

                  <div
                    className="absolute -top-3 transform -translate-x-1/2 transition-all duration-1000"
                    style={{ left: `${Math.min(95, Math.max(5, (currentStepIdx / 5) * 100))}%` }}
                  >
                    <div className="p-1.5 rounded-full bg-white text-slate-900 shadow-lg animate-pulse">
                      <Bike size={16} className="text-[#FF5A36]" />
                    </div>
                  </div>
                </div>

                {/* Customer node */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md">
                    🏠
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 mt-1">You</span>
                </div>
              </div>
            </div>

            {/* Status Stepper */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Progress Stepper
              </h4>

              <div className="space-y-3 relative pl-6 border-l-2 border-slate-200 ml-3">
                {steps.map((st, sIdx) => {
                  const isCompleted = sIdx <= currentStepIdx;
                  const isCurrent = sIdx === currentStepIdx;

                  return (
                    <div key={st.key} className="relative">
                      {/* Node circle */}
                      <div
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white transition-colors ${
                          isCompleted ? 'bg-[#FF5A36]' : 'bg-slate-300'
                        } ${isCurrent ? 'ring-4 ring-orange-200 animate-pulse' : ''}`}
                      />

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isCompleted ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {st.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{st.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rider Card */}
            {order.delivery_partner_name && (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    🏍️
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      Rider: {order.delivery_partner_name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Hero Splendor • Rating: 4.88 ★ • 148 Deliveries
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${order.delivery_partner_phone || '+919447199887'}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  <Phone size={12} className="text-[#FF5A36]" />
                  <span>Call Rider</span>
                </a>
              </div>
            )}

            {/* Order Items & Breakdown */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-xs text-slate-800">Order Summary</h4>
              {order.items?.map((it, i) => (
                <div key={i} className="flex justify-between text-slate-600">
                  <span>
                    {it.quantity}x {it.item_name}
                  </span>
                  <span>₹{it.total_price}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900">
                <span>Paid via {order.payment_method.toUpperCase()}</span>
                <span className="text-[#FF5A36]">₹{order.total_amount}</span>
              </div>
            </div>

            {/* Refund / Cancellation button */}
            {refundStatus ? (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                ✓ {refundStatus}
              </div>
            ) : (
              order.status !== 'DELIVERED' &&
              order.status !== 'REFUNDED' && (
                <div className="pt-2">
                  <button
                    onClick={handleRefund}
                    disabled={requestingRefund}
                    className="w-full py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>
                      {requestingRefund
                        ? 'Processing Refund...'
                        : 'Cancel Order & Request Full Refund'}
                    </span>
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
