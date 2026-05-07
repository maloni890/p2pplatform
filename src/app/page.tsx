"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Shield,
  Percent,
  TrendingUp,
  Home,
  Calculator,
  LayoutDashboard,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const FEATURES = ["Fast", "Secure", "Zero Fee", "Best Rate", "24/7 Support", "Instant"];

export default function HomePage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [currentRate] = useState(106.35);

  const isActive = (path: string) => pathname === path;

  // Generate particles
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number }>>([]);
  
  useEffect(() => {
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative overflow-hidden">
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-[390px] mx-auto text-center">
          {/* Logo */}
          <div className="fade-in-up mb-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4d7cfe] to-[#8b5cf6] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">DB</span>
              </div>
              <span className="text-white font-bold text-xl">DTBranch</span>
            </div>
          </div>

          {/* Live Rate Pill */}
          <div className="fade-in-up delay-100 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-white text-sm font-medium">
                Live Rate <span className="text-primary font-bold">₹{currentRate.toFixed(2)}/USDT</span>
              </span>
            </div>
          </div>

          {/* Hero Text */}
          <div className="fade-in-up delay-200 mb-4">
            <h1 className="text-[30px] font-bold text-white leading-tight">
              Buy &amp; Sell USDT
            </h1>
            <p className="text-[26px] font-semibold text-primary">
              Get INR Instantly
            </p>
          </div>

          {/* Subtext */}
          <p className="fade-in-up delay-300 text-[13px] text-muted-foreground mb-8 px-4">
            India&apos;s most trusted P2P platform for instant USDT to INR conversion with zero fees
          </p>

          {/* CTA Buttons */}
          <div className="fade-in-up delay-400 flex gap-3 mb-10 px-4">
            <Link
              href="/sell"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-[#5d8cff] text-white font-semibold rounded-full transition-all"
            >
              <Zap className="size-4" />
              Sell USDT
            </Link>
            <Link
              href="/buy"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-transparent border border-white/30 hover:border-white/50 hover:bg-white/5 text-white font-semibold rounded-full transition-all"
            >
              Buy USDT
            </Link>
          </div>

          {/* Feature Tags - Scrolling */}
          <div className="fade-in-up delay-500 overflow-hidden mb-12">
            <div className="flex gap-4 features-scroll whitespace-nowrap">
              {[...FEATURES, ...FEATURES].map((feature, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-full text-xs text-muted-foreground"
                >
                  {feature === "Fast" && <Zap className="size-3 text-primary" />}
                  {feature === "Secure" && <Shield className="size-3 text-primary" />}
                  {feature === "Zero Fee" && <Percent className="size-3 text-primary" />}
                  {feature === "Best Rate" && <TrendingUp className="size-3 text-primary" />}
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="fade-in-up delay-500 grid grid-cols-3 gap-4 px-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">50K+</p>
              <p className="text-[11px] text-muted-foreground">Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">₹100Cr+</p>
              <p className="text-[11px] text-muted-foreground">Volume</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-[11px] text-muted-foreground">Success</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Links */}
      <footer className="py-4 text-center">
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
          <Link href="/register" className="hover:text-primary transition-colors">Register</Link>
          <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
        </div>
      </footer>

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
                isActive(href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-white"
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
