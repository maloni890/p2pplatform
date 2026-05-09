"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  Calculator,
  LayoutDashboard,
  User,
  AlertCircle,
  Upload,
  Shield,
  Store,
  Clock,
  CreditCard,
  Wallet,
  FileText,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type KycStep = 1 | 2 | 3 | 4 | 5;

interface KycData {
  // Step 1
  fullName: string;
  dob: string;
  pan: string;
  // Step 2
  aadhaarFront: File | null;
  aadhaarBack: File | null;
  panCard: File | null;
  selfie: File | null;
  // Step 3
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  // Step 4
  walletAddress: string;
  network: "TRC20" | "ERC20" | "BEP20";
  // Step 5
  termsAccepted: boolean;
}

interface FilePreview {
  aadhaarFront?: string;
  aadhaarBack?: string;
  panCard?: string;
  selfie?: string;
}

export default function SellerKycPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [step, setStep] = useState<KycStep>(1);
  const [data, setData] = useState<KycData>({
    fullName: "",
    dob: "",
    pan: "",
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    selfie: null,
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
    walletAddress: "",
    network: "TRC20",
    termsAccepted: false,
  });
  const [previews, setPreviews] = useState<FilePreview>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileRefs = {
    aadhaarFront: useRef<HTMLInputElement>(null),
    aadhaarBack: useRef<HTMLInputElement>(null),
    panCard: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (!user) router.push("/login?redirect=/seller-kyc");
  }, [user, router]);

  const update = <K extends keyof KycData>(key: K, value: KycData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "aadhaarFront" | "aadhaarBack" | "panCard" | "selfie"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [field]: "Max 5MB" }));
      return;
    }
    update(field, file);
    setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
  };

  const removeFile = (field: "aadhaarFront" | "aadhaarBack" | "panCard" | "selfie") => {
    update(field, null);
    setPreviews((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (s: KycStep): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!data.fullName.trim()) e.fullName = "Full name required";
      if (!data.dob) e.dob = "Date of birth required";
      if (!data.pan.trim()) e.pan = "PAN required";
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(data.pan.toUpperCase()))
        e.pan = "Invalid PAN format (e.g. ABCDE1234F)";
    } else if (s === 2) {
      if (!data.aadhaarFront) e.aadhaarFront = "Required";
      if (!data.aadhaarBack) e.aadhaarBack = "Required";
      if (!data.panCard) e.panCard = "Required";
      if (!data.selfie) e.selfie = "Required";
    } else if (s === 3) {
      if (!data.accountHolder.trim()) e.accountHolder = "Required";
      if (!data.accountNumber.trim()) e.accountNumber = "Required";
      else if (!/^\d{9,18}$/.test(data.accountNumber)) e.accountNumber = "Invalid account number";
      if (!data.ifsc.trim()) e.ifsc = "Required";
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifsc.toUpperCase())) e.ifsc = "Invalid IFSC";
      if (!data.upiId.trim()) e.upiId = "Required";
      else if (!/^[\w.-]+@[\w]+$/.test(data.upiId)) e.upiId = "Invalid UPI ID";
    } else if (s === 4) {
      if (!data.walletAddress.trim()) e.walletAddress = "Required";
      else if (data.walletAddress.length < 20) e.walletAddress = "Invalid wallet address";
    } else if (s === 5) {
      if (!data.termsAccepted) e.termsAccepted = "You must accept the seller terms";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step) && step < 5) {
      setStep((step + 1) as KycStep);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("KYC submitted! Under review for 24-48 hours");
  };

  const isActive = (path: string) => pathname === path;

  if (!user) return null;

  // Submitted Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
        <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,transparent_70%)] pointer-events-none" />
        <main className="flex-1 w-full max-w-[390px] mx-auto px-3 py-4 relative z-10 flex flex-col justify-center">
          <div className="bg-card border-2 border-amber-500/40 rounded-2xl p-6 text-center">
            <div className="size-16 mx-auto mb-4 rounded-full bg-amber-500/15 flex items-center justify-center">
              <Clock className="size-8 text-amber-400" />
            </div>
            <h2 className="text-[18px] font-bold text-white mb-2">KYC Submitted!</h2>
            <p className="text-[12px] text-muted-foreground mb-1">
              Status: <span className="text-amber-400 font-semibold">Under Review</span>
            </p>
            <p className="text-[10px] text-muted-foreground mb-4">
              Our team will verify your documents within 24-48 hours
            </p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
              <div className="inline-flex items-center gap-1 mb-1">
                <Sparkles className="size-3 text-amber-400" />
                <p className="text-[10px] font-semibold text-amber-400">Next Steps</p>
              </div>
              <p className="text-[9px] text-muted-foreground text-left">
                You&apos;ll receive an email once verified. After approval, you can list USDT for sale and earn 0.2% bonus on every trade.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="block w-full py-2.5 bg-primary hover:bg-[#5d8cff] text-white text-[12px] font-bold rounded-full transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const stepLabels = ["Personal", "ID Verify", "Bank", "Wallet", "Review"];

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(138,43,226,0.1)_0%,transparent_70%)] pointer-events-none" />

      <main className="flex-1 w-full max-w-[390px] mx-auto px-3 py-4 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => (step > 1 ? setStep((step - 1) as KycStep) : router.push("/profile"))}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <ArrowLeft className="size-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-amber-500/15 flex items-center justify-center">
              <Store className="size-3.5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-[14px] font-bold text-white">Seller KYC</h1>
              <p className="text-[9px] text-muted-foreground">Become a verified USDT seller</p>
            </div>
          </div>
        </div>

        {/* Encryption Note */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1.5 mb-4 flex items-center gap-2">
          <Shield className="size-3 text-primary shrink-0" />
          <p className="text-[9px] text-muted-foreground">
            Your KYC is encrypted and never shared with buyers
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`size-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                    s === step
                      ? "bg-amber-500 text-black"
                      : s < step
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-surface text-muted-foreground"
                  }`}
                >
                  {s < step ? <Check className="size-2.5" /> : s}
                </div>
                {s < 5 && (
                  <div className={`flex-1 h-0.5 mx-1 ${s < step ? "bg-amber-500" : "bg-border"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-[10px] text-muted-foreground">
            Step {step} of 5: <span className="text-white font-semibold">{stepLabels[step - 1]}</span>
          </p>
        </div>

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-3 fade-in-up">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="size-4 text-amber-400" />
                <h2 className="text-[13px] font-bold text-white">Personal Information</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Full Name (as per PAN)</label>
                  <input
                    type="text"
                    value={data.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="Enter your full legal name"
                    className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-[12px] text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-amber-500 ${
                      errors.fullName ? "border-red-500/50" : "border-border"
                    }`}
                  />
                  {errors.fullName && <ErrText msg={errors.fullName} />}
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Date of Birth</label>
                  <input
                    type="date"
                    value={data.dob}
                    onChange={(e) => update("dob", e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-[12px] text-white focus:outline-none focus:border-amber-500 ${
                      errors.dob ? "border-red-500/50" : "border-border"
                    }`}
                  />
                  {errors.dob && <ErrText msg={errors.dob} />}
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">PAN Number</label>
                  <input
                    type="text"
                    value={data.pan}
                    onChange={(e) => update("pan", e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-[12px] text-white font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-amber-500 ${
                      errors.pan ? "border-red-500/50" : "border-border"
                    }`}
                  />
                  {errors.pan && <ErrText msg={errors.pan} />}
                </div>
              </div>
            </div>

            <NextButton onClick={handleNext} label="Continue" />
          </div>
        )}

        {/* STEP 2: ID Verification */}
        {step === 2 && (
          <div className="space-y-3 fade-in-up">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="size-4 text-amber-400" />
                <h2 className="text-[13px] font-bold text-white">ID Verification</h2>
              </div>

              <div className="space-y-3">
                <FileUpload
                  label="Aadhaar Front"
                  preview={previews.aadhaarFront}
                  onChange={(e) => handleFileChange(e, "aadhaarFront")}
                  onRemove={() => removeFile("aadhaarFront")}
                  inputRef={fileRefs.aadhaarFront}
                  error={errors.aadhaarFront}
                />
                <FileUpload
                  label="Aadhaar Back"
                  preview={previews.aadhaarBack}
                  onChange={(e) => handleFileChange(e, "aadhaarBack")}
                  onRemove={() => removeFile("aadhaarBack")}
                  inputRef={fileRefs.aadhaarBack}
                  error={errors.aadhaarBack}
                />
                <FileUpload
                  label="PAN Card"
                  preview={previews.panCard}
                  onChange={(e) => handleFileChange(e, "panCard")}
                  onRemove={() => removeFile("panCard")}
                  inputRef={fileRefs.panCard}
                  error={errors.panCard}
                />
                <FileUpload
                  label="Selfie with ID"
                  preview={previews.selfie}
                  onChange={(e) => handleFileChange(e, "selfie")}
                  onRemove={() => removeFile("selfie")}
                  inputRef={fileRefs.selfie}
                  error={errors.selfie}
                />
              </div>
            </div>

            <NextButton onClick={handleNext} label="Continue" />
          </div>
        )}

        {/* STEP 3: Bank Details */}
        {step === 3 && (
          <div className="space-y-3 fade-in-up">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="size-4 text-amber-400" />
                <h2 className="text-[13px] font-bold text-white">Bank Details</h2>
              </div>

              <p className="text-[9px] text-muted-foreground mb-3 px-2 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                Buyers will pay directly to your UPI/bank
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Account Holder Name</label>
                  <input
                    type="text"
                    value={data.accountHolder}
                    onChange={(e) => update("accountHolder", e.target.value)}
                    placeholder="As per bank records"
                    className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-[12px] text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-amber-500 ${
                      errors.accountHolder ? "border-red-500/50" : "border-border"
                    }`}
                  />
                  {errors.accountHolder && <ErrText msg={errors.accountHolder} />}
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Account Number</label>
                  <input
                    type="text"
                    value={data.accountNumber}
                    onChange={(e) => update("accountNumber", e.target.value.replace(/\D/g, ""))}
                    placeholder="Bank account number"
                    className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-[12px] text-white font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-amber-500 ${
                      errors.accountNumber ? "border-red-500/50" : "border-border"
                    }`}
                  />
                  {errors.accountNumber && <ErrText msg={errors.accountNumber} />}
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">IFSC Code</label>
                  <input
                    type="text"
                    value={data.ifsc}
                    onChange={(e) => update("ifsc", e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-[12px] text-white font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-amber-500 ${
                      errors.ifsc ? "border-red-500/50" : "border-border"
                    }`}
                  />
                  {errors.ifsc && <ErrText msg={errors.ifsc} />}
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">UPI ID</label>
                  <input
                    type="text"
                    value={data.upiId}
                    onChange={(e) => update("upiId", e.target.value)}
                    placeholder="yourname@upi"
                    className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-[12px] text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-amber-500 ${
                      errors.upiId ? "border-red-500/50" : "border-border"
                    }`}
                  />
                  {errors.upiId && <ErrText msg={errors.upiId} />}
                </div>
              </div>
            </div>

            <NextButton onClick={handleNext} label="Continue" />
          </div>
        )}

        {/* STEP 4: USDT Wallet */}
        {step === 4 && (
          <div className="space-y-3 fade-in-up">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="size-4 text-amber-400" />
                <h2 className="text-[13px] font-bold text-white">USDT Wallet</h2>
              </div>

              <p className="text-[9px] text-muted-foreground mb-3 px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                You must deposit USDT to escrow when a trade is matched
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-2 block">Primary Network</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["TRC20", "ERC20", "BEP20"] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => update("network", n)}
                        className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${
                          data.network === n
                            ? "bg-amber-500 text-black"
                            : "bg-surface text-muted-foreground hover:text-white"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">
                    USDT Wallet Address ({data.network})
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={data.walletAddress}
                      onChange={(e) => update("walletAddress", e.target.value)}
                      placeholder={`Your ${data.network} wallet address`}
                      className={`w-full pl-8 pr-3 py-2.5 bg-surface border rounded-lg text-[11px] text-white font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-amber-500 ${
                        errors.walletAddress ? "border-red-500/50" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.walletAddress && <ErrText msg={errors.walletAddress} />}
                </div>
              </div>
            </div>

            <NextButton onClick={handleNext} label="Continue to Review" />
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-3 fade-in-up">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="size-4 text-amber-400" />
                <h2 className="text-[13px] font-bold text-white">Review Your Information</h2>
              </div>

              <div className="space-y-2.5">
                <ReviewItem label="Full Name" value={data.fullName} />
                <ReviewItem label="Date of Birth" value={data.dob} />
                <ReviewItem label="PAN" value={data.pan} mono />
                <ReviewItem label="ID Documents" value="4 files uploaded" />
                <ReviewItem label="Account Holder" value={data.accountHolder} />
                <ReviewItem label="Account Number" value={`****${data.accountNumber.slice(-4)}`} mono />
                <ReviewItem label="IFSC" value={data.ifsc} mono />
                <ReviewItem label="UPI ID" value={data.upiId} mono />
                <ReviewItem label="Wallet Network" value={data.network} />
                <ReviewItem
                  label="Wallet"
                  value={`${data.walletAddress.slice(0, 8)}...${data.walletAddress.slice(-6)}`}
                  mono
                />
              </div>
            </div>

            {/* Bonus Card */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-amber-400 mb-0.5">Verified Seller Benefits</p>
                  <p className="text-[9px] text-muted-foreground">
                    Earn extra 0.2% bonus on every trade • Priority listing • Verified badge
                  </p>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-card border border-border rounded-xl p-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.termsAccepted}
                  onChange={(e) => update("termsAccepted", e.target.checked)}
                  className="mt-0.5 accent-amber-500"
                />
                <span className="text-[10px] text-muted-foreground">
                  I agree to <span className="text-amber-400 font-semibold">SwapEase Seller Terms</span> and confirm all information is accurate
                </span>
              </label>
              {errors.termsAccepted && <ErrText msg={errors.termsAccepted} />}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[13px] font-bold rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit KYC
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            <p className="text-[9px] text-center text-muted-foreground">
              Review takes 24-48 hours • You&apos;ll receive an email once verified
            </p>
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

// Helpers
function ErrText({ msg }: { msg: string }) {
  return (
    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
      <AlertCircle className="size-3" />
      {msg}
    </p>
  );
}

function NextButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[13px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5"
    >
      {label}
      <ArrowRight className="size-4" />
    </button>
  );
}

function FileUpload({
  label,
  preview,
  onChange,
  onRemove,
  inputRef,
  error,
}: {
  label: string;
  preview?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  error?: string;
}) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground mb-1 block">{label}</label>
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={preview || "/placeholder.svg"} alt={label} className="w-full h-24 object-cover" />
          <button
            onClick={onRemove}
            className="absolute top-1.5 right-1.5 size-6 bg-red-500 rounded-full flex items-center justify-center"
          >
            <X className="size-3 text-white" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className={`w-full py-4 border-2 border-dashed rounded-lg hover:border-amber-500/40 transition-colors flex flex-col items-center gap-1 ${
            error ? "border-red-500/40" : "border-border"
          }`}
        >
          <Upload className="size-4 text-amber-400" />
          <span className="text-[10px] font-medium text-white">Tap to upload {label}</span>
          <span className="text-[8px] text-muted-foreground">PNG, JPG up to 5MB</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="hidden" />
      {error && <ErrText msg={error} />}
    </div>
  );
}

function ReviewItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={`text-[11px] text-white font-semibold ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
