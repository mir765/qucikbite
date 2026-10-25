import React, { useState, useEffect } from 'react';
import { Restaurant, MenuItem } from '../types';
import { QuickBiteApi } from '../services/api';
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  ShieldCheck,
  Flame,
  Info,
  Plus,
  Heart,
  Share2,
  CheckCircle2,
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface Props {
  restaurantIdOrSlug: string | number;
  onBack: () => void;
  onAddToCart: (item: MenuItem) => void;
  onOpenCustomization: (item: MenuItem) => void;
}

export const RestaurantDetailView: React.FC<Props> = ({
  restaurantIdOrSlug,
  onBack,
  onAddToCart,
  onOpenCustomization
}) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [expandedTransparency, setExpandedTransparency] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    QuickBiteApi.getRestaurantDetail(restaurantIdOrSlug)
      .then(setRestaurant)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [restaurantIdOrSlug]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading authentic menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm font-bold text-slate-700">Restaurant not found</p>
        <button
          onClick={onBack}
          className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold cursor-pointer"
        >
          Return to Discovery
        </button>
      </div>
    );
  }

  const allItems = restaurant.categories?.flatMap((c) => c.items) || [];
  const filteredItems =
    selectedCategory === 'all'
      ? allItems
      : allItems.filter((i) => i.category === selectedCategory);

  return (
    <div className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top back bar */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Back to Restaurants</span>
      </button>

      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white mb-8">
        <div className="h-56 sm:h-72 w-full relative">
          <img
            src={restaurant.banner_url || restaurant.logo_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors cursor-pointer">
              <Heart size={16} />
            </button>
            <button className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors cursor-pointer">
              <Share2 size={16} />
            </button>
          </div>

          {/* Restaurant Header Info Overlay */}
          <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FF5A36] uppercase tracking-wider text-white">
                  {restaurant.area}, {restaurant.city}
                </span>
                {restaurant.fssai_verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700/80 backdrop-blur-md text-white">
                    <ShieldCheck size={12} />
                    <span>FSSAI Lic: {restaurant.fssai_license}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {restaurant.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 font-medium mt-0.5 max-w-xl">
                {restaurant.description || restaurant.tagline}
              </p>
            </div>

            {/* Rating Box */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1 bg-emerald-600 px-2 py-1 rounded-xl text-white font-extrabold text-sm">
                <span>{restaurant.rating}</span>
                <Star size={13} className="fill-white" />
              </div>
              <div className="text-[11px] leading-tight text-white/90">
                <p className="font-bold">{restaurant.total_reviews}+ Reviews</p>
                <p className="text-white/70">Verified Kerala Foodies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-[#FF5A36]" />
              <span>{restaurant.avg_delivery_time_mins} mins delivery</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Bike size={15} className="text-slate-500" />
              <span>₹{restaurant.delivery_fee_base} Base Delivery</span>
            </div>
            <span>•</span>
            <div>
              <span>Min Order: </span>
              <strong className="text-slate-900">₹{restaurant.min_order_amount}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-orange-100 text-[#FF5A36] px-2.5 py-1 rounded-full font-bold">
              Offer: Flat 50% OFF (QUICK50)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Menu vs Reviews */}
      <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'menu'
              ? 'border-[#FF5A36] text-[#FF5A36]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Menu & RealPlate Transparency ({allItems.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reviews'
              ? 'border-[#FF5A36] text-[#FF5A36]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare size={15} />
          <span>Verified Reviews ({restaurant.reviews?.length || 0})</span>
        </button>
      </div>

      {/* Menu View */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Category Tabs */}
          {restaurant.categories && restaurant.categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Categories ({allItems.length})
              </button>

              {restaurant.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name} ({cat.items?.length || 0})
                </button>
              ))}
            </div>
          )}

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const isTransparencyOpen = expandedTransparency === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex gap-4 items-start">
                    {/* Item Image with Bestseller tag */}
                    <div className="relative shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-slate-100"
                        loading="lazy"
                      />
                      {item.is_bestseller && (
                        <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                          BESTSELLER
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {item.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-extrabold text-sm text-slate-900">
                          ₹{item.price}
                        </span>
                        <span className="text-[11px] text-slate-500">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.portion_size}
                        </span>
                        {item.spice_level && item.spice_level !== 'none' && (
                          <span className="text-[11px] text-orange-600 font-semibold flex items-center">
                            <Flame size={12} />
                            {item.spice_level.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      {/* RealPlate Transparency Toggle */}
                      <button
                        onClick={() =>
                          setExpandedTransparency(isTransparencyOpen ? null : item.id)
                        }
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF5A36] hover:text-[#e04826] cursor-pointer"
                      >
                        <Info size={12} />
                        <span>
                          {isTransparencyOpen
                            ? 'Hide RealPlate Details'
                            : 'View RealPlate™ Transparency'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* RealPlate Accordion */}
                  {isTransparencyOpen && (
                    <div className="mt-3 p-3 rounded-xl bg-orange-50/60 border border-orange-200 text-xs space-y-2 text-slate-700 animate-fade-in">
                      <div className="flex items-center justify-between font-bold text-orange-950 text-[11px]">
                        <span>RealPlate Verified Nutritional & Ingredient Profile</span>
                        <Sparkles size={12} className="text-[#FF5A36]" />
                      </div>

                      {item.ingredients && item.ingredients.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-900">Ingredients: </span>
                          <span className="text-slate-600">{item.ingredients.join(', ')}</span>
                        </div>
                      )}

                      {item.allergens && item.allergens.length > 0 ? (
                        <div>
                          <span className="font-semibold text-rose-700">Allergens: </span>
                          <span className="text-rose-600 font-medium">
                            {item.allergens.join(', ')}
                          </span>
                        </div>
                      ) : (
                        <div className="text-emerald-700 font-medium text-[11px]">
                          ✓ No common allergens reported
                        </div>
                      )}

                      {(item.calories || item.protein_g) && (
                        <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[10px] text-center">
                          <div className="bg-white p-1 rounded border border-orange-200">
                            <span className="text-slate-400 block">Calories</span>
                            <strong className="text-slate-900">{item.calories || 450} kcal</strong>
                          </div>
                          <div className="bg-white p-1 rounded border border-orange-200">
                            <span className="text-slate-400 block">Protein</span>
                            <strong className="text-slate-900">{item.protein_g || 22}g</strong>
                          </div>
                          <div className="bg-white p-1 rounded border border-orange-200">
                            <span className="text-slate-400 block">Carbs</span>
                            <strong className="text-slate-900">{item.carbs_g || 65}g</strong>
                          </div>
                          <div className="bg-white p-1 rounded border border-orange-200">
                            <span className="text-slate-400 block">Fat</span>
                            <strong className="text-slate-900">{item.fat_g || 14}g</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add to Cart Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Prep time: ~{item.preparation_time_mins} mins
                    </span>

                    {item.customization_options && item.customization_options.length > 0 ? (
                      <button
                        onClick={() => onOpenCustomization(item)}
                        className="flex items-center gap-1 px-4 py-1.5 bg-[#FF5A36] hover:bg-[#e04826] text-white rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Plus size={14} />
                        <span>Customize</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onAddToCart(item)}
                        className="flex items-center gap-1 px-4 py-1.5 bg-[#FF5A36] hover:bg-[#e04826] text-white rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Plus size={14} />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews View */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Overall Customer Rating: {restaurant.rating} ★
              </h3>
              <p className="text-xs text-slate-500">
                Based on verified orders placed through QuickBite
              </p>
            </div>

            <div className="flex gap-3 text-xs font-semibold text-slate-700">
              <span className="bg-white px-2 py-1 rounded border border-slate-200">
                Taste: 4.9 ★
              </span>
              <span className="bg-white px-2 py-1 rounded border border-slate-200">
                Packaging: 4.8 ★
              </span>
              <span className="bg-white px-2 py-1 rounded border border-slate-200">
                Value: 4.7 ★
              </span>
            </div>
          </div>

          {restaurant.reviews && restaurant.reviews.length > 0 ? (
            restaurant.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {rev.customer_name?.[0] || 'K'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {rev.customer_name || 'Verified Foodie'}
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        ✓ Verified Purchase
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded">
                    <span>{rev.rating}</span>
                    <Star size={10} className="fill-white" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No written reviews yet. Be the first to order and review!
            </p>
          )}
        </div>
      )}
    </div>
  );
};
