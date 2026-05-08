"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Lock,
  Globe,
  Wallet,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

export default function LearnMorePage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".scroll-animate").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[390px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="size-5 text-white" />
          </Link>
          <h1 className="text-white font-semibold">Learn More</h1>
        </div>
      </header>

      <main className="max-w-[390px] mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <section className="scroll-animate opacity-0 translate-y-4 transition-all duration-500">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="SwapEase"
                width={96}
                height={96}
                className="rounded-2xl shadow-lg"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to SwapEase</h2>
            <p className="text-muted-foreground text-sm">
              India&apos;s most trusted P2P platform for USDT trading
            </p>
          </div>
        </section>

        {/* What is USDT Section */}
        <section className="scroll-animate opacity-0 translate-y-4 transition-all duration-500 delay-100">
          <div className="card-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#26a17b]/20 flex items-center justify-center">
                <span className="text-[#26a17b] font-bold text-sm">₮</span>
              </div>
              <h3 className="text-lg font-semibold text-white">What is USDT?</h3>
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed mb-4">
              USDT (Tether) is a <span className="text-white">stablecoin</span> cryptocurrency that is pegged to the US Dollar. 
              1 USDT = 1 USD, making it a stable store of value in the volatile crypto market.
            </p>
            <div className="space-y-2">
              {[
                "Backed 1:1 by US Dollar reserves",
                "Most traded cryptocurrency by volume",
                "Used for trading, transfers & savings",
                "Available on multiple blockchain networks",
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-[13px] text-muted-foreground">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What is P2P Trading */}
        <section className="scroll-animate opacity-0 translate-y-4 transition-all duration-500 delay-150">
          <div className="card-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white">What is P2P Trading?</h3>
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed mb-4">
              P2P (Peer-to-Peer) trading allows you to buy and sell cryptocurrency 
              <span className="text-white"> directly with other users</span> without any middleman. 
              SwapEase acts as an escrow to ensure safe transactions.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Lock, label: "Escrow Protected" },
                { icon: Zap, label: "Instant Transfer" },
                { icon: Shield, label: "100% Secure" },
                { icon: TrendingUp, label: "Best Rates" },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                  <Icon className="size-4 text-primary" />
                  <span className="text-[12px] text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How SwapEase Works */}
        <section className="scroll-animate opacity-0 translate-y-4 transition-all duration-500 delay-200">
          <h3 className="text-lg font-semibold text-white mb-4">How SwapEase Works</h3>
          
          {/* Sell Flow */}
          <div className="card-dark rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Zap className="size-4 text-green-400" />
              </div>
              <h4 className="font-semibold text-white">Sell USDT - Get INR</h4>
            </div>
            <div className="space-y-4">
              {[
                { step: 1, title: "Enter Amount", desc: "Enter USDT amount you want to sell" },
                { step: 2, title: "Add Bank Details", desc: "Provide your bank account for INR" },
                { step: 3, title: "Send USDT", desc: "Transfer USDT to our secure wallet" },
                { step: 4, title: "Receive INR", desc: "Get instant INR in your bank account" },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-[12px] font-bold text-primary">{step}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white">{title}</p>
                    <p className="text-[12px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buy Flow */}
          <div className="card-dark rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Wallet className="size-4 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white">Buy USDT - Pay INR</h4>
            </div>
            <div className="space-y-4">
              {[
                { step: 1, title: "Enter Amount", desc: "Enter INR or USDT amount to buy" },
                { step: 2, title: "Add Wallet", desc: "Provide your USDT wallet address" },
                { step: 3, title: "Make Payment", desc: "Pay via UPI or Bank Transfer" },
                { step: 4, title: "Receive USDT", desc: "Get USDT in your wallet instantly" },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-[12px] font-bold text-primary">{step}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white">{title}</p>
                    <p className="text-[12px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Networks */}
        <section className="scroll-animate opacity-0 translate-y-4 transition-all duration-500 delay-250">
          <div className="card-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Globe className="size-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Supported Networks</h3>
            </div>
            <p className="text-muted-foreground text-[13px] mb-4">
              We support USDT on multiple blockchain networks for your convenience.
            </p>
            <div className="space-y-3">
              {[
                { name: "TRC20", chain: "Tron Network", fee: "Low fees (~1 USDT)", color: "text-red-400" },
                { name: "ERC20", chain: "Ethereum Network", fee: "Higher gas fees", color: "text-blue-400" },
                { name: "BEP20", chain: "BNB Smart Chain", fee: "Low fees (~0.5 USDT)", color: "text-yellow-400" },
              ].map(({ name, chain, fee, color }) => (
                <div key={name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-sm ${color}`}>{name}</span>
                    <span className="text-[12px] text-muted-foreground">{chain}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{fee}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex gap-2">
                <AlertCircle className="size-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-yellow-200/80">
                  Always double-check the network before sending. Sending to wrong network may result in permanent loss.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose SwapEase */}
        <section className="scroll-animate opacity-0 translate-y-4 transition-all duration-500 delay-300">
          <h3 className="text-lg font-semibold text-white mb-4">Why Choose SwapEase?</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Shield, title: "100% Secure", desc: "Bank-grade security" },
              { icon: Zap, title: "Instant Payout", desc: "Get INR in minutes" },
              { icon: TrendingUp, title: "Best Rates", desc: "Competitive pricing" },
              { icon: Lock, title: "Non-Custodial", desc: "You control funds" },
              { icon: Users, title: "24/7 Support", desc: "Always available" },
              { icon: ArrowRightLeft, title: "Zero Fees", desc: "No hidden charges" },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="card-dark rounded-xl p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                  <Icon className="size-5 text-primary" />
                </div>
                <p className="text-[13px] font-medium text-white">{title}</p>
                <p className="text-[11px] text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="scroll-animate opacity-0 translate-y-4 transition-all duration-500 delay-350">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="size-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">FAQs</h3>
          </div>
          <div className="space-y-3">
            {[
              { q: "Is SwapEase safe to use?", a: "Yes, we use bank-grade encryption and secure escrow to protect all transactions." },
              { q: "How long does a transaction take?", a: "Most transactions are completed within 5-15 minutes after payment confirmation." },
              { q: "What is the minimum amount?", a: "Minimum transaction is 10 USDT for selling and Rs 1,000 for buying." },
              { q: "Are there any hidden fees?", a: "No hidden fees. We charge a transparent 0.5% platform fee on transactions." },
              { q: "What if I send to wrong address?", a: "Unfortunately, crypto transactions are irreversible. Always double-check addresses." },
            ].map(({ q, a }, i) => (
              <details key={i} className="card-dark rounded-xl group">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="text-[13px] font-medium text-white pr-4">{q}</span>
                  <ChevronRight className="size-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 pt-0">
                  <p className="text-[12px] text-muted-foreground">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="scroll-animate opacity-0 translate-y-4 transition-all duration-500 delay-400">
          <div className="card-dark rounded-2xl p-6 text-center border border-primary/20">
            <h3 className="text-xl font-bold text-white mb-2">Ready to Start Trading?</h3>
            <p className="text-muted-foreground text-[13px] mb-5">
              Join thousands of users trading USDT on SwapEase
            </p>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="flex-1 py-3 bg-primary hover:bg-[#5d8cff] text-white font-semibold rounded-full transition-colors text-[14px]"
              >
                Get Started
              </Link>
              <Link
                href="/calculator"
                className="flex-1 py-3 border border-white/20 hover:bg-white/5 text-white font-semibold rounded-full transition-colors text-[14px]"
              >
                Calculator
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom spacing */}
        <div className="h-4" />
      </main>

      {/* Add animation styles */}
      <style jsx>{`
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
