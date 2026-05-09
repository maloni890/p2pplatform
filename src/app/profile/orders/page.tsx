"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";

interface Order {
  id: string;
  type: "buy" | "sell";
  amount_usdt: number;
  amount_inr: number;
  rate: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  created_at: string;
}

const DEMO_ORDERS: Order[] = [
  {
    id: "ORD-2026-001",
    type: "sell",
    amount_usdt: 500,
    amount_inr: 46225,
    rate: 92.45,
    status: "COMPLETED",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-2026-002",
    type: "buy",
    amount_usdt: 1000,
    amount_inr: 92450,
    rate: 92.45,
    status: "PENDING",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-2026-003",
    type: "sell",
    amount_usdt: 750,
    amount_inr: 69337,
    rate: 92.45,
    status: "COMPLETED",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-2026-004",
    type: "buy",
    amount_usdt: 250,
    amount_inr: 23112,
    rate: 92.45,
    status: "CANCELLED",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-2026-005",
    type: "sell",
    amount_usdt: 2000,
    amount_inr: 184900,
    rate: 92.45,
    status: "COMPLETED",
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [orders] = useState<Order[]>(DEMO_ORDERS);
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.type === filter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString();
  };

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
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-white/70 text-sm mt-1">
            View all your buy and sell orders
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-card rounded-xl p-1 border border-border">
          {(["all", "buy", "sell"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                filter === tab
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "all" ? "All" : tab === "buy" ? "Buy" : "Sell"}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const StatusIcon = STATUS_CONFIG[order.status].icon;
            return (
              <div
                key={order.id}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                        order.type === "buy"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {order.type === "buy" ? (
                        <TrendingUp className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {order.type === "buy" ? "Bought" : "Sold"} USDT
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_CONFIG[order.status].className}`}
                        >
                          {STATUS_CONFIG[order.status].label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.id} - {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">USDT</p>
                    <p className="font-semibold text-foreground">
                      {order.amount_usdt.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">INR</p>
                    <p className="font-semibold text-foreground">
                      {order.amount_inr.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate</p>
                    <p className="font-semibold text-foreground">
                      {order.rate.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Filter className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </main>
    </div>
  );
}
