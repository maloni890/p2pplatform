"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RATE = 106.35;
const PLATFORM_FEE_PERCENT = 0.5;
const MIN_INR = 500;
const MAX_INR = 1000000;

interface Seller {
  id: string;
  name: string;
  initials: string;
  verified: boolean;
  rate: number;
  available: number;
  completionRate: number;
  avgReleaseTime: string;
  trades: number;
  upiId: string;
}

const ACTIVE_SELLERS: Seller[] = [
  { id: "S001", name: "Vikram Singh", initials: "VS", verified: true, rate: 106.20, available: 5000, completionRate: 99.2, avgReleaseTime: "3 min", trades: 1245, upiId: "vikram****@okaxis" },
  { id: "S002", name: "Anjali Mehta", initials: "AM", verified: true, rate: 106.25, available: 8500, completionRate: 98.8, avgReleaseTime: "5 min", trades: 856, upiId: "anjali****@upi" },
  { id: "S003", name: "Karan Joshi", initials: "KJ", verified: true, rate: 106.15, available: 2500, completionRate: 99.6, avgReleaseTime: "2 min", trades: 2341, upiId: "karan****@paytm" },
  { id: "S004", name: "Neha Gupta", initials: "NG", verified: false, rate: 106.10, available: 1000, completionRate: 96.5, avgReleaseTime: "8 min", trades: 124, upiId: "neha****@ybl" },
];

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

  const amountNum = parseFloat(amount) || 0;
  const sellerRate = selectedSeller?.rate || RATE;
  const inrAmount = inputMode === "inr" ? amountNum : amountNum * sellerRate;
  const usdtAmount = inputMode === "usdt" ? amountNum : amountNum / sellerRate;
  const platformFee = inrAmount * (PLATFORM_FEE_PERCENT / 100);
  const totalInr = inrAmount + platformFee;

  useEffect(() => {
    if (!user) router.push("/login?redirect=/buy");
  }, [user, router]);

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
    const inr = inputMode === "inr" ? amountNum : amountNum * RATE;
    if (!amount || amountNum <= 0) newErrors.amount = "Please enter a valid amount";
    else if (inr < MIN_INR) newErrors.amount = `Minimum amount is ₹${MIN_INR}`;
    else if (inr > MAX_INR) newErrors.amount = `Maximum amount is ₹${MAX_INR.toLocaleString()}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1 = () => validateStep1() && setStep(2);

  const handleSelectSeller = (seller: Seller) => {
    setSelectedSeller(seller);
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
    await new Promise((r) => setTimeout(r, 2000));
    setIsProcessing(false);
    setStep(5);

    // Auto-complete after 3s
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

  const handleConfirmWallet = () => {
    if (validateStep5Wallet()) {
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
            onClick={() => (step > 1 ? setStep(step - 1) : router.push("/dashboard"))}
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
                  ₹{RATE.toFixed(2)}/USDT
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

        {/* Step 2: Select Seller */}
        {step === 2 && (
          <div className="space-y-3 fade-in-up">
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">You want to buy</span>
                <span className="text-[14px] font-bold text-white">{usdtAmount.toFixed(2)} USDT</span>
              </div>
            </div>

            <div className="space-y-2">
              {ACTIVE_SELLERS.filter((s) => s.available >= usdtAmount).map((seller) => (
                <div
                  key={seller.id}
                  className="bg-card border border-border hover:border-primary/40 rounded-xl p-3 transition-colors"
                >
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <div className="size-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {seller.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[12px] font-semibold text-white truncate">{seller.name}</p>
                        {seller.verified && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-green-500/15 border border-green-500/30 rounded-full">
                            <CheckCircle2 className="size-2.5 text-green-400" />
                            <span className="text-[7px] text-green-400 font-semibold">Verified</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-muted-foreground">
                        Available: {seller.available.toLocaleString()} USDT
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-bold text-primary">₹{seller.rate}</p>
                      <p className="text-[8px] text-muted-foreground">per USDT</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2.5 pb-2.5 border-b border-border">
                    <div>
                      <p className="text-[8px] text-muted-foreground">Completion</p>
                      <p className="text-[10px] font-semibold text-white">{seller.completionRate}%</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-muted-foreground">Release</p>
                      <p className="text-[10px] font-semibold text-white">{seller.avgReleaseTime}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-muted-foreground">Trades</p>
                      <p className="text-[10px] font-semibold text-white inline-flex items-center gap-0.5">
                        <Star className="size-2.5 text-amber-400" fill="currentColor" />
                        {seller.trades}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectSeller(seller)}
                    className="w-full py-2 bg-primary hover:bg-[#5d8cff] text-white text-[11px] font-semibold rounded-full transition-colors"
                  >
                    Buy from this Seller
                  </button>
                </div>
              ))}

              {ACTIVE_SELLERS.filter((s) => s.available >= usdtAmount).length === 0 && (
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    No sellers available for this amount. Try a smaller amount.
                  </p>
                </div>
              )}
            </div>
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
                  {selectedSeller.initials}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-white">{selectedSeller.name}</p>
                  <p className="text-[9px] text-muted-foreground">Verified Seller • {selectedSeller.completionRate}%</p>
                </div>
                <p className="text-[12px] font-bold text-primary">₹{selectedSeller.rate}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-card border border-border rounded-xl p-3 space-y-2.5">
              <p className="text-[11px] font-semibold text-white mb-1">Pay to seller&apos;s UPI</p>

              <div className="bg-surface rounded-lg p-2.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[8px] text-muted-foreground mb-0.5">UPI ID</p>
                  <p className="text-[12px] font-mono font-semibold text-white truncate">{selectedSeller.upiId}</p>
                </div>
                <button
                  onClick={() => copyText(selectedSeller.upiId, "upi")}
                  className="p-1.5 bg-primary/15 rounded-md ml-2"
                >
                  {copied === "upi" ? <Check className="size-3 text-primary" /> : <Copy className="size-3 text-primary" />}
                </button>
              </div>

              <div className="bg-surface rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-muted-foreground mb-0.5">Exact Amount to Pay</p>
                  <p className="text-[16px] font-bold text-primary">
                    ₹{totalInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => copyText(totalInr.toFixed(2), "amount")}
                  className="p-1.5 bg-primary/15 rounded-md"
                >
                  {copied === "amount" ? <Check className="size-3 text-primary" /> : <Copy className="size-3 text-primary" />}
                </button>
              </div>
            </div>

            {/* Warnings */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 space-y-1.5">
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="size-3 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-white">
                  <span className="font-semibold">Pay exact amount only</span>
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="size-3 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-white">
                  <span className="font-semibold">Do not write USDT/Crypto</span> in payment note
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="size-3 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-white">
                  Pay only from <span className="font-semibold">your verified bank account</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleStep3Submit}
              className="w-full py-3 bg-primary hover:bg-[#5d8cff] text-white text-[13px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5"
            >
              I have paid
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* Step 4: Upload Payment Proof */}
        {step === 4 && selectedSeller && (
          <div className="space-y-3 fade-in-up">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[11px] font-semibold text-white mb-2">Upload Payment Proof</p>

              {!screenshotPreview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-border rounded-xl hover:border-primary/40 transition-colors flex flex-col items-center gap-2"
                >
                  <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Upload className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white">Tap to upload screenshot</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">PNG, JPG up to 5MB</p>
                  </div>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={screenshotPreview || "/placeholder.svg"} alt="Payment proof" className="w-full h-auto" />
                  <button
                    onClick={() => {
                      setScreenshot(null);
                      setScreenshotPreview(null);
                    }}
                    className="absolute top-2 right-2 size-7 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="size-3.5 text-white" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-card/90 rounded-full text-[9px] text-white inline-flex items-center gap-1">
                    <ImageIcon className="size-2.5" />
                    {screenshot?.name}
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {errors.screenshot && (
                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.screenshot}
                </p>
              )}
            </div>

            {/* UTR */}
            <div className="bg-card border border-border rounded-xl p-3">
              <label className="text-[10px] text-muted-foreground mb-2 block">UTR / Transaction ID</label>
              <input
                type="text"
                value={utr}
                onChange={(e) => {
                  setUtr(e.target.value);
                  setErrors({ ...errors, utr: undefined });
                }}
                placeholder="Enter UTR from your payment app"
                className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-[12px] text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary ${
                  errors.utr ? "border-red-500/50" : "border-border"
                }`}
              />
              {errors.utr && (
                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.utr}
                </p>
              )}
              <p className="text-[9px] text-muted-foreground mt-1.5">
                Find UTR in your UPI/bank app under transaction details
              </p>
            </div>

            <button
              onClick={handleStep4Submit}
              disabled={isProcessing}
              className="w-full py-3 bg-primary hover:bg-[#5d8cff] text-white text-[13px] font-bold rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Submit Payment Proof
                </>
              )}
            </button>

            <p className="text-[9px] text-center text-muted-foreground">
              USDT will be released within 5 mins after seller confirms
            </p>
          </div>
        )}

        {/* Step 5: Receive USDT */}
        {step === 5 && selectedSeller && (
          <div className="space-y-3 fade-in-up">
            {!txHash ? (
              <div className="bg-card border border-amber-500/30 rounded-xl p-5 text-center">
                <div className="size-14 mx-auto mb-3 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <Loader2 className="size-7 text-amber-400 animate-spin" />
                </div>
                <h3 className="text-[14px] font-bold text-white mb-1">Waiting for seller to confirm...</h3>
                <p className="text-[10px] text-muted-foreground">
                  {selectedSeller.name} is verifying your payment
                </p>
              </div>
            ) : (
              <div className="bg-card border border-green-500/40 rounded-xl p-5 text-center">
                <div className="size-14 mx-auto mb-3 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 className="size-7 text-green-400" />
                </div>
                <h3 className="text-[15px] font-bold text-white mb-1">USDT Sent!</h3>
                <p className="text-[11px] text-muted-foreground mb-3">
                  {usdtAmount.toFixed(2)} USDT sent to your wallet
                </p>
                <div className="bg-surface rounded-lg p-2 text-left">
                  <p className="text-[8px] text-muted-foreground mb-0.5">Transaction Hash</p>
                  <div className="flex items-center gap-1">
                    <p className="text-[9px] font-mono text-white truncate">{txHash}</p>
                    <button
                      onClick={() => copyText(txHash, "hash")}
                      className="p-1 bg-primary/15 rounded shrink-0"
                    >
                      {copied === "hash" ? <Check className="size-2.5 text-primary" /> : <Copy className="size-2.5 text-primary" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Address */}
            <div className="bg-card border border-border rounded-xl p-3">
              <label className="text-[10px] text-muted-foreground mb-2 block">Your USDT Wallet</label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {(["TRC20", "ERC20", "BEP20"] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className={`py-1.5 text-[10px] font-semibold rounded-lg transition-all ${
                      network === n ? "bg-primary text-white" : "bg-surface text-muted-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Wallet className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => {
                    setWalletAddress(e.target.value);
                    setErrors({ ...errors, wallet: undefined });
                  }}
                  placeholder={`Your ${network} address`}
                  className={`w-full pl-8 pr-3 py-2.5 bg-surface border rounded-lg text-[11px] text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary ${
                    errors.wallet ? "border-red-500/50" : "border-border"
                  }`}
                />
              </div>
              {errors.wallet && (
                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.wallet}
                </p>
              )}
              <button
                onClick={handleConfirmWallet}
                className="w-full mt-2 py-2 bg-primary text-white text-[11px] font-semibold rounded-full"
              >
                Confirm Wallet Address
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard"
                className="py-2.5 bg-surface text-white text-[11px] font-semibold rounded-full text-center"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setStep(1);
                  setAmount("");
                  setSelectedSeller(null);
                  setScreenshot(null);
                  setScreenshotPreview(null);
                  setUtr("");
                  setTxHash("");
                  setWalletAddress("");
                }}
                className="py-2.5 bg-primary text-white text-[11px] font-semibold rounded-full"
              >
                Buy More
              </button>
            </div>
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
