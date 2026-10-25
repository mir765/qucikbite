import React, { useState, useEffect } from 'react';
import { QuickBiteApi } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Calendar,
  X,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MealPassModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await QuickBiteApi.getMealPass();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: any) => {
    setSubscribing(true);
    try {
      await QuickBiteApi.subscribeMealPass({
        plan_name: plan.title,
        plan_duration: 'weekly',
        meal_type: 'lunch',
        price_paid: plan.weekly_price
      });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setSuccessMsg(`Subscribed to ${plan.title}! Starting tomorrow at 12:30 PM.`);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubscribing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white">MealPass™ Subscriptions</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-950 uppercase">
                  Daily Kerala Feasts
                </span>
              </div>
              <p className="text-xs text-white/90">
                Rotational home-style Kerala lunches delivered daily at your scheduled slot. Pause or skip anytime.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Active subscriptions */}
          {data?.my_subscriptions && data.my_subscriptions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                My Active Subscriptions
              </h4>

              <div className="space-y-2">
                {data.my_subscriptions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {sub.plan_name}
                        </span>
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Active from {sub.start_date} to {sub.end_date} • Daily Delivery at 12:45 PM
                      </p>
                    </div>

                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer shadow-xs">
                      <Pause size={12} />
                      <span>Pause</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plans browser */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Curated Kerala Meal Plans
            </h4>

            <div className="space-y-3">
              {data?.available_plans?.map((plan: any) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {plan.cuisine}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{plan.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="sm:text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{plan.weekly_price}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        per week (7 days)
                      </span>
                    </div>

                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={subscribing}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
