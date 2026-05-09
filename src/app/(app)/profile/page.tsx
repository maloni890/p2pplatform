"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Pencil, Landmark, ShieldCheck, ClipboardList,
  History, Gift, Tag, MessageCircle, LogOut,
  ChevronRight, Crown, BadgeCheck,
} from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out");
      router.push("/");
    } catch {
      toast.error("Failed to logout");
    }
  };

  if (!user) return null;

  const menuItems: MenuItem[] = [
    { label: "Edit Profile",        href: "/profile/edit",         icon: Pencil,       description: "Update personal info" },
    { label: "Bank Accounts",       href: "/profile/bank-accounts",icon: Landmark,     description: "Manage bank & UPI" },
    { label: "KYC Verification",    href: "/profile/kyc",          icon: ShieldCheck,  description: "Verify Aadhaar & PAN",
      badge: user?.is_verified_trader ? "Verified" : "Pending" },
    { label: "My Orders",           href: "/orders",               icon: ClipboardList,description: "View all orders" },
    { label: "Withdrawal History",  href: "/profile/withdrawals",  icon: History,      description: "Track INR withdrawals" },
    { label: "Refer & Earn",        href: "/profile/referrals",    icon: Gift,         description: "Invite friends, earn rewards" },
    { label: "Offers",              href: "/profile/offers",       icon: Tag,          description: "Exclusive promotions" },
    { label: "Support",             href: "/profile/support",      icon: MessageCircle,description: "Get help via WhatsApp or ticket" },
  ];

  const initials = (() => {
    if (user.name) {
      const parts = user.name.split(" ");
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return user.name.substring(0, 2).toUpperCase();
    }
    return (user.username || "U").substring(0, 2).toUpperCase();
  })();

  const isVIP = (user.completed_trades || 0) >= 50;

  return (
    <div
      style={{
        background: "#0d1117",
        minHeight: "100%",
        fontFamily: "'Inter',-apple-system,sans-serif",
        fontSize: 13,
        color: "#e6edf3",
      }}
    >
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div
        style={{ height: 44, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid #21262d" }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>Profile</span>
      </div>

      {/* ── AVATAR + INFO ───────────────────────────────────────── */}
      <div className="flex flex-col items-center pt-6 pb-5 px-4">
        <div className="relative mb-3">
          <div
            className="flex items-center justify-center rounded-full text-white font-bold"
            style={{ width: 64, height: 64, background: "linear-gradient(135deg,#4d7cfe,#8b5cf6)", fontSize: 22 }}
          >
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1">
            {isVIP ? (
              <span
                className="flex items-center gap-0.5 rounded-full text-white font-bold"
                style={{ padding: "2px 6px", background: "#f0b90b", fontSize: 8, color: "#000" }}
              >
                <Crown size={8} /> VIP
              </span>
            ) : (
              <span
                className="flex items-center gap-0.5 rounded-full font-bold"
                style={{ padding: "2px 6px", background: "#1677ff", fontSize: 8, color: "#fff" }}
              >
                <BadgeCheck size={8} /> Member
              </span>
            )}
          </div>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600 }}>{user.name || user.username}</p>
        <p style={{ fontSize: 11, color: "#7d8590", marginTop: 2 }}>{user.email}</p>
      </div>

      {/* ── STATS ROW ───────────────────────────────────────────── */}
      <div
        className="grid grid-cols-3 mx-4 rounded-lg mb-4"
        style={{ background: "#161b22", border: "1px solid #21262d" }}
      >
        {[
          { label: "Trades", value: user.completed_trades || 0 },
          { label: "Completion", value: `${user.completion_rate || 0}%` },
          { label: "USDT Vol.", value: "0" },
        ].map((stat, i) => (
          <div key={stat.label} className="flex flex-col items-center py-3"
            style={{ borderRight: i < 2 ? "1px solid #21262d" : "none" }}
          >
            <span style={{ fontSize: 16, fontWeight: 700 }}>{stat.value}</span>
            <span style={{ fontSize: 10, color: "#7d8590", marginTop: 2 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── MENU ────────────────────────────────────────────────── */}
      <div className="mx-4 rounded-xl overflow-hidden mb-4" style={{ background: "#161b22", border: "1px solid #21262d" }}>
        {menuItems.map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#21262d] transition-colors"
            style={{ borderBottom: i < menuItems.length - 1 ? "1px solid #21262d" : "none", textDecoration: "none" }}
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 32, height: 32, background: "rgba(77,124,254,0.12)" }}
            >
              <item.icon size={15} color="#4d7cfe" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 13, fontWeight: 500, color: "#e6edf3" }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      padding: "1px 6px",
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 500,
                      color: item.badge === "Verified" ? "#0ecb81" : "#f0b90b",
                      background: item.badge === "Verified" ? "rgba(14,203,129,0.12)" : "rgba(240,185,11,0.12)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <p style={{ fontSize: 11, color: "#7d8590", marginTop: 2 }}>{item.description}</p>
              )}
            </div>
            <ChevronRight size={14} color="#484f58" />
          </Link>
        ))}
      </div>

      {/* ── LOGOUT ──────────────────────────────────────────────── */}
      <div className="mx-4 mb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(246,70,93,0.1)", border: "1px solid rgba(246,70,93,0.2)" }}
        >
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 32, height: 32, background: "rgba(246,70,93,0.15)" }}
          >
            <LogOut size={15} color="#f6465d" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#f6465d" }}>Sign Out</span>
        </button>
        <p className="text-center mt-4" style={{ fontSize: 10, color: "#484f58" }}>SwapEase v1.0.0</p>
      </div>
    </div>
  );
}
