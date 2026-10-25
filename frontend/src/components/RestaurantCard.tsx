import React from 'react';
import { Restaurant } from '../types';
import { Star, Clock, Bike, ShieldCheck, Tag } from 'lucide-react';

interface Props {
  restaurant: Restaurant;
  onClick: () => void;
}

export const RestaurantCard: React.FC<Props> = ({ restaurant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
    >
      {/* Banner / Food Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={restaurant.banner_url || restaurant.logo_url}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Dark subtle gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"></div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {restaurant.is_open ? (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Open Now
            </span>
          ) : (
            <span className="bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Closed
            </span>
          )}

          {restaurant.is_pure_veg && (
            <span className="bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Pure Veg
            </span>
          )}
        </div>

        {/* Delivery Time Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
          <Clock size={12} className="text-orange-400" />
          <span>{restaurant.avg_delivery_time_mins} mins</span>
        </div>

        {/* FSSAI Verified Pill */}
        {restaurant.fssai_verified && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md text-emerald-400 text-[11px] font-semibold px-2 py-1 rounded-lg">
            <ShieldCheck size={13} />
            <span className="text-white text-[10px]">FSSAI</span>
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-slate-900 group-hover:text-[#FF5A36] transition-colors line-clamp-1">
              {restaurant.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 bg-emerald-700 text-white text-xs font-extrabold px-1.5 py-0.5 rounded-md shrink-0">
              <span>{restaurant.rating}</span>
              <Star size={11} className="fill-white" />
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
            {restaurant.cuisines?.join(', ')} • {restaurant.area}
          </p>

          <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-1">
            "{restaurant.tagline || 'Authentic Kerala flavours'}"
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1 text-slate-600">
            <Bike size={13} className="text-slate-400" />
            <span>₹{restaurant.delivery_fee_base} Delivery</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">Min:</span>
            <span className="font-semibold text-slate-700">₹{restaurant.min_order_amount}</span>
          </div>

          <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
            {restaurant.price_range}
          </span>
        </div>

        {/* Promo tag */}
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
          <Tag size={12} />
          <span>Flat 50% OFF up to ₹100 • Use QUICK50</span>
        </div>
      </div>
    </div>
  );
};
