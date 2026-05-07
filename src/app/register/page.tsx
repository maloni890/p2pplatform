"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, ArrowRightLeft, User, Mail, Phone, Lock, Gift } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    referralCode: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian phone number";
    }
    
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = "Password must contain uppercase, lowercase and number";
    }
    
    if (form.referralCode && !/^[A-Za-z0-9]{6,10}$/.test(form.referralCode)) {
      newErrors.referralCode = "Invalid referral code format";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Generate username from name
      const username = form.name.toLowerCase().replace(/\s+/g, "_") + "_" + Math.random().toString(36).slice(2, 6);
      
      await register({
        username,
        email: form.email,
        password: form.password,
        phone: form.phone,
        name: form.name,
        referral_code: form.referralCode || undefined,
      });
      
      toast.success("Account created! Please verify your phone.");
      // Redirect to OTP verification with phone number
      router.push(`/verify-otp?phone=${encodeURIComponent(form.phone)}`);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { detail?: unknown } };
        message?: string;
      };
      const detail = axiosErr?.response?.data?.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((e: { msg: string }) => e.msg).join(", ")
          : axiosErr?.message || "Registration failed. Please try again.";
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md" data-testid="register-page">
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
          <p className="text-muted-foreground text-sm mt-2">Start trading USDT in minutes</p>
        </div>

        {/* Register Card */}
        <div className="bg-card rounded-2xl p-8 border border-border shadow-xl animate-fade-in-up">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Create Account
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Fill in your details to get started
          </p>

          {/* Form Error */}
          {errors.form && (
            <div
              className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              data-testid="register-error"
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.name ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Enter your full name"
                  data-testid="register-name-input"
                />
              </div>
              {errors.name && (
                <p className="text-destructive text-xs mt-1.5">{errors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.email ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Enter your email"
                  data-testid="register-email-input"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Phone Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Phone Number
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3.5 bg-muted border border-r-0 border-input rounded-l-xl text-muted-foreground text-sm">
                  +91
                </span>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      updateField("phone", value);
                    }}
                    className={`w-full px-4 py-3 bg-background border rounded-r-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.phone ? "border-destructive" : "border-input"
                    }`}
                    placeholder="Enter phone number"
                    data-testid="register-phone-input"
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="text-destructive text-xs mt-1.5">{errors.phone}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.password ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Create a strong password"
                  data-testid="register-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1.5">{errors.password}</p>
              )}
              <p className="text-muted-foreground text-xs mt-1">
                Min 8 characters with uppercase, lowercase and number
              </p>
            </div>

            {/* Referral Code Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Referral Code <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.referralCode}
                  onChange={(e) => updateField("referralCode", e.target.value.toUpperCase())}
                  className={`w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.referralCode ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Enter referral code"
                  maxLength={10}
                  data-testid="register-referral-input"
                />
              </div>
              {errors.referralCode && (
                <p className="text-destructive text-xs mt-1.5">{errors.referralCode}</p>
              )}
            </div>

            {/* Terms */}
            <p className="text-muted-foreground text-xs">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
              data-testid="register-submit-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-semibold"
                data-testid="register-login-link"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          Secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}
