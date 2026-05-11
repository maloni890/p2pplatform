"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  Check,
  AlertTriangle,
  Copy,
  Upload,
  Clock,
  Pause2,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  fullName: string;
  dob: string;
  panNumber: string;
  aadhaarNumber: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  aadhaarFront: File | null;
  aadhaarBack: File | null;
  panCard: File | null;
  selfie: File | null;
}

interface DepositData {
  network: "TRC20" | "ERC20" | "BEP20";
  transactionHash: string;
}

export default function BecomeSellerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [requirementsChecked, setRequirementsChecked] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dob: "",
    panNumber: "",
    aadhaarNumber: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    selfie: null,
  });
  const [depositData, setDepositData] = useState<DepositData>({
    network: "TRC20",
    transactionHash: "",
  });

  const fileInputRefs = {
    aadhaarFront: useRef<HTMLInputElement>(null),
    aadhaarBack: useRef<HTMLInputElement>(null),
    panCard: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
  };

  // Requirements checklist
  const requirements = [
    {
      icon: "🔵",
      title: "Minimum $1,000 USDT security deposit",
      subtitle: "Held by SwapEase as fraud protection",
    },
    {
      icon: "🔵",
      title: "Complete KYC verification (Aadhaar + PAN)",
      subtitle: "Government ID required",
    },
    {
      icon: "🔵",
      title: "Valid UPI ID or bank account",
      subtitle: "For receiving INR payments from buyers",
    },
    {
      icon: "🔵",
      title: "Maximum 1,000 USDT per trade limit",
      subtitle: "Cannot exceed this limit per order",
    },
    {
      icon: "🔵",
      title: "Admin approval required",
      subtitle: "Review takes 24-48 business hours",
    },
  ];

  // Step indicator component
  const StepIndicator = () => {
    const steps = ["Requirements", "KYC", "Deposit", "Review"];
    return (
      <div className="w-full px-6 py-8">
        <div className="flex items-center justify-between relative mb-2">
          {/* Connecting line */}
          <div className="absolute top-5 left-0 right-0 h-px bg-border" />

          {steps.map((step, idx) => {
            const stepNum = (idx + 1) as Step;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;

            return (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : isCompleted
                        ? "bg-success text-white"
                        : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNum}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{step}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // STEP 1: Requirements
  const Step1 = () => (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">Seller Requirements</h2>
      <p className="text-sm text-muted-foreground mb-6">Please read carefully before applying</p>

      {/* Requirements list */}
      <div className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
        {requirements.map((req, idx) => (
          <div key={idx} className="h-auto p-4 border-b border-border last:border-b-0 flex gap-3">
            <div className="text-2xl mt-1 shrink-0">{req.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{req.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{req.subtitle}</p>
            </div>
            <div className="text-xs text-success mt-2">✓</div>
          </div>
        ))}
      </div>

      {/* Warning box */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 mb-6">
        <div className="flex gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed text-red-400">
            Your $1,000 USDT deposit will be held as security. It will be refunded if you stop
            selling and have no disputes.
          </p>
        </div>
      </div>

      {/* Checkbox */}
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={requirementsChecked}
          onChange={(e) => setRequirementsChecked(e.target.checked)}
          className="w-5 h-5 mt-0.5 accent-primary cursor-pointer rounded"
        />
        <span className="text-sm text-foreground">
          I understand and agree to seller terms
        </span>
      </label>

      {/* Continue button */}
      <button
        onClick={() => setCurrentStep(2)}
        disabled={!requirementsChecked}
        className="w-full py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  // STEP 2: KYC Details
  const Step2 = () => (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">Identity Verification</h2>
      <p className="text-sm text-muted-foreground mb-6">Your data is encrypted and secure</p>

      {/* Personal Info Form */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">
            Full Legal Name
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 bg-input border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            className="w-full px-4 py-3 bg-input border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">
            PAN Number
          </label>
          <input
            type="text"
            value={formData.panNumber}
            onChange={(e) =>
              setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })
            }
            placeholder="XXXXXXXXXX"
            maxLength={10}
            className="w-full px-4 py-3 bg-input border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">
            Aadhaar Number
          </label>
          <input
            type="password"
            value={formData.aadhaarNumber}
            onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
            placeholder="••••••••••••"
            maxLength={12}
            className="w-full px-4 py-3 bg-input border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Document Uploads */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-muted-foreground mb-4 block">Document Uploads</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "aadhaarFront", label: "📄 Aadhaar Front" },
            { key: "aadhaarBack", label: "📄 Aadhaar Back" },
            { key: "panCard", label: "🪪 PAN Card" },
            { key: "selfie", label: "🤳 Selfie with ID" },
          ].map((doc) => (
            <button
              key={doc.key}
              onClick={() =>
                fileInputRefs[doc.key as keyof typeof fileInputRefs]?.current?.click()
              }
              className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors"
            >
              <input
                ref={fileInputRefs[doc.key as keyof typeof fileInputRefs]}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFormData({
                      ...formData,
                      [doc.key]: e.target.files[0],
                    });
                    toast.success("File uploaded");
                  }
                }}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{doc.label}</p>
              <p className="text-[10px] text-muted-foreground/60">JPG, PNG max 5MB</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bank Details */}
      <div className="space-y-4 mb-8">
        <p className="text-xs font-semibold text-muted-foreground">Bank Details</p>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">
            Account Holder Name
          </label>
          <input
            type="text"
            value={formData.accountHolderName}
            onChange={(e) =>
              setFormData({ ...formData, accountHolderName: e.target.value })
            }
            placeholder="Enter account holder name"
            className="w-full px-4 py-3 bg-input border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">
            Account Number
          </label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="Enter account number"
            className="w-full px-4 py-3 bg-input border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">
            IFSC Code
          </label>
          <input
            type="text"
            value={formData.ifscCode}
            onChange={(e) =>
              setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })
            }
            placeholder="XXXXXXXXX"
            className="w-full px-4 py-3 bg-input border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">
            UPI ID
          </label>
          <input
            type="text"
            value={formData.upiId}
            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
            placeholder="username@upi"
            className="w-full px-4 py-3 bg-input border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 py-3 border border-border text-foreground rounded-full font-semibold text-sm hover:bg-muted/50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // STEP 3: Security Deposit
  const Step3 = () => (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">Security Deposit</h2>
      <p className="text-sm text-muted-foreground mb-8">Send exactly $1,000 USDT to activate</p>

      {/* Deposit card */}
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 mb-8">
        <p className="text-center text-4xl font-bold text-foreground mb-1">1,000 USDT</p>
        <p className="text-center text-sm text-muted-foreground">≈ ₹1,06,350</p>
      </div>

      {/* Network tabs */}
      <div className="flex gap-2 mb-6">
        {(["TRC20", "ERC20", "BEP20"] as const).map((net) => (
          <button
            key={net}
            onClick={() => setDepositData({ ...depositData, network: net })}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              depositData.network === net
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {net}
          </button>
        ))}
      </div>

      {/* Wallet address */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-2">Send USDT to this address:</p>
        <div className="bg-muted/50 border border-border rounded-lg p-3 mb-3">
          <p className="text-xs text-foreground font-mono break-all">
            TRXHNqF2Lh7b4nS9mK2qQ8rP5sT1vW3xC6yZ7aM4nS
          </p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText("TRXHNqF2Lh7b4nS9mK2qQ8rP5sT1vW3xC6yZ7aM4nS");
            toast.success("Address copied");
          }}
          className="w-full py-2 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
        >
          <Copy className="w-3.5 h-3.5" /> Copy Address
        </button>
      </div>

      {/* QR Code placeholder */}
      <div className="mb-8 text-center">
        <div className="bg-white p-4 rounded-lg inline-block mb-2">
          <div className="w-32 h-32 bg-muted rounded flex items-center justify-center">
            <p className="text-xs text-muted-foreground">QR Code</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Scan to send</p>
      </div>

      {/* Warning */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mb-6">
        <p className="text-xs leading-relaxed text-yellow-400">
          Before sending:<br />
          1. Select correct network above<br />
          2. Send EXACTLY 1,000 USDT<br />
          3. Do not send any other token<br />
          4. Transaction may take 5-30 minutes
        </p>
      </div>

      {/* Transaction hash input */}
      <div className="mb-8">
        <label className="text-xs text-muted-foreground block mb-2">
          Enter transaction hash after sending:
        </label>
        <input
          type="text"
          value={depositData.transactionHash}
          onChange={(e) =>
            setDepositData({ ...depositData, transactionHash: e.target.value })
          }
          placeholder="0x..."
          className="w-full px-4 py-3 bg-input border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(2)}
          className="flex-1 py-3 border border-border text-foreground rounded-full font-semibold text-sm hover:bg-muted/50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          disabled={!depositData.transactionHash}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          I have sent the deposit <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // STEP 4: Under Review
  const Step4 = () => (
    <div className="max-w-2xl mx-auto px-6 py-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Clock className="w-10 h-10 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
      <p className="text-sm text-muted-foreground mb-8">We're reviewing your application</p>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left space-y-4">
        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Requirements accepted</p>
          </div>
        </div>
        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">KYC documents submitted</p>
          </div>
        </div>
        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Deposit transaction submitted</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Admin review (24-48 hrs)</p>
            <p className="text-xs text-muted-foreground">In progress</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Pause2 className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Seller account activation</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-8">
        You'll receive a notification when approved
      </p>

      <Link
        href="/dashboard"
        className="inline-block px-6 py-3 border border-border text-foreground rounded-full font-semibold text-sm hover:bg-muted/50 transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <StepIndicator />
        {currentStep === 1 && <Step1 />}
        {currentStep === 2 && <Step2 />}
        {currentStep === 3 && <Step3 />}
        {currentStep === 4 && <Step4 />}
      </div>
    </div>
  );
}
