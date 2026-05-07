"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  ArrowLeft, 
  Zap, 
  Wallet, 
  CheckCircle, 
  Clock, 
  Copy, 
  Check,
  Home,
  Calculator,
  LayoutDashboard,
  User,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Constants
const RATE = 86.50; // INR per USDT
const PLATFORM_FEE_PERCENT = 0.5;
const MIN_USDT = 10;
const MAX_USDT = 10000;

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Step state: 1 = Enter amount, 2 = Enter wallet, 3 = Payment status
  const [step, setStep] = useState(1);
  
  // Form state
  const [usdtAmount, setUsdtAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("TRC20");
  const [errors, setErrors] = useState<{ usdt?: string; wallet?: string }>({});
  
  // Transaction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "completed">("pending");
  const [copied, setCopied] = useState(false);
  
  // Calculated values
  const usdtNum = parseFloat(usdtAmount) || 0;
  const grossInr = usdtNum * RATE;
  const platformFee = grossInr * (PLATFORM_FEE_PERCENT / 100);
  const netInr = grossInr - platformFee;
  const netRate = usdtNum > 0 ? (netInr / usdtNum) : RATE;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/sell");
    }
  }, [user, router]);

  // Validate Step 1
  const validateStep1 = () => {
    const newErrors: { usdt?: string } = {};
    
    if (!usdtAmount || usdtNum <= 0) {
      newErrors.usdt = "Please enter a valid amount";
    } else if (usdtNum < MIN_USDT) {
      newErrors.usdt = `Minimum amount is ${MIN_USDT} USDT`;
    } else if (usdtNum > MAX_USDT) {
      newErrors.usdt = `Maximum amount is ${MAX_USDT} USDT`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2
  const validateStep2 = () => {
    const newErrors: { wallet?: string } = {};
    
    if (!walletAddress.trim()) {
      newErrors.wallet = "Please enter your wallet address";
    } else if (walletAddress.length < 20) {
      newErrors.wallet = "Invalid wallet address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Step 1 submit
  const handleStep1Submit = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  // Handle Step 2 submit
  const handleStep2Submit = async () => {
    if (!validateStep2()) return;
    
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate transaction ID
    const txId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setTransactionId(txId);
    setPaymentStatus("pending");
    setStep(3);
    setIsProcessing(false);
    
    // Simulate payment processing
    setTimeout(() => setPaymentStatus("processing"), 3000);
    setTimeout(() => {
      setPaymentStatus("completed");
      toast.success("USDT received! INR will be credited within 5 minutes.");
    }, 8000);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick amount buttons
  const quickAmounts = [100, 500, 1000, 5000];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Back button and title */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : router.push("/dashboard")}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
          >
            <ArrowLeft className="size-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-foreground">Sell USDT</h1>
            <p className="text-sm text-muted-foreground">Get INR directly in your bank</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div 
                className={`size-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  s === step 
                    ? "bg-primary text-primary-foreground" 
                    : s < step 
                      ? "bg-primary/20 text-primary" 
                      : "bg-surface text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="size-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-8 h-0.5 ${s < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Step {step} of 3: {step === 1 ? "Enter Amount" : step === 2 ? "Wallet Address" : "Payment Status"}
        </p>

        {/* Step 1: Enter Amount */}
        {step === 1 && (
          <div className="space-y-6 fade-in-up">
            {/* Amount Input Card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                USDT Amount
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
                  className={`w-full text-3xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 ${
                    errors.usdt ? "text-destructive" : ""
                  }`}
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                  USDT
                </span>
              </div>
              {errors.usdt && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {errors.usdt}
                </p>
              )}
              
              {/* Quick amounts */}
              <div className="flex gap-2 mt-4">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setUsdtAmount(amt.toString())}
                    className="flex-1 py-2 text-sm font-medium bg-surface hover:bg-primary/10 text-foreground rounded-lg transition-colors"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate Info Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">INR You Receive</span>
                <span className="text-2xl font-bold text-foreground">
                  {grossInr > 0 ? `₹${grossInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "₹0.00"}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                <span className="text-foreground">
                  - ₹{platformFee.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Net Rate</span>
                <span className="text-primary font-semibold">
                  ₹{netRate.toFixed(2)}/USDT
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Net Amount</span>
                <span className="text-xl font-bold text-primary">
                  ₹{netInr > 0 ? netInr.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0.00"}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleStep1Submit}
              disabled={!usdtAmount || usdtNum <= 0}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-green"
            >
              <Zap className="size-5" />
              Sell USDT Now
            </button>

            {/* Info text */}
            <p className="text-xs text-center text-muted-foreground">
              Min: {MIN_USDT} USDT | Max: {MAX_USDT.toLocaleString()} USDT
            </p>
          </div>
        )}

        {/* Step 2: Enter Wallet Address */}
        {step === 2 && (
          <div className="space-y-6 fade-in-up">
            {/* Summary Card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Selling</span>
                <span className="text-lg font-bold text-foreground">{usdtAmount} USDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">You Receive</span>
                <span className="text-lg font-bold text-primary">
                  ₹{netInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Network Selection */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Select Network
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["TRC20", "ERC20", "BEP20"].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className={`py-3 text-sm font-semibold rounded-xl transition-all ${
                      network === n
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-foreground hover:bg-primary/10"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Address Input */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Your {network} Wallet Address
              </label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => {
                    setWalletAddress(e.target.value);
                    setErrors({});
                  }}
                  placeholder={`Enter your ${network} address`}
                  className={`w-full pl-12 pr-4 py-4 bg-surface border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none ${
                    errors.wallet ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
              {errors.wallet && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {errors.wallet}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Send your USDT to our platform wallet after confirmation. Make sure to use the correct network.
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleStep2Submit}
              disabled={isProcessing || !walletAddress.trim()}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-green"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="size-5" />
                  Confirm & Continue
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Payment Status */}
        {step === 3 && (
          <div className="space-y-6 fade-in-up">
            {/* Status Card */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              {paymentStatus === "pending" && (
                <>
                  <div className="size-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="size-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Awaiting USDT</h3>
                  <p className="text-sm text-muted-foreground">
                    Please send {usdtAmount} USDT to the wallet address below
                  </p>
                </>
              )}
              {paymentStatus === "processing" && (
                <>
                  <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="size-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Processing Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve received your USDT. Processing INR transfer...
                  </p>
                </>
              )}
              {paymentStatus === "completed" && (
                <>
                  <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="size-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Payment Completed!</h3>
                  <p className="text-sm text-muted-foreground">
                    ₹{netInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })} has been credited to your bank account
                  </p>
                </>
              )}
            </div>

            {/* Platform Wallet Address */}
            {paymentStatus !== "completed" && (
              <div className="bg-surface border border-border rounded-2xl p-5">
                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Send USDT to ({network})
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-card rounded-lg text-xs text-foreground font-mono break-all">
                    TN7xG8K2mVqPzDh4jR9sYb3wLcFe5aQnMp
                  </code>
                  <button
                    onClick={() => copyToClipboard("TN7xG8K2mVqPzDh4jR9sYb3wLcFe5aQnMp")}
                    className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="size-5 text-primary" /> : <Copy className="size-5 text-primary" />}
                  </button>
                </div>
                <p className="text-xs text-destructive mt-3 font-medium">
                  Only send USDT via {network} network. Other tokens will be lost.
                </p>
              </div>
            )}

            {/* Transaction Details */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-foreground">{transactionId}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-foreground">{usdtAmount} USDT</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">You Receive</span>
                <span className="font-bold text-primary">
                  ₹{netInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  paymentStatus === "pending" 
                    ? "bg-yellow-500/10 text-yellow-600" 
                    : paymentStatus === "processing"
                      ? "bg-primary/10 text-primary"
                      : "bg-primary/10 text-primary"
                }`}>
                  {paymentStatus === "pending" ? "Pending" : paymentStatus === "processing" ? "Processing" : "Completed"}
                </span>
              </div>
            </div>

            {/* Actions */}
            {paymentStatus === "completed" && (
              <div className="flex gap-3">
                <Link 
                  href="/dashboard" 
                  className="flex-1 py-4 bg-surface text-foreground font-semibold rounded-xl text-center hover:bg-surface/80 transition-colors"
                >
                  View Dashboard
                </Link>
                <button
                  onClick={() => {
                    setStep(1);
                    setUsdtAmount("");
                    setWalletAddress("");
                    setPaymentStatus("pending");
                  }}
                  className="flex-1 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Sell More
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 md:hidden z-50">
        <div className="flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-primary transition-colors">
            <Home className="size-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/calculator" className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-primary transition-colors">
            <Calculator className="size-5" />
            <span className="text-xs font-medium">Calculator</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-primary transition-colors">
            <LayoutDashboard className="size-5" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-primary transition-colors">
            <User className="size-5" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
