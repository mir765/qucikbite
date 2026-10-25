import React, { useEffect, useState } from 'react';
import { LastCallBite } from '../types';
import { QuickBiteApi } from '../services/api';
import { Clock, Tag, Flame, ShieldAlert, ArrowRight } from 'lucide-react';

interface Props {
  onSelectItem: (bite: LastCallBite) => void;
}

export const LastCallSection: React.FC<Props> = ({ onSelectItem }) => {
  const [bites, setBites] = useState<LastCallBite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    QuickBiteApi.getLastCallBites()
      .then(setBites)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || bites.length === 0) return null;

  return (
    <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-orange-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-600 text-white shadow-sm">
            <Flame size={18} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                LastCall Bites™
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase">
                Up to 45% OFF
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Freshly prepared surplus evening bundles. Zero food waste, maximum savings!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full border border-orange-200">
          <Clock size={13} className="text-orange-600" />
          <span>Order before daily cutoff (10:45 PM)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bites.map((bite) => {
          const discountPct = Math.round(
            ((Number(bite.original_price) - Number(bite.discounted_price)) /
              Number(bite.original_price)) *
              100
          );

          return (
            <div
              key={bite.id}
              className="bg-white rounded-2xl p-4 border border-orange-100 shadow-xs hover:shadow-md transition-shadow flex gap-4 items-center"
            >
              <img
                src={bite.image_url}
                alt={bite.title}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {discountPct}% OFF
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 truncate">
                    {bite.restaurant_name} ({bite.restaurant_area})
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                  {bite.title}
                </h3>

                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {bite.description}
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{bite.discounted_price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{bite.original_price}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectItem(bite)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Claim</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-rose-600 font-semibold">
                  <span>Only {bite.quantity_remaining} left</span>
                  <span>•</span>
                  <span>Ready by {bite.pickup_deadline}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
