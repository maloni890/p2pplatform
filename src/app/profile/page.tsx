"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Share2,
  Pencil,
  ChevronRight,
  ChevronDown,
  ThumbsUp,
  CreditCard,
  Lock,
  Users,
  Ban,
  Settings,
  Shield,
  Gift,
  HelpCircle,
  Info,
  LogOut,
  Check,
  Bell,
  FileText,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

type TabType = "trade" | "notifications" | "others";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("trade");
  const [showMoreStats, setShowMoreStats] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name[0].toUpperCase();
    }
    return user?.username?.[0].toUpperCase() || "U";
  };

  // Mock stats - replace with real data
  const stats = {
    trades30d: user?.completed_trades || 0,
    completionRate: "100%",
    avgReleaseTime: "2.5 min",
    avgPayTime: "3.2 min",
    totalTrades: user?.completed_trades || 0,
    positiveFeedback: 98,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="size-8 border-4 border-[#f0b90b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const tradeItems = [
    { icon: ThumbsUp, label: "Received Feedback", count: stats.positiveFeedback, href: "/profile/feedback" },
    { icon: CreditCard, label: "Payment Method(s)", count: 2, href: "/profile/bank-accounts" },
    { icon: Lock, label: "Restrictions Removal Center", href: "/profile/restrictions" },
    { icon: Users, label: "Follows", href: "/profile/follows" },
    { icon: Ban, label: "Blocked Users", href: "/profile/blocked" },
  ];

  const notificationItems = [
    { icon: Bell, label: "Push Notifications", href: "/profile/notifications" },
    { icon: FileText, label: "Transaction Alerts", href: "/profile/alerts" },
  ];

  const otherItems = [
    { icon: Pencil, label: "Edit Profile", href: "/profile/edit" },
    { icon: Shield, label: "Security Settings", href: "/profile/security" },
    { icon: Gift, label: "Refer & Earn", href: "/profile/referrals" },
    { icon: HelpCircle, label: "Support", href: "/profile/support" },
    { icon: Info, label: "About SwapEase", href: "/about" },
  ];

  const currentItems = activeTab === "trade" ? tradeItems : activeTab === "notifications" ? notificationItems : otherItems;

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col pb-16">
      {/* Top Bar - 44px */}
      <header className="h-[44px] flex items-center justify-between px-4 bg-[#0d1117] sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="size-5 text-white" />
        </button>
        <button className="p-1">
          <Share2 className="size-5 text-white" />
        </button>
      </header>

      {/* User Header */}
      <div className="px-4 pt-4 pb-5">
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="size-16 rounded-full bg-[#21262d] flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{getUserInitials()}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {user.name || `User-${user.id?.slice(-5) || "xxxxx"}`}
              </span>
              <button className="p-1">
                <Pencil className="size-3.5 text-[#7d8590]" />
              </button>
            </div>
            <p className="text-xs text-[#7d8590]">Verified user</p>
          </div>
        </div>

        {/* Verification Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Check className="size-3 text-[#0ecb81]" />
            <span className="text-xs text-[#7d8590]">Email</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="size-3 text-[#0ecb81]" />
            <span className="text-xs text-[#7d8590]">SMS</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="size-3 text-[#0ecb81]" />
            <span className="text-xs text-[#7d8590]">KYC</span>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mx-4 mb-4 bg-[#161b22] rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-lg font-bold text-white">{stats.trades30d}</p>
            <p className="text-[11px] text-[#7d8590]">30d Trades</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats.completionRate}</p>
            <p className="text-[11px] text-[#7d8590]">30d Completion Rate</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats.avgReleaseTime}</p>
            <p className="text-[11px] text-[#7d8590]">Avg. Release Time</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats.avgPayTime}</p>
            <p className="text-[11px] text-[#7d8590]">Avg. Pay Time</p>
          </div>
        </div>

        {showMoreStats && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#21262d]">
            <div>
              <p className="text-lg font-bold text-white">{stats.totalTrades}</p>
              <p className="text-[11px] text-[#7d8590]">Total Trades</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{stats.positiveFeedback}%</p>
              <p className="text-[11px] text-[#7d8590]">Positive Feedback</p>
            </div>
          </div>
        )}

        <button 
          onClick={() => setShowMoreStats(!showMoreStats)}
          className="w-full flex items-center justify-center gap-1 mt-3 pt-3 border-t border-[#21262d]"
        >
          <span className="text-xs text-[#7d8590]">{showMoreStats ? "Less" : "More"}</span>
          <ChevronDown className={`size-3 text-[#7d8590] transition-transform ${showMoreStats ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Tab Row */}
      <div className="flex items-center border-b border-[#21262d] mx-4">
        {(["trade", "notifications", "others"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize relative ${
              activeTab === tab ? "text-white" : "text-[#7d8590]"
            }`}
          >
            {tab === "notifications" ? "Notifications" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#f0b90b]" />
            )}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="flex-1">
        {currentItems.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center justify-between px-4 h-[52px] ${
              index !== currentItems.length - 1 ? "border-b border-[#21262d]" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="size-5 text-[#7d8590]" />
              <span className="text-sm text-white">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {"count" in item && item.count !== undefined && (
                <span className="text-sm text-[#7d8590]">{item.count}</span>
              )}
              <ChevronRight className="size-4 text-[#7d8590]" />
            </div>
          </Link>
        ))}

        {/* Logout - only in Others tab */}
        {activeTab === "others" && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 h-[52px] w-full border-t border-[#21262d]"
          >
            <LogOut className="size-5 text-[#f6465d]" />
            <span className="text-sm text-[#f6465d]">Logout</span>
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
