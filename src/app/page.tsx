"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Shield,
  Zap,
  Clock,
  TrendingUp,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  Calculator,
  LayoutDashboard,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Demo data for live trades
const DEMO_TRADES = [
  { type: "buy", amount: 500, rate: 92.45, time: "2s ago" },
  { type: "sell", amount: 1200, rate: 92.38, time: "5s ago" },
  { type: "buy", amount: 750, rate: 92.42, time: "8s ago" },
  { type: "sell", amount: 2000, rate: 92.35, time: "12s ago" },
  { type: "buy", amount: 300, rate: 92.48, time: "15s ago" },
  { type: "sell", amount: 890, rate: 92.40, time: "18s ago" },
  { type: "buy", amount: 1500, rate: 92.44, time: "22s ago" },
  { type: "sell", amount: 450, rate: 92.36, time: "25s ago" },
  { type: "buy", amount: 2500, rate: 92.46, time: "30s ago" },
  { type: "sell", amount: 680, rate: 92.39, time: "35s ago" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Payout",
    description: "Receive INR directly in your bank within minutes",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "Escrow protection on every transaction",
  },
  {
    icon: Percent,
    title: "Zero Fee",
    description: "No hidden charges, what you see is what you get",
  },
  {
    icon: TrendingUp,
    title: "Best Rate",
    description: "Competitive rates updated in real-time",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [currentRate, setCurrentRate] = useState(92.45);
  const [trades, setTrades] = useState(DEMO_TRADES);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Simulate rate changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRate((prev) => {
        const change = (Math.random() - 0.5) * 0.1;
        return Math.round((prev + change) * 100) / 100;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate new trades
  useEffect(() => {
    const interval = setInterval(() => {
      const newTrade = {
        type: Math.random() > 0.5 ? "buy" : "sell",
        amount: Math.floor(Math.random() * 2000) + 200,
        rate: currentRate + (Math.random() - 0.5) * 0.2,
        time: "just now",
      };
      setTrades((prev) => [newTrade, ...prev.slice(0, 9)]);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentRate]);

  // Scroll animation observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-animate opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-20">
          {/* Live rate ticker */}
          <div className="fade-in-up flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-muted-foreground">Live Rate</span>
              <span className="text-lg font-bold text-primary ticker-glow font-stat">
                ₹{currentRate.toFixed(2)}/USDT
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center">
            <h1 className="fade-in-up delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-foreground text-balance">
              Buy &amp; Sell USDT
              <br />
              <span className="text-primary">INR directly in your bank</span>
            </h1>

            <p className="fade-in-up delay-200 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              India&apos;s fastest P2P trading platform. Trade USDT with instant bank transfers, 
              zero fees, and the best rates guaranteed.
            </p>

            {/* CTA Buttons */}
            <div className="fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/sell"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:opacity-90 transition-all glow-green"
              >
                <Zap className="size-5" />
                Sell USDT
                <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="/buy"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-card border-2 border-primary text-primary font-bold text-lg rounded-xl hover:bg-primary/5 transition-all"
              >
                <TrendingUp className="size-5" />
                Buy USDT
                <ArrowDownRight className="size-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="fade-in-up delay-400 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {[
                { icon: Shield, text: "Escrow Protected" },
                { icon: Zap, text: "Instant Settlement" },
                { icon: Clock, text: "24/7 Support" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Trades Feed */}
      <section className="border-y border-border bg-card/50 overflow-hidden py-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0 pl-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live Trades
          </div>
          <div className="overflow-hidden flex-1">
            <div ref={scrollRef} className="flex gap-4 trades-scroll">
              {/* Duplicate trades for seamless loop */}
              {[...trades, ...trades].map((trade, i) => (
                <div
                  key={i}
                  className="shrink-0 flex items-center gap-3 px-4 py-2 bg-background border border-border rounded-lg"
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center ${
                      trade.type === "buy"
                        ? "bg-primary/15 text-primary"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {trade.type === "buy" ? (
                      <ArrowDownRight className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {trade.type === "buy" ? "Buy" : "Sell"} {trade.amount} USDT
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{trade.rate.toFixed(2)} · {trade.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 w-full">
        <div className="animate-on-scroll text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Why Choose SwapEase?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The most trusted P2P platform for USDT trading in India
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-on-scroll group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="size-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="animate-on-scroll text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              How SwapEase Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start trading in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "01",
                title: "Choose an Offer",
                desc: "Browse verified traders with the best rates and select your preferred payment method.",
              },
              {
                step: "02",
                title: "Make Payment",
                desc: "Transfer INR via UPI, IMPS, or bank transfer. Funds are secured in escrow.",
              },
              {
                step: "03",
                title: "Receive USDT",
                desc: "Once payment is confirmed, USDT is instantly released to your wallet.",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="animate-on-scroll relative"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="text-6xl font-black text-primary/15 mb-4 font-stat">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-6 text-primary/30">
                    <ArrowUpRight className="size-8 rotate-45" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="animate-on-scroll grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "Active Users" },
              { value: "₹100Cr+", label: "Volume Traded" },
              { value: "< 5 min", label: "Avg Settlement" },
              { value: "99.9%", label: "Success Rate" },
            ].map((stat, i) => (
              <div key={stat.label} style={{ animationDelay: `${i * 100}ms` }}>
                <p className="text-3xl md:text-4xl font-black text-primary mb-2 font-stat">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 text-balance">
              Ready to start trading?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of traders. Create a free account and experience the fastest USDT trading in India.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:opacity-90 transition-opacity glow-green"
            >
              Get Started Free
              <ArrowUpRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-[10px] font-bold">SE</span>
            </div>
            <span className="font-bold text-foreground">SwapEase</span>
            <span>&copy; 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/buy" className="hover:text-foreground transition-colors">
              Buy USDT
            </Link>
            <Link href="/sell" className="hover:text-foreground transition-colors">
              Sell USDT
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>

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
