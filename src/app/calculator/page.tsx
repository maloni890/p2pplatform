"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ArrowRightLeft, Home, Calculator, LayoutDashboard, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CalculatorPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [usdtAmount, setUsdtAmount] = useState<string>("100");
  const [inrAmount, setInrAmount] = useState<string>("");
  const [rate] = useState(92.45);
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
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-foreground mb-2">USDT Calculator</h1>
          <p className="text-sm text-muted-foreground">
            Convert between USDT and INR at live rates
          </p>
        </div>

        {/* Live Rate */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="text-sm text-muted-foreground">Live Rate:</span>
          <span className="text-lg font-bold text-primary font-stat">₹{rate}/USDT</span>
        </div>

        {/* Calculator Card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {/* USDT Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              USDT Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={usdtAmount}
                onChange={(e) => handleUsdtChange(e.target.value)}
                placeholder="Enter USDT amount"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                USDT
              </span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-4">
            <button
              onClick={swapDirection}
              className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/15 transition-colors"
            >
              <ArrowRightLeft className="size-4 text-primary rotate-90" />
            </button>
          </div>

          {/* INR Input */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              INR Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={inrAmount}
                onChange={(e) => handleInrChange(e.target.value)}
                placeholder="Enter INR amount"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                INR
              </span>
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="mt-6">
            <p className="text-xs text-muted-foreground mb-3">Quick amounts (USDT)</p>
            <div className="flex flex-wrap gap-2">
              {[100, 500, 1000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleUsdtChange(amount.toString())}
                  className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Link
            href="/sell"
            className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-center rounded-xl hover:opacity-90 transition-opacity"
          >
            Sell USDT
          </Link>
          <Link
            href="/buy"
            className="flex-1 py-3 bg-card border-2 border-primary text-primary font-bold text-center rounded-xl hover:bg-primary/5 transition-colors"
          >
            Buy USDT
          </Link>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {[
            { href: "/", icon: Home, label: "Home" },
            { href: "/calculator", icon: Calculator, label: "Calculator" },
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: user ? `/user/${user.username}` : "/login", icon: User, label: "Profile" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive(href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
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
