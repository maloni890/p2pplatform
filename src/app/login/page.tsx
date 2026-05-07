"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, ArrowRightLeft, Mail, Phone, Lock } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md" data-testid="login-page">
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
          <p className="text-muted-foreground text-sm mt-2">Welcome back to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl p-8 border border-border shadow-xl animate-fade-in-up">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Sign In
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Enter your credentials to continue
          </p>

          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                loginMethod === "email"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="size-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                loginMethod === "phone"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="size-4" />
              Phone
            </button>
          </div>

          {/* Form Error */}
          {errors.form && (
            <div
              className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              data-testid="login-error"
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            {loginMethod === "email" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
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
                    className={`w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.email ? "border-destructive" : "border-input"
                    }`}
                    placeholder="Enter your email"
                    data-testid="login-email-input"
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-xs mt-1.5">{errors.email}</p>
                )}
              </div>
            )}

            {/* Phone Input */}
            {loginMethod === "phone" && (
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
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(value);
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                      className={`w-full px-4 py-3 bg-background border rounded-r-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        errors.phone ? "border-destructive" : "border-input"
                      }`}
                      placeholder="Enter phone number"
                      data-testid="login-phone-input"
                    />
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-destructive text-xs mt-1.5">{errors.phone}</p>
                )}
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
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
                  className={`w-full pl-10 pr-12 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.password ? "border-destructive" : "border-input"
                  }`}
                  placeholder="Enter password"
                  data-testid="login-password-input"
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
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline font-medium"
                data-testid="forgot-password-link"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
              data-testid="login-submit-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-semibold"
                data-testid="login-register-link"
              >
                Create Account
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
