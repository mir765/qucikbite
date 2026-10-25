import React, { useState, useEffect } from 'react';
import { CartItem, CustomerAddress, User } from '../types';
import { QuickBiteApi } from '../services/api';
import confetti from 'canvas-confetti';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  MapPin,
  CreditCard,
  Smartphone,
  Banknote,
  ShieldCheck,
  ArrowRight,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser: User | null;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onOrderSuccess: (orderNumber: string) => void;
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
  onOpenAuth
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [calculating, setCalculating] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [calculatedBill, setCalculatedBill] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Primary restaurant ID from cart
  const restaurantId = cartItems.length > 0 ? cartItems[0].menu_item.restaurant : null;

  useEffect(() => {
    if (isOpen && currentUser) {
      QuickBiteApi.getAddresses()
        .then((addrList) => {
          setAddresses(addrList);
          const def = addrList.find((a) => a.is_default) || addrList[0];
          if (def) setSelectedAddressId(def.id);
        })
        .catch(console.error);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (cartItems.length > 0 && restaurantId) {
      recalculateCart();
    } else {
      setCalculatedBill(null);
    }
  }, [cartItems, couponCode, restaurantId]);

  const recalculateCart = async (code = couponCode) => {
    if (!restaurantId || cartItems.length === 0) return;
    setCalculating(true);
    setErrorMessage('');
    try {
      const data = await QuickBiteApi.calculateCart({
        restaurant_id: restaurantId,
        items: cartItems.map((c) => ({ id: c.menu_item.id, quantity: c.quantity })),
        coupon_code: code
      });
      setCalculatedBill(data);
      if (data.applied_coupon) {
        setAppliedCoupon(data.applied_coupon);
      } else if (code) {
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setErrorMessage(err.response.data.error);
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleApplyCoupon = (code: string) => {
    setCouponCode(code);
    recalculateCart(code);
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (cartItems.length === 0 || !restaurantId) return;

    const selectedAddr =
      addresses.find((a) => a.id === selectedAddressId) ||
      addresses[0] || {
        address_line1: 'Marine Drive, Kochi',
        city: 'Kochi',
        state: 'Kerala'
      };

    setPlacingOrder(true);
    setErrorMessage('');

    try {
      const order = await QuickBiteApi.placeOrder({
        restaurant_id: restaurantId,
        items: cartItems.map((c) => ({
          id: c.menu_item.id,
          quantity: c.quantity,
          customizations: c.selected_customizations || {},
          special_instructions: c.special_instructions || ''
        })),
        delivery_address: selectedAddr,
        delivery_instructions: deliveryInstructions,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code || ''
      });

      // Trigger celebration confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      onClearCart();
      onClose();
      onOrderSuccess(order.order_number);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-base text-slate-900">Your QuickBite Cart</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5A36]">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF5A36] flex items-center justify-center text-2xl">
              🛒
            </div>
            <h3 className="font-bold text-base text-slate-800">Your cart is empty</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Explore authentic Malabar biryanis, Kerala sadya, or seafood coastal curries!
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold cursor-pointer hover:bg-black"
            >
              Browse Kerala Kitchens
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Restaurant indicator */}
            {calculatedBill?.restaurant && (
              <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    Ordering from {calculatedBill.restaurant.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {calculatedBill.restaurant.area} • ~
                    {calculatedBill.restaurant.avg_delivery_time_mins} mins delivery
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Single Kitchen
                </span>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Order Items
              </h3>

              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.menu_item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {item.menu_item.name}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ₹{item.menu_item.price} each
                    </p>

                    {item.selected_customizations &&
                      Object.keys(item.selected_customizations).length > 0 && (
                        <p className="text-[10px] text-orange-600 font-medium">
                          {Object.values(item.selected_customizations).join(', ')}
                        </p>
                      )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl">
                    <button
                      onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                      className="p-0.5 hover:text-[#FF5A36] text-slate-600 cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-extrabold w-3 text-center text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      className="p-0.5 hover:text-[#FF5A36] text-slate-600 cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span className="text-xs font-extrabold text-slate-900 w-14 text-right">
                    ₹{Number(item.menu_item.price) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupons Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Coupons & Offers
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Promo Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-50 px-3 py-2 text-xs font-bold font-mono rounded-xl border border-slate-200 outline-none focus:border-[#FF5A36]"
                />
                <button
                  onClick={() => recalculateCart(couponCode)}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Coupon Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {['QUICK50', 'KERALA20', 'FREESHIP'].map((code) => (
                  <button
                    key={code}
                    onClick={() => handleApplyCoupon(code)}
                    className="text-[10px] font-bold px-2 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 cursor-pointer shrink-0"
                  >
                    {code}
                  </button>
                ))}
              </div>

              {appliedCoupon && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                  <span>✓ {appliedCoupon.title} applied!</span>
                  <span className="font-extrabold">-₹{appliedCoupon.discount_amount}</span>
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Delivery Location
              </h3>

              {addresses.length > 0 ? (
                <div className="space-y-1.5">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-[#FF5A36] bg-orange-50/40 text-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="capitalize">{addr.label}</span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {addr.address_line1}, {addr.city}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <p className="font-semibold">Delivery Address: Marine Drive, Kochi, Kerala</p>
                </div>
              )}

              <input
                type="text"
                placeholder="Delivery instructions (e.g. Call upon arrival at security)"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#FF5A36]"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Payment Method (Razorpay & Sandbox)
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'upi', label: 'UPI (GPay/PhonePe)', icon: Smartphone },
                  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Smartphone },
                  { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#FF5A36] bg-orange-50 text-[#FF5A36] shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Breakdown Bill */}
            {calculatedBill && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Bill Summary
                </h4>

                <div className="flex justify-between text-slate-600">
                  <span>Item Subtotal</span>
                  <span>₹{calculatedBill.subtotal}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>₹{calculatedBill.delivery_fee}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>GST & Restaurant Taxes (5%)</span>
                  <span>₹{calculatedBill.tax_amount}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>QuickBite Platform Fee</span>
                  <span>₹{calculatedBill.platform_fee}</span>
                </div>

                {Number(calculatedBill.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Applied</span>
                    <span>-₹{calculatedBill.discount_amount}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>To Pay</span>
                  <span className="text-[#FF5A36]">₹{calculatedBill.total_amount}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sticky Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700">
                <ShieldCheck size={14} />
                <span>Verified 256-bit Encrypted Checkout</span>
              </span>
              <span>Total: ₹{calculatedBill?.total_amount || 0}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={placingOrder || calculating}
              className="w-full py-3 bg-[#FF5A36] hover:bg-[#e04826] text-white rounded-2xl text-xs font-extrabold transition-transform active:scale-98 flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-60"
            >
              {placingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Razorpay Payment...</span>
                </>
              ) : (
                <>
                  <span>Place Order • ₹{calculatedBill?.total_amount || 0}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
