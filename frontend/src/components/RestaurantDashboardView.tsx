import React, { useState, useEffect } from 'react';
import { QuickBiteApi } from '../services/api';
import {
  ChefHat,
  Clock,
  Printer,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Plus,
  RefreshCw,
  UtensilsCrossed,
  DollarSign,
  Package
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const RestaurantDashboardView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics' | 'settlements'>('orders');
  const [kotModalOrder, setKotModalOrder] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  // Add dish form state
  const [showAddDish, setShowAddDish] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishVeg, setNewDishVeg] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadMenu();
    const interval = setInterval(loadDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await QuickBiteApi.getRestaurantDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMenu = async () => {
    try {
      const items = await QuickBiteApi.getRestaurantDashboard();
      // Items are included in popular or can be fetched
      setMenuItems(items?.popular_dishes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderNumber: string, newStatus: string) => {
    try {
      await QuickBiteApi.updateOrderStatus(orderNumber, newStatus);
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStock = async (itemId: number, currentAvailable: boolean) => {
    try {
      await QuickBiteApi.updateMenuItem(itemId, { is_available: !currentAvailable });
      loadMenu();
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;
    try {
      await QuickBiteApi.createMenuItem({
        restaurant: data?.restaurant?.id || 1,
        category: 1,
        name: newDishName,
        description: newDishDesc || 'Freshly prepared Kerala delicacy',
        image_url:
          'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
        price: parseFloat(newDishPrice),
        is_veg: newDishVeg,
        is_available: true,
        preparation_time_mins: 15,
        spice_level: 'medium',
        portion_size: 'Serves 1',
        stock_quantity: 40
      });
      setShowAddDish(false);
      setNewDishName('');
      setNewDishPrice('');
      setNewDishDesc('');
      loadMenu();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-2">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Connecting to Restaurant KOT system...</p>
      </div>
    );
  }

  const metrics = data?.metrics;
  const recentOrders = data?.recent_orders || [];
  const copilot = data?.sales_copilot;

  // Hourly demand trend mock for Recharts
  const hourlyData = [
    { time: '11 AM', orders: 4 },
    { time: '12 PM', orders: 14 },
    { time: '1 PM', orders: 28 },
    { time: '2 PM', orders: 18 },
    { time: '6 PM', orders: 8 },
    { time: '8 PM', orders: 32 },
    { time: '9 PM', orders: 24 },
    { time: '10 PM', orders: 10 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Restaurant Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md">
            <ChefHat size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {data?.restaurant?.name || 'Malabar Grand Kitchen'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                Active & Accepting Orders
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Kitchen Control Terminal • Marine Drive, Kochi • FSSAI Verified
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh KOT</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 text-xs font-semibold block">Today's Sales</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            ₹{metrics?.total_revenue?.toLocaleString() || '0'}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">Gross Orders Value</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 text-xs font-semibold block">Pending Action</span>
          <span className="text-xl font-extrabold text-orange-600 mt-1 block">
            {metrics?.pending_orders || 0}
          </span>
          <span className="text-[10px] text-orange-500 font-bold">Needs Confirmation</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 text-xs font-semibold block">In Kitchen</span>
          <span className="text-xl font-extrabold text-blue-600 mt-1 block">
            {metrics?.preparing_orders || 0}
          </span>
          <span className="text-[10px] text-blue-500 font-bold">Currently Cooking</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 text-xs font-semibold block">Ready for Pickup</span>
          <span className="text-xl font-extrabold text-purple-600 mt-1 block">
            {metrics?.ready_orders || 0}
          </span>
          <span className="text-[10px] text-purple-500 font-bold">Awaiting Rider</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 text-xs font-semibold block">Net Payout Est.</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
            ₹{metrics?.net_payout?.toLocaleString() || '0'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">After 15% Commission</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold text-slate-600">
        {[
          { id: 'orders', label: 'Live KOT Board & Operations' },
          { id: 'menu', label: 'Menu Stock & Instant Availability' },
          { id: 'analytics', label: 'Sales Copilot & Peak Hours' },
          { id: 'settlements', label: 'Financial Settlements & Commission' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: LIVE KOT BOARD */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Kitchen Order Tickets (KOT)
            </h3>
            <span className="text-xs text-slate-500">Real-time status synchronizer</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOrders.map((ord: any) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {ord.order_number}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        ord.status === 'PREPARING'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'READY_FOR_PICKUP'
                          ? 'bg-purple-100 text-purple-800'
                          : ord.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Customer: <strong>{ord.customer_name || 'Rahul Nair'}</strong>
                  </p>

                  {/* Items */}
                  <div className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1 font-medium text-slate-700">
                    {ord.items?.map((it: any, iIdx: number) => (
                      <div key={iIdx} className="flex justify-between">
                        <span>
                          {it.quantity}x {it.item_name}
                        </span>
                        <span className="font-bold">₹{it.total_price}</span>
                      </div>
                    ))}
                  </div>

                  {ord.delivery_instructions && (
                    <p className="text-[10px] text-slate-500 italic">
                      Note: "{ord.delivery_instructions}"
                    </p>
                  )}
                </div>

                {/* KOT Operations */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setKotModalOrder(ord)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-black cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Print KOT</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {ord.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.order_number, 'ACCEPTED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Accept
                      </button>
                    )}

                    {ord.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.order_number, 'PREPARING')}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Start Cooking
                      </button>
                    )}

                    {ord.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.order_number, 'READY_FOR_PICKUP')}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Mark Ready
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MENU STOCK MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Menu Item Stock & Instant Availability Switch
              </h3>
              <p className="text-xs text-slate-500">
                Sold out of fresh Karimeen or Biryani? Toggle off instantly to prevent customer orders.
              </p>
            </div>

            <button
              onClick={() => setShowAddDish(!showAddDish)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5A36] text-white rounded-xl text-xs font-bold hover:bg-[#e04826] cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Dish</span>
            </button>
          </div>

          {showAddDish && (
            <form
              onSubmit={handleAddDish}
              className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-3 shadow-sm max-w-xl"
            >
              <h4 className="font-bold text-slate-900">Add New Dish to Menu</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Dish Name (e.g. Malabar Fish Fry)"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  required
                  className="p-2.5 rounded-xl border border-slate-200 outline-none"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newDishPrice}
                  onChange={(e) => setNewDishPrice(e.target.value)}
                  required
                  className="p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <textarea
                placeholder="Dish description & ingredients..."
                value={newDishDesc}
                onChange={(e) => setNewDishDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none resize-none h-16"
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={newDishVeg}
                    onChange={(e) => setNewDishVeg(e.target.checked)}
                  />
                  <span>Pure Vegetarian</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-black"
                >
                  Create Dish
                </button>
              </div>
            </form>
          )}

          {/* Menu Items Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Dish</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3">Live Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{item.name}</td>
                    <td className="p-3">{item.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}</td>
                    <td className="p-3 font-bold">₹{item.price}</td>
                    <td className="p-3">{item.stock_quantity || 45} units</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStock(item.id, item.is_available)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          item.is_available
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {item.is_available ? '✓ In Stock' : '✕ Sold Out'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SALES COPILOT & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* AI Sales Copilot Suggestion Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border border-orange-200 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#FF5A36] animate-pulse" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-orange-900">
                QuickBite Kitchen Copilot™ Insights
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              💡 {copilot?.smart_suggestion || 'Anticipate peak lunch traffic between 1:00 PM and 2:15 PM.'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-900 font-semibold pt-1">
              <AlertTriangle size={13} className="text-amber-600" />
              <span>{copilot?.inventory_alert || 'Ghee & spices stock levels healthy.'}</span>
            </div>
          </div>

          {/* Peak Hours Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900">
              Peak Hours Arrival Volume (Today)
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#FF5A36" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTLEMENTS & COMMISSION */}
      {activeTab === 'settlements' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">
            Financial Reconciliation & Net Bank Settlement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Gross Merchandise Value</span>
              <p className="text-lg font-extrabold text-slate-900 mt-1">
                ₹{metrics?.total_revenue || 0}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Platform Commission (15%)</span>
              <p className="text-lg font-extrabold text-rose-600 mt-1">
                -₹{Math.round(Number(metrics?.total_revenue || 0) * 0.15)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 font-bold">Net Payout to Bank</span>
              <p className="text-lg font-extrabold text-emerald-900 mt-1">
                ₹{metrics?.net_payout || 0}
              </p>
              <span className="text-[10px] text-emerald-700">Settled daily by 11:00 PM</span>
            </div>
          </div>
        </div>
      )}

      {/* KOT Printable Modal Slip */}
      {kotModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full font-mono text-xs space-y-3 border border-slate-200 shadow-2xl">
            <div className="text-center border-b border-dashed border-slate-400 pb-3">
              <h3 className="font-bold text-sm tracking-widest uppercase">
                {data?.restaurant?.name || 'QUICKBITE KITCHEN'}
              </h3>
              <p className="text-[10px] text-slate-500">KITCHEN ORDER TICKET (KOT)</p>
              <p className="font-bold text-xs mt-1">Order #{kotModalOrder.order_number}</p>
              <p className="text-[10px] text-slate-400">
                {new Date(kotModalOrder.created_at).toLocaleString()}
              </p>
            </div>

            <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
              {kotModalOrder.items?.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between font-bold">
                  <span>
                    {it.quantity}x {it.item_name}
                  </span>
                  <span>₹{it.total_price}</span>
                </div>
              ))}
            </div>

            <div className="text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{kotModalOrder.items_subtotal}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total:</span>
                <span>₹{kotModalOrder.total_amount}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer text-xs"
              >
                Print Slip
              </button>
              <button
                onClick={() => setKotModalOrder(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
