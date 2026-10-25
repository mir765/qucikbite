import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface Props {
  onApplyCouponCode?: (code: string) => void;
  onOpenBudgetMode: () => void;
  onOpenSmartBite: () => void;
}

export const PromotionalBanners: React.FC<Props> = ({
  onApplyCouponCode,
  onOpenBudgetMode,
  onOpenSmartBite
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const banners = [
    {
      id: 1,
      tag: 'FESTIVE OFFER',
      title: 'Malabar Coastal Food Fest',
      subtitle: 'Flat 50% OFF on Thalassery Biryanis, Karimeen & Seafood curries',
      code: 'QUICK50',
      cta: 'Explore Specialities',
      bgGradient: 'from-orange-600 via-rose-600 to-amber-600',
      action: onOpenSmartBite
    },
    {
      id: 2,
      tag: 'SMART SAVER',
      title: 'QuickBite Budget Mode™',
      subtitle: 'Meals under ₹99, ₹149 & ₹199 with guaranteed all-inclusive final billing!',
      code: 'BUDGET99',
      cta: 'Launch Budget Mode',
      bgGradient: 'from-emerald-700 via-teal-700 to-cyan-800',
      action: onOpenBudgetMode
    },
    {
      id: 3,
      tag: 'AUTHENTIC KERALA',
      title: 'Taste of God\'s Own Country',
      subtitle: 'Get 20% OFF on Puttu & Kadala, Appam Stew & Ghee Roast Dosas',
      code: 'KERALA20',
      cta: 'Order Now',
      bgGradient: 'from-amber-600 via-orange-700 to-red-700',
      action: onOpenSmartBite
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const current = banners[activeSlide];

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg mt-4 mb-8 text-white transition-all duration-700">
      <div
        className={`bg-gradient-to-r ${current.bgGradient} p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative`}
      >
        {/* Background decorative patterns */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute left-1/3 -top-12 w-48 h-48 rounded-full bg-black/10 blur-xl pointer-events-none"></div>

        <div className="space-y-3 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase">
            <Flame size={13} className="text-amber-300" />
            <span>{current.tag}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {current.title}
          </h2>

          <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
            {current.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={current.action}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <span>{current.cta}</span>
              <ArrowRight size={14} />
            </button>

            {current.code && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-xs font-semibold">
                <Tag size={13} className="text-amber-300" />
                <span>Use Code:</span>
                <span className="font-mono font-bold tracking-wider text-amber-300">
                  {current.code}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights on right */}
        <div className="hidden lg:flex flex-col gap-3 z-10 text-xs bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="font-semibold">FSSAI Certified Kerala Kitchens</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-300" />
            <span className="font-semibold">HonestTrack Delay Compensation Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-cyan-300" />
            <span className="font-semibold">Zero Surge Pricing in Budget Mode</span>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
