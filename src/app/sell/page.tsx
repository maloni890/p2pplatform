"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Home,
  Calculator,
  LayoutDashboard,
  User,
  AlertCircle,
  Loader2,
  Clock,
  Shield,
  Star,
  XCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RATE = 106.35;
const PLATFORM_FEE_PERCENT = 0.5;
const MIN_USDT = 10;
const MAX_USDT = 100000;

const ESCROW_WALLET = {
  TRC20: "TN7xG8K2mVqPzDh4jR9sYb3wLcFe5aQnMp",
  ERC20: "0x8e3fA21B3CcF9eC9d9a2A5b4bE7E8F2c1234abcd",
  BEP20: "0xBE7eA21B3CcF9eC9d9a2A5b4bE7E8F2c1234abcd",
};

interface Buyer {
  id: string;
  order_number: string;
  buyer_id: string;
  buyer_name: string;
  usdt_amount: number;
  inr_amount: number;
  rate: number;
  status: string;
  created_at: string;
}

// Loading Skeleton Component
function BuyerSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-3 animate-pulse">
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="size-9 rounded-full bg-surface shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-3 bg-surface rounded w-24 mb-1.5" />
          <div className="h-2 bg-surface rounded w-32" />
        </div>
        <div className="text-right">
          <div className="h-4 bg-surface rounded w-12 mb-1" />
          <div className="h-2 bg-surface rounded w-10" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2.5 pb-2.5 border-b border-border">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-2 bg-surface rounded w-12 mb-1" />
            <div className="h-3 bg-surface rounded w-8" />
          </div>
        ))}
      </div>
      <div className="h-8 bg-surface rounded-full w-full" />
    </div>
  );
}

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [step, setStep] = useState(1);
  const [usdtAmount, setUsdtAmount] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [network, setNetwork] = useState<"TRC20" | "ERC20" | "BEP20">("TRC20");
  const [errors, setErrors] = useState<{ usdt?: string }>({});
  const [copied, setCopied] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState<"waiting" | "deposited" | "buyer-paid" | "released">("waiting");
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New state for database integration
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [buyersError, setBuyersError] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [liveRate, setLiveRate] = useState(RATE);

  const usdtNum = parseFloat(usdtAmount) || 0;
  const grossInr = usdtNum * (selectedBuyer?.rate || liveRate);
  const platformFee = grossInr * (PLATFORM_FEE_PERCENT / 100);
  const netInr = grossInr - platformFee;

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/sell");
    }
  }, [user, router]);

  // Fetch buyers from database
  const fetchBuyers = useCallback(async () => {
    if (usdtNum <= 0) return;
    
    setLoadingBuyers(true);
    setBuyersError(null);
    
    try {
      const res = await fetch(`/api/buyers?minAmount=${usdtNum}`);
      const data = await res.json();
      
      if (data.success) {
        setBuyers(data.buyers);
        // Update live rate from first buyer if available
        if (data.buyers.length > 0) {
          setLiveRate(parseFloat(data.buyers[0].rate));
        }
      } else {
        setBuyersError("Failed to load buyers");
      }
    } catch (error) {
      console.error("Error fetching buyers:", error);
      setBuyersError("Failed to load buyers. Please try again.");
    } finally {
      setLoadingBuyers(false);
    }
  }, [usdtNum]);

  // Fetch buyers when entering step 2
  useEffect(() => {
    if (step === 2) {
      fetchBuyers();
    }
  }, [step, fetchBuyers]);

  // Countdown timer for step 3 & 4
  useEffect(() => {
    if (step === 3 && escrowStatus === "deposited") {
      const interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, escrowStatus]);

  // Simulate escrow flow
  useEffect(() => {
    if (step === 3 && escrowStatus === "waiting") {
      const t1 = setTimeout(() => setEscrowStatus("deposited"), 4000);
      const t2 = setTimeout(() => {
        setEscrowStatus("buyer-paid");
        setStep(4);
      }, 9000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [step, escrowStatus]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const validateStep1 = () => {
    const newErrors: { usdt?: string } = {};
    if (!usdtAmount || usdtNum <= 0) newErrors.usdt = "Please enter a valid amount";
    else if (usdtNum < MIN_USDT) newErrors.usdt = `Minimum ${MIN_USDT} USDT`;
    else if (usdtNum > MAX_USDT) newErrors.usdt = `Maximum ${MAX_USDT} USDT`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1 = () => validateStep1() && setStep(2);

  const handleSelectBuyer = async (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsProcessing(true);
    
    // Create order in database
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: buyer.buyer_id,
          buyerName: buyer.buyer_name,
          sellerId: null, // Will be set when seller accepts
          sellerUserId: user?.id || user?.username,
          sellerName: user?.name || user?.username,
          type: "sell",
          usdtAmount: usdtNum,
          inrAmount: usdtNum * buyer.rate,
          rate: buyer.rate,
          commission: (usdtNum * buyer.rate) * (PLATFORM_FEE_PERCENT / 100),
          paymentMethod: "UPI",
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setCurrentOrderId(data.order.id);
        toast.success("Order created! Deposit USDT to escrow.");
      } else {
        toast.error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    }
    
    setIsProcessing(false);
    setStep(3);
    setEscrowStatus("waiting");
    setTimeLeft(15 * 60);
  };

  const handleConfirmReceived = async () => {
    setIsProcessing(true);
    
    // Update order status in database
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrderId,
          status: "completed",
        }),
      });
    } catch (error) {
      console.error("Error updating order:", error);
    }
    
    await new Promise((r) => setTimeout(r, 1500));
    setEscrowStatus("released");
    setIsProcessing(false);
    toast.success("USDT released to buyer. Trade completed!");
  };

  const handleDispute = async () => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrderId,
          status: "disputed",
          disputeReason: "Seller did not receive payment",
        }),
      });
    } catch (error) {
      console.error("Error creating dispute:", error);
    }
    toast.error("Dispute opened. Our team will contact you within 30 minutes.");
    router.push("/profile/support");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(ESCROW_WALLET[network]);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = (path: string) => pathname === path;
  const quickAmounts = [100, 500, 1000, 5000];

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(34,197,94,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(138,43,226,0.1)_0%,transparent_70%)] pointer-events-none" />

      <main className="flex-1 w-full max-w-[390px] mx-auto px-3 py-4 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.push("/p2p"))}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <ArrowLeft className="size-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-[16px] font-bold text-white">Sell USDT</h1>
            <p className="text-[10px] text-muted-foreground">P2P trade with verified buyers</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    s === step
                      ? "bg-primary text-white"
                      : s < step
                      ? "bg-primary/20 text-primary"
                      : "bg-surface text-muted-foreground"
                  }`}
                >
                  {s < step ? <Check className="size-3" /> : s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-0.5 mx-1 ${s < step ? "bg-primary" : "bg-border"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-[10px] text-muted-foreground">
            Step {step} of 4:{" "}
            {step === 1
              ? "Enter Amount"
              : step === 2
              ? "Select Buyer"
              : step === 3
              ? "Escrow & Payment"
              : "Confirm Payment"}
          </p>
        </div>

        {/* Step 1: Enter Amount */}
        {step === 1 && (
          <div className="space-y-3 fade-in-up">
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="text-[10px] text-muted-foreground mb-2 block">
                How much USDT do you want to sell?
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={usdtAmount}
                  onChange={(e) => {
                    setUsdtAmount(e.target.value);
                    setErrors({});
                  }}
                  placeholder="0.00"
                  className="w-full text-2xl font-bold bg-transparent border-none outline-none text-white placeholder:text-muted-foreground/30"
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-muted-foreground">
                  USDT
                </span>
              </div>
              {errors.usdt && (
                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.usdt}
                </p>
              )}
              <div className="flex gap-1.5 mt-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setUsdtAmount(amt.toString())}
                    className="flex-1 py-1.5 text-[10px] font-medium bg-surface hover:bg-primary/10 text-white rounded-lg transition-colors"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate Info */}
            <div className="bg-gradient-to-br from-green-500/10 to-primary/5 border border-green-500/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Live Rate</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-semibold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                  </span>
                  ₹{liveRate.toFixed(2)}/USDT
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Gross INR</span>
                <span className="text-white">
                  ₹{grossInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                <span className="text-red-400">
                  - ₹{platformFee.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-white">You will receive</span>
                <span className="text-[18px] font-bold text-green-400">
                  ≈ ₹{netInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handleStep1}
              disabled={!usdtAmount || usdtNum <= 0}
              className="w-full py-3 bg-green-500 hover:bg-green-400 text-white text-[13px] font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              Find Buyer
              <ArrowRight className="size-4" />
            </button>

            <p className="text-[9px] text-center text-muted-foreground">
              Min: {MIN_USDT} USDT | Max: {MAX_USDT.toLocaleString()} USDT
            </p>
          </div>
        )}

        {/* Step 2: Select Buyer - Now with real database calls */}
        {step === 2 && (
          <div className="space-y-3 fade-in-up">
            {/* Summary */}
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">You are selling</span>
                <span className="text-[14px] font-bold text-white">{usdtAmount} USDT</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <Shield className="size-3.5 text-primary" />
              <p className="text-[10px] text-muted-foreground">
                Your USDT will be held in escrow until payment is confirmed
              </p>
            </div>

            {/* Refresh Button */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                {buyers.length} buyer{buyers.length !== 1 ? "s" : ""} available
              </p>
              <button
                onClick={fetchBuyers}
                disabled={loadingBuyers}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`size-3 ${loadingBuyers ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Loading State */}
            {loadingBuyers && (
              <div className="space-y-2">
                <BuyerSkeleton />
                <BuyerSkeleton />
                <BuyerSkeleton />
              </div>
            )}

            {/* Error State */}
            {buyersError && !loadingBuyers && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                <AlertCircle className="size-8 text-red-400 mx-auto mb-2" />
                <p className="text-[11px] text-red-400 mb-2">{buyersError}</p>
                <button
                  onClick={fetchBuyers}
                  className="px-4 py-1.5 bg-red-500/20 text-red-400 text-[10px] font-semibold rounded-full hover:bg-red-500/30 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loadingBuyers && !buyersError && buyers.length === 0 && (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="size-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-3">
                  <User className="size-6 text-muted-foreground" />
                </div>
                <p className="text-[12px] font-semibold text-white mb-1">No buyers available</p>
                <p className="text-[10px] text-muted-foreground mb-3">
                  No buyers are looking for this amount of USDT right now. Try a different amount or check back later.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-1.5 bg-primary/20 text-primary text-[10px] font-semibold rounded-full hover:bg-primary/30 transition-colors"
                >
                  Change Amount
                </button>
              </div>
            )}

            {/* Buyers List */}
            {!loadingBuyers && !buyersError && buyers.length > 0 && (
              <div className="space-y-2">
                {buyers.map((buyer) => (
                  <div
                    key={buyer.id}
                    className="bg-card border border-border hover:border-primary/40 rounded-xl p-3 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <div className="size-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {buyer.buyer_name?.split(" ").map(n => n[0]).join("") || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-[12px] font-semibold text-white truncate">{buyer.buyer_name}</p>
                          <CheckCircle2 className="size-3 text-primary shrink-0" />
                        </div>
                        <p className="text-[9px] text-muted-foreground">
                          Wants to buy {parseFloat(String(buyer.usdt_amount)).toLocaleString()} USDT
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-green-400">₹{parseFloat(String(buyer.rate)).toFixed(2)}</p>
                        <p className="text-[8px] text-muted-foreground">per USDT</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2.5 pb-2.5 border-b border-border">
                      <div>
                        <p className="text-[8px] text-muted-foreground">Order ID</p>
                        <p className="text-[10px] font-semibold text-white">{buyer.order_number}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-muted-foreground">Amount</p>
                        <p className="text-[10px] font-semibold text-white">₹{parseFloat(String(buyer.inr_amount)).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-muted-foreground">Status</p>
                        <p className="text-[10px] font-semibold text-amber-400 capitalize">{buyer.status}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectBuyer(buyer)}
                      disabled={isProcessing}
                      className="w-full py-2 bg-primary hover:bg-[#5d8cff] text-white text-[11px] font-semibold rounded-full transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="size-4 animate-spin mx-auto" />
                      ) : (
                        "Select this Buyer"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Escrow & Payment */}
        {step === 3 && selectedBuyer && (
          <div className="space-y-3 fade-in-up">
            {/* Trade Summary */}
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-[9px] font-bold">
                  {selectedBuyer.buyer_name?.split(" ").map(n => n[0]).join("") || "?"}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-white">{selectedBuyer.buyer_name}</p>
                  <p className="text-[9px] text-muted-foreground">Buyer • Order #{selectedBuyer.order_number}</p>
                </div>
                <p className="text-[12px] font-bold text-green-400">₹{parseFloat(String(selectedBuyer.rate)).toFixed(2)}</p>
              </div>
            </div>

            {/* Network Selector */}
            <div className="bg-card border border-border rounded-xl p-3">
              <label className="text-[10px] text-muted-foreground mb-2 block">Select Network</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["TRC20", "ERC20", "BEP20"] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${
                      network === n
                        ? "bg-primary text-white"
                        : "bg-surface text-muted-foreground hover:text-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Escrow Address */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-2">
                <Shield className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-white">
                    Send {usdtAmount} USDT to escrow wallet
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    Your USDT is safe — held by SwapEase until buyer pays
                  </p>
                </div>
              </div>
              <div className="bg-card rounded-lg p-2 flex items-center gap-2">
                <code className="flex-1 text-[9px] text-white font-mono break-all">
                  {ESCROW_WALLET[network]}
                </code>
                <button
                  onClick={copyAddress}
                  className="p-1.5 bg-primary/15 rounded-md transition-colors"
                >
                  {copied ? <Check className="size-3 text-primary" /> : <Copy className="size-3 text-primary" />}
                </button>
              </div>
              <p className="text-[9px] text-amber-400 mt-2">
                Only send via {network} network. Wrong network = lost funds
              </p>
            </div>

            {/* Status */}
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              {escrowStatus === "waiting" && (
                <>
                  <Loader2 className="size-8 text-primary mx-auto mb-2 animate-spin" />
                  <p className="text-[12px] font-semibold text-white mb-1">Waiting for your USDT deposit...</p>
                  <p className="text-[10px] text-muted-foreground">
                    Send the exact amount to escrow wallet above
                  </p>
                </>
              )}
              {escrowStatus === "deposited" && (
                <>
                  <CheckCircle2 className="size-8 text-green-400 mx-auto mb-2" />
                  <p className="text-[12px] font-semibold text-white mb-1">USDT received in escrow</p>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Buyer has 15 mins to send payment
                  </p>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full">
                    <Clock className="size-3 text-amber-400" />
                    <span className="text-[11px] font-bold text-amber-400">{formatTime(timeLeft)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Confirm Payment */}
        {step === 4 && selectedBuyer && (
          <div className="space-y-3 fade-in-up">
            {escrowStatus === "buyer-paid" && (
              <>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                  <CheckCircle2 className="size-10 text-green-400 mx-auto mb-2" />
                  <p className="text-[13px] font-bold text-white mb-1">Buyer claims payment sent!</p>
                  <p className="text-[10px] text-muted-foreground">
                    Check your bank/UPI for ₹{(usdtNum * selectedBuyer.rate).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground mb-2">Trade Details</p>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">USDT Sold</span>
                      <span className="text-white font-semibold">{usdtAmount} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="text-white">₹{parseFloat(String(selectedBuyer.rate)).toFixed(2)}/USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="text-red-400">- ₹{platformFee.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">You Receive</span>
                      <span className="font-bold text-green-400">₹{netInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmReceived}
                  disabled={isProcessing}
                  className="w-full py-3 bg-green-500 hover:bg-green-400 text-white text-[13px] font-bold rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Payment Received - Release USDT
                    </>
                  )}
                </button>

                <button
                  onClick={handleDispute}
                  className="w-full py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[12px] font-semibold rounded-full transition-colors hover:bg-red-500/20 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="size-4" />
                  Open Dispute
                </button>
              </>
            )}

            {escrowStatus === "released" && (
              <div className="bg-card border border-green-500/30 rounded-xl p-6 text-center">
                <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="size-10 text-green-400" />
                </div>
                <p className="text-[16px] font-bold text-white mb-2">Trade Completed!</p>
                <p className="text-[11px] text-muted-foreground mb-4">
                  {usdtAmount} USDT released to buyer. ₹{netInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })} credited to your account.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-[#5d8cff] text-white text-[12px] font-semibold rounded-full transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bottom-nav border-t border-border z-50">
        <div className="flex items-center justify-around h-full max-w-[390px] mx-auto">
          {[
            { href: "/", icon: Home, label: "Home" },
            { href: "/calculator", icon: Calculator, label: "Calculator" },
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: user ? "/profile" : "/login", icon: User, label: "Profile" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 transition-colors ${
                isActive(href) ? "text-primary" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Icon className="size-4" />
              <span className="text-[8px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
