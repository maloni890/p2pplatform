"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRightLeft, Phone, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

function OTPVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      // Focus the next empty input or last input
      const nextEmpty = newOtp.findIndex((val) => !val);
      inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // For demo, accept any 6-digit OTP
      setVerified(true);
      toast.success("Phone verified successfully!");
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    try {
      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("OTP sent successfully!");
      setResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  // Success state
  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="size-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Verification Successful!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your phone number has been verified. Redirecting to dashboard...
          </p>
          <div className="flex justify-center">
            <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md" data-testid="verify-otp-page">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-foreground font-black text-2xl"
          >
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
              <ArrowRightLeft className="size-5" />
            </div>
            SwapEase
          </Link>
        </div>

        {/* OTP Card */}
        <div className="bg-card rounded-2xl p-8 border border-border shadow-xl animate-fade-in-up">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          {/* Phone Icon */}
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Phone className="size-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Verify Your Phone
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-8">
            We&apos;ve sent a 6-digit code to{" "}
            <span className="text-foreground font-medium">+91 {phone}</span>
          </p>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-background border border-input rounded-xl text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                data-testid={`otp-input-${index}`}
              />
            ))}
          </div>

          {/* Resend Timer */}
          <p className="text-center text-muted-foreground text-sm mb-6">
            {resendTimer > 0 ? (
              <>
                Resend code in{" "}
                <span className="text-foreground font-medium">{resendTimer}s</span>
              </>
            ) : (
              <>
                Didn&apos;t receive the code?{" "}
                <button
                  onClick={handleResend}
                  className="text-primary font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </>
            )}
          </p>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.join("").length !== 6}
            className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            data-testid="verify-otp-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>

          {/* Help Text */}
          <p className="text-center text-muted-foreground text-xs mt-6">
            Having trouble?{" "}
            <Link href="/support" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>

        {/* Info */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          OTP is valid for 10 minutes
        </p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OTPVerificationContent />
    </Suspense>
  );
}
