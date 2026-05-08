"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, User, Mail, Phone, Lock, Gift } from "lucide-react";
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
      router.push(`/verify-otp?phone=${encodeURIComponent(form.phone)}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: unknown } }; message?: string };
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      {/* Background glows */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-[390px] relative z-10" data-testid="register-page">
        {/* Logo */}
        <div className="text-center mb-6 fade-in-up">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4d7cfe] to-[#8b5cf6] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">SE</span>
            </div>
            <span className="text-white font-bold text-xl">SwapEase</span>
          </Link>
        </div>

        {/* Register Card */}
        <div className="bg-card border border-border rounded-2xl p-6 fade-in-up delay-100">
          <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-[13px] text-muted-foreground mb-5">Start trading USDT in minutes</p>

          {/* Form Error */}
          {errors.form && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={`w-full h-11 pl-10 pr-4 bg-surface border rounded-xl text-white text-[13px] placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.name ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="text-destructive text-[11px] mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 bg-surface border border-r-0 border-input rounded-l-xl text-muted-foreground text-[13px]">
                  <Phone className="size-4 mr-1.5" />
                  +91
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateField("phone", value);
                  }}
                  className={`flex-1 h-11 px-4 bg-surface border rounded-r-xl text-white text-[13px] placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.phone ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && <p className="text-destructive text-[11px] mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={`w-full h-11 pl-10 pr-4 bg-surface border rounded-xl text-white text-[13px] placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.email ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-destructive text-[11px] mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={`w-full h-11 pl-10 pr-12 bg-surface border rounded-xl text-white text-[13px] placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.password ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-[11px] mt-1">{errors.password}</p>}
            </div>

            {/* Referral Code */}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                Referral Code <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <div className="relative">
                <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.referralCode}
                  onChange={(e) => updateField("referralCode", e.target.value.toUpperCase())}
                  className={`w-full h-11 pl-10 pr-4 bg-surface border rounded-xl text-white text-[13px] placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.referralCode ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Enter referral code"
                  maxLength={10}
                />
              </div>
              {errors.referralCode && <p className="text-destructive text-[11px] mt-1">{errors.referralCode}</p>}
            </div>

            {/* Terms */}
            <p className="text-muted-foreground text-[11px]">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-[#5d8cff] text-white font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-muted-foreground text-[13px]">
              Already have account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
