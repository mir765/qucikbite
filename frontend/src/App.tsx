import React, { useState, useEffect } from 'react';
import { User, UserRole, Restaurant, MenuItem, CartItem, LastCallBite } from './types';
import { QuickBiteApi } from './services/api';

import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { Header } from './components/Header';
import { PromotionalBanners } from './components/PromotionalBanners';
import { FilterPills } from './components/FilterPills';
import { RestaurantCard } from './components/RestaurantCard';
import { LastCallSection } from './components/LastCallSection';
import { RestaurantDetailView } from './components/RestaurantDetailView';
import { DishCustomizationModal } from './components/DishCustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { SmartBiteModal } from './components/SmartBiteModal';
import { BudgetModeModal } from './components/BudgetModeModal';
import { GroupBiteModal } from './components/GroupBiteModal';
import { BitePointsModal } from './components/BitePointsModal';
import { MealPassModal } from './components/MealPassModal';
import { LiveTrackingModal } from './components/LiveTrackingModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { RestaurantDashboardView } from './components/RestaurantDashboardView';
import { RiderDashboardView } from './components/RiderDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AuthModal } from './components/AuthModal';

import { Flame, Sparkles, Check, Heart, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  // User & Role State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingRole, setLoadingRole] = useState(false);

  // App Discovery State
  const [selectedCity, setSelectedCity] = useState('Kochi');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isPureVeg, setIsPureVeg] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [selectedRestaurantSlug, setSelectedRestaurantSlug] = useState<string | null>(null);

  // Cart & Rewards State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('quickbite_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [bitePoints, setBitePoints] = useState(128);

  // Modals
  const [isSmartBiteOpen, setIsSmartBiteOpen] = useState(false);
  const [isBudgetModeOpen, setIsBudgetModeOpen] = useState(false);
  const [isGroupBiteOpen, setIsGroupBiteOpen] = useState(false);
  const [isMealPassOpen, setIsMealPassOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBitePointsOpen, setIsBitePointsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [liveTrackingOrderNumber, setLiveTrackingOrderNumber] = useState<string | null>(null);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('quickbite_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Load Initial User & Restaurants
  useEffect(() => {
    // Attempt getMe or fallback to customer
    QuickBiteApi.getMe()
      .then((user) => {
        setCurrentUser(user);
      })
      .catch(() => {
        // Switch to demo customer
        QuickBiteApi.switchDemoRole('customer').then((res) => {
          setCurrentUser(res.user);
        });
      });

    loadRestaurants();
    loadBitePoints();
  }, []);

  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const data = await QuickBiteApi.getRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to load restaurants', err);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const loadBitePoints = async () => {
    try {
      const res = await QuickBiteApi.getBitePoints();
      setBitePoints(res.balance);
    } catch {
      // keep fallback
    }
  };

  // Switch demo persona
  const handleSwitchRole = async (role: UserRole) => {
    setLoadingRole(true);
    try {
      const res = await QuickBiteApi.switchDemoRole(role);
      setCurrentUser(res.user);
      setSelectedRestaurantSlug(null);
      showToast(`Switched persona to ${res.user.role.replace('_', ' ').toUpperCase()}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRole(false);
    }
  };

  // Cart operations
  const handleAddToCart = (item: any) => {
    // Convert to MenuItem structure if from SmartBite / BudgetMode
    const menuItem: MenuItem = {
      id: item.id,
      restaurant: item.restaurant_id || item.restaurant || 1,
      category: item.category || 1,
      name: item.name,
      description: item.description || '',
      image_url: item.image_url,
      price: item.price || item.dish_price,
      is_veg: item.is_veg ?? true,
      is_available: true,
      preparation_time_mins: item.preparation_time_mins || 15,
      spice_level: item.spice_level || 'medium',
      portion_size: item.portion_size || 'Serves 1',
      ingredients: item.ingredients || [],
      allergens: item.allergens || [],
      stock_quantity: 40,
      is_bestseller: false
    };

    setCartItems((prev) => {
      // Check multi-restaurant conflict
      if (prev.length > 0 && prev[0].menu_item.restaurant !== menuItem.restaurant) {
        if (
          !window.confirm(
            'Your cart already contains dishes from another restaurant. Clear previous items and start an order here?'
          )
        ) {
          return prev;
        }
        return [{ menu_item: menuItem, quantity: 1 }];
      }

      const existingIndex = prev.findIndex((i) => i.menu_item.id === menuItem.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      }
      return [...prev, { menu_item: menuItem, quantity: 1 }];
    });

    showToast(`Added ${item.name} to cart!`);
  };

  const handleConfirmCustomization = (customized: {
    menu_item: MenuItem;
    quantity: number;
    selected_customizations: Record<string, string>;
    special_instructions: string;
    final_price: number;
  }) => {
    setCartItems((prev) => {
      if (prev.length > 0 && prev[0].menu_item.restaurant !== customized.menu_item.restaurant) {
        if (
          !window.confirm(
            'Your cart already contains dishes from another restaurant. Clear previous items?'
          )
        ) {
          return prev;
        }
        return [
          {
            menu_item: customized.menu_item,
            quantity: customized.quantity,
            selected_customizations: customized.selected_customizations,
            special_instructions: customized.special_instructions
          }
        ];
      }

      return [
        ...prev,
        {
          menu_item: customized.menu_item,
          quantity: customized.quantity,
          selected_customizations: customized.selected_customizations,
          special_instructions: customized.special_instructions
        }
      ];
    });

    showToast(`Added customized ${customized.menu_item.name} to cart!`);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      setCartItems((prev) => {
        const copy = [...prev];
        copy[index].quantity = newQty;
        return copy;
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((r) => {
    if (isPureVeg && !r.is_pure_veg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCuisine = r.cuisines?.some((c) => c.toLowerCase().includes(q));
      const matchArea = r.area?.toLowerCase().includes(q);
      if (!matchName && !matchCuisine && !matchArea) return false;
    }
    if (activeFilter === 'kerala') {
      return r.cuisines?.some((c) => ['kerala', 'malabar', 'south indian'].includes(c.toLowerCase()));
    }
    if (activeFilter === 'fast') {
      return r.avg_delivery_time_mins <= 25;
    }
    if (activeFilter === 'top_rated') {
      return r.rating >= 4.7;
    }
    if (activeFilter === 'budget') {
      return r.price_range === '$';
    }
    if (activeFilter === 'seafood') {
      return r.cuisines?.some((c) => c.toLowerCase().includes('seafood'));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col font-sans">
      
      {/* 1. Global Role Switcher Bar */}
      <RoleSwitcherBar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        loadingRole={loadingRole}
      />

      {/* 2. Brand Header & Navbar */}
      <Header
        currentUser={currentUser}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartItems={cartItems}
        bitePoints={bitePoints}
        onOpenSmartBite={() => setIsSmartBiteOpen(true)}
        onOpenBudgetMode={() => setIsBudgetModeOpen(true)}
        onOpenGroupBite={() => setIsGroupBiteOpen(true)}
        onOpenMealPass={() => setIsMealPassOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBitePoints={() => setIsBitePointsOpen(true)}
        onOpenOrders={() => setLiveTrackingOrderNumber('QB-20261025-0102')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          localStorage.removeItem('quickbite_token');
          handleSwitchRole('customer');
        }}
        onLogoClick={() => setSelectedRestaurantSlug(null)}
      />

      {/* 3. Main Views Router Based on Active Role */}
      <main className="flex-1">
        
        {/* ROLE A: CUSTOMER VIEW */}
        {(!currentUser || currentUser.role === 'customer') && (
          <div>
            {selectedRestaurantSlug ? (
              /* Restaurant Details & RealPlate Menu */
              <RestaurantDetailView
                restaurantIdOrSlug={selectedRestaurantSlug}
                onBack={() => setSelectedRestaurantSlug(null)}
                onAddToCart={handleAddToCart}
                onOpenCustomization={(item) => setCustomizingItem(item)}
              />
            ) : (
              /* Homepage & Discovery */
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                
                {/* Hero Promo Banners */}
                <PromotionalBanners
                  onOpenBudgetMode={() => setIsBudgetModeOpen(true)}
                  onOpenSmartBite={() => setIsSmartBiteOpen(true)}
                />

                {/* LastCall Bites Surplus Deals */}
                <LastCallSection
                  onSelectItem={(bite) => {
                    handleAddToCart({
                      id: bite.id,
                      restaurant_id: bite.restaurant,
                      restaurant_name: bite.restaurant_name,
                      name: bite.title,
                      price: bite.discounted_price,
                      image_url: bite.image_url,
                      portion_size: 'Surplus Bundle',
                      is_veg: false
                    });
                  }}
                />

                {/* Filter Pills */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Kitchens in {selectedCity}, Kerala
                  </h2>
                  <span className="text-xs font-semibold text-slate-500">
                    {filteredRestaurants.length} Verified Spots
                  </span>
                </div>

                <FilterPills
                  activeFilter={activeFilter}
                  onSelectFilter={setActiveFilter}
                  isPureVeg={isPureVeg}
                  onTogglePureVeg={() => setIsPureVeg(!isPureVeg)}
                />

                {/* Restaurants Grid */}
                {loadingRestaurants ? (
                  <div className="py-24 text-center space-y-2">
                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-semibold text-slate-500">
                      Loading Kerala food delivery spots...
                    </p>
                  </div>
                ) : filteredRestaurants.length === 0 ? (
                  <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
                    <div className="text-3xl">🍲</div>
                    <h3 className="font-bold text-base text-slate-900">
                      No matching restaurants found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try clearing your search filters or browse other Kerala specialities like Malabar
                      biryanis, Appam stew or Karimeen.
                    </p>
                    <button
                      onClick={() => {
                        setActiveFilter('all');
                        setIsPureVeg(false);
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onClick={() => setSelectedRestaurantSlug(restaurant.slug || String(restaurant.id))}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ROLE B: RESTAURANT DASHBOARD */}
        {currentUser?.role === 'restaurant_owner' && <RestaurantDashboardView />}

        {/* ROLE C: DELIVERY PARTNER / RIDER VIEW */}
        {currentUser?.role === 'rider' && <RiderDashboardView />}

        {/* ROLE D: ADMINISTRATOR DASHBOARD */}
        {currentUser?.role === 'admin' && <AdminDashboardView />}
      </main>

      {/* 4. Footer */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF5A36] text-white flex items-center justify-center font-extrabold text-lg">
                Q
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Quick<span className="text-[#FF5A36]">Bite</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Complete food delivery ecosystem engineered for Kerala, India. Featuring SmartBite AI,
              Budget Mode, RealPlate transparency, and HonestTrack delivery.
            </p>
            <div className="text-slate-500 text-[11px]">
              © {new Date().getFullYear()} QuickBite Technologies Inc.
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
              Active Kerala Hubs
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>Kochi (Marine Drive, Kakkanad, Fort Kochi)</li>
              <li>Trivandrum (Technopark, Kowdiar)</li>
              <li>Kozhikode (SM Street, Mavoor Road)</li>
              <li>Thrissur (Round, Swaraj Round)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
              Core Innovations
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>SmartBite AI Food Assistant</li>
              <li>QuickBite Budget Mode™</li>
              <li>RealPlate™ Nutrition Transparency</li>
              <li>GroupBite Collaborative Ordering</li>
              <li>LastCall Bites Surplus Reduction</li>
              <li>HonestTrack™ Delivery Guarantee</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
              Food Safety & Standards
            </h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              100% of QuickBite partner kitchens are verified under the Food Safety and Standards
              Authority of India (FSSAI).
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck size={16} />
              <span>FSSAI Certified Ecosystem</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderSuccess={(orderNum) => {
          setLiveTrackingOrderNumber(orderNum);
          loadBitePoints();
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <SmartBiteModal
        isOpen={isSmartBiteOpen}
        onClose={() => setIsSmartBiteOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <BudgetModeModal
        isOpen={isBudgetModeOpen}
        onClose={() => setIsBudgetModeOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <GroupBiteModal
        isOpen={isGroupBiteOpen}
        onClose={() => setIsGroupBiteOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <MealPassModal
        isOpen={isMealPassOpen}
        onClose={() => setIsMealPassOpen(false)}
      />

      <BitePointsModal
        isOpen={isBitePointsOpen}
        onClose={() => setIsBitePointsOpen(false)}
        onPointsRedeemed={loadBitePoints}
      />

      <LiveTrackingModal
        isOpen={!!liveTrackingOrderNumber}
        orderNumber={liveTrackingOrderNumber}
        onClose={() => setLiveTrackingOrderNumber(null)}
      />

      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onTrackOrder={(num) => setLiveTrackingOrderNumber(num)}
      />

      <DishCustomizationModal
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
        onConfirm={handleConfirmCustomization}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={() => {
          QuickBiteApi.getMe().then(setCurrentUser);
          loadBitePoints();
        }}
      />

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
