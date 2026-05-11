"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Tag, Clock, Percent, Zap, Gift } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  description: string;
  code?: string;
  discount?: string;
  valid_until: string;
  icon: "percent" | "zap" | "gift";
  color: "primary" | "amber" | "purple";
}

const OFFERS: Offer[] = [
  {
    id: "1",
    title: "Zero Fee Weekend",
    description: "Trade USDT with 0% platform fee this weekend!",
    code: "WEEKEND0",
    discount: "0% Fee",
    valid_until: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    icon: "percent",
    color: "primary",
  },
  {
    id: "2",
    title: "First Trade Bonus",
    description: "Get 50 INR bonus on your first successful trade",
    discount: "50 INR Bonus",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    icon: "gift",
    color: "amber",
  },
  {
    id: "3",
    title: "VIP Upgrade",
    description: "Complete 10 trades this month and get VIP status free!",
    discount: "VIP Status",
    valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    icon: "zap",
    color: "purple",
  },
];

const ICON_MAP = {
  percent: Percent,
  zap: Zap,
  gift: Gift,
};

const COLOR_MAP = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    gradient: "from-primary to-emerald-600",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-amber-500/20",
    gradient: "from-amber-500 to-orange-500",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-600",
    border: "border-purple-500/20",
    gradient: "from-purple-500 to-pink-500",
  },
};

export default function OffersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <h1 className="text-2xl font-bold text-white">Offers</h1>
          <p className="text-white/70 text-sm mt-1">
            Exclusive deals and promotions
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-4">
        {OFFERS.map((offer) => {
          const IconComponent = ICON_MAP[offer.icon];
          const colors = COLOR_MAP[offer.color];
          const daysLeft = getDaysLeft(offer.valid_until);

          return (
            <div
              key={offer.id}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${colors.gradient} p-4 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-center gap-3 relative">
                  <div className="size-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <IconComponent className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{offer.title}</h3>
                    {offer.discount && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-medium">
                        {offer.discount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  {offer.description}
                </p>

                {offer.code && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Code:</span>
                    <span className="px-3 py-1 bg-muted rounded-lg font-mono text-sm font-semibold tracking-wider">
                      {offer.code}
                    </span>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    Valid until {formatDate(offer.valid_until)}
                  </div>
                  <span
                    className={`px-2 py-1 ${colors.bg} ${colors.text} text-xs font-medium rounded-full`}
                  >
                    {daysLeft} days left
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {OFFERS.length === 0 && (
          <div className="text-center py-12">
            <Tag className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No offers available</p>
          </div>
        )}
      </main>
    </div>
  );
}
