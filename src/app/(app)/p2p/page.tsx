"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, Search, RefreshCw, Star, ShieldCheck, Zap } from "lucide-react";

type TradeType = "Buy" | "Sell";

interface Seller {
  id: string;
  name: string;
  username: string;
  avatar_initials: string;
  is_verified: boolean;
  is_online: boolean;
  available_usdt: number;
  rate: number;
  upi_id: string;
  completion_rate: number;
  avg_response_time: number;
  total_trades: number;
  min_order_inr: number;
  max_order_inr: number;
}

const PAYMENT_FILTERS = ["All", "UPI", "Bank", "IMPS"];

export default function P2PPage() {
  const router = useRouter();

  const [tradeType, setTradeType] = useState<TradeType>("Buy");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [searchAmount, setSearchAmount] = useState("");

  const fetchSellers = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/sellers");
      const data = await res.json();
      if (data.success) setSellers(data.sellers || []);
      else throw new Error("no data");
    } catch {
      setSellers([
        {
          id: "1", name: "Rahul Kumar", username: "rahulk", avatar_initials: "RK",
          is_verified: true, is_online: true, available_usdt: 5000, rate: 106.50,
          upi_id: "rahul@upi", completion_rate: 98.5, avg_response_time: 3,
          total_trades: 1243, min_order_inr: 500, max_order_inr: 100000,
        },
        {
          id: "2", name: "Priya Shah", username: "priyas", avatar_initials: "PS",
          is_verified: true, is_online: false, available_usdt: 2500, rate: 106.30,
          upi_id: "priya@upi", completion_rate: 99.1, avg_response_time: 5,
          total_trades: 867, min_order_inr: 1000, max_order_inr: 50000,
        },
        {
          id: "3", name: "Amit Verma", username: "amitv", avatar_initials: "AV",
          is_verified: false, is_online: true, available_usdt: 800, rate: 106.10,
          upi_id: "amit@upi", completion_rate: 95.0, avg_response_time: 8,
          total_trades: 412, min_order_inr: 500, max_order_inr: 30000,
        },
        {
          id: "4", name: "Sneha Patel", username: "snehap", avatar_initials: "SP",
          is_verified: true, is_online: true, available_usdt: 10000, rate: 106.70,
          upi_id: "sneha@upi", completion_rate: 99.8, avg_response_time: 2,
          total_trades: 3421, min_order_inr: 1000, max_order_inr: 500000,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  const handleTrade = (seller: Seller) => {
    if (tradeType === "Buy") {
      router.push(`/buy?sellerId=${seller.id}`);
    } else {
      router.push(`/sell?sellerId=${seller.id}`);
    }
  };

  return (
    <div style={{ background: "#0d1117", minHeight: "100%", fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 13, color: "#e6edf3" }}>
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 44, borderBottom: "1px solid #21262d" }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>P2P Trading</span>
        <div className="flex items-center gap-4">
          <button onClick={() => fetchSellers(true)}>
            <RefreshCw size={18} color={refreshing ? "#f0b90b" : "#7d8590"} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button>
            <Filter size={18} color="#7d8590" />
          </button>
          <Link href="/create-offer" style={{ fontSize: 12, fontWeight: 600, color: "#f0b90b" }}>
            + Post
          </Link>
        </div>
      </div>

      {/* ── BUY / SELL TOGGLE ───────────────────────────────────── */}
      <div className="flex" style={{ borderBottom: "1px solid #21262d" }}>
        {(["Buy", "Sell"] as TradeType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTradeType(t)}
            style={{
              flex: 1,
              height: 40,
              fontSize: 14,
              fontWeight: 600,
              color: tradeType === t
                ? (t === "Buy" ? "#0ecb81" : "#f6465d")
                : "#7d8590",
              borderBottom: tradeType === t
                ? `2px solid ${t === "Buy" ? "#0ecb81" : "#f6465d"}`
                : "2px solid transparent",
              background: "transparent",
            }}
          >
            {t} USDT
          </button>
        ))}
      </div>

      {/* ── PAYMENT FILTER CHIPS ────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
        {PAYMENT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setPaymentFilter(f)}
            style={{
              padding: "4px 12px",
              borderRadius: 16,
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: "nowrap",
              color: paymentFilter === f ? "#000" : "#7d8590",
              background: paymentFilter === f ? "#f0b90b" : "#161b22",
              border: paymentFilter === f ? "none" : "1px solid #21262d",
            }}
          >
            {f}
          </button>
        ))}
        <div
          className="flex items-center gap-1.5 ml-auto shrink-0"
          style={{ height: 30, padding: "0 10px", background: "#161b22", border: "1px solid #21262d", borderRadius: 4 }}
        >
          <Search size={12} color="#7d8590" />
          <input
            value={searchAmount}
            onChange={(e) => setSearchAmount(e.target.value)}
            placeholder="Amount (INR)"
            style={{ width: 90, background: "transparent", border: "none", outline: "none", fontSize: 12, color: "#e6edf3" }}
          />
        </div>
      </div>

      {/* ── COLUMN HEADERS ──────────────────────────────────────── */}
      <div
        className="flex items-center px-4"
        style={{ height: 32, borderBottom: "1px solid #21262d" }}
      >
        <span style={{ flex: 1, fontSize: 11, color: "#7d8590" }}>Advertiser</span>
        <span style={{ fontSize: 11, color: "#7d8590" }}>Price / Avail / Limit</span>
        <span style={{ width: 72, textAlign: "right", fontSize: 11, color: "#7d8590" }}>Action</span>
      </div>

      {/* ── SELLER ROWS ─────────────────────────────────────────── */}
      {loading ? (
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-4" style={{ borderBottom: "1px solid #21262d" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-full animate-pulse" style={{ width: 32, height: 32, background: "#21262d" }} />
                <div className="rounded animate-pulse" style={{ width: 100, height: 12, background: "#21262d" }} />
              </div>
              <div className="rounded animate-pulse" style={{ width: 160, height: 10, background: "#21262d" }} />
            </div>
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <div className="py-16 text-center" style={{ color: "#484f58", fontSize: 13 }}>
          No offers available right now
        </div>
      ) : (
        sellers.map((seller, idx) => (
          <div
            key={seller.id}
            style={{ padding: "14px 16px", borderBottom: idx < sellers.length - 1 ? "1px solid #21262d" : "none" }}
          >
            <div className="flex items-start justify-between">
              {/* Left: info */}
              <div className="flex-1 min-w-0">
                {/* Avatar + name row */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative">
                    <div
                      className="flex items-center justify-center rounded-full font-bold"
                      style={{ width: 32, height: 32, background: "#21262d", fontSize: 12, color: "#e6edf3" }}
                    >
                      {seller.avatar_initials}
                    </div>
                    {seller.is_online && (
                      <span
                        className="absolute bottom-0 right-0 rounded-full border-2"
                        style={{ width: 8, height: 8, background: "#0ecb81", borderColor: "#0d1117" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{seller.name}</span>
                      {seller.is_verified && <ShieldCheck size={12} color="#f0b90b" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span style={{ fontSize: 11, color: "#7d8590" }}>{seller.total_trades} trades</span>
                      <span style={{ fontSize: 11, color: "#0ecb81" }}>{seller.completion_rate.toFixed(1)}%</span>
                      <span style={{ fontSize: 11, color: "#7d8590", display: "flex", alignItems: "center", gap: 2 }}>
                        <Zap size={10} color="#7d8590" />
                        ~{seller.avg_response_time}min
                      </span>
                    </div>
                  </div>
                  <button><Star size={14} color="#484f58" /></button>
                </div>

                {/* Price / Avail / Limit */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span style={{ fontSize: 20, fontWeight: 700, color: tradeType === "Buy" ? "#0ecb81" : "#f6465d" }}>
                    ₹{seller.rate.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 11, color: "#7d8590" }}>/ USDT</span>
                </div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span style={{ fontSize: 11, color: "#7d8590" }}>
                    Avail: <span style={{ color: "#e6edf3" }}>{seller.available_usdt.toLocaleString()} USDT</span>
                  </span>
                  <span style={{ fontSize: 11, color: "#7d8590" }}>
                    ₹{(seller.min_order_inr / 1000).toFixed(0)}k–₹{(seller.max_order_inr / 1000).toFixed(0)}k
                  </span>
                </div>
                {/* Payment badges */}
                <div className="flex items-center gap-1.5">
                  {["UPI", "Bank"].map((pm) => (
                    <span
                      key={pm}
                      style={{ padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 500, background: "#21262d", color: "#7d8590" }}
                    >
                      {pm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: action button */}
              <button
                onClick={() => handleTrade(seller)}
                style={{
                  height: 36,
                  padding: "0 18px",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#000",
                  background: tradeType === "Buy" ? "#0ecb81" : "#f6465d",
                  marginLeft: 12,
                  flexShrink: 0,
                  alignSelf: "flex-end",
                }}
              >
                {tradeType}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
