"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Gift,
  Copy,
  Users,
  Wallet,
  Share2,
  CheckCircle2,
} from "lucide-react";

interface Referral {
  id: string;
  name: string;
  joined_at: string;
  trades_completed: number;
  earnings: number;
}

const DEMO_REFERRALS: Referral[] = [
  {
    id: "1",
    name: "Rahul S.",
    joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    trades_completed: 12,
    earnings: 240,
  },
  {
    id: "2",
    name: "Priya M.",
    joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    trades_completed: 8,
    earnings: 160,
  },
  {
    id: "3",
    name: "Amit K.",
    joined_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    trades_completed: 25,
    earnings: 500,
  },
];

export default function ReferralsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [referrals] = useState<Referral[]>(DEMO_REFERRALS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const referralCode = user?.my_referral_code || "SWAPEASE";
  const referralLink = `https://swapease.com/register?ref=${referralCode}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join SwapEase",
          text: `Use my referral code ${referralCode} to get started on SwapEase - India's fastest P2P USDT platform!`,
          url: referralLink,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy(referralLink, "Referral link");
    }
  };

  const totalEarnings = referrals.reduce((sum, r) => sum + r.earnings, 0);
  const totalReferrals = referrals.length;

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-emerald-600 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Refer & Earn</h1>
          <p className="text-white/70 text-sm mt-1">
            Invite friends and earn rewards
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* Earnings Card */}
        <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <Gift className="size-10 mb-4 opacity-80" />
          <p className="text-white/70 text-sm">Total Earnings</p>
          <p className="text-3xl font-bold mt-1">
            {totalEarnings.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            })}
          </p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/70 text-xs">Referrals</p>
              <p className="font-semibold">{totalReferrals}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs">Per Trade</p>
              <p className="font-semibold">20 INR</p>
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Your Referral Code
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-muted/50 rounded-xl border border-border font-mono text-lg text-center font-bold tracking-wider">
              {referralCode}
            </div>
            <button
              onClick={() => handleCopy(referralCode, "Referral code")}
              className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              {copied ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Copy className="size-5" />
              )}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Referral Link</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 px-3 py-2 bg-muted/50 rounded-lg border border-border text-xs text-muted-foreground truncate"
              />
              <button
                onClick={() => handleCopy(referralLink, "Referral link")}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Copy className="size-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="w-full mt-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="size-5" />
            Share with Friends
          </button>
        </div>

        {/* How it works */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">How it Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-foreground">Share your code</p>
                <p className="text-xs text-muted-foreground">
                  Send your referral code to friends
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-foreground">They sign up</p>
                <p className="text-xs text-muted-foreground">
                  Friends register using your code
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-foreground">You earn rewards</p>
                <p className="text-xs text-muted-foreground">
                  Get 20 INR for every trade they complete
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        {referrals.length > 0 && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Your Referrals</h3>
            </div>
            <div className="divide-y divide-border">
              {referrals.map((referral) => (
                <div key={referral.id} className="p-4 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {referral.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{referral.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {referral.trades_completed} trades completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      +{referral.earnings} INR
                    </p>
                    <p className="text-xs text-muted-foreground">earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
