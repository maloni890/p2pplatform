"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Shield, Zap, Lock, Users, Percent, Layers, ChevronDown, Menu, X, Star } from "lucide-react";

const FEATURES = [
  { icon: Users, title: "P2P Trading", desc: "Trade directly with verified sellers." },
  { icon: Zap, title: "Instant Settlement", desc: "INR hits your bank in minutes." },
  { icon: Lock, title: "Escrow Protected", desc: "USDT locked safely until payment confirmed." },
  { icon: Shield, title: "Verified Sellers", desc: "KYC-verified traders with ratings." },
  { icon: Percent, title: "Zero Hidden Fees", desc: "0.3% only. No hidden fees." },
  { icon: Layers, title: "Multi-Network", desc: "TRC20, ERC20, BEP20 supported." },
];

const STEPS = [
  { num: "01", title: "Post or Browse", desc: "Browse verified seller ads or post your own. Filter by rate and payment method." },
  { num: "02", title: "Trade with Escrow", desc: "USDT locked securely. Pay INR directly to seller via UPI or bank transfer." },
  { num: "03", title: "Confirm & Release", desc: "Upload payment proof. Seller confirms and USDT releases to your wallet." },
];

const TESTIMONIALS = [
  { initials: "RK", name: "Rohit K.", location: "Mumbai", quote: "Sold 5000 USDT in 10 minutes. Best rates I've found anywhere." },
  { initials: "PS", name: "Priya S.", location: "Delhi", quote: "KYC process was smooth. Payments hit my bank instantly." },
  { initials: "AJ", name: "Amit J.", location: "Bangalore", quote: "Been using for 3 months. Zero issues, great support." },
];

const SECURITY_POINTS = [
  { icon: "🔐", title: "Escrow Protected", desc: "USDT locked in smart escrow during every trade." },
  { icon: "🛡️", title: "KYC Verified", desc: "All sellers verified with government ID." },
  { icon: "⏱️", title: "Dispute Resolution", desc: "24hr admin support for any trade issues." },
  { icon: "🔒", title: "Non-Custodial", desc: "We never hold your funds or private keys." },
];

const NETWORKS = [
  { name: "TRON", type: "TRC20", color: "#e50914" },
  { name: "Ethereum", type: "ERC20", color: "#627eea" },
  { name: "BNB", type: "BEP20", color: "#f3ba2f" },
];

const FAQS = [
  { q: "Is SwapEase safe to use?", a: "Yes. All trades use escrow protection. USDT is locked until INR payment is confirmed. KYC-verified sellers only." },
  { q: "What are the fees?", a: "We charge 0.3% on each side of the trade. No deposit, withdrawal, or hidden fees." },
  { q: "How long does a trade take?", a: "Most trades complete in 5-15 minutes depending on the seller's response time." },
  { q: "Which networks are supported?", a: "TRC20 (TRON), ERC20 (Ethereum), and BEP20 (BNB Chain)." },
  { q: "How do I become a seller?", a: "Complete KYC verification and apply as a seller from your profile page." },
];

const getInitialsBgColor = (initials: string): string => {
  const colors = ["bg-blue-500", "bg-purple-500", "bg-teal-500"];
  return colors[initials.charCodeAt(0) % colors.length];
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [currentRate] = useState(106.35);

  return (
    <div className="min-h-screen bg-[#0a0a1a]" style={{ fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* ═══ NAVBAR ═══════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 h-[52px] px-4 flex items-center justify-between bg-[rgba(10,10,26,0.95)] border-b border-[rgba(255,255,255,0.06)] backdrop-blur">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-[#4d7cfe] to-[#6b94ff] rounded-[8px] flex items-center justify-center">
            <span className="text-white text-[11px] font-bold">SE</span>
          </div>
          <span className="text-white text-[15px] font-semibold">SwapEase</span>
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white hover:bg-[rgba(255,255,255,0.05)] rounded"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-[52px] left-0 right-0 bg-[#13131f] border-b border-[rgba(255,255,255,0.08)]">
            <div className="p-4 flex flex-col gap-3">
              <a href="#features" className="text-[14px] text-white px-4 py-3 hover:bg-[rgba(77,124,254,0.1)] rounded">Features</a>
              <Link href="/p2p" className="text-[14px] text-white px-4 py-3 hover:bg-[rgba(77,124,254,0.1)] rounded">P2P Market</Link>
              <a href="#how-it-works" className="text-[14px] text-white px-4 py-3 hover:bg-[rgba(77,124,254,0.1)] rounded">About</a>
              <Link href="/register" className="text-[14px] text-white px-4 py-3 bg-[#4d7cfe] rounded font-semibold hover:bg-[#5d8cff]">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO SECTION ══════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[radial-gradient(ellipse_at_30%_0%,#1a0a2e_0%,#0a0a1a_60%,#0d1020_100%)] px-4 pt-12 pb-10">
        {/* Label Pill */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[rgba(77,124,254,0.1)] border border-[rgba(77,124,254,0.2)] rounded-full">
            <span className="w-1.5 h-1.5 bg-[#0ecb81] rounded-full animate-pulse" />
            <span className="text-[11px] text-[#8b949e]">India's #1 Decentralized P2P Exchange</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-[32px] font-bold text-[#f0f6fc] text-center leading-[1.1] mb-1">
          Buy &amp; Sell USDT
        </h1>

        {/* Subheadline */}
        <h2 className="text-[26px] font-semibold text-[#4d7cfe] text-center mb-3.5">
          Get INR directly in your bank
        </h2>

        {/* Body Text */}
        <p className="text-[13px] text-[#8b949e] text-center leading-[1.6] max-w-[320px] mx-auto mb-6">
          Trade USDT peer-to-peer with instant bank transfers, zero hidden fees, and the best rates in India.
        </p>

        {/* CTA Buttons - Stacked on mobile */}
        <div className="flex flex-col gap-2.5 mb-4">
          <Link
            href="/register"
            className="w-full h-12 bg-gradient-to-r from-[#4d7cfe] to-[#6b94ff] text-white text-[15px] font-semibold rounded-full flex items-center justify-center hover:shadow-lg transition-all"
          >
            Start Trading
          </Link>
          <Link
            href="/p2p"
            className="w-full h-12 bg-transparent border border-[rgba(255,255,255,0.15)] text-white text-[15px] font-medium rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            View P2P Market
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 text-[11px] text-[#8b949e]">
          <span>🔒 Non-custodial</span>
          <span>✓ KYC Verified</span>
          <span>⚡ Zero Fees</span>
        </div>

        {/* Live Rate Card */}
        <div className="bg-[#13131f] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-3.5 max-w-[320px] mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] text-[#8b949e]">USDT / INR</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#0ecb81] rounded-full animate-pulse" />
              <span className="text-[11px] text-[#0ecb81]">Live</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline mb-2.5">
            <span className="text-[26px] font-bold text-white">₹{currentRate.toFixed(2)}</span>
            <span className="text-[11px] bg-[rgba(14,203,129,0.1)] text-[#0ecb81] px-2 py-1 rounded">+0.29%</span>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.06)] my-2.5" />

          {/* Mini Order Book */}
          <div className="space-y-0.5 text-[11px] font-mono">
            <div className="flex justify-between text-[#f6465d]"><span>106.40</span><span>1,250</span></div>
            <div className="flex justify-between text-[#f6465d]"><span>106.38</span><span>890</span></div>
            <div className="flex justify-between text-[#f6465d]"><span>106.35</span><span>2,100</span></div>
            <div className="text-center text-[#8b949e] py-1.5 text-[10px]">Spread ₹0.52</div>
            <div className="flex justify-between text-[#0ecb81]"><span>106.32</span><span>1,800</span></div>
            <div className="flex justify-between text-[#0ecb81]"><span>106.30</span><span>3,200</span></div>
            <div className="flex justify-between text-[#0ecb81]"><span>106.28</span><span>950</span></div>
          </div>

          <div className="text-center mt-2.5 pt-2.5 border-t border-[rgba(255,255,255,0.06)]">
            <Link href="/p2p" className="text-[11px] text-[#4d7cfe] hover:underline">
              View full P2P market →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#13131f] border-t border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="text-center flex-1">
            <div className="text-[18px] font-bold text-white">₹0</div>
            <div className="text-[11px] text-[#8b949e]">Volume</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-[18px] font-bold text-white">0</div>
            <div className="text-[11px] text-[#8b949e]">Traders</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-[18px] font-bold text-white">0</div>
            <div className="text-[11px] text-[#8b949e]">Trades</div>
          </div>
        </div>
        <div className="text-[10px] text-[#8b949e] text-right mt-2">Updated live</div>
      </section>

      {/* ═══ WHY SWAPEASE ══════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 bg-[#0a0a1a] px-4 py-10">
        <p className="text-[10px] text-[#8b949e] uppercase tracking-[2px] mb-2">WHY SWAPEASE</p>
        <h2 className="text-[20px] font-bold text-white mb-1.5">Built for serious traders</h2>
        <p className="text-[13px] text-[#8b949e] mb-5">Everything you need to trade USDT safely</p>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {FEATURES.map((feature, i) => (
            <div key={i} className="bg-[#13131f] border border-[rgba(255,255,255,0.06)] rounded-[10px] p-3 hover:border-[rgba(77,124,254,0.3)] transition-all hover:scale-105">
              <feature.icon size={18} className="text-[#4d7cfe] mb-2" />
              <h3 className="text-[12px] font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-[11px] text-[#8b949e] leading-[1.4]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW P2P WORKS ════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 bg-[#0d0d1a] border-t border-[rgba(255,255,255,0.04)] px-4 py-10">
        <h2 className="text-[20px] font-bold text-white text-center mb-7">How P2P works</h2>

        {/* Vertical Steps */}
        <div className="space-y-8">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-4">
              {/* Left: Step Indicator */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[rgba(77,124,254,0.15)] border border-[rgba(77,124,254,0.3)] rounded-full flex items-center justify-center">
                  <span className="text-[12px] font-bold text-[#4d7cfe]">{step.num}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-[1px] h-10 bg-[rgba(77,124,254,0.2)] mt-2" />
                )}
              </div>

              {/* Right: Content */}
              <div className="flex-1 pt-1">
                <h3 className="text-[14px] font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-[12px] text-[#8b949e] leading-[1.5]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ══════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0a0a1a] px-4 py-10">
        <h2 className="text-[18px] font-bold text-white text-center mb-5">Trusted by traders</h2>

        <div className="space-y-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <div key={i} className="bg-[#13131f] border border-[rgba(255,255,255,0.06)] rounded-[10px] p-3.5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold ${getInitialsBgColor(testimonial.initials)}`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-white">{testimonial.name}</div>
                    <div className="text-[11px] text-[#8b949e]">{testimonial.location}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="fill-[#4d7cfe] text-[#4d7cfe]" />
                  ))}
                </div>
              </div>
              <p className="text-[12px] text-[#8b949e] leading-[1.5]">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECURITY ══════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0d0d1a] border-t border-[rgba(255,255,255,0.04)] px-4 py-10">
        <h2 className="text-[18px] font-bold text-white text-center mb-1.5">Your security is our priority</h2>
        <p className="text-[12px] text-[#8b949e] text-center mb-5">Multiple layers of protection</p>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          {SECURITY_POINTS.map((point, i) => (
            <div key={i} className="bg-[#13131f] border border-[rgba(255,255,255,0.06)] rounded-[8px] p-3">
              <div className="text-[20px] mb-2">{point.icon}</div>
              <h3 className="text-[12px] font-bold text-white mb-1">{point.title}</h3>
              <p className="text-[11px] text-[#8b949e] leading-[1.4]">{point.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SUPPORTED NETWORKS ════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0a0a1a] px-4 py-8 text-center">
        <p className="text-[10px] text-[#8b949e] uppercase tracking-[2px] mb-4">SUPPORTED NETWORKS</p>

        <div className="flex justify-center gap-2 mb-3 flex-wrap">
          {NETWORKS.map((network) => (
            <div key={network.type} className="flex items-center gap-1.5 px-2.5 py-2 bg-[#13131f] border border-[rgba(255,255,255,0.08)] rounded-[6px]">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: network.color }} />
              <span className="text-[12px] font-bold text-white">{network.name}</span>
              <span className="text-[10px] text-[#8b949e]">{network.type}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#f0b90b]">⚠ Always verify network before sending</p>
      </section>

      {/* ═══ FAQ ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0d0d1a] px-4 py-10">
        <h2 className="text-[18px] font-bold text-white mb-5">Frequently asked</h2>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-[#13131f] border border-[rgba(255,255,255,0.06)] rounded-[8px] overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full px-3.5 py-3.5 flex justify-between items-center text-left hover:bg-[rgba(77,124,254,0.05)] transition-all"
              >
                <span className="text-[13px] font-semibold text-white">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#4d7cfe] transition-transform ${expandedFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              {expandedFaq === i && (
                <div className="px-3.5 py-3 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(77,124,254,0.05)]">
                  <p className="text-[12px] text-[#8b949e] leading-[1.6]">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA SECTION ═══════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#13131f] border-t border-[rgba(255,255,255,0.06)] px-4 py-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(77,124,254,0.1)] border border-[rgba(77,124,254,0.2)] rounded-full mb-4">
          <span className="text-[11px] text-[#4d7cfe]">🇮🇳 Made for India</span>
        </div>

        <h2 className="text-[24px] font-bold text-white mb-2">Ready to trade?</h2>
        <p className="text-[13px] text-[#8b949e] mb-6">
          Join SwapEase — India's trusted decentralized P2P USDT exchange
        </p>

        <div className="flex flex-col gap-2.5">
          <Link
            href="/register"
            className="h-12 bg-gradient-to-r from-[#4d7cfe] to-[#6b94ff] text-white text-[15px] font-semibold rounded-full flex items-center justify-center hover:shadow-lg transition-all"
          >
            Start Trading
          </Link>
          <Link
            href="/p2p"
            className="h-12 bg-transparent border border-[rgba(255,255,255,0.15)] text-white text-[15px] font-medium rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            View P2P Market
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="relative z-10 bg-[#0a0a1a] border-t border-[rgba(255,255,255,0.06)] px-4 py-8">
        {/* Top Row */}
        <div className="flex flex-col gap-4 mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#4d7cfe] to-[#6b94ff] rounded-[8px] flex items-center justify-center">
              <span className="text-white text-[11px] font-bold">SE</span>
            </div>
            <span className="text-white text-[15px] font-semibold">SwapEase</span>
          </Link>

          <div className="flex gap-4 text-[11px] text-[#8b949e]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-[#8b949e] leading-[1.6] mb-6">
          SwapEase is a peer-to-peer USDT exchange. We do not provide financial advice. Trade at your own risk.
        </p>

        {/* Social & Bottom */}
        <div className="flex justify-center gap-2 mb-4">
          <a href="#" className="w-8 h-8 rounded-full bg-[#13131f] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-white hover:bg-[rgba(77,124,254,0.1)] transition-all">
            <span className="text-[14px]">f</span>
          </a>
          <a href="#" className="w-8 h-8 rounded-full bg-[#13131f] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-white hover:bg-[rgba(77,124,254,0.1)] transition-all">
            <span className="text-[14px]">𝕏</span>
          </a>
        </div>

        <div className="flex justify-between text-[10px] text-[#484f58] pt-4 border-t border-[rgba(255,255,255,0.04)]">
          <span>© 2025 SwapEase</span>
          <span>Built in India 🇮🇳</span>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
