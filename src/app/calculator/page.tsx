"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightLeft, Home, Calculator, LayoutDashboard, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CalculatorPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [usdtAmount, setUsdtAmount] = useState<string>("100");
  const [inrAmount, setInrAmount] = useState<string>("");
  const [rate] = useState(106.35);
  const [direction, setDirection] = useState<"usdt-to-inr" | "inr-to-usdt">("usdt-to-inr");

  useEffect(() => {
    if (direction === "usdt-to-inr" && usdtAmount) {
      const usdt = parseFloat(usdtAmount) || 0;
      setInrAmount((usdt * rate).toFixed(2));
    } else if (direction === "inr-to-usdt" && inrAmount) {
      const inr = parseFloat(inrAmount) || 0;
      setUsdtAmount((inr / rate).toFixed(2));
    }
  }, [usdtAmount, inrAmount, direction, rate]);

  const handleUsdtChange = (value: string) => {
    setDirection("usdt-to-inr");
    setUsdtAmount(value);
  };

  const handleInrChange = (value: string) => {
    setDirection("inr-to-usdt");
    setInrAmount(value);
  };

  const swapDirection = () => {
    setDirection((prev) => (prev === "usdt-to-inr" ? "inr-to-usdt" : "usdt-to-inr"));
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(77,124,254,0.1)_0%,transparent_70%)] pointer-events-none" />

      <main className="flex-1 w-full max-w-[390px] mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white mb-1">USDT Calculator</h1>
          <p className="text-[13px] text-muted-foreground">
            Convert between USDT and INR at live rates
          </p>
        </div>

        {/* Live Rate */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[12px] text-muted-foreground">Live Rate:</span>
          <span className="text-[15px] font-bold text-primary font-stat">₹{rate}/USDT</span>
        </div>

        {/* Calculator Card */}
        <div className="bg-card border border-border rounded-2xl p-5">
          {/* USDT Input */}
          <div className="mb-4">
            <label className="block text-[12px] font-medium text-muted-foreground mb-2">
              USDT Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={usdtAmount}
                onChange={(e) => handleUsdtChange(e.target.value)}
                placeholder="Enter USDT amount"
                className="w-full h-12 px-4 bg-surface border border-input rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-muted-foreground">
                USDT
              </span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-3">
            <button
              onClick={swapDirection}
              className="size-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <ArrowRightLeft className="size-4 text-primary rotate-90" />
            </button>
          </div>

          {/* INR Input */}
          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-2">
              INR Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={inrAmount}
                onChange={(e) => handleInrChange(e.target.value)}
                placeholder="Enter INR amount"
                className="w-full h-12 px-4 bg-surface border border-input rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-muted-foreground">
                INR
              </span>
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="mt-5">
            <p className="text-[11px] text-muted-foreground mb-2">Quick amounts (USDT)</p>
            <div className="flex flex-wrap gap-2">
              {[100, 500, 1000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleUsdtChange(amount.toString())}
                  className="px-3 py-1.5 bg-surface border border-border text-white text-[12px] font-medium rounded-lg hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-5">
          <Link
            href="/sell"
            className="flex-1 py-3 bg-primary hover:bg-[#5d8cff] text-white font-semibold text-center rounded-full transition-colors"
          >
            Sell USDT
          </Link>
          <Link
            href="/buy"
            className="flex-1 py-3 bg-transparent border border-white/30 hover:border-white/50 text-white font-semibold text-center rounded-full transition-colors"
          >
            Buy USDT
          </Link>
        </div>
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
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive(href) ? "text-primary" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
