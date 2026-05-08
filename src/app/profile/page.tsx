"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  User,
  Pencil,
  Landmark,
  ShieldCheck,
  ClipboardList,
  History,
  Gift,
  Tag,
  MessageCircle,
  LogOut,
  ChevronRight,
  Home,
  Calculator,
  LayoutDashboard,
  Crown,
  BadgeCheck,
} from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Calculator", href: "/calculator", icon: Calculator },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
];

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

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

  const menuItems: MenuItem[] = [
    { label: "Edit Profile", href: "/profile/edit", icon: Pencil, description: "Update your personal information" },
    { label: "Bank Accounts", href: "/profile/bank-accounts", icon: Landmark, description: "Add or manage your bank accounts" },
    { label: "KYC Verification", href: "/profile/kyc", icon: ShieldCheck, description: "Verify your Aadhaar & PAN", badge: user?.is_verified_trader ? "Verified" : "Pending" },
    { label: "My Orders", href: "/profile/orders", icon: ClipboardList, description: "View all your buy & sell orders" },
    { label: "Withdrawal History", href: "/profile/withdrawals", icon: History, description: "Track your INR withdrawals" },
    { label: "Refer & Earn", href: "/profile/referrals", icon: Gift, description: "Invite friends and earn rewards" },
    { label: "Offers", href: "/profile/offers", icon: Tag, description: "Exclusive deals and promotions" },
    { label: "Support", href: "/profile/support", icon: MessageCircle, description: "Get help via WhatsApp or ticket" },
  ];

  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
      return user.name.substring(0, 2).toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || "U";
  };

  const isVIP = (user?.completed_trades || 0) >= 50;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(77,124,254,0.1)_0%,transparent_70%)] pointer-events-none" />

      {/* Header with Avatar */}
      <div className="relative pt-8 pb-6 px-4">
        <div className="max-w-[390px] mx-auto flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="size-20 rounded-full bg-gradient-to-br from-[#4d7cfe] to-[#8b5cf6] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {getUserInitials()}
            </div>
            {/* Badge */}
            <div className="absolute -bottom-1 -right-1">
              {isVIP ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                  <Crown className="size-3" />
                  VIP
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg">
                  <BadgeCheck className="size-3" />
                  Member
                </div>
              )}
            </div>
          </div>

          {/* Name and Info */}
          <h1 className="text-lg font-bold text-white mb-0.5">{user.name || user.username}</h1>
          <p className="text-[12px] text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Menu List */}
      <main className="flex-1 w-full max-w-[390px] mx-auto px-4 pb-8 relative z-10">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href || "#"}
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-surface/50 transition-colors ${
                index !== menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <item.icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-white">{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                      item.badge === "Verified" ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.description}</p>
                )}
              </div>
              <ChevronRight className="size-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 flex items-center gap-3 px-4 py-3.5 bg-red-500/10 rounded-2xl border border-red-500/20 hover:bg-red-500/15 transition-colors"
        >
          <div className="size-9 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 shrink-0">
            <LogOut className="size-4" />
          </div>
          <span className="text-[13px] font-medium text-red-400">Logout</span>
        </button>

        {/* App Version */}
        <p className="text-center text-[11px] text-muted-foreground mt-6">SwapEase v1.0.0</p>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bottom-nav border-t border-border md:hidden z-50">
        <div className="flex items-center justify-around h-full max-w-[390px] mx-auto">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                }`}
              >
                <item.icon className="size-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
