"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Upload, 
  CheckCircle, 
  Clock, 
  Copy, 
  Check,
  Home,
  Calculator,
  LayoutDashboard,
  User,
  AlertCircle,
  Loader2,
  Building2,
  QrCode,
  X,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Constants
const RATE = 87.00; // INR per USDT
const PLATFORM_FEE_PERCENT = 0.5;
const MIN_INR = 500;
const MAX_INR = 500000;

// Platform bank details (demo)
const BANK_DETAILS = {
  name: "SwapEase Technologies Pvt Ltd",
  accountNumber: "50200012345678",
  ifsc: "HDFC0001234",
  bank: "HDFC Bank",
  upiId: "swapease@hdfcbank"
};

export default function BuyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Step state: 1 = Enter amount, 2 = Payment details, 3 = Upload & Status
  const [step, setStep] = useState(1);
  const [inputMode, setInputMode] = useState<"inr" | "usdt">("inr");
  
  // Form state
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("TRC20");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank">("upi");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ amount?: string; wallet?: string; screenshot?: string }>({});
  
  // Transaction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "verifying" | "completed">("pending");
  const [copied, setCopied] = useState<string | null>(null);
  
  // Calculated values
  const amountNum = parseFloat(amount) || 0;
  const inrAmount = inputMode === "inr" ? amountNum : amountNum * RATE;
  const usdtAmount = inputMode === "usdt" ? amountNum : amountNum / RATE;
  const platformFee = inrAmount * (PLATFORM_FEE_PERCENT / 100);
  const totalInr = inrAmount + platformFee;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/buy");
    }
  }, [user, router]);

  // Validate Step 1
  const validateStep1 = () => {
    const newErrors: { amount?: string; wallet?: string } = {};
    
    const inr = inputMode === "inr" ? amountNum : amountNum * RATE;
    
    if (!amount || amountNum <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (inr < MIN_INR) {
      newErrors.amount = `Minimum amount is ₹${MIN_INR}`;
    } else if (inr > MAX_INR) {
      newErrors.amount = `Maximum amount is ₹${MAX_INR.toLocaleString()}`;
    }
    
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

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, screenshot: "File size must be less than 5MB" });
        return;
      }
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setErrors({ ...errors, screenshot: undefined });
    }
  };

  // Handle Step 2 submit (upload screenshot)
  const handleStep2Submit = async () => {
    if (!screenshot) {
      setErrors({ ...errors, screenshot: "Please upload payment screenshot" });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate transaction ID
    const txId = `BUY${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setTransactionId(txId);
    setPaymentStatus("verifying");
    setStep(3);
    setIsProcessing(false);
    
    // Simulate verification
    setTimeout(() => {
      setPaymentStatus("completed");
      toast.success("Payment verified! USDT will be sent to your wallet.");
    }, 5000);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  // Quick amount buttons
  const quickAmountsInr = [1000, 5000, 10000, 50000];
  const quickAmountsUsdt = [50, 100, 500, 1000];

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
            <h1 className="font-bold text-xl text-foreground">Buy USDT</h1>
            <p className="text-sm text-muted-foreground">Pay via UPI or Bank Transfer</p>
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
          Step {step} of 3: {step === 1 ? "Enter Amount" : step === 2 ? "Make Payment" : "Confirmation"}
        </p>

        {/* Step 1: Enter Amount */}
        {step === 1 && (
          <div className="space-y-6 fade-in-up">
            {/* Input Mode Toggle */}
            <div className="bg-card border border-border rounded-2xl p-2 flex">
              <button
                onClick={() => { setInputMode("inr"); setAmount(""); }}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${
                  inputMode === "inr" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Enter INR
              </button>
              <button
                onClick={() => { setInputMode("usdt"); setAmount(""); }}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${
                  inputMode === "usdt" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Enter USDT
              </button>
            </div>

            {/* Amount Input Card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                {inputMode === "inr" ? "INR Amount" : "USDT Amount"}
              </label>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                  {inputMode === "inr" ? "₹" : ""}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrors({});
                  }}
                  placeholder="0.00"
                  className={`w-full text-3xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 ${
                    inputMode === "inr" ? "pl-6" : ""
                  } ${errors.amount ? "text-destructive" : ""}`}
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                  {inputMode === "inr" ? "INR" : "USDT"}
                </span>
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {errors.amount}
                </p>
              )}
              
              {/* Quick amounts */}
              <div className="flex gap-2 mt-4">
                {(inputMode === "inr" ? quickAmountsInr : quickAmountsUsdt).map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="flex-1 py-2 text-sm font-medium bg-surface hover:bg-primary/10 text-foreground rounded-lg transition-colors"
                  >
                    {inputMode === "inr" ? `₹${amt.toLocaleString()}` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate Info Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">USDT You Receive</span>
                <span className="text-2xl font-bold text-foreground">
                  {usdtAmount > 0 ? usdtAmount.toFixed(2) : "0.00"} USDT
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Rate</span>
                <span className="text-primary font-semibold">₹{RATE}/USDT</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                <span className="text-foreground">
                  + ₹{platformFee.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Total to Pay</span>
                <span className="text-xl font-bold text-primary">
                  ₹{totalInr > 0 ? totalInr.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0.00"}
                </span>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Your Wallet Address
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {["TRC20", "ERC20", "BEP20"].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      network === n
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-foreground hover:bg-primary/10"
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
                placeholder={`Enter your ${network} address`}
                className={`w-full px-4 py-3 bg-surface border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none ${
                  errors.wallet ? "border-destructive" : "border-border"
                }`}
              />
              {errors.wallet && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {errors.wallet}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleStep1Submit}
              disabled={!amount || amountNum <= 0}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-green"
            >
              <ShoppingCart className="size-5" />
              Buy USDT Now
            </button>

            {/* Info text */}
            <p className="text-xs text-center text-muted-foreground">
              Min: ₹{MIN_INR} | Max: ₹{MAX_INR.toLocaleString()}
            </p>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && (
          <div className="space-y-6 fade-in-up">
            {/* Order Summary */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You Pay</span>
                  <span className="font-bold text-foreground">
                    ₹{totalInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You Receive</span>
                  <span className="font-bold text-primary">{usdtAmount.toFixed(2)} USDT</span>
                </div>
              </div>
            </div>

            {/* Payment Method Toggle */}
            <div className="bg-card border border-border rounded-2xl p-2 flex">
              <button
                onClick={() => setPaymentMethod("upi")}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === "upi" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="size-4" />
                UPI
              </button>
              <button
                onClick={() => setPaymentMethod("bank")}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === "bank" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="size-4" />
                Bank Transfer
              </button>
            </div>

            {/* Payment Details */}
            {paymentMethod === "upi" ? (
              <div className="bg-surface border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-4">UPI Payment</h3>
                <div className="bg-card p-4 rounded-xl mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
                      <p className="font-mono text-foreground font-semibold">{BANK_DETAILS.upiId}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(BANK_DETAILS.upiId, "upi")}
                      className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    >
                      {copied === "upi" ? <Check className="size-5 text-primary" /> : <Copy className="size-5 text-primary" />}
                    </button>
                  </div>
                </div>
                <div className="bg-card p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Amount to Pay</p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{totalInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(totalInr.toFixed(2), "amount")}
                    className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    {copied === "amount" ? <Check className="size-5 text-primary" /> : <Copy className="size-5 text-primary" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Bank Transfer Details</h3>
                <div className="space-y-3">
                  {[
                    { label: "Account Name", value: BANK_DETAILS.name, key: "name" },
                    { label: "Account Number", value: BANK_DETAILS.accountNumber, key: "account" },
                    { label: "IFSC Code", value: BANK_DETAILS.ifsc, key: "ifsc" },
                    { label: "Bank", value: BANK_DETAILS.bank, key: "bank" },
                  ].map((item) => (
                    <div key={item.key} className="bg-card p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-mono text-sm text-foreground font-medium">{item.value}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.value, item.key)}
                        className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                      >
                        {copied === item.key ? <Check className="size-4 text-primary" /> : <Copy className="size-4 text-primary" />}
                      </button>
                    </div>
                  ))}
                  <div className="bg-card p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount to Transfer</p>
                      <p className="text-xl font-bold text-primary">
                        ₹{totalInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(totalInr.toFixed(2), "amount")}
                      className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    >
                      {copied === "amount" ? <Check className="size-5 text-primary" /> : <Copy className="size-5 text-primary" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Screenshot */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-3">Upload Payment Screenshot</h3>
              <p className="text-xs text-muted-foreground mb-4">
                After making the payment, upload a screenshot for verification
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              {screenshotPreview ? (
                <div className="relative">
                  <img 
                    src={screenshotPreview} 
                    alt="Payment screenshot" 
                    className="w-full h-48 object-cover rounded-xl border border-border"
                  />
                  <button
                    onClick={() => {
                      setScreenshot(null);
                      setScreenshotPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg hover:opacity-90"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-8 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition-colors ${
                    errors.screenshot 
                      ? "border-destructive bg-destructive/5" 
                      : "border-border hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <div className="size-12 rounded-full bg-surface flex items-center justify-center">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </button>
              )}
              {errors.screenshot && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {errors.screenshot}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleStep2Submit}
              disabled={isProcessing || !screenshot}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-green"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="size-5" />
                  I&apos;ve Made the Payment
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6 fade-in-up">
            {/* Status Card */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              {paymentStatus === "verifying" && (
                <>
                  <div className="size-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="size-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Verifying Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;re verifying your payment. This usually takes 2-5 minutes.
                  </p>
                </>
              )}
              {paymentStatus === "completed" && (
                <>
                  <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="size-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Payment Verified!</h3>
                  <p className="text-sm text-muted-foreground">
                    {usdtAmount.toFixed(2)} USDT has been sent to your wallet
                  </p>
                </>
              )}
            </div>

            {/* Screenshot Preview */}
            {screenshotPreview && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ImageIcon className="size-4" />
                  Uploaded Screenshot
                </h3>
                <img 
                  src={screenshotPreview} 
                  alt="Payment screenshot" 
                  className="w-full h-40 object-cover rounded-xl border border-border"
                />
              </div>
            )}

            {/* Transaction Details */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-foreground">{transactionId}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="text-foreground">
                  ₹{totalInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">USDT Amount</span>
                <span className="font-bold text-primary">{usdtAmount.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Network</span>
                <span className="text-foreground">{network}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Wallet</span>
                <span className="text-foreground font-mono text-xs">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  paymentStatus === "verifying" 
                    ? "bg-yellow-500/10 text-yellow-600" 
                    : "bg-primary/10 text-primary"
                }`}>
                  {paymentStatus === "verifying" ? "Verifying" : "Completed"}
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
                    setAmount("");
                    setWalletAddress("");
                    setScreenshot(null);
                    setScreenshotPreview(null);
                    setPaymentStatus("pending");
                  }}
                  className="flex-1 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Buy More
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
