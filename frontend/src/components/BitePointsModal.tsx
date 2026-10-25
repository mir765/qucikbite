import React, { useState, useEffect } from 'react';
import { BitePointsData } from '../types';
import { QuickBiteApi } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Coins,
  X,
  Award,
  Gift,
  Share2,
  Copy,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPointsRedeemed?: () => void;
}

export const BitePointsModal: React.FC<Props> = ({ isOpen, onClose, onPointsRedeemed }) => {
  const [data, setData] = useState<BitePointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemedVoucher, setRedeemedVoucher] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPoints();
    }
  }, [isOpen]);

  const loadPoints = async () => {
    setLoading(true);
    try {
      const res = await QuickBiteApi.getBitePoints();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (points: number) => {
    setRedeeming(true);
    try {
      const res = await QuickBiteApi.redeemBitePoints(points);
      setRedeemedVoucher(res.voucher_code);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      loadPoints();
      if (onPointsRedeemed) onPointsRedeemed();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Redemption failed');
    } finally {
      setRedeeming(false);
    }
  };

  const handleCopyReferral = () => {
    if (!data?.referral_code) return;
    navigator.clipboard.writeText(
      `Order on QuickBite Kerala and get ₹75 off! Use my referral code: ${data.referral_code}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
              <Coins size={22} className="text-amber-200" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">BitePoints™ Loyalty & Rewards</h2>
              <p className="text-xs text-amber-100">
                Earn 10 pts for every ₹100 spent • Redeem instant cash discount vouchers
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {loading || !data ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">Loading your BitePoints ledger...</p>
            </div>
          ) : (
            <>
              {/* Balance Card */}
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                    Available Reward Balance
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-amber-950">
                      {data.balance}
                    </span>
                    <span className="text-xs font-bold text-amber-700">BitePoints</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Worth ~₹{Math.floor((data.balance / 100) * 50)} in instant food discounts
                  </p>
                </div>

                <button
                  onClick={() => handleRedeem(100)}
                  disabled={redeeming || data.balance < 100}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {redeeming ? 'Redeeming...' : 'Redeem 100 pts (₹50 OFF)'}
                </button>
              </div>

              {/* Redeemed voucher success alert */}
              {redeemedVoucher && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                  <div>
                    <span className="block font-bold">✓ Voucher Created:</span>
                    <span className="font-mono text-sm tracking-wider">{redeemedVoucher}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-1 rounded">
                    Auto-valid on Cart!
                  </span>
                </div>
              )}

              {/* Referral Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    Invite Friends & Earn 50 Points
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Your code: <strong className="font-mono text-slate-900">{data.referral_code}</strong>
                  </p>
                </div>

                <button
                  onClick={handleCopyReferral}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer shadow-xs"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>

              {/* Milestone Badges */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Kerala Foodie Milestones
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {data.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition-all ${
                        m.achieved
                          ? 'border-amber-300 bg-amber-50/60 text-amber-950 font-bold'
                          : 'border-slate-200 bg-white text-slate-400 font-medium'
                      }`}
                    >
                      <Award
                        size={20}
                        className={`mx-auto mb-1 ${
                          m.achieved ? 'text-amber-600' : 'text-slate-300'
                        }`}
                      />
                      <span className="text-[11px] block">{m.title}</span>
                      <span className="text-[10px] opacity-75">{m.target} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Points History Ledger */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Points Activity Ledger
                </h4>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {data.ledger?.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{entry.description}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`font-extrabold text-sm ${
                          entry.points > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {entry.points > 0 ? `+${entry.points}` : entry.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
