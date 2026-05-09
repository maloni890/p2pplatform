"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, ChevronRight, Wallet, TrendingUp, ArrowDownToLine } from "lucide-react";

const STAKING_PLANS = [
  { id: 1, days: 7, apy: 2.0, dailyRate: 0.0055, min: 10, max: 10000, label: "Flexible" },
  { id: 2, days: 30, apy: 4.0, dailyRate: 0.011, min: 50, max: 25000, label: "Standard" },
  { id: 3, days: 90, apy: 6.0, dailyRate: 0.0164, min: 100, max: 50000, label: "Premium" },
];

const FAQS = [
  { q: "When do I receive rewards?", a: "Rewards are calculated daily at 00:00 UTC and credited to your staking balance. You can claim them anytime after the lock period ends." },
  { q: "Can I unstake early?", a: "Early unstaking is possible but incurs a 1% penalty fee. The remaining principal and accrued rewards will be returned to your wallet." },
  { q: "Is my USDT safe?", a: "Your staked USDT is secured by SwapEase platform reserves. Staking rewards are generated from P2P trading commissions, not external investments." },
];

export default function StakePage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof STAKING_PLANS[0] | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");

  // Demo: user's active staking (would come from API)
  const myStaking = {
    amount: 0,
    rewards: 0,
  };

  const handleStakeNow = (plan: typeof STAKING_PLANS[0]) => {
    setSelectedPlan(plan);
    setStakeAmount("");
    setShowStakeModal(true);
  };

  const estimatedReturn = selectedPlan && stakeAmount
    ? (parseFloat(stakeAmount) * (selectedPlan.apy / 100) * (selectedPlan.days / 365)).toFixed(2)
    : "0.00";

  const handleConfirmStake = () => {
    // Would call API to stake
    alert(`Staked ${stakeAmount} USDT for ${selectedPlan?.days} days`);
    setShowStakeModal(false);
    setSelectedPlan(null);
    setStakeAmount("");
  };

  return (
    <div className="min-h-screen bg-[#0d1117] pb-20">
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10">
      {/* Top Bar */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-[#21262d] sticky top-0 bg-[#0d1117] z-10">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft className="size-5 text-white" />
        </button>
        <span className="text-[15px] font-semibold text-white">Earn</span>
        <button className="p-1 -mr-1">
          <Info className="size-5 text-[#8b949e]" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Banner */}
        <div className="bg-[#161b22] rounded-lg p-4 flex items-center gap-3">
          <div className="size-10 rounded-full bg-[#4d7cfe]/20 flex items-center justify-center shrink-0">
            <span className="text-[#4d7cfe] text-lg font-bold">$</span>
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">Stake USDT, Earn Daily</p>
            <p className="text-[11px] text-[#8b949e]">Powered by SwapEase P2P revenue</p>
          </div>
        </div>

        {/* My Staking */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#8b949e]">My Staked</p>
              <p className="text-[18px] font-bold text-white">{myStaking.amount} USDT</p>
              <p className="text-[11px] text-[#0ecb81]">Rewards earned: ₹{myStaking.rewards.toFixed(2)}</p>
            </div>
            {myStaking.amount > 0 && (
              <button className="px-4 py-2 border border-[#4d7cfe] text-[#4d7cfe] text-[12px] font-medium rounded">
                Unstake
              </button>
            )}
          </div>
        </div>

        {/* Staking Plans */}
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-white">Staking Plans</p>
          
          {STAKING_PLANS.map((plan) => (
            <div key={plan.id} className="bg-[#161b22] border border-[#21262d] rounded-lg p-4">
              {/* Top row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-bold text-white">{plan.days} Days</span>
                <span className="px-2 py-0.5 bg-[#21262d] text-[#8b949e] text-[10px] rounded-full">{plan.label}</span>
              </div>
              
              {/* APY */}
              <p className="text-[20px] font-bold text-[#4d7cfe] mb-3">{plan.apy.toFixed(2)}% APY</p>
              
              {/* Details row */}
              <div className="flex items-center justify-between text-[11px] text-[#8b949e] mb-3">
                <span>Min: {plan.min} USDT</span>
                <span>Max: {plan.max.toLocaleString()} USDT</span>
                <span>Daily: {plan.dailyRate}%</span>
              </div>
              
              {/* Stake button */}
              <button
                onClick={() => handleStakeNow(plan)}
                className="w-full h-8 bg-[#4d7cfe] text-black text-[12px] font-bold rounded"
              >
                Stake Now
              </button>
            </div>
          ))}
        </div>

        {/* Important Note */}
        <div className="bg-[rgba(240,185,11,0.08)] border border-[rgba(240,185,11,0.2)] rounded-lg p-3">
          <p className="text-[11px] text-[#4d7cfe]/90 leading-relaxed">
            Rewards funded by SwapEase P2P trading commission. Returns may vary based on platform volume.
          </p>
        </div>

        {/* How It Works */}
        <div>
          <p className="text-[13px] font-semibold text-white mb-3">How It Works</p>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 text-center">
              <div className="size-10 rounded-full bg-[#161b22] border border-[#21262d] flex items-center justify-center mx-auto mb-2">
                <Wallet className="size-4 text-[#8b949e]" />
              </div>
              <p className="text-[11px] text-[#8b949e]">Deposit USDT</p>
            </div>
            <div className="flex-1 text-center">
              <div className="size-10 rounded-full bg-[#161b22] border border-[#21262d] flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="size-4 text-[#8b949e]" />
              </div>
              <p className="text-[11px] text-[#8b949e]">Earn Daily</p>
            </div>
            <div className="flex-1 text-center">
              <div className="size-10 rounded-full bg-[#161b22] border border-[#21262d] flex items-center justify-center mx-auto mb-2">
                <ArrowDownToLine className="size-4 text-[#8b949e]" />
              </div>
              <p className="text-[11px] text-[#8b949e]">Withdraw Anytime</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <p className="text-[13px] font-semibold text-white mb-3">FAQ</p>
          <div className="space-y-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3"
                >
                  <span className="text-[13px] text-white text-left">{faq.q}</span>
                  <ChevronRight className={`size-4 text-[#8b949e] transition-transform ${expandedFaq === idx ? "rotate-90" : ""}`} />
                </button>
                {expandedFaq === idx && (
                  <div className="px-3 pb-3">
                    <p className="text-[12px] text-[#8b949e] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stake Modal (Bottom Sheet) */}
      {showStakeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowStakeModal(false)} 
          />
          <div className="relative w-full bg-[#161b22] rounded-t-2xl p-4 pb-8">
            <div className="w-10 h-1 bg-[#21262d] rounded-full mx-auto mb-4" />
            
            <h3 className="text-[15px] font-semibold text-white text-center mb-4">
              Stake USDT — {selectedPlan.days} Days
            </h3>
            
            {/* Amount input */}
            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#8b949e]">Amount</span>
                <button 
                  onClick={() => setStakeAmount(String(selectedPlan.max))}
                  className="text-[11px] text-[#4d7cfe] font-medium"
                >
                  Max
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-[18px] font-bold text-white outline-none"
                />
                <span className="text-[14px] text-[#8b949e]">USDT</span>
              </div>
            </div>

            {/* Limits */}
            <div className="flex items-center justify-between text-[11px] text-[#8b949e] mb-3">
              <span>Min: {selectedPlan.min} USDT</span>
              <span>Max: {selectedPlan.max.toLocaleString()} USDT</span>
            </div>

            {/* Estimated return */}
            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#8b949e]">Estimated Return</span>
                <span className="text-[14px] font-semibold text-[#0ecb81]">≈ {estimatedReturn} USDT</span>
              </div>
              <p className="text-[10px] text-[#8b949e] mt-1">Over {selectedPlan.days} days at {selectedPlan.apy}% APY</p>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirmStake}
              disabled={!stakeAmount || parseFloat(stakeAmount) < selectedPlan.min}
              className="w-full h-11 bg-[#4d7cfe] text-black text-[14px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Stake
            </button>

            {/* Fine print */}
            <p className="text-[10px] text-[#8b949e] text-center mt-3">
              Staked funds locked for {selectedPlan.days} days
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
