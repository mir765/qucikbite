import React, { useState, useEffect } from 'react';
import { User, CustomerAddress, Order, SupportTicket } from '../types';
import { QuickBiteApi } from '../services/api';
import {
  User as UserIcon,
  X,
  MapPin,
  Clock,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  Send
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onTrackOrder: (orderNumber: string) => void;
}

export const CustomerProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onTrackOrder
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'support'>('profile');
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);

  // Address form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState<'home' | 'work' | 'other'>('home');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newLandmark, setNewLandmark] = useState('');

  // Support Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('missing_item');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, activeTab]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'addresses') {
        const addrList = await QuickBiteApi.getAddresses();
        setAddresses(addrList);
      } else if (activeTab === 'orders') {
        const orderList = await QuickBiteApi.getOrders('customer');
        setOrders(orderList);
      } else if (activeTab === 'support') {
        const ticketList = await QuickBiteApi.getSupportTickets();
        setTickets(ticketList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine.trim()) return;
    try {
      await QuickBiteApi.addAddress({
        label: newLabel,
        address_line1: newAddressLine,
        landmark: newLandmark,
        city: 'Kochi',
        state: 'Kerala',
        postal_code: '682031',
        is_default: addresses.length === 0
      });
      setShowAddAddress(false);
      setNewAddressLine('');
      setNewLandmark('');
      loadUserData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await QuickBiteApi.deleteAddress(id);
      loadUserData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;
    try {
      await QuickBiteApi.createSupportTicket({
        subject: ticketSubject,
        category: ticketCategory,
        description: ticketDescription,
        priority: 'medium'
      });
      setTicketSubject('');
      setTicketDescription('');
      setTicketSubmitted(true);
      setTimeout(() => setTicketSubmitted(false), 3000);
      loadUserData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center font-bold text-sm">
              {currentUser?.first_name?.[0] || 'U'}
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                {currentUser?.first_name} {currentUser?.last_name}
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser?.phone || '+91 98470 12345'} • {currentUser?.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-5 gap-4 text-xs font-bold text-slate-600">
          {[
            { id: 'profile', label: 'Preferences', icon: UserIcon },
            { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
            { id: 'orders', label: 'Order History', icon: Clock },
            { id: 'support', label: 'Support & Tickets', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#FF5A36] text-[#FF5A36]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* PROFILE PREFERENCES */}
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Dietary & Taste Preferences</h3>
                <p className="text-slate-500">
                  Customizes SmartBite AI suggestions and highlights appropriate dishes.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {['Halal Food Only', 'Vegetarian Preferred', 'Less Spicy', 'Seafood Enthusiast'].map(
                    (pref, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-white border border-slate-300 font-bold text-slate-700 text-xs shadow-xs"
                      >
                        ✓ {pref}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-sm">Account & Privacy</h3>
                <p className="text-slate-500">
                  Your phone number is verified and masked during delivery partner calls for privacy.
                </p>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold pt-1">
                  <Shield size={14} />
                  <span>256-bit Encrypted Session Active</span>
                </div>
              </div>
            </div>
          )}

          {/* SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Saved Delivery Locations
                </h3>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="flex items-center gap-1 text-xs font-bold text-[#FF5A36] hover:text-[#e04826] cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add New Address</span>
                </button>
              </div>

              {showAddAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                >
                  <div className="flex gap-2">
                    {(['home', 'work', 'other'] as const).map((l) => (
                      <button
                        type="button"
                        key={l}
                        onClick={() => setNewLabel(l)}
                        className={`px-3 py-1.5 rounded-xl capitalize font-bold border cursor-pointer ${
                          newLabel === l
                            ? 'bg-[#FF5A36] text-white border-[#FF5A36]'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Address Line 1 (Flat, Building, Street)"
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    required
                    className="w-full bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    className="w-full bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black cursor-pointer"
                  >
                    Save Address
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold capitalize text-slate-900">
                          {addr.label}
                        </span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-orange-100 text-[#FF5A36] font-bold px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        {addr.address_line1}, {addr.city}, Kerala {addr.postal_code}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No past orders yet.</p>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-slate-900">
                          {ord.order_number}
                        </span>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {ord.restaurant_name} • {new Date(ord.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {ord.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="font-extrabold text-sm text-slate-900">
                        ₹{ord.total_amount}
                      </span>

                      <button
                        onClick={() => {
                          onTrackOrder(ord.order_number);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SUPPORT TICKETS */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <h3 className="font-extrabold text-slate-900 text-sm">Need Help with an Order?</h3>
                <p className="text-slate-500">
                  Report missing items, spillage, quality issues or request a refund review.
                </p>

                {ticketSubmitted && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    ✓ Support ticket raised! Our Kerala support desk will respond shortly.
                  </div>
                )}

                <form onSubmit={handleCreateTicket} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      required
                      className="bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                    />

                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                    >
                      <option value="missing_item">Missing Items</option>
                      <option value="damaged_food">Food Quality / Spillage</option>
                      <option value="late_delivery">Late Delivery Compensation</option>
                      <option value="refund_request">Refund Request</option>
                      <option value="general">General Support</option>
                    </select>
                  </div>

                  <textarea
                    placeholder="Describe the issue with your order..."
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    required
                    className="w-full bg-white p-2.5 rounded-xl border border-slate-200 outline-none resize-none h-18"
                  />

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#FF5A36] text-white rounded-xl font-bold cursor-pointer hover:bg-[#e04826]"
                  >
                    <Send size={13} />
                    <span>Submit Ticket</span>
                  </button>
                </form>
              </div>

              {/* Tickets list */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  My Support Tickets ({tickets.length})
                </h4>

                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{t.ticket_number}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded uppercase">
                        {t.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800">{t.subject}</p>
                    <p className="text-slate-500">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
