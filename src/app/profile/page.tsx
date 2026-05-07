"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
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
  action?: () => void;
  variant?: "default" | "danger";
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
    {
      label: "Edit Profile",
      href: "/profile/edit",
      icon: Pencil,
      description: "Update your personal information",
    },
    {
      label: "Bank Accounts",
      href: "/profile/bank-accounts",
      icon: Landmark,
      description: "Add or manage your bank accounts",
    },
    {
      label: "KYC Verification",
      href: "/profile/kyc",
      icon: ShieldCheck,
      description: "Verify your Aadhaar & PAN",
      badge: user?.is_verified_trader ? "Verified" : "Pending",
    },
    {
      label: "My Orders",
      href: "/profile/orders",
      icon: ClipboardList,
      description: "View all your buy & sell orders",
    },
    {
      label: "Withdrawal History",
      href: "/profile/withdrawals",
      icon: History,
      description: "Track your INR withdrawals",
    },
    {
      label: "Refer & Earn",
      href: "/profile/referrals",
      icon: Gift,
      description: "Invite friends and earn rewards",
    },
    {
      label: "Offers",
      href: "/profile/offers",
      icon: Tag,
      description: "Exclusive deals and promotions",
    },
    {
      label: "Support",
      href: "/profile/support",
      icon: MessageCircle,
      description: "Get help via WhatsApp or ticket",
    },
  ];

  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || "U";
  };

  const isVIP = (user?.completed_trades || 0) >= 50;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Green Header Background */}
      <div className="bg-gradient-to-br from-primary via-primary to-emerald-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-lg mx-auto px-4 py-8 relative">
          {/* Avatar and User Info */}
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="size-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30 shadow-lg">
                {getUserInitials()}
              </div>
              {/* Badge */}
              <div className="absolute -bottom-1 -right-1">
                {isVIP ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                    <Crown className="size-3" />
                    VIP
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-white text-primary text-xs font-bold rounded-full shadow-lg">
                    <BadgeCheck className="size-3" />
                    Member
                  </div>
                )}
              </div>
            </div>

            {/* Name and Email */}
            <h1 className="text-xl font-bold text-white mb-1">
              {user.name || user.username}
            </h1>
            <p className="text-white/70 text-sm mb-2">{user.email}</p>
            {user.phone && (
              <p className="text-white/60 text-xs">+91 {user.phone}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {user.completed_trades || 0}
                </p>
                <p className="text-xs text-white/60">Trades</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {user.completion_rate || 100}%
                </p>
                <p className="text-xs text-white/60">Completion</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {user.is_verified_trader ? (
                    <ShieldCheck className="size-6 mx-auto" />
                  ) : (
                    "-"
                  )}
                </p>
                <p className="text-xs text-white/60">KYC</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24 md:pb-8">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href || "#"}
              className={`flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors ${
                index !== menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <item.icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        item.badge === "Verified"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {item.description}
                  </p>
                )}
              </div>
              <ChevronRight className="size-5 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 flex items-center gap-4 px-4 py-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
        >
          <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
            <LogOut className="size-5" />
          </div>
          <span className="font-medium text-red-600 dark:text-red-500">
            Logout
          </span>
        </button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          SwapEase v1.0.0
        </p>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border md:hidden z-50">
        <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`size-5 ${isActive ? "text-primary" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
