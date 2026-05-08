"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Phone, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (loginMethod === "email") {
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email";
      }
    } else {
      if (!phone) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[6-9]\d{9}$/.test(phone)) {
        newErrors.phone = "Please enter a valid 10-digit Indian phone number";
      }
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const identifier = loginMethod === "email" ? email : phone;
      const data = await login(identifier, password);
      toast.success("Login successful!");
      if (data.role === "admin") router.push("/admin");
      else router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: unknown } }; message?: string };
      const detail = axiosErr?.response?.data?.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((e: { msg: string }) => e.msg).join(" ")
          : axiosErr?.message || "Login failed";
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-[390px] relative z-10" data-testid="login-page">
        {/* Logo */}
        <div className="text-center mb-8 fade-in-up">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt="SwapEase"
              width={44}
              height={44}
              className="rounded-xl"
            />
            <span className="text-white font-bold text-xl">SwapEase</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-6 fade-in-up delay-100">
          <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
          <p className="text-[13px] text-muted-foreground mb-6">Sign in to your account</p>

          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-5 p-1 bg-surface rounded-xl">
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                loginMethod === "email"
                  ? "bg-card text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Mail className="size-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                loginMethod === "phone"
                  ? "bg-card text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Phone className="size-4" />
              Phone
            </button>
          </div>

          {/* Form Error */}
          {errors.form && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            {loginMethod === "email" && (
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`w-full h-11 pl-10 pr-4 bg-surface border rounded-xl text-white text-[13px] placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.email ? "border-destructive" : "border-input"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-[11px] mt-1.5">{errors.email}</p>
                )}
              </div>
            )}

            {/* Phone Input */}
            {loginMethod === "phone" && (
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                  Phone Number
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 bg-surface border border-r-0 border-input rounded-l-xl text-muted-foreground text-[13px]">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setPhone(value);
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                    className={`flex-1 h-11 px-4 bg-surface border rounded-r-xl text-white text-[13px] placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.phone ? "border-destructive" : "border-input"
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-destructive text-[11px] mt-1.5">{errors.phone}</p>
                )}
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  className={`w-full h-11 pl-10 pr-12 bg-surface border rounded-xl text-white text-[13px] placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.password ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-[11px] mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link href="/forgot-password" className="text-[12px] text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-[#5d8cff] text-white font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-muted-foreground text-[13px]">
              New here?{" "}
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
