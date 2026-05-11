"use client";

import React, { useState } from "react";
import { Info, Copy, Check, X } from "lucide-react";

interface StakingPlan {
  duration: number;
  apy: number;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
  isPopular?: boolean;
  bonus?: string;
}

const STAKING_PLANS: StakingPlan[] = [
  {
    duration: 7,
    apy: 2.0,
    minAmount: 10,
    maxAmount: 5000,
    dailyRate: 0.0055,
  },
  {
    duration: 30,
    apy: 4.0,
    minAmount: 10,
    maxAmount: 10000,
    dailyRate: 0.011,
    isPopular: true,
  },
  {
    duration: 90,
    apy: 6.0,
    minAmount: 10,
    maxAmount: 10000,
    dailyRate: 0.016,
    bonus: "+0.5% bonus for 90 days",
  },
];

interface StakeFormData {
  amount: string;
  selectedPlan: number;
}

export default function StakePage() {
  const [stakedAmount] = useState(0);
  const [rewardsEarned] = useState(0);
  const [activeStake] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [formData, setFormData] = useState<StakeFormData>({
    amount: "",
    selectedPlan: 1,
  });
  const [copied, setCopied] = useState(false);
  const [disclaimer, setDisclaimer] = useState(false);

  const plan = STAKING_PLANS[selectedPlan];

  const calculateRewards = (amount: number) => {
    if (!amount) return 0;
    return (amount * plan.apy) / 100;
  };

  const calculateUnlockDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + plan.duration);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleOpenModal = (planIndex: number) => {
    setSelectedPlan(planIndex);
    setFormData({ amount: "", selectedPlan: planIndex });
    setShowModal(true);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText("1A1z7agoat2Bt89zLQc6D4YJvWG3h6Tj2X");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMaxClick = () => {
    setFormData({
      ...formData,
      amount: String(STAKING_PLANS[selectedPlan].maxAmount),
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, amount: e.target.value });
  };

  const handleConfirmStake = () => {
    alert(`Confirmed stake of ${formData.amount} USDT for ${plan.duration} days`);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-4 max-w-3xl mx-auto">
          <h1 className="text-base font-bold text-white text-center flex-1">
            Earn
          </h1>
          <button className="p-2 hover:bg-surface rounded-lg transition-colors">
            <Info className="size-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 pb-24">
        {/* My Staking Summary */}
        <div className="mt-6 mb-8">
          <div className="bg-[#13131f] border border-white/8 rounded-2xl p-5">
            <p className="text-xs text-muted-foreground mb-2">My Staked Assets</p>
            <h2 className="text-2xl font-bold text-white mb-4">{stakedAmount} USDT</h2>

            {/* Stats Row */}
            <div className="flex justify-between mb-4 pb-4 border-b border-white/8">
              <div>
                <p className="text-xs text-muted-foreground">Rewards Earned</p>
                <p className="text-lg font-bold text-success">{rewardsEarned} USDT</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Est. APY</p>
                <p className="text-lg font-bold text-white">—</p>
              </div>
            </div>

            {/* Progress Bar */}
            {activeStake && (
              <div className="mb-4">
                <div className="w-full bg-white/6 rounded-sm h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: "60%" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">23 days remaining</p>
              </div>
            )}

            {/* Action Buttons */}
            {stakedAmount > 0 && (
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90">
                  Claim Rewards
                </button>
                <button className="flex-1 px-4 py-2 border border-destructive text-destructive rounded-full text-sm font-semibold hover:bg-destructive/5">
                  Unstake
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Staking Plans */}
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1">Staking Plans</h3>
            <p className="text-xs text-muted-foreground">Lock USDT, earn daily rewards</p>
          </div>

          <div className="space-y-3">
            {STAKING_PLANS.map((plan, idx) => (
              <div
                key={idx}
                className="bg-[#13131f] border border-white/8 rounded-2xl p-4"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                    <span className="inline-block px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full font-semibold">
                      {plan.duration} Days
                    </span>
                    {plan.isPopular && (
                      <span className="inline-block px-2 py-1 bg-success/10 text-success text-xs rounded-full font-semibold">
                        Most Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* APY */}
                <div className="mb-3">
                  <h4 className="text-xl font-bold text-white">
                    {plan.apy.toFixed(2)}% APY
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Annual Percentage Yield
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-3 mb-3 pb-3 border-b border-white/8">
                  <div>
                    <p className="text-xs text-muted-foreground">Min</p>
                    <p className="text-xs font-semibold text-white">
                      {plan.minAmount} USDT
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max</p>
                    <p className="text-xs font-semibold text-white">
                      {plan.maxAmount} USDT
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Daily</p>
                    <p className="text-xs font-semibold text-white">
                      {plan.dailyRate.toFixed(4)}%
                    </p>
                  </div>
                </div>

                {/* Example Calculation */}
                <div className="bg-white/3 border border-white/6 rounded-lg p-3 mb-3">
                  <p className="text-xs text-muted-foreground">
                    Example: Stake 1,000 USDT for {plan.duration} days
                    <br />= Earn ~{((1000 * plan.apy) / 100).toFixed(0)} USDT in rewards
                  </p>
                </div>

                {/* Bonus */}
                {plan.bonus && (
                  <p className="text-xs text-success font-semibold mb-3">
                    {plan.bonus}
                  </p>
                )}

                {/* Stake Button */}
                <button
                  onClick={() => handleOpenModal(idx)}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:opacity-90"
                >
                  Stake Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Staking History */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-white mb-4">Staking History</h3>
          <div className="bg-[#13131f] border border-white/8 rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">No staking history yet</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 bg-white/3 border border-white/6 rounded-xl p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            ℹ️ Staking rewards are funded from ChainSwap P2P trading commissions.
            Returns are not guaranteed and may vary based on platform volume. Not
            financial advice.
          </p>
        </div>
      </div>

      {/* Stake Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full bg-[#13131f] border-t border-white/8 rounded-3xl rounded-b-none p-5 max-h-[90vh] overflow-y-auto">
            {/* Handle bar */}
            <div className="flex justify-center mb-4">
              <div className="w-8 h-1 bg-white/10 rounded-full" />
            </div>

            {/* Title */}
            <h2 className="text-base font-bold text-white mb-5">
              Stake USDT — {plan.duration} Days
            </h2>

            {/* Amount Input */}
            <div className="mb-5">
              <label className="text-xs text-muted-foreground mb-2 block">
                Enter amount (USDT)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white text-sm placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleMaxClick}
                  className="px-4 py-3 text-primary text-sm font-semibold hover:bg-white/5 rounded-full transition-colors"
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available: 0 USDT
              </p>
            </div>

            {/* Calculation Card */}
            <div className="bg-white/4 border border-white/8 rounded-xl p-4 mb-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="text-white font-semibold">{plan.duration} Days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">APY:</span>
                <span className="text-white font-semibold">
                  {plan.apy.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Reward:</span>
                <span className="text-white font-semibold">
                  {formData.amount ? ((parseFloat(formData.amount) * plan.dailyRate) / 100).toFixed(2) : "0.00"} USDT
                </span>
              </div>
              <div className="border-t border-white/8" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Reward:</span>
                <span className="text-success font-bold">
                  {calculateRewards(parseFloat(formData.amount) || 0).toFixed(2)} USDT
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unlock Date:</span>
                <span className="text-primary font-semibold">
                  {calculateUnlockDate()}
                </span>
              </div>
            </div>

            {/* Fine Print */}
            <p className="text-xs text-muted-foreground text-center mb-5 leading-relaxed">
              Staked funds are locked for the full duration. Early withdrawal not
              permitted.
            </p>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmStake}
              className="w-full px-4 py-4 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:opacity-90 mb-3"
            >
              Confirm Stake
            </button>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-3 border border-white/20 text-white rounded-full text-sm font-semibold hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
