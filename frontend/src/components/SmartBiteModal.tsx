import React, { useState } from 'react';
import { QuickBiteApi } from '../services/api';
import { MenuItem } from '../types';
import {
  Sparkles,
  X,
  Search,
  ArrowRight,
  Flame,
  CheckCircle2,
  Info,
  Clock,
  Star,
  Plus
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

export const SmartBiteModal: React.FC<Props> = ({ isOpen, onClose, onAddToCart }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  if (!isOpen) return null;

  const samplePrompts = [
    'Find a filling dinner under ₹150',
    'Suggest spicy Kerala food near me',
    'Find vegetarian food for two people under ₹400',
    'Traditional Malabar Biryani specials',
    'Meals with lowest delivery charges'
  ];

  const handleSearch = async (textToSearch?: string) => {
    const q = textToSearch || query;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await QuickBiteApi.querySmartBite(q);
      setResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5A36] to-amber-500 flex items-center justify-center text-white shadow-md">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
                  SmartBite AI Assistant
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-600 text-white uppercase tracking-wider">
                  Intelligent Discovery
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ask in plain English: budgets, cravings, Kerala specialities & dietary needs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input & Chips */}
        <div className="p-5 border-b border-slate-100 space-y-3">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="e.g. Find spicy Kerala food under ₹200 for lunch..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-slate-50 focus:bg-white pl-4 pr-12 py-3 text-sm rounded-2xl border border-slate-200 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 outline-none transition-all"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="absolute right-2 p-2 bg-[#FF5A36] hover:bg-[#e04826] text-white rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">Try:</span>
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(p);
                  handleSearch(p);
                }}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 transition-colors cursor-pointer shrink-0 border border-slate-200"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-600">
                SmartBite AI is analyzing Kerala restaurants, menus, and transparent prices...
              </p>
            </div>
          )}

          {!loading && response && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 bg-orange-50 text-orange-800 px-2.5 py-1 rounded-lg border border-orange-200">
                  {response.summary}
                </span>
                <span className="text-[11px] text-slate-500">
                  {response.total_found} verified matches
                </span>
              </div>

              <div className="space-y-3">
                {response.results.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white"
                  >
                    <div className="flex gap-3.5 items-center">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {item.restaurant_name} • {item.portion_size}
                        </p>

                        {/* Transparent reason badge */}
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{item.transparent_reason}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 block sm:text-right">Payable:</span>
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{item.final_payable_amount}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onAddToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            restaurant_id: item.restaurant_id,
                            restaurant_name: item.restaurant_name,
                            image_url: item.image_url,
                            portion_size: item.portion_size,
                            is_veg: item.is_veg
                          });
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#FF5A36] hover:bg-[#e04826] text-white rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Plus size={13} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !response && (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                How SmartBite AI Works
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                SmartBite checks genuine live restaurant menus, calculates full payable totals
                including delivery and taxes, and explains exactly why each meal was chosen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
