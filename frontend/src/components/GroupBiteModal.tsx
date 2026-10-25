import React, { useState } from 'react';
import { QuickBiteApi } from '../services/api';
import {
  Users,
  X,
  Share2,
  Copy,
  Plus,
  Check,
  ShoppingBag,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

export const GroupBiteModal: React.FC<Props> = ({ isOpen, onClose, onAddToCart }) => {
  const [roomCode, setRoomCode] = useState('');
  const [createdRoom, setCreatedRoom] = useState<any>(null);
  const [budgetPerPerson, setBudgetPerPerson] = useState(250);
  const [memberName, setMemberName] = useState('Rahul');
  const [guestName, setGuestName] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const room = await QuickBiteApi.createGroupOrder(1, budgetPerPerson);
      setCreatedRoom(room);
      setRoomCode(room.room_code);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSampleItem = async (itemName: string, price: number) => {
    if (!createdRoom) return;
    try {
      const updated = await QuickBiteApi.addGroupOrderItem(createdRoom.room_code, {
        member_name: guestName.trim() || 'Colleague / Friend',
        item_id: 1,
        item_name: itemName,
        price
      });
      setCreatedRoom(updated);
      setGuestName('');
    } catch (err) {
      console.error(err);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(`Join my QuickBite Group Order! Code: ${createdRoom?.room_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white">GroupBite™ Group Order</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-indigo-900 uppercase">
                  Colleges & Offices
                </span>
              </div>
              <p className="text-xs text-white/90">
                Order together from one Kerala kitchen, track per-person budgets, checkout together!
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

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {!createdRoom ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-bold text-sm text-slate-800">
                  Setup Your Group Order Session
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ideal for Infopark tech teams, college hostels, and family feasts. Everyone adds
                  their own favourite dishes within a preset per-person budget.
                </p>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Per-Person Spending Limit:
                  </label>
                  <div className="flex gap-2">
                    {[199, 250, 350, 500].map((b) => (
                      <button
                        key={b}
                        onClick={() => setBudgetPerPerson(b)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          budgetPerPerson === b
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        ₹{b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-transform active:scale-98 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Creating Room...' : 'Start Group Order Room'}
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Shareable Code Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Group Room Code
                  </span>
                  <span className="text-2xl font-extrabold text-indigo-950 font-mono tracking-widest">
                    {createdRoom.room_code}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Budget: ₹{createdRoom.per_person_budget} per person • {createdRoom.restaurant_name}
                  </p>
                </div>

                <button
                  onClick={copyInvite}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-indigo-300 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer shadow-xs"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied Link!' : 'Share Code'}</span>
                </button>
              </div>

              {/* Add member items simulation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-800">
                  Simulate Participant Adding Dishes:
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Friend's name (e.g. Anjali, Arjun)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="flex-1 text-xs bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                  />
                  <button
                    onClick={() => handleAddSampleItem('Malabar Chicken Dum Biryani', 220)}
                    className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black cursor-pointer"
                  >
                    + Add Biryani
                  </button>
                  <button
                    onClick={() => handleAddSampleItem('Kerala Parotta (3pcs) & Curry', 140)}
                    className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black cursor-pointer"
                  >
                    + Add Parotta
                  </button>
                </div>
              </div>

              {/* Participants and items list */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                  Live Participant Selections ({createdRoom.members_data?.length || 0})
                </h4>

                <div className="space-y-2">
                  {createdRoom.members_data?.map((m: any, idx: number) => {
                    const memberTotal = m.items?.reduce((s: number, i: any) => s + i.price, 0) || 0;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                              {m.member_name[0]}
                            </span>
                            <span className="font-bold text-xs text-slate-900">
                              {m.member_name} {m.is_organizer && '(Organizer)'}
                            </span>
                          </div>

                          <span className="text-xs font-extrabold text-slate-900">
                            Total: ₹{memberTotal} / ₹{createdRoom.per_person_budget}
                          </span>
                        </div>

                        {/* Items for this member */}
                        {m.items && m.items.length > 0 ? (
                          <div className="space-y-1 pl-8 text-xs text-slate-600">
                            {m.items.map((it: any, iIdx: number) => (
                              <div key={iIdx} className="flex justify-between">
                                <span>{it.item_name}</span>
                                <span className="font-semibold text-slate-900">₹{it.price}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 pl-8">
                            Browsing menu... no items selected yet.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Final combined checkout button */}
              <button
                onClick={() => {
                  onAddToCart({
                    id: 1,
                    name: `GroupBite (${createdRoom.room_code}) Combined Feast`,
                    price: 360,
                    restaurant_id: 1,
                    restaurant_name: 'Malabar Grand by Paragon',
                    portion_size: 'Group Feast'
                  });
                  onClose();
                }}
                className="w-full py-3 bg-[#FF5A36] hover:bg-[#e04826] text-white rounded-2xl text-xs font-bold transition-transform active:scale-98 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Review & Checkout Combined Group Cart</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
