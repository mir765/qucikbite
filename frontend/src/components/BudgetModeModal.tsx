import React, { useState, useEffect } from 'react';
import { QuickBiteApi } from '../services/api';
import {
  Percent,
  X,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Users,
  Leaf,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

export const BudgetModeModal: React.FC<Props> = ({ isOpen, onClose, onAddToCart }) => {
  const [budget, setBudget] = useState(199);
  const [isVeg, setIsVeg] = useState(false);
  const [people, setPeople] = useState(1);
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);

  const presets = [99, 149, 199, 299];

  useEffect(() => {
    if (isOpen) {
      loadMeals(budget, isVeg, people);
    }
  }, [isOpen, budget, isVeg, people]);

  const loadMeals = async (b: number, veg: boolean, p: number) => {
    setLoading(true);
    try {
      const data = await QuickBiteApi.getBudgetMeals(b, veg, p);
      setMeals(data.meals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
              <Percent size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white">QuickBite Budget Mode™</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-900 uppercase">
                  Guaranteed Cap
                </span>
              </div>
              <p className="text-xs text-white/90">
                Food + 5% GST + Delivery + Platform Fee ≤ Your Selected Budget. Guaranteed.
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

        {/* Controls: Preset chips & Filters */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Select Target Budget:</span>
              <span className="text-sm font-extrabold text-emerald-700">₹{budget} max</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {presets.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBudget(amt)}
                  className={`py-2 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                    budget === amt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Slider & Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVeg(!isVeg)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  isVeg
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <Leaf size={13} />
                <span>Pure Veg Only</span>
              </button>

              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 text-xs font-bold text-slate-700">
                <Users size={13} className="text-slate-500" />
                <button
                  onClick={() => setPeople(1)}
                  className={`px-2 py-0.5 rounded-full cursor-pointer ${
                    people === 1 ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`}
                >
                  1 Person
                </button>
                <button
                  onClick={() => setPeople(2)}
                  className={`px-2 py-0.5 rounded-full cursor-pointer ${
                    people === 2 ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`}
                >
                  2 People
                </button>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck size={13} />
              <span>Zero hidden surprises at checkout</span>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3.5">
          {loading && (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">
                Calculating exact fees for eligible meals...
              </p>
            </div>
          )}

          {!loading && meals.length === 0 && (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">
                No eligible meals found under ₹{budget}
              </p>
              <p className="text-xs text-slate-500">
                Try raising the budget to ₹149 or ₹199 to unlock complete combo meals with delivery!
              </p>
            </div>
          )}

          {!loading &&
            meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
              >
                <div className="flex gap-3.5 items-center">
                  <img
                    src={meal.image_url}
                    alt={meal.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          meal.is_veg ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <h4 className="font-bold text-sm text-slate-900">{meal.name}</h4>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium">
                      {meal.restaurant_name} • {meal.portion_size}
                    </p>

                    {/* Price breakdown pill */}
                    <div className="mt-2 text-[10px] text-slate-600 bg-slate-100 px-2 py-1 rounded-md font-mono flex flex-wrap gap-x-2">
                      <span>Dish: ₹{meal.dish_price}</span>
                      <span>•</span>
                      <span>GST: ₹{meal.tax_amount}</span>
                      <span>•</span>
                      <span>Delivery: ₹{meal.delivery_fee}</span>
                      <span>•</span>
                      <span>Fee: ₹{meal.platform_fee}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Guaranteed Final:
                    </span>
                    <span className="text-lg font-extrabold text-emerald-800">
                      ₹{meal.final_payable_amount}
                    </span>
                    <span className="text-[10px] text-emerald-600 block font-semibold">
                      ₹{meal.remaining_budget} under budget
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart({
                        id: meal.id,
                        name: meal.name,
                        price: meal.dish_price,
                        restaurant_id: meal.restaurant_id,
                        restaurant_name: meal.restaurant_name,
                        image_url: meal.image_url,
                        portion_size: meal.portion_size,
                        is_veg: meal.is_veg
                      });
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Plus size={13} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
