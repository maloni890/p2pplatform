"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

type FilterType = "All" | "Buy" | "Sell";
type StatusFilter = "All" | "Pending" | "Active" | "Completed" | "Cancelled";

interface Order {
  id: string;
  order_number: string;
  type: "buy" | "sell";
  usdt_amount: number;
  inr_amount: number;
  rate: number;
  status: string;
  seller_name?: string;
  buyer_name?: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:          { label: "Pending",          color: "#f0b90b", bg: "rgba(240,185,11,0.12)",   icon: <Clock size={12} /> },
  ESCROW_WAITING:   { label: "Escrow Waiting",   color: "#f0b90b", bg: "rgba(240,185,11,0.12)",   icon: <Clock size={12} /> },
  ESCROWED:         { label: "Escrowed",          color: "#1677ff", bg: "rgba(22,119,255,0.12)",   icon: <CheckCircle2 size={12} /> },
  PAYMENT_PENDING:  { label: "Pay Pending",       color: "#f0b90b", bg: "rgba(240,185,11,0.12)",   icon: <Clock size={12} /> },
  PAYMENT_UPLOADED: { label: "Pay Uploaded",      color: "#1677ff", bg: "rgba(22,119,255,0.12)",   icon: <AlertCircle size={12} /> },
  COMPLETED:        { label: "Completed",         color: "#0ecb81", bg: "rgba(14,203,129,0.12)",   icon: <CheckCircle2 size={12} /> },
  CANCELLED:        { label: "Cancelled",         color: "#f6465d", bg: "rgba(246,70,93,0.12)",    icon: <XCircle size={12} /> },
  DISPUTED:         { label: "Disputed",          color: "#f6465d", bg: "rgba(246,70,93,0.12)",    icon: <AlertCircle size={12} /> },
};

const TYPE_FILTERS: FilterType[]   = ["All", "Buy", "Sell"];
const STATUS_FILTERS: StatusFilter[] = ["All", "Pending", "Active", "Completed", "Cancelled"];

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const fetchOrders = useCallback(async (refresh = false) => {
    if (!user) return;
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${user.id || user.username}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchType = typeFilter === "All" || o.type === typeFilter.toLowerCase();
    const matchStatus =
      statusFilter === "All" ? true :
      statusFilter === "Pending" ? ["PENDING", "ESCROW_WAITING"].includes(o.status) :
      statusFilter === "Active" ? ["ESCROWED", "PAYMENT_PENDING", "PAYMENT_UPLOADED"].includes(o.status) :
      statusFilter === "Completed" ? o.status === "COMPLETED" :
      statusFilter === "Cancelled" ? ["CANCELLED", "DISPUTED"].includes(o.status) :
      true;
    return matchType && matchStatus;
  });

  return (
    <div style={{ background: "#0d1117", minHeight: "100%", fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 13 }}>
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 44, background: "#0d1117", borderBottom: "1px solid #21262d" }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3" }}>My Orders</span>
        <button onClick={() => fetchOrders(true)}>
          <RefreshCw size={18} color={refreshing ? "#f0b90b" : "#7d8590"} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ── TYPE FILTER TABS ────────────────────────────────────── */}
      <div className="flex px-4 gap-0" style={{ borderBottom: "1px solid #21262d" }}>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: typeFilter === f ? 600 : 400,
              color: typeFilter === f ? "#e6edf3" : "#7d8590",
              borderBottom: typeFilter === f ? "2px solid #f0b90b" : "2px solid transparent",
              background: "transparent",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── STATUS CHIPS ────────────────────────────────────────── */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            style={{
              padding: "4px 12px",
              borderRadius: 16,
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: "nowrap",
              color: statusFilter === f ? "#000" : "#7d8590",
              background: statusFilter === f ? "#f0b90b" : "#161b22",
              border: statusFilter === f ? "none" : "1px solid #21262d",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── ORDER CARDS ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col gap-0 px-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg mb-3 animate-pulse"
              style={{ height: 80, background: "#161b22" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <ClipboardEmpty />
          <p style={{ fontSize: 14, color: "#7d8590" }}>No orders found</p>
          <Link
            href="/p2p"
            style={{
              padding: "8px 20px",
              background: "#f0b90b",
              color: "#000",
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Start Trading
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {filtered.map((order, idx) => {
            const st = STATUS_STYLE[order.status] || STATUS_STYLE.PENDING;
            return (
              <Link
                key={order.id}
                href={`/trade/${order.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: idx < filtered.length - 1 ? "1px solid #21262d" : "none",
                    background: "#0d1117",
                  }}
                >
                  {/* Row 1: type badge + order number + status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-1"
                        style={{
                          padding: "2px 8px",
                          borderRadius: 3,
                          fontSize: 11,
                          fontWeight: 600,
                          color: order.type === "buy" ? "#0ecb81" : "#f6465d",
                          background: order.type === "buy" ? "rgba(14,203,129,0.12)" : "rgba(246,70,93,0.12)",
                        }}
                      >
                        {order.type === "buy" ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
                        {order.type.toUpperCase()} USDT
                      </span>
                      <span style={{ fontSize: 11, color: "#484f58" }}>#{order.order_number}</span>
                    </div>
                    <span
                      className="flex items-center gap-1"
                      style={{
                        padding: "2px 8px",
                        borderRadius: 3,
                        fontSize: 11,
                        color: st.color,
                        background: st.bg,
                      }}
                    >
                      {st.icon}
                      {st.label}
                    </span>
                  </div>

                  {/* Row 2: amounts + counterparty */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "#e6edf3", lineHeight: 1.2 }}>
                        {Number(order.usdt_amount).toFixed(2)} <span style={{ fontSize: 12, color: "#7d8590", fontWeight: 400 }}>USDT</span>
                      </p>
                      <p style={{ fontSize: 12, color: "#7d8590", marginTop: 2 }}>
                        ₹{Number(order.inr_amount).toLocaleString("en-IN")}
                        {order.rate ? <span style={{ marginLeft: 6, color: "#484f58" }}>@ ₹{Number(order.rate).toFixed(2)}</span> : null}
                      </p>
                    </div>
                    <div className="text-right">
                      <p style={{ fontSize: 11, color: "#7d8590" }}>
                        {order.type === "buy" ? "Seller" : "Buyer"}:&nbsp;
                        <span style={{ color: "#e6edf3" }}>
                          {order.type === "buy" ? (order.seller_name || "—") : (order.buyer_name || "—")}
                        </span>
                      </p>
                      <p style={{ fontSize: 10, color: "#484f58", marginTop: 2 }}>
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClipboardEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="10" y="14" width="28" height="30" rx="3" stroke="#21262d" strokeWidth="2" />
      <path d="M18 14v-2a2 2 0 012-2h8a2 2 0 012 2v2" stroke="#21262d" strokeWidth="2" />
      <line x1="16" y1="24" x2="32" y2="24" stroke="#21262d" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="30" x2="28" y2="30" stroke="#21262d" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
