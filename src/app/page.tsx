"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Shield,
  Percent,
  TrendingUp,
  Link2,
  Wallet,
  Clock,
  User,
  ArrowLeftRight,
  Landmark,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const FEATURES = ["Fast", "Secure", "Zero Fee", "Best Rate", "24/7 Support", "Instant"];

const LIVE_TRADES = [
  { name: "Rahul S.", action: "bought", amount: 500, inr: 53175, time: "2 mins ago", initials: "RS" },
  { name: "Priya M.", action: "sold", amount: 1200, inr: 127620, time: "4 mins ago", initials: "PM" },
  { name: "Amit K.", action: "bought", amount: 250, inr: 26587, time: "5 mins ago", initials: "AK" },
  { name: "Sneha R.", action: "sold", amount: 800, inr: 85080, time: "7 mins ago", initials: "SR" },
  { name: "Vikram J.", action: "bought", amount: 2000, inr: 212700, time: "8 mins ago", initials: "VJ" },
  { name: "Neha P.", action: "sold", amount: 350, inr: 37222, time: "10 mins ago", initials: "NP" },
];

const NETWORKS = [
  { name: "TRON", type: "TRC20", icon: "T" },
  { name: "Ethereum", type: "ERC20", icon: "E" },
  { name: "BNB Chain", type: "BEP20", icon: "B" },
];

export default function HomePage() {
  const [currentRate] = useState(106.35);
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number }>>([]);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
    }));
    setParticles(generated);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              bottom: "0",
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Corner glow effects */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 relative z-10">
        <div className="w-full max-w-[390px] mx-auto">
          {/* Hero Section - Centered */}
          <div className="text-center">
            {/* Logo */}
            <div className="fade-in-up mb-5">
              <div className="inline-flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="SwapEase"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-white font-bold text-lg">SwapEase</span>
              </div>
            </div>

            {/* Live Rate Pill */}
            <div className="fade-in-up delay-100 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                <span className="text-white text-xs font-medium">
                  Live <span className="text-primary font-bold">₹{currentRate.toFixed(2)}/USDT</span>
                </span>
              </div>
            </div>

            {/* Hero Text */}
            <div className="fade-in-up delay-200 mb-3">
              <h1 className="text-[24px] font-bold text-white leading-tight">
                Buy &amp; Sell USDT
              </h1>
              <p className="text-[20px] font-semibold text-primary">
                Get INR Instantly
              </p>
            </div>

            {/* Subtext */}
            <p className="fade-in-up delay-300 text-[11px] text-muted-foreground mb-4 px-3">
              India&apos;s most trusted P2P platform for instant USDT to INR conversion
            </p>

            {/* CTA Buttons */}
            <div className="fade-in-up delay-400 flex gap-2 mb-6 px-3">
              <Link
                href="/register"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary hover:bg-[#5d8cff] text-white text-sm font-semibold rounded-full transition-all"
              >
                Get Started
              </Link>
              <Link
                href="/learn-more"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-transparent border border-white/30 hover:border-white/50 hover:bg-white/5 text-white text-sm font-semibold rounded-full transition-all"
              >
                Learn More
              </Link>
            </div>

            {/* Feature Tags - Scrolling */}
            <div className="fade-in-up delay-500 overflow-hidden mb-8">
              <div className="flex gap-2 features-scroll whitespace-nowrap">
                {[...FEATURES, ...FEATURES].map((feature, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-card border border-border rounded-full text-[10px] text-muted-foreground"
                  >
                    {feature === "Fast" && <Zap className="size-2.5 text-primary" />}
                    {feature === "Secure" && <Shield className="size-2.5 text-primary" />}
                    {feature === "Zero Fee" && <Percent className="size-2.5 text-primary" />}
                    {feature === "Best Rate" && <TrendingUp className="size-2.5 text-primary" />}
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="fade-in-up delay-500 grid grid-cols-3 gap-2 px-3 mb-10">
              <div className="text-center">
                <p className="text-lg font-bold text-white">50K+</p>
                <p className="text-[10px] text-muted-foreground">Users</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">₹100Cr+</p>
                <p className="text-[10px] text-muted-foreground">Volume</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">99.9%</p>
                <p className="text-[10px] text-muted-foreground">Success</p>
              </div>
            </div>
          </div>

          {/* SECTION 1 — Why Decentralized */}
          <div
            id="why-different"
            ref={setSectionRef("why-different")}
            className={`mb-8 transition-all duration-700 ${isVisible("why-different") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="p-4 bg-card rounded-xl border border-border relative overflow-hidden">
              {/* Purple glow border effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8b5cf6]/20 via-transparent to-[#4d7cfe]/20 pointer-events-none" />
              
              <h2 className="text-[15px] font-bold text-white mb-1 relative">Why SwapEase is Different?</h2>
              <p className="text-[11px] text-primary mb-4 relative">
                Fully decentralized — no middlemen, just P2P freedom
              </p>

              <div className="grid gap-2 relative">
                {[
                  { icon: Link2, title: "Truly Decentralized", desc: "No central authority. You control your funds." },
                  { icon: Wallet, title: "Non-Custodial", desc: "Direct wallet-to-wallet trades." },
                  { icon: Clock, title: "Instant Settlement", desc: "Trades settle in minutes." },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#1a1a2c] rounded-lg border-t-2 border-t-primary"
                  >
                    <div className="flex items-start gap-2">
                      <item.icon className="size-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-[12px] font-semibold text-white">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2 — How It Works */}
          <div
            id="how-it-works"
            ref={setSectionRef("how-it-works")}
            className={`mb-8 transition-all duration-700 ${isVisible("how-it-works") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h2 className="text-[15px] font-bold text-white text-center mb-4">How It Works</h2>
            
            <div className="relative">
              {/* Dotted line connector */}
              <div className="absolute top-6 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-primary/30 z-0" />
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { icon: User, step: 1, title: "Create Account", desc: "Register in 60 sec" },
                  { icon: ArrowLeftRight, step: 2, title: "Place Order", desc: "Buy or Sell USDT" },
                  { icon: Landmark, step: 3, title: "Get Paid", desc: "INR via UPI/IMPS" },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex-shrink-0 w-[110px] text-center relative z-10"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-[11px]">{item.step}</span>
                    </div>
                    <div className="p-2 bg-card rounded-lg border border-border">
                      <item.icon className="size-4 text-primary mx-auto mb-1" />
                      <p className="text-[10px] font-semibold text-white mb-0.5">{item.title}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3 — Decentralized Advantage Banner */}
          <div
            id="advantage-banner"
            ref={setSectionRef("advantage-banner")}
            className={`mb-8 transition-all duration-700 ${isVisible("advantage-banner") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative p-4 bg-card rounded-xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#4d7cfe] via-[#8b5cf6] to-[#4d7cfe] p-[1px] animate-pulse">
                <div className="w-full h-full bg-card rounded-xl" />
              </div>
              
              <div className="relative text-center">
                <h3 className="text-[14px] font-bold text-white mb-1">
                  No KYC. No Limits. No Middlemen.
                </h3>
                <p className="text-[10px] text-muted-foreground mb-3">
                  SwapEase runs on smart contracts. Secured by blockchain.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] text-green-400">
                    <CheckCircle2 className="size-3" />
                    Smart Contract
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-green-400">
                    <CheckCircle2 className="size-3" />
                    Blockchain Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 — Live Trades Feed */}
          <div
            id="live-trades"
            ref={setSectionRef("live-trades")}
            className={`mb-8 transition-all duration-700 ${isVisible("live-trades") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold text-white">Live Trades</h2>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                Real-time
              </span>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="h-[180px] overflow-hidden relative">
                <div className="live-trades-scroll">
                  {[...LIVE_TRADES, ...LIVE_TRADES].map((trade, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 border-b border-border/50 h-[30px]"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4d7cfe] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[8px] font-bold">{trade.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white truncate">
                          <span className="font-medium">{trade.name}</span>{" "}
                          <span className={trade.action === "bought" ? "text-green-400" : "text-primary"}>
                            {trade.action}
                          </span>{" "}
                          <span className="font-semibold">{trade.amount} USDT</span>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[9px] text-muted-foreground">₹{trade.inr.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5 — Supported Networks */}
          <div
            id="networks"
            ref={setSectionRef("networks")}
            className={`mb-8 transition-all duration-700 ${isVisible("networks") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h2 className="text-[13px] font-bold text-white text-center mb-3">Supported Networks</h2>
            
            <div className="flex items-center justify-center gap-1.5 flex-wrap mb-2">
              {NETWORKS.map((network) => (
                <div
                  key={network.type}
                  className="inline-flex items-center gap-1.5 px-2 py-1.5 bg-card border border-border rounded-full"
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#4d7cfe] to-[#8b5cf6] flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">{network.icon}</span>
                  </div>
                  <span className="text-[10px] text-white">{network.name}</span>
                  <span className="text-[9px] text-muted-foreground">({network.type})</span>
                </div>
              ))}
            </div>
            
            <p className="text-center text-[9px] text-yellow-500/80">
              Always send USDT on correct network
            </p>
          </div>

          {/* SECTION 6 — CTA Bottom Banner */}
          <div
            id="cta-banner"
            ref={setSectionRef("cta-banner")}
            className={`mb-6 transition-all duration-700 ${isVisible("cta-banner") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="p-4 bg-card rounded-xl border border-border relative overflow-hidden text-center">
              {/* Blue glow effect */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(77,124,254,0.15)_0%,transparent_70%)] pointer-events-none" />
              
              <h3 className="text-[16px] font-bold text-white mb-1 relative">Ready to Trade?</h3>
              <p className="text-[10px] text-muted-foreground mb-4 relative">
                Join 50,000+ traders on India&apos;s most trusted exchange
              </p>
              
              <div className="flex gap-2 justify-center relative">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-[#5d8cff] text-white text-[12px] font-semibold rounded-full transition-colors"
                >
                  Get Started
                  <ExternalLink className="size-3" />
                </Link>
                <Link
                  href="/learn-more"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-transparent border border-white/20 hover:border-white/40 text-white text-[12px] font-semibold rounded-full transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#0d0d1a] border-t border-border">
        <div className="w-full max-w-[390px] mx-auto">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Image
              src="/logo.png"
              alt="SwapEase"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-white font-bold">SwapEase</span>
          </div>
          <p className="text-center text-xs text-muted-foreground mb-6">
            Decentralized P2P USDT Exchange
          </p>

          {/* Links */}
          <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
            {["Home", "Calculator", "Support", "Terms", "Privacy"].map((link) => (
              <Link
                key={link}
                href={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <a
              href="https://t.me/swapease"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors"
            >
              <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/swapease"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors"
            >
              <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-center text-[11px] text-muted-foreground/60">
            © 2025 SwapEase. Decentralized &amp; Secured by Blockchain.
          </p>
        </div>
      </footer>
    </div>
  );
}
