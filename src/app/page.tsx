"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Shield, Zap, Lock, Users, Percent, Layers, ChevronDown, Menu, X } from "lucide-react";

const FEATURES = [
  { icon: Users, title: "P2P Trading", desc: "Trade directly with verified sellers. No intermediary." },
  { icon: Zap, title: "Instant Settlement", desc: "INR hits your bank in minutes via UPI/IMPS." },
  { icon: Lock, title: "Escrow Protected", desc: "USDT locked safely until payment confirmed." },
  { icon: Shield, title: "Verified Sellers", desc: "KYC-verified traders with completion ratings." },
  { icon: Percent, title: "Zero Hidden Fees", desc: "0.3% only. No deposit or withdrawal fees." },
  { icon: Layers, title: "Multi-Network", desc: "TRC20, ERC20, BEP20 supported." },
];

const STEPS = [
  { num: "01", title: "Post or Browse", desc: "Browse verified seller ads or post your own. Filter by rate, payment method, and amount." },
  { num: "02", title: "Trade with Escrow", desc: "USDT locked in escrow. Pay INR directly to seller via UPI or bank transfer." },
  { num: "03", title: "Confirm & Release", desc: "Upload payment proof. Seller confirms and USDT releases to your wallet instantly." },
];

const NETWORKS = [
  { name: "TRON", type: "TRC20", color: "#ff0013" },
  { name: "Ethereum", type: "ERC20", color: "#627eea" },
  { name: "BNB Chain", type: "BEP20", color: "#4d7cfe" },
];

export default function LandingPage() {
  const [currentRate] = useState(106.35);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="min-h-screen bg-[#0d1117]" style={{ fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-14 px-5 flex items-center justify-between transition-all duration-200 ${
          scrolled ? "bg-[#0d1117]/95 backdrop-blur-sm border-b border-[#21262d]" : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#4d7cfe] rounded-md flex items-center justify-center">
            <span className="text-black text-xs font-bold">SE</span>
          </div>
          <span className="text-[#f0f6fc] text-base font-semibold">SwapEase</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-[13px] text-[#8b949e] hover:text-[#f0f6fc] transition-colors">Features</a>
          <Link href="/p2p" className="text-[13px] text-[#8b949e] hover:text-[#f0f6fc] transition-colors">P2P</Link>
          <a href="#how-it-works" className="text-[13px] text-[#8b949e] hover:text-[#f0f6fc] transition-colors">About</a>
          <Link
            href="/register"
            className="h-[34px] px-4 bg-[#4d7cfe] text-white text-[13px] font-semibold rounded-md flex items-center hover:bg-[#5d8cff] transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1 text-[#f0f6fc]"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-[#0d1117] border-b border-[#21262d] p-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[14px] text-[#8b949e]">Features</a>
              <Link href="/p2p" onClick={() => setMobileMenuOpen(false)} className="text-[14px] text-[#8b949e]">P2P</Link>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-[14px] text-[#8b949e]">About</a>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="h-11 bg-[#4d7cfe] text-white text-[14px] font-semibold rounded-md flex items-center justify-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-[85vh] pt-20 pb-16 px-5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:text-left text-center">
            {/* Label Pill */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#161b22] border border-[#30363d] rounded-full mb-6 animate-fade-in"
            >
              <span className="w-1.5 h-1.5 bg-[#3fb950] rounded-full" />
              <span className="text-[12px] text-[#8b949e]">India&apos;s #1 Decentralized P2P Exchange</span>
            </div>

            {/* Headlines */}
            <h1 className="text-4xl md:text-[52px] font-bold text-[#f0f6fc] leading-[1.1] mb-2 animate-fade-in animation-delay-100">
              Buy &amp; Sell USDT
            </h1>
            <p className="text-2xl md:text-[40px] font-semibold text-[#4d7cfe] mb-4 animate-fade-in animation-delay-200">
              Get INR directly in your bank
            </p>

            {/* Body Text */}
            <p className="text-[14px] text-[#8b949e] max-w-[420px] lg:mx-0 mx-auto mb-7 leading-relaxed animate-fade-in animation-delay-300">
              Trade USDT peer-to-peer with instant bank transfers, zero hidden fees, and the best rates in India.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-3 lg:justify-start justify-center flex-wrap mb-4 animate-fade-in animation-delay-400">
              <Link
                href="/register"
                className="h-11 px-6 bg-[#4d7cfe] text-white text-[14px] font-semibold rounded-md flex items-center hover:bg-[#5d8cff] transition-all"
              >
                Start Trading
              </Link>
              <Link
                href="/p2p"
                className="h-11 px-6 bg-transparent border border-[#30363d] text-[#f0f6fc] text-[14px] font-medium rounded-md flex items-center hover:border-[#8b949e] transition-colors"
              >
                View P2P Market
              </Link>
            </div>

            {/* Trust Line */}
            <p className="text-[12px] text-[#8b949e] animate-fade-in animation-delay-500">
              <span className="mr-3">🔒 Non-custodial</span>
              <span className="mr-3">·</span>
              <span className="mr-3">✓ KYC Verified Sellers</span>
              <span className="mr-3">·</span>
              <span>0% Platform Fee</span>
            </p>
          </div>

          {/* Right Column - Live Rate Card (Desktop Only) */}
          <div className="hidden lg:block">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 max-w-sm ml-auto animate-fade-in animation-delay-300">
              <p className="text-[12px] text-[#8b949e] mb-1">USDT / INR</p>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-[32px] font-bold text-[#f0f6fc]">₹{currentRate.toFixed(2)}</span>
                <span className="text-[13px] text-[#3fb950]">+₹0.31 (0.29%)</span>
              </div>
              
              <div className="border-t border-[#21262d] my-4" />
              
              {/* Mini Order Book */}
              <div className="space-y-1.5 font-mono text-[12px]">
                <div className="flex justify-between text-[#3fb950]">
                  <span>106.40</span><span>1,250.00</span>
                </div>
                <div className="flex justify-between text-[#3fb950]">
                  <span>106.38</span><span>890.50</span>
                </div>
                <div className="flex justify-between text-[#3fb950]">
                  <span>106.35</span><span>2,100.00</span>
                </div>
                <div className="h-px bg-[#30363d] my-2" />
                <div className="flex justify-between text-[#f6465d]">
                  <span>106.32</span><span>1,800.00</span>
                </div>
                <div className="flex justify-between text-[#f6465d]">
                  <span>106.30</span><span>3,200.00</span>
                </div>
                <div className="flex justify-between text-[#f6465d]">
                  <span>106.28</span><span>950.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#161b22] border-y border-[#21262d] py-5 px-5">
        <div className="max-w-4xl mx-auto flex justify-between items-center overflow-x-auto gap-8">
          <div className="text-center flex-shrink-0">
            <p className="text-xl font-bold text-[#f0f6fc]">₹0</p>
            <p className="text-[12px] text-[#8b949e]">Volume</p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-xl font-bold text-[#f0f6fc]">0</p>
            <p className="text-[12px] text-[#8b949e]">Traders</p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-xl font-bold text-[#f0f6fc]">0</p>
            <p className="text-[12px] text-[#8b949e]">Trades</p>
          </div>
          <p className="text-[11px] text-[#8b949e] flex-shrink-0">Updated live</p>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={setSectionRef("features")}
        className="py-16 px-5 bg-[#0d1117]"
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] text-[#8b949e] uppercase tracking-widest mb-2">WHY SWAPEASE</p>
          <h2 className="text-2xl font-bold text-[#f0f6fc] mb-2">Built for serious traders</h2>
          <p className="text-[14px] text-[#8b949e] mb-10">Everything you need to trade USDT safely in India</p>

          <div
            className={`grid md:grid-cols-3 sm:grid-cols-2 gap-4 transition-all duration-700 ${
              isVisible("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 hover:border-[#4d7cfe] transition-colors duration-200"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <feature.icon className="size-5 text-[#4d7cfe] mb-3" />
                <h3 className="text-[14px] font-semibold text-[#f0f6fc] mb-1">{feature.title}</h3>
                <p className="text-[13px] text-[#8b949e] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How P2P Works */}
      <section
        id="how-it-works"
        ref={setSectionRef("how-it-works")}
        className="py-16 px-5 bg-[#161b22]"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[22px] font-bold text-[#f0f6fc] text-center mb-10">How P2P works</h2>

          <div
            className={`grid md:grid-cols-3 gap-0 transition-all duration-700 ${
              isVisible("how-it-works") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`p-6 ${i < 2 ? "md:border-r border-b md:border-b-0 border-[#30363d]" : ""}`}
              >
                <p className="text-[11px] text-[#8b949e] font-medium mb-2">{step.num}</p>
                <h3 className="text-[15px] font-bold text-[#f0f6fc] mb-2">{step.title}</h3>
                <p className="text-[13px] text-[#8b949e] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Networks */}
      <section className="py-10 px-5 bg-[#0d1117] text-center">
        <p className="text-[11px] text-[#8b949e] uppercase tracking-widest mb-4">SUPPORTED NETWORKS</p>
        
        <div className="flex items-center justify-center gap-3 flex-wrap mb-3">
          {NETWORKS.map((network) => (
            <div
              key={network.type}
              className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-md"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: network.color }}
              />
              <span className="text-[13px] text-[#f0f6fc]">{network.name}</span>
              <span className="text-[11px] text-[#8b949e]">{network.type}</span>
            </div>
          ))}
        </div>

        <p className="text-[12px] text-[#4d7cfe]">
          Always verify the network before sending USDT to avoid loss of funds
        </p>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-5 bg-[#161b22] border-y border-[#21262d] text-center">
        <h2 className="text-[28px] font-bold text-[#f0f6fc] mb-2">Ready to trade?</h2>
        <p className="text-[14px] text-[#8b949e] mb-7">
          Join SwapEase — India&apos;s trusted decentralized P2P USDT exchange
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/register"
            className="h-11 px-6 bg-[#4d7cfe] text-white text-[14px] font-semibold rounded-md flex items-center hover:bg-[#5d8cff] transition-all"
          >
            Start Trading
          </Link>
          <Link
            href="/p2p"
            className="h-11 px-6 bg-transparent border border-[#30363d] text-[#f0f6fc] text-[14px] font-medium rounded-md flex items-center hover:border-[#8b949e] transition-colors"
          >
            View P2P Market
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1117] border-t border-[#21262d] py-10 px-5">
        <div className="max-w-4xl mx-auto">
          {/* Top Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#4d7cfe] rounded-md flex items-center justify-center">
                <span className="text-black text-xs font-bold">SE</span>
              </div>
              <span className="text-[#f0f6fc] text-base font-semibold">SwapEase</span>
            </Link>

            <div className="flex gap-6">
              <Link href="/privacy" className="text-[13px] text-[#8b949e] hover:text-[#f0f6fc]">Privacy</Link>
              <Link href="/terms" className="text-[13px] text-[#8b949e] hover:text-[#f0f6fc]">Terms</Link>
              <Link href="/support" className="text-[13px] text-[#8b949e] hover:text-[#f0f6fc]">Support</Link>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[12px] text-[#8b949e] max-w-md mb-6">
            SwapEase is a peer-to-peer USDT exchange platform. We do not provide financial advice. Trade at your own risk.
          </p>

          {/* Bottom Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] text-[#484f58]">
            <span>© 2025 SwapEase</span>
            <span>Built in India 🇮🇳</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease forwards;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
