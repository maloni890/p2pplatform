"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

// Demo admin credentials
const DEMO_ADMIN = {
  email: "admin@swapease.com",
  password: "admin123",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in as admin
  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session");
    if (adminSession) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));

    // Demo login check
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      localStorage.setItem(
        "admin_session",
        JSON.stringify({
          id: "admin_1",
          email: DEMO_ADMIN.email,
          name: "Admin User",
          role: "admin",
          loggedInAt: new Date().toISOString(),
        })
      );
      router.push("/admin");
    } else {
      setError("Invalid admin credentials");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f14] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Shield className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">SwapEase Admin</h1>
          <p className="text-sm text-zinc-500 mt-1">Secure admin portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111820] border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-zinc-500 mt-1">Sign in to admin dashboard</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="size-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@swapease.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0f14] border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-12 py-3 bg-[#0a0f14] border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="size-4" />
                  Sign in to Admin
                </>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-xs text-zinc-400 text-center mb-2">Demo Credentials</p>
            <div className="flex flex-col gap-1 text-center">
              <p className="text-xs text-zinc-500">
                Email: <span className="text-primary font-mono">admin@swapease.com</span>
              </p>
              <p className="text-xs text-zinc-500">
                Password: <span className="text-primary font-mono">admin123</span>
              </p>
            </div>
          </div>
        </div>

        {/* Back to main site */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          Not an admin?{" "}
          <a href="/" className="text-primary hover:underline">
            Go to main site
          </a>
        </p>
      </div>
    </div>
  );
}
