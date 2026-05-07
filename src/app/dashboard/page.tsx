"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, api } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Zap,
  Landmark,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Home,
  Calculator,
  LayoutDashboard,
  User,
  Wallet,
  RefreshCw,
  ChevronRight,
  Star,
} from "lucide-react";

interface Order {
  id: string;
  type: "buy" | "sell";
  amount_usdt: number;
  amount_inr?: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "INITIATED" | "PAYMENT_SENT" | "DISPUTED";
  created_at: string;
  counterparty?: string;
}

const DEMO_ORDERS: Order[] = [
  { id: "ORD-2026-001", type: "sell", amount_usdt: 500, amount_inr: 46225, status: "COMPLETED", created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "ORD-2026-002", type: "buy", amount_usdt: 1000, amount_inr: 92450, status: "PENDING", created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: "ORD-2026-003", type: "sell", amount_usdt: 750, amount_inr: 69337, status: "COMPLETED", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: "ORD-2026-004", type: "buy", amount_usdt: 250, amount_inr: 23112, status: "CANCELLED", created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
];

const STATUS_CONFIG = {
  PENDING: { label: "Pending", icon: Clock, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  INITIATED: { label: "Initiated", icon: Clock, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  PAYMENT_SENT: { label: "Payment Sent", icon: Clock, className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, className: "bg-green-500/15 text-green-400 border-green-500/30" },
  CANCELLED: { label: "Cancelled", icon: XCircle, className: "bg-red-500/15 text-red-400 border-red-500/30" },
  DISPUTED: { label: "Disputed", icon: AlertCircle, className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats] = useState({ balance: 45678.50, totalDeposited: 15000, totalWithdrawn: 125000, status: "Standard" as "Standard" | "VIP" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/trades");
      if (res.data && res.data.length > 0) {
        setOrders(res.data.map((t: { id: string; is_buyer: boolean; amount_usdt: number; amount_inr?: number; status: string; created_at: string }) => ({
          id: t.id, type: t.is_buyer ? "buy" : "sell", amount_usdt: t.amount_usdt, amount_inr: t.amount_inr, status: t.status, created_at: t.created_at,
        })));
      } else {
        setOrders(DEMO_ORDERS);
      }
    } catch {
      setOrders(DEMO_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Data refreshed");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 relative">
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(77,124,254,0.1)_0%,transparent_70%)] pointer-events-none" />

      <main className="flex-1 w-full max-w-[390px] mx-auto px-4 py-6 relative z-10" data-testid="dashboard-page">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground text-[13px]">Hi</p>
            <h1 className="text-xl font-bold text-white">{user?.name || user?.username || "User"}</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-surface rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-card border border-primary/30 rounded-2xl p-5 mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="size-4 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">Available INR Balance</span>
            </div>
            <p className="text-3xl font-bold text-white mb-5 font-stat">
              ₹{stats.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link
                href="/sell"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-[#5d8cff] text-white font-semibold rounded-full transition-all"
              >
                <Zap className="size-4" />
                Sell USDT
              </Link>
              <Link
                href="/buy"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-transparent border border-white/30 hover:border-white/50 text-white font-semibold rounded-full transition-all"
              >
                <Landmark className="size-4" />
                Buy USDT
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="size-4 text-primary" />
              <span className="text-[11px] text-muted-foreground">Deposited</span>
            </div>
            <p className="text-lg font-bold text-white font-stat">{stats.totalDeposited.toLocaleString()} USDT</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className={`size-4 ${stats.status === "VIP" ? "text-amber-400" : "text-muted-foreground"}`} />
              <span className="text-[11px] text-muted-foreground">Status</span>
            </div>
            <p className={`text-lg font-bold font-stat ${stats.status === "VIP" ? "text-amber-400" : "text-white"}`}>
              {stats.status}
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-white text-[15px]">Recent Orders</h2>
            <Link href="/profile/orders" className="text-[12px] text-primary font-medium flex items-center gap-1 hover:underline">
              View All <ChevronRight className="size-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-[13px] mb-4">No orders yet</p>
              <Link href="/buy" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-[13px] font-semibold rounded-full">
                Start Trading
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.slice(0, 5).map((order) => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusConfig.icon;
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/trade/${order.id}`)}
                  >
                    <div className={`size-9 rounded-full flex items-center justify-center ${
                      order.type === "buy" ? "bg-primary/15 text-primary" : "bg-green-500/15 text-green-400"
                    }`}>
                      {order.type === "buy" ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white capitalize">{order.type} USDT</p>
                      <p className="text-[11px] text-muted-foreground">{order.amount_usdt.toLocaleString()} USDT</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${statusConfig.className}`}>
                        <StatusIcon className="size-3" />
                        {statusConfig.label}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

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
                isActive(href) ? "text-primary" : "text-muted-foreground hover:text-white"
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
