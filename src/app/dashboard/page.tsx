"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, api } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Zap,
  TrendingUp,
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
  RefreshCw,
  ChevronRight,
  Star,
  Store,
  Repeat,
  PiggyBank,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  type: "buy" | "sell";
  usdt_amount: number;
  inr_amount: number;
  status: string;
  created_at: string;
  seller_name?: string;
  buyer_name?: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  PENDING: { label: "Pending", icon: Clock, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  ESCROW_WAITING: { label: "Escrow Waiting", icon: Clock, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  ESCROWED: { label: "Escrowed", icon: CheckCircle2, className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  PAYMENT_PENDING: { label: "Payment Pending", icon: Clock, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  PAYMENT_UPLOADED: { label: "Payment Uploaded", icon: Clock, className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
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
  const [stats] = useState({
    totalTrades: 24,
    commissionSaved: 1850,
    status: "Standard" as "Standard" | "VIP",
    sellerStatus: "none" as "none" | "pending" | "verified" | "rejected",
  });

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch orders from our API
      const res = await fetch(`/api/orders?userId=${user.id || user.username}`);
      const data = await res.json();
      
      if (data.success && data.orders && data.orders.length > 0) {
        setOrders(data.orders.map((o: { id: string; order_number: string; type: string; usdt_amount: number; inr_amount: number; status: string; created_at: string; seller_name?: string; buyer_name?: string }) => ({
          id: o.id,
          order_number: o.order_number,
          type: o.type as "buy" | "sell",
          usdt_amount: parseFloat(String(o.usdt_amount)),
          inr_amount: parseFloat(String(o.inr_amount)),
          status: o.status?.toUpperCase() || "PENDING",
          created_at: o.created_at,
          seller_name: o.seller_name,
          buyer_name: o.buyer_name,
        })));
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

      <main className="flex-1 w-full max-w-[390px] mx-auto px-3 py-4 relative z-10" data-testid="dashboard-page">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-[11px]">Hi</p>
            <h1 className="text-lg font-bold text-white">{user?.name || user?.username || "User"}</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 hover:bg-surface rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* P2P Marketplace Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
          <Repeat className="size-3.5 text-primary shrink-0" />
          <p className="text-[10px] text-white">
            <span className="font-semibold">P2P Marketplace</span>
            <span className="text-muted-foreground"> - Direct user-to-user trades</span>
          </p>
        </div>

        {/* Two Action Cards Side by Side */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* SELL USDT Card - Green Accent */}
          <Link
            href="/sell"
            className="bg-card border border-green-500/30 rounded-xl p-3 relative overflow-hidden hover:border-green-500/50 transition-all group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="size-8 rounded-full bg-green-500/15 flex items-center justify-center mb-2">
                <ArrowUpRight className="size-4 text-green-400" />
              </div>
              <h3 className="text-[12px] font-bold text-white mb-0.5">Sell USDT</h3>
              <p className="text-[9px] text-muted-foreground mb-3 leading-tight">
                Got USDT? Sell to buyers
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-green-400 inline-flex items-center gap-1">
                  Sell USDT
                  <Zap className="size-2.5" />
                </span>
                <ArrowRight className="size-3 text-green-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* BUY USDT Card - Blue Accent */}
          <Link
            href="/buy"
            className="bg-card border border-primary/30 rounded-xl p-3 relative overflow-hidden hover:border-primary/50 transition-all group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="size-8 rounded-full bg-primary/15 flex items-center justify-center mb-2">
                <ArrowDownRight className="size-4 text-primary" />
              </div>
              <h3 className="text-[12px] font-bold text-white mb-0.5">Buy USDT</h3>
              <p className="text-[9px] text-muted-foreground mb-3 leading-tight">
                Need USDT? Buy from sellers
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-primary">
                  Buy USDT
                </span>
                <ArrowRight className="size-3 text-primary group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Row - 3 Columns */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-card border border-border rounded-lg p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="size-2.5 text-primary" />
              <span className="text-[8px] text-muted-foreground">Total Trades</span>
            </div>
            <p className="text-[14px] font-bold text-white font-stat">{stats.totalTrades}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <PiggyBank className="size-2.5 text-green-400" />
              <span className="text-[8px] text-muted-foreground">Saved</span>
            </div>
            <p className="text-[14px] font-bold text-green-400 font-stat">₹{stats.commissionSaved}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <Star className={`size-2.5 ${stats.status === "VIP" ? "text-amber-400" : "text-muted-foreground"}`} />
              <span className="text-[8px] text-muted-foreground">Status</span>
            </div>
            <p className={`text-[14px] font-bold font-stat ${stats.status === "VIP" ? "text-amber-400" : "text-white"}`}>
              {stats.status}
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h2 className="font-semibold text-white text-[13px]">Recent Orders</h2>
            <Link href="/profile/orders" className="text-[10px] text-primary font-medium flex items-center gap-0.5 hover:underline">
              View All <ChevronRight className="size-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin size-6 border-3 border-primary border-t-transparent rounded-full" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-[11px] mb-3">No orders yet</p>
              <Link href="/buy" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[11px] font-semibold rounded-full">
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
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-surface/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/trade/${order.id}`)}
                  >
                    <div className={`size-7 rounded-full flex items-center justify-center ${
                      order.type === "buy" ? "bg-primary/15 text-primary" : "bg-green-500/15 text-green-400"
                    }`}>
                      {order.type === "buy" ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-white capitalize">{order.type} USDT</p>
                      <p className="text-[9px] text-muted-foreground">{order.usdt_amount.toLocaleString()} USDT</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-medium border ${statusConfig.className}`}>
                        <StatusIcon className="size-2.5" />
                        {statusConfig.label}
                      </span>
                      <p className="text-[8px] text-muted-foreground mt-0.5">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Become a Seller Section */}
        <div className="bg-card border-2 border-amber-500/40 rounded-xl p-4 relative overflow-hidden">
          {/* Gold glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative">
            <div className="flex items-start gap-2.5 mb-3">
              <div className="size-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                <Store className="size-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-bold text-white mb-0.5">
                  Want to list your USDT for sale?
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Complete seller verification to start earning from your USDT
                </p>
              </div>
            </div>

            {/* Bonus Badge */}
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full mb-3">
              <Sparkles className="size-2.5 text-amber-400" />
              <span className="text-[9px] font-semibold text-amber-400">
                Verified Sellers earn extra 0.2% bonus
              </span>
            </div>

            <Link
              href="/seller-kyc"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[12px] font-bold rounded-full transition-all"
            >
              Apply as Seller
              <ArrowRight className="size-3.5" />
            </Link>

            {stats.sellerStatus !== "none" && (
              <div className="mt-2 text-center">
                <span className="text-[9px] text-muted-foreground">
                  Status: <span className="text-amber-400 font-semibold capitalize">{stats.sellerStatus}</span>
                </span>
              </div>
            )}
          </div>
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
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 transition-colors ${
                isActive(href) ? "text-primary" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Icon className="size-4" />
              <span className="text-[8px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
