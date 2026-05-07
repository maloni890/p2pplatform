"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
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

// Demo data for orders
const DEMO_ORDERS: Order[] = [
  {
    id: "ORD-2026-001",
    type: "sell",
    amount_usdt: 500,
    amount_inr: 46225,
    status: "COMPLETED",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    counterparty: "trader_pro",
  },
  {
    id: "ORD-2026-002",
    type: "buy",
    amount_usdt: 1000,
    amount_inr: 92450,
    status: "PENDING",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    counterparty: "crypto_king",
  },
  {
    id: "ORD-2026-003",
    type: "sell",
    amount_usdt: 750,
    amount_inr: 69337,
    status: "COMPLETED",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    counterparty: "usdt_dealer",
  },
  {
    id: "ORD-2026-004",
    type: "buy",
    amount_usdt: 250,
    amount_inr: 23112,
    status: "CANCELLED",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    counterparty: "quick_swap",
  },
  {
    id: "ORD-2026-005",
    type: "sell",
    amount_usdt: 2000,
    amount_inr: 184900,
    status: "COMPLETED",
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    counterparty: "bulk_trader",
  },
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  INITIATED: {
    label: "Initiated",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  PAYMENT_SENT: {
    label: "Payment Sent",
    icon: Clock,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  DISPUTED: {
    label: "Disputed",
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Demo stats
  const [stats, setStats] = useState({
    balance: 45678.50,
    totalDeposited: 15000,
    totalWithdrawn: 125000,
    status: "Standard" as "Standard" | "VIP",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/trades");
      if (res.data && res.data.length > 0) {
        setOrders(res.data.map((t: { id: string; is_buyer: boolean; amount_usdt: number; amount_inr?: number; status: string; created_at: string; counterparty?: string }) => ({
          id: t.id,
          type: t.is_buyer ? "buy" : "sell",
          amount_usdt: t.amount_usdt,
          amount_inr: t.amount_inr,
          status: t.status,
          created_at: t.created_at,
          counterparty: t.counterparty,
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

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const totalDeposited = completedOrders
    .filter((o) => o.type === "sell")
    .reduce((acc, o) => acc + o.amount_usdt, 0);
  const totalWithdrawn = completedOrders
    .filter((o) => o.type === "sell")
    .reduce((acc, o) => acc + (o.amount_inr || 0), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6 w-full flex-1" data-testid="dashboard-page">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            {user && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                Member
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh data"
          >
            <RefreshCw className={`size-5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 mb-6 shadow-lg">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="size-5 text-white/70" />
              <span className="text-sm font-medium text-white/70">Available INR Balance</span>
            </div>
            <p className="text-4xl md:text-5xl font-black text-white mb-6 font-stat">
              ₹{stats.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/sell"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-white/95 transition-colors shadow-md"
              >
                <Zap className="size-5" />
                Sell USDT
              </Link>
              <Link
                href="/buy"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/15 text-white font-bold rounded-xl hover:bg-white/25 transition-colors border border-white/20"
              >
                <Landmark className="size-5" />
                Buy USDT
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="size-4 text-primary" />
              <span className="text-xs text-muted-foreground">Deposited</span>
            </div>
            <p className="text-lg font-bold text-foreground font-stat">
              {totalDeposited > 0 ? totalDeposited.toLocaleString() : stats.totalDeposited.toLocaleString()} USDT
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="size-4 text-primary" />
              <span className="text-xs text-muted-foreground">Withdrawn</span>
            </div>
            <p className="text-lg font-bold text-foreground font-stat">
              ₹{(totalWithdrawn > 0 ? totalWithdrawn : stats.totalWithdrawn).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="size-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Status</span>
            </div>
            <p className={`text-lg font-bold font-stat ${stats.status === "VIP" ? "text-amber-500" : "text-foreground"}`}>
              {stats.status}
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Orders</h2>
            <Link
              href="/dashboard/orders"
              className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
            >
              View All
              <ChevronRight className="size-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Link
                href="/buy"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg"
              >
                Start Trading
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.slice(0, 10).map((order) => {
                    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => router.push(`/trade/${order.id}`)}
                      >
                        <td className="px-4 py-4">
                          <span className="font-mono text-xs text-muted-foreground">
                            {order.id.slice(0, 12)}...
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`size-7 rounded-full flex items-center justify-center ${
                                order.type === "buy"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-emerald-500/10 text-emerald-600"
                              }`}
                            >
                              {order.type === "buy" ? (
                                <ArrowDownRight className="size-4" />
                              ) : (
                                <ArrowUpRight className="size-4" />
                              )}
                            </div>
                            <span className="font-medium text-foreground capitalize">
                              {order.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-foreground">
                              {order.amount_usdt.toLocaleString()} USDT
                            </p>
                            {order.amount_inr && (
                              <p className="text-xs text-muted-foreground">
                                ₹{order.amount_inr.toLocaleString("en-IN")}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}
                          >
                            <StatusIcon className="size-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {[
            { href: "/", icon: Home, label: "Home" },
            { href: "/calculator", icon: Calculator, label: "Calculator" },
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: user ? `/user/${user.username}` : "/login", icon: User, label: "Profile" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive(href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
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
