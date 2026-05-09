"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Star,
  ArrowRight,
  Upload,
  ImageIcon,
  X,
  Wallet,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PLATFORM_FEE_PERCENT = 0.5;
const MIN_INR = 500;
const MAX_INR = 1000000;

interface Seller {
  id: string;
  user_id: string;
  name: string;
  username: string;
  avatar_initials: string;
  is_verified: boolean;
  is_online: boolean;
  available_usdt: number;
  rate: number;
  upi_id: string;
  bank_account: string | null;
  bank_ifsc: string | null;
  bank_name: string | null;
  completion_rate: number;
  avg_response_time: number;
  total_trades: number;
  rating: number;
  min_limit: number;
  max_limit: number;
}

// Loading Skeleton Component
function SellerSkeleton() {
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

export default function BuyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [inputMode, setInputMode] = useState<"inr" | "usdt">("inr");
  const [amount, setAmount] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState<"TRC20" | "ERC20" | "BEP20">("TRC20");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [utr, setUtr] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; screenshot?: string; utr?: string; wallet?: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [txHash, setTxHash] = useState("");
  
  // New state for database integration
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [sellersError, setSellersError] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [liveRate, setLiveRate] = useState(106.35);

  const amountNum = parseFloat(amount) || 0;
  const sellerRate = selectedSeller?.rate || liveRate;
  const inrAmount = inputMode === "inr" ? amountNum : amountNum * sellerRate;
  const usdtAmount = inputMode === "usdt" ? amountNum : amountNum / sellerRate;
  const platformFee = inrAmount * (PLATFORM_FEE_PERCENT / 100);
  const totalInr = inrAmount + platformFee;

  useEffect(() => {
    if (!user) router.push("/login?redirect=/buy");
  }, [user, router]);

  // Fetch sellers from database
  const fetchSellers = useCallback(async () => {
    if (usdtAmount <= 0) return;
    
    setLoadingSellers(true);
    setSellersError(null);
    
    try {
      const res = await fetch(`/api/sellers?minAmount=${usdtAmount}`);
      const data = await res.json();
      
      if (data.success) {
        setSellers(data.sellers);
        // Update live rate from first seller if available
        if (data.sellers.length > 0) {
          setLiveRate(parseFloat(data.sellers[0].rate));
        }
      } else {
        setSellersError("Failed to load sellers");
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      setSellersError("Failed to load sellers. Please try again.");
    } finally {
      setLoadingSellers(false);
    }
  }, [usdtAmount]);

  // Fetch sellers when entering step 2
  useEffect(() => {
    if (step === 2) {
      fetchSellers();
    }
  }, [step, fetchSellers]);

  // Countdown for step 3
  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const validateStep1 = () => {
    const newErrors: { amount?: string } = {};
    const inr = inputMode === "inr" ? amountNum : amountNum * liveRate;
    if (!amount || amountNum <= 0) newErrors.amount = "Please enter a valid amount";
    else if (inr < MIN_INR) newErrors.amount = `Minimum amount is ₹${MIN_INR}`;
    else if (inr > MAX_INR) newErrors.amount = `Maximum amount is ₹${MAX_INR.toLocaleString()}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1 = () => validateStep1() && setStep(2);

  const handleSelectSeller = async (seller: Seller) => {
    setSelectedSeller(seller);
    setIsProcessing(true);
    
    // Create order in database
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: user?.id || user?.username,
          buyerName: user?.name || user?.username,
          sellerId: seller.id,
          sellerUserId: seller.user_id,
          sellerName: seller.name,
          type: "buy",
          usdtAmount: usdtAmount,
          inrAmount: usdtAmount * seller.rate,
          rate: seller.rate,
          commission: (usdtAmount * seller.rate) * (PLATFORM_FEE_PERCENT / 100),
          paymentMethod: "UPI",
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setCurrentOrderId(data.order.id);
        toast.success("Order created! Pay the seller.");
      } else {
        toast.error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    }
    
    setIsProcessing(false);
    setStep(3);
    setTimeLeft(15 * 60);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, screenshot: "File must be less than 5MB" });
        return;
      }
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setErrors({ ...errors, screenshot: undefined });
    }
  };

  const handleStep4Submit = async () => {
    const newErrors: typeof errors = {};
    if (!screenshot) newErrors.screenshot = "Please upload payment screenshot";
    if (!utr.trim()) newErrors.utr = "Please enter UTR / Transaction ID";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsProcessing(true);
    
    // Update order status in database
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrderId,
          status: "payment_uploaded",
          paymentScreenshot: screenshotPreview, // In production, upload to storage
          utrNumber: utr,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Payment proof uploaded!");
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
    
    setIsProcessing(false);
    setStep(5);

    // Simulate seller releasing USDT
    setTimeout(() => {
      const hash = "0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setTxHash(hash);
      toast.success("USDT sent to your wallet!");
    }, 3000);
  };

  const handleStep3Submit = () => {
    setStep(4);
  };

  const validateStep5Wallet = () => {
    const newErrors: { wallet?: string } = {};
    if (!walletAddress.trim()) newErrors.wallet = "Please enter your wallet address";
    else if (walletAddress.length < 20) newErrors.wallet = "Invalid wallet address";
    setErrors({ ...errors, ...newErrors });
    return !newErrors.wallet;
  };

  const handleConfirmWallet = async () => {
    if (validateStep5Wallet()) {
      // Update order with wallet address
      try {
        await fetch("/api/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: currentOrderId,
            status: "completed",
            buyerWalletAddress: walletAddress,
            buyerWalletNetwork: network,
          }),
        });
      } catch (error) {
        console.error("Error updating order:", error);
      }
      toast.success(`${usdtAmount.toFixed(2)} USDT will be sent to your wallet`);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied");
    setTimeout(() => setCopied(null), 2000);
  };

  const isActive = (path: string) => pathname === path;
  const quickAmountsInr = [1000, 5000, 10000, 50000];
  const quickAmountsUsdt = [50, 100, 500, 1000];

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.1)_0%,transparent_70%)] pointer-events-none" />
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
            <h1 className="text-[16px] font-bold text-white">Buy USDT</h1>
            <p className="text-[10px] text-muted-foreground">P2P trade with verified sellers</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`size-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                    s === step
                      ? "bg-primary text-white"
                      : s < step
                      ? "bg-primary/20 text-primary"
                      : "bg-surface text-muted-foreground"
                  }`}
                >
                  {s < step ? <Check className="size-2.5" /> : s}
                </div>
                {s < 5 && (
                  <div className={`flex-1 h-0.5 mx-1 ${s < step ? "bg-primary" : "bg-border"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-[10px] text-muted-foreground">
            Step {step} of 5:{" "}
            {step === 1
              ? "Enter Amount"
              : step === 2
              ? "Select Seller"
              : step === 3
              ? "Pay Seller"
              : step === 4
              ? "Upload Proof"
              : "Receive USDT"}
          </p>
        </div>

        {/* Step 1: Enter Amount */}
        {step === 1 && (
          <div className="space-y-3 fade-in-up">
            {/* Toggle */}
            <div className="bg-card border border-border rounded-xl p-1 flex">
              <button
                onClick={() => {
                  setInputMode("inr");
                  setAmount("");
                }}
                className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all ${
                  inputMode === "inr" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                Enter INR
              </button>
              <button
                onClick={() => {
                  setInputMode("usdt");
                  setAmount("");
                }}
                className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all ${
                  inputMode === "usdt" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                Enter USDT
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <label className="text-[10px] text-muted-foreground mb-2 block">
                {inputMode === "inr"
                  ? "How much INR do you want to spend?"
                  : "How much USDT do you want to buy?"}
              </label>
              <div className="relative">
                {inputMode === "inr" && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                    ₹
                  </span>
                )}
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrors({});
                  }}
                  placeholder="0.00"
                  className={`w-full text-2xl font-bold bg-transparent border-none outline-none text-white placeholder:text-muted-foreground/30 ${
                    inputMode === "inr" ? "pl-5" : ""
                  }`}
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-muted-foreground">
                  {inputMode === "inr" ? "INR" : "USDT"}
                </span>
              </div>
              {errors.amount && (
                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.amount}
                </p>
              )}
              <div className="flex gap-1.5 mt-3">
                {(inputMode === "inr" ? quickAmountsInr : quickAmountsUsdt).map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="flex-1 py-1.5 text-[10px] font-medium bg-surface hover:bg-primary/10 text-white rounded-lg transition-colors"
                  >
                    {inputMode === "inr" ? `₹${amt >= 1000 ? amt / 1000 + "k" : amt}` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate Info */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/5 border border-primary/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Live Rate</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-primary font-semibold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                  </span>
                  ₹{liveRate.toFixed(2)}/USDT
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">USDT You Receive</span>
                <span className="text-white font-semibold">{usdtAmount.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                <span className="text-amber-400">
                  + ₹{platformFee.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-white">You will pay</span>
                <span className="text-[18px] font-bold text-primary">
                  ≈ ₹{totalInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handleStep1}
              disabled={!amount || amountNum <= 0}
              className="w-full py-3 bg-primary hover:bg-[#5d8cff] text-white text-[13px] font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              Find Seller
              <ArrowRight className="size-4" />
            </button>
            <p className="text-[9px] text-center text-muted-foreground">
              Min: ₹{MIN_INR} | Max: ₹{MAX_INR.toLocaleString()}
            </p>
          </div>
        )}

        {/* Step 2: Select Seller - Now with real database calls */}
        {step === 2 && (
          <div className="space-y-3 fade-in-up">
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">You want to buy</span>
                <span className="text-[14px] font-bold text-white">{usdtAmount.toFixed(2)} USDT</span>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                {sellers.length} seller{sellers.length !== 1 ? "s" : ""} available
              </p>
              <button
                onClick={fetchSellers}
                disabled={loadingSellers}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`size-3 ${loadingSellers ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Loading State */}
            {loadingSellers && (
              <div className="space-y-2">
                <SellerSkeleton />
                <SellerSkeleton />
                <SellerSkeleton />
              </div>
            )}

            {/* Error State */}
            {sellersError && !loadingSellers && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                <AlertCircle className="size-8 text-red-400 mx-auto mb-2" />
                <p className="text-[11px] text-red-400 mb-2">{sellersError}</p>
                <button
                  onClick={fetchSellers}
                  className="px-4 py-1.5 bg-red-500/20 text-red-400 text-[10px] font-semibold rounded-full hover:bg-red-500/30 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loadingSellers && !sellersError && sellers.length === 0 && (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="size-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-3">
                  <User className="size-6 text-muted-foreground" />
                </div>
                <p className="text-[12px] font-semibold text-white mb-1">No sellers available</p>
                <p className="text-[10px] text-muted-foreground mb-3">
                  No sellers have enough USDT for your order right now. Try a smaller amount or check back later.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-1.5 bg-primary/20 text-primary text-[10px] font-semibold rounded-full hover:bg-primary/30 transition-colors"
                >
                  Change Amount
                </button>
              </div>
            )}

            {/* Sellers List */}
            {!loadingSellers && !sellersError && sellers.length > 0 && (
              <div className="space-y-2">
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="bg-card border border-border hover:border-primary/40 rounded-xl p-3 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <div className="size-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {seller.avatar_initials || seller.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-[12px] font-semibold text-white truncate">{seller.name}</p>
                          {seller.is_verified && (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-green-500/15 border border-green-500/30 rounded-full">
                              <CheckCircle2 className="size-2.5 text-green-400" />
                              <span className="text-[7px] text-green-400 font-semibold">Verified</span>
                            </span>
                          )}
                          {seller.is_online && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-muted-foreground">
                          Available: {parseFloat(String(seller.available_usdt)).toLocaleString()} USDT
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-primary">₹{parseFloat(String(seller.rate)).toFixed(2)}</p>
                        <p className="text-[8px] text-muted-foreground">per USDT</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2.5 pb-2.5 border-b border-border">
                      <div>
                        <p className="text-[8px] text-muted-foreground">Completion</p>
                        <p className="text-[10px] font-semibold text-white">{parseFloat(String(seller.completion_rate)).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-muted-foreground">Response</p>
                        <p className="text-[10px] font-semibold text-white">~{seller.avg_response_time} min</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-muted-foreground">Trades</p>
                        <p className="text-[10px] font-semibold text-white inline-flex items-center gap-0.5">
                          <Star className="size-2.5 text-amber-400" fill="currentColor" />
                          {seller.total_trades}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectSeller(seller)}
                      disabled={isProcessing}
                      className="w-full py-2 bg-primary hover:bg-[#5d8cff] text-white text-[11px] font-semibold rounded-full transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="size-4 animate-spin mx-auto" />
                      ) : (
                        "Buy from this Seller"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Payment Instructions */}
        {step === 3 && selectedSeller && (
          <div className="space-y-3 fade-in-up">
            {/* Timer */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
              <div className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-amber-400" />
                <p className="text-[11px] text-muted-foreground">Payment valid for</p>
                <span className="text-[14px] font-bold text-amber-400">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-[9px] font-bold">
                  {selectedSeller.avatar_initials}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-white">{selectedSeller.name}</p>
                  <p className="text-[9px] text-muted-foreground">Verified Seller • {parseFloat(String(selectedSeller.completion_rate)).toFixed(1)}%</p>
                </div>
                <p className="text-[12px] font-bold text-primary">₹{parseFloat(String(selectedSeller.rate)).toFixed(2)}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-card border border-border rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-[10px] text-muted-foreground">Pay Amount</span>
                <span className="text-[16px] font-bold text-white">
                  ₹{(usdtAmount * parseFloat(String(selectedSeller.rate))).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* UPI ID */}
              <div>
                <label className="text-[9px] text-muted-foreground mb-1 block">Pay to UPI</label>
                <div className="flex items-center gap-2 bg-surface rounded-lg p-2">
                  <code className="flex-1 text-[11px] text-white font-mono">{selectedSeller.upi_id}</code>
                  <button
                    onClick={() => copyText(selectedSeller.upi_id, "upi")}
                    className="p-1.5 bg-primary/15 rounded-md transition-colors"
                  >
                    {copied === "upi" ? <Check className="size-3 text-primary" /> : <Copy className="size-3 text-primary" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-red-400 font-semibold mb-1">Important Instructions</p>
                  <ul className="text-[9px] text-red-400/80 space-y-0.5 list-disc pl-3">
                    <li>Pay exact amount shown above</li>
                    <li>Do NOT mention crypto/USDT in payment remarks</li>
                    <li>Take screenshot after payment</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleStep3Submit}
              className="w-full py-3 bg-primary hover:bg-[#5d8cff] text-white text-[13px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5"
            >
              I&apos;ve Made Payment
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* Step 4: Upload Payment Proof */}
        {step === 4 && selectedSeller && (
          <div className="space-y-3 fade-in-up">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-[11px] text-muted-foreground">Upload proof of payment to</p>
              <p className="text-[13px] font-bold text-white">{selectedSeller.name}</p>
            </div>

            {/* Screenshot Upload */}
            <div className="bg-card border border-border rounded-xl p-3">
              <label className="text-[10px] text-muted-foreground mb-2 block">Payment Screenshot</label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {screenshotPreview ? (
                <div className="relative rounded-lg overflow-hidden mb-2">
                  <img src={screenshotPreview} alt="Screenshot" className="w-full h-32 object-cover" />
                  <button
                    onClick={() => {
                      setScreenshot(null);
                      setScreenshotPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
                  >
                    <X className="size-3 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-border rounded-lg flex flex-col items-center gap-2 hover:border-primary/50 transition-colors"
                >
                  <div className="size-10 rounded-full bg-surface flex items-center justify-center">
                    <Upload className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Tap to upload screenshot</p>
                </button>
              )}
              {errors.screenshot && (
                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.screenshot}
                </p>
              )}
            </div>

            {/* UTR Input */}
            <div className="bg-card border border-border rounded-xl p-3">
              <label className="text-[10px] text-muted-foreground mb-2 block">UTR / Transaction ID</label>
              <input
                type="text"
                value={utr}
                onChange={(e) => {
                  setUtr(e.target.value);
                  setErrors({ ...errors, utr: undefined });
                }}
                placeholder="Enter 12-digit UTR number"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-[12px] text-white placeholder:text-muted-foreground/50 outline-none focus:border-primary"
              />
              {errors.utr && (
                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.utr}
                </p>
              )}
            </div>

            <button
              onClick={handleStep4Submit}
              disabled={isProcessing}
              className="w-full py-3 bg-primary hover:bg-[#5d8cff] text-white text-[13px] font-bold rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isProcessing ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  Submit Proof
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 5: Receive USDT */}
        {step === 5 && (
          <div className="space-y-3 fade-in-up">
            {/* Status */}
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              {!txHash ? (
                <>
                  <Loader2 className="size-10 text-primary mx-auto mb-3 animate-spin" />
                  <p className="text-[13px] font-bold text-white mb-1">Waiting for seller...</p>
                  <p className="text-[10px] text-muted-foreground">
                    Seller is verifying your payment. USDT will be sent once confirmed.
                  </p>
                </>
              ) : (
                <>
                  <div className="size-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="size-8 text-green-400" />
                  </div>
                  <p className="text-[14px] font-bold text-white mb-1">Trade Completed!</p>
                  <p className="text-[10px] text-muted-foreground mb-3">
                    {usdtAmount.toFixed(2)} USDT has been sent to your wallet
                  </p>
                </>
              )}
            </div>

            {/* Wallet Address Input */}
            <div className="bg-card border border-border rounded-xl p-3">
              <label className="text-[10px] text-muted-foreground mb-2 block">Your Wallet Address</label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {(["TRC20", "ERC20", "BEP20"] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className={`py-1.5 text-[10px] font-semibold rounded-lg transition-all ${
                      network === n
                        ? "bg-primary text-white"
                        : "bg-surface text-muted-foreground hover:text-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => {
                  setWalletAddress(e.target.value);
                  setErrors({ ...errors, wallet: undefined });
                }}
                placeholder={`Enter ${network} wallet address`}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-[11px] text-white placeholder:text-muted-foreground/50 outline-none focus:border-primary font-mono"
              />
              {errors.wallet && (
                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.wallet}
                </p>
              )}
            </div>

            {txHash && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground">Transaction Hash</span>
                  <button
                    onClick={() => copyText(txHash, "txhash")}
                    className="p-1 hover:bg-green-500/20 rounded"
                  >
                    {copied === "txhash" ? <Check className="size-3 text-green-400" /> : <Copy className="size-3 text-green-400" />}
                  </button>
                </div>
                <code className="text-[9px] text-green-400 font-mono break-all">{txHash}</code>
              </div>
            )}

            <button
              onClick={handleConfirmWallet}
              className="w-full py-3 bg-primary hover:bg-[#5d8cff] text-white text-[13px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5"
            >
              <Wallet className="size-4" />
              Confirm Wallet
            </button>

            <Link
              href="/dashboard"
              className="w-full py-3 bg-surface hover:bg-surface/80 text-white text-[12px] font-semibold rounded-full transition-all flex items-center justify-center gap-1.5"
            >
              Back to Dashboard
            </Link>
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
