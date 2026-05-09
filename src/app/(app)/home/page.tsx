"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Bell,
  Headphones,
  Menu,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  X,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ClipboardList,
} from "lucide-react";

// ── Sparkline SVG ─────────────────────────────────────────────────
function Sparkline({ up = true }: { up?: boolean }) {
  const pts = up
    ? "0,18 10,14 20,16 30,10 40,12 50,6 60,8 70,4 80,2"
    : "0,4 10,8 20,6 30,12 40,10 50,16 60,14 70,18 80,18";
  const color = up ? "#0ecb81" : "#f6465d";
  return (
    <svg width="80" height="22" viewBox="0 0 80 22" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Mock market data ──────────────────────────────────────────────
const MARKET_DATA = [
  { symbol: "USDT", name: "Tether",        price: "1.00",     chg: "+0.01%",  up: true  },
  { symbol: "BTC",  name: "Bitcoin",       price: "6,842,150",chg: "+2.34%",  up: true  },
  { symbol: "ETH",  name: "Ethereum",      price: "3,24,810", chg: "+1.87%",  up: true  },
  { symbol: "BNB",  name: "BNB",           price: "53,290",   chg: "-0.62%",  up: false },
  { symbol: "SOL",  name: "Solana",        price: "14,850",   chg: "+4.21%",  up: true  },
  { symbol: "XRP",  name: "XRP",           price: "482",      chg: "-1.15%",  up: false },
];

const COIN_ICONS: Record<string, string> = {
  USDT: "₮", BTC: "₿", ETH: "Ξ", BNB: "B", SOL: "◎", XRP: "✕",
};

const MARKET_TABS = ["Favorites", "Gainers", "New", "All"] as const;
const SUB_TABS    = ["USDT", "INR"] as const;
const BOTTOM_TABS = ["Discover", "Following", "Announcement"] as const;

export default function HomePage() {
  const router = useRouter();

  const [balanceHidden, setBalanceHidden] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeView, setActiveView] = useState<"Exchange" | "Wallet">("Exchange");
  const [marketTab, setMarketTab] = useState<typeof MARKET_TABS[number]>("All");
  const [subTab, setSubTab] = useState<typeof SUB_TABS[number]>("USDT");
  const [bottomTab, setBottomTab] = useState<typeof BOTTOM_TABS[number]>("Discover");
  const [liveRate, setLiveRate] = useState(106.35);
  const [searchQuery, setSearchQuery] = useState("");

  // Simulate live rate flicker
  useEffect(() => {
    const t = setInterval(() => {
      setLiveRate((r) => parseFloat((r + (Math.random() - 0.5) * 0.08).toFixed(2)));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const filteredMarket = MARKET_DATA.filter(
    (c) => c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const S: React.CSSProperties = {
    fontFamily: "'Inter', -apple-system, sans-serif",
    fontSize: 13,
    color: "#e6edf3",
    background: "#0d1117",
    minHeight: "100%",
  };

  return (
    <div style={S}>
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10">

      {/* ── TOP BAR ───────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 44, background: "#0d1117", borderBottom: "1px solid #21262d" }}
      >
        {/* Left: hamburger + badge */}
        <button className="relative p-1">
          <Menu size={20} color="#e6edf3" />
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-black font-bold"
            style={{ width: 14, height: 14, fontSize: 8, background: "#f0b90b" }}
          >3</span>
        </button>

        {/* Center: Exchange | Wallet toggle pills */}
        <div
          className="flex items-center rounded"
          style={{ background: "#161b22", padding: 2, gap: 2 }}
        >
          {(["Exchange", "Wallet"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              style={{
                padding: "4px 14px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
                color: activeView === v ? "#e6edf3" : "#7d8590",
                background: activeView === v ? "#21262d" : "transparent",
                transition: "all 0.15s",
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Right: headset + bell */}
        <div className="flex items-center" style={{ gap: 16 }}>
          <button><Headphones size={20} color="#e6edf3" /></button>
          <Link href="/profile" className="relative">
            <Bell size={20} color="#e6edf3" />
            <span
              className="absolute -top-0.5 -right-0.5 rounded-full"
              style={{ width: 7, height: 7, background: "#f6465d" }}
            />
          </Link>
        </div>
      </div>

      {/* ── SEARCH BAR ────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="flex items-center gap-2 px-3"
          style={{
            height: 36,
            background: "#161b22",
            border: "1px solid #21262d",
            borderRadius: 4,
          }}
        >
          <Search size={14} color="#7d8590" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coins, features..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "#e6edf3",
            }}
          />
        </div>
      </div>

      {/* ── PORTFOLIO SECTION ─────────────────────────────────────── */}
      <div className="px-4 pt-2 pb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span style={{ fontSize: 11, color: "#7d8590" }}>Est. Total Value (INR)</span>
            <button onClick={() => setBalanceHidden((h) => !h)}>
              {balanceHidden
                ? <Eye size={13} color="#7d8590" />
                : <EyeOff size={13} color="#7d8590" />}
            </button>
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#e6edf3", lineHeight: 1.2 }}>
            {balanceHidden ? "₹ ••••••" : "₹0.00"}
          </div>
          <div style={{ fontSize: 11, color: "#7d8590", marginTop: 4 }}>
            {"Today's PNL ₹0.00 (0.00%)"}
          </div>
        </div>

        {/* Add Funds */}
        <button
          onClick={() => router.push("/p2p")}
          className="flex items-center gap-1"
          style={{
            height: 32,
            padding: "0 14px",
            background: "#f0b90b",
            color: "#000",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            marginTop: 4,
          }}
        >
          <Plus size={14} />
          Add Funds
        </button>
      </div>

      {/* ── BANNER CARD ───────────────────────────────────────────── */}
      {!bannerDismissed && (
        <div className="px-4 pb-3">
          <div
            className="relative flex items-center justify-between px-3 py-2.5 rounded-lg"
            style={{ background: "#161b22", border: "1px solid #21262d" }}
          >
            {/* Left icon */}
            <div
              className="flex items-center justify-center rounded-lg mr-3 shrink-0"
              style={{ width: 36, height: 36, background: "#21262d" }}
            >
              <ArrowLeftRight size={18} color="#f0b90b" />
            </div>
            {/* Text */}
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3" }}>
                SwapEase P2P — Trade USDT with INR
              </p>
              <p style={{ fontSize: 11, color: "#7d8590" }}>Instant transfers, zero fees</p>
            </div>
            {/* Join + close */}
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <Link
                href="/p2p"
                style={{
                  padding: "4px 10px",
                  border: "1px solid #484f58",
                  borderRadius: 4,
                  fontSize: 11,
                  color: "#e6edf3",
                }}
              >
                Join
              </Link>
              <button onClick={() => setBannerDismissed(true)}>
                <X size={14} color="#7d8590" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2-COLUMN QUICK ACCESS ─────────────────────────────────── */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-3">
        {/* P2P Orders card */}
        <Link href="/orders" style={{ textDecoration: "none" }}>
          <div
            className="p-3 rounded-lg"
            style={{ background: "#161b22", border: "1px solid #21262d" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: 13, color: "#e6edf3", fontWeight: 500 }}>P2P Orders</span>
              <ChevronRight size={14} color="#7d8590" />
            </div>
            <p style={{ fontSize: 11, color: "#7d8590", marginBottom: 12 }}>Buy/Sell USDT with INR</p>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 36, height: 36, background: "#21262d" }}
                >
                  <ArrowLeftRight size={16} color="#f0b90b" />
                </div>
                <span style={{ fontSize: 11, color: "#7d8590" }}>P2P</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 36, height: 36, background: "#21262d" }}
                >
                  <ClipboardList size={16} color="#1677ff" />
                </div>
                <span style={{ fontSize: 11, color: "#7d8590" }}>Find Offer</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Live Rate card */}
        <Link href="/p2p" style={{ textDecoration: "none" }}>
          <div
            className="p-3 rounded-lg"
            style={{ background: "#161b22", border: "1px solid #21262d" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: 13, color: "#e6edf3", fontWeight: 500 }}>Live Rate</span>
              <ChevronRight size={14} color="#7d8590" />
            </div>
            <p style={{ fontSize: 11, color: "#7d8590", marginBottom: 4 }}>USDT/INR</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#e6edf3", lineHeight: 1.2 }}>
              ₹{liveRate.toFixed(2)}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span style={{ fontSize: 11, color: "#0ecb81" }}>+0.3% today</span>
              <Sparkline up />
            </div>
          </div>
        </Link>
      </div>

      {/* ── MARKET TABLE ─────────────────────────────────────────── */}
      <div style={{ background: "#0d1117" }}>
        {/* Main tabs */}
        <div
          className="flex px-4 gap-5"
          style={{ borderBottom: "1px solid #21262d" }}
        >
          {MARKET_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setMarketTab(tab)}
              style={{
                paddingBottom: 10,
                paddingTop: 6,
                fontSize: 13,
                fontWeight: marketTab === tab ? 600 : 400,
                color: marketTab === tab ? "#e6edf3" : "#7d8590",
                borderBottom: marketTab === tab ? "2px solid #f0b90b" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {tab === "Favorites" ? <Star size={14} /> : tab}
            </button>
          ))}
          {/* Sub tabs right-aligned */}
          <div className="flex items-center ml-auto gap-1">
            {SUB_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                style={{
                  padding: "2px 8px",
                  fontSize: 11,
                  borderRadius: 4,
                  color: subTab === t ? "#e6edf3" : "#7d8590",
                  background: subTab === t ? "#21262d" : "transparent",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div
          className="flex items-center px-4"
          style={{ height: 32, borderBottom: "1px solid #21262d" }}
        >
          <span style={{ flex: 1, fontSize: 11, color: "#7d8590" }}>Name</span>
          <span style={{ width: 100, textAlign: "right", fontSize: 11, color: "#7d8590" }}>Last Price</span>
          <span style={{ width: 80, textAlign: "right", fontSize: 11, color: "#7d8590" }}>24h Chg%</span>
        </div>

        {/* Rows */}
        {filteredMarket.map((coin) => (
          <div
            key={coin.symbol}
            className="flex items-center px-4"
            style={{ height: 40 }}
          >
            {/* Coin icon + names */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 24,
                  height: 24,
                  background: "#21262d",
                  fontSize: 11,
                  color: "#e6edf3",
                  fontWeight: 700,
                }}
              >
                {COIN_ICONS[coin.symbol]}
              </div>
              <div className="min-w-0">
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{coin.symbol}</span>
                <span style={{ fontSize: 11, color: "#7d8590", marginLeft: 4 }}>{coin.name}</span>
              </div>
            </div>
            {/* Price */}
            <div style={{ width: 100, textAlign: "right", fontSize: 13, color: "#e6edf3" }}>
              ₹{coin.price}
            </div>
            {/* Change badge */}
            <div style={{ width: 80, textAlign: "right" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 6px",
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 500,
                  background: coin.up ? "rgba(14,203,129,0.15)" : "rgba(246,70,93,0.15)",
                  color: coin.up ? "#0ecb81" : "#f6465d",
                }}
              >
                {coin.up ? <TrendingUp size={10} className="inline mr-0.5" /> : <TrendingDown size={10} className="inline mr-0.5" />}
                {coin.chg}
              </span>
            </div>
          </div>
        ))}

        {filteredMarket.length === 0 && (
          <div className="text-center py-8" style={{ color: "#7d8590", fontSize: 13 }}>
            No results for &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>

      {/* ── BOTTOM DISCOVERY TABS ─────────────────────────────────── */}
      <div
        className="flex px-4 gap-6 overflow-x-auto scrollbar-hide mt-2"
        style={{ borderTop: "1px solid #21262d", paddingTop: 10, paddingBottom: 10 }}
      >
        {BOTTOM_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setBottomTab(tab)}
            style={{
              fontSize: 11,
              whiteSpace: "nowrap",
              color: bottomTab === tab ? "#e6edf3" : "#7d8590",
              fontWeight: bottomTab === tab ? 500 : 400,
              paddingBottom: 2,
              borderBottom: bottomTab === tab ? "1px solid #f0b90b" : "1px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Discovery content placeholder */}
      <div className="px-4 py-6 text-center" style={{ color: "#484f58", fontSize: 12 }}>
        {bottomTab === "Discover" && "Explore trending coins and news"}
        {bottomTab === "Following" && "Follow traders to see their activity"}
        {bottomTab === "Announcement" && "No new announcements"}
      </div>
    </div>
  );
}
