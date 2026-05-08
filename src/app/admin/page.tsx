"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  DollarSign,
  Shield,
  UserCheck,
  LogOut,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Eye,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";

// Types
interface Stats {
  totalUsers: number;
  pendingBuyOrders: number;
  pendingSellOrders: number;
  todayVolume: number;
  totalVolume: number;
  pendingKyc: number;
  activeSellers: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  order_number: string;
  type: string;
  usdt_amount: number;
  inr_amount: number;
  status: string;
  buyer_name?: string;
  seller_name?: string;
  buyer_wallet?: string;
  seller_upi?: string;
  payment_screenshot?: string;
  utr_number?: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_seller: boolean;
  is_blocked: boolean;
  is_verified: boolean;
  total_trades: number;
  created_at: string;
}

interface KycApplication {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  pan_number: string;
  aadhaar_number: string;
  aadhaar_front_url: string;
  aadhaar_back_url: string;
  pan_card_url: string;
  selfie_url: string;
  bank_account_number: string;
  bank_ifsc: string;
  bank_name: string;
  upi_id: string;
  usdt_wallet_address: string;
  usdt_network: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
}

interface Seller {
  id: string;
  user_id: string;
  name: string;
  is_verified: boolean;
  available_usdt: number;
  rate: number;
  upi_id: string;
  completion_rate: number;
  avg_response_time: number;
  user_email?: string;
  user_phone?: string;
  user_blocked?: boolean;
  created_at: string;
}

interface Rates {
  buy_rate: number;
  sell_rate: number;
  vip_buy_rate: number;
  vip_sell_rate: number;
  platform_fee_percent: number;
  min_trade_amount: number;
  max_trade_amount: number;
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "kyc", label: "KYC Requests", icon: Shield },
  { id: "sellers", label: "Sellers", icon: UserCheck },
  { id: "rates", label: "Rate Settings", icon: DollarSign },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  escrow_waiting: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  escrowed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  payment_pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  payment_uploaded: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  disputed: "bg-red-500/15 text-red-400 border-red-500/30",
  approved: "bg-green-500/15 text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [kycApplications, setKycApplications] = useState<KycApplication[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [rates, setRates] = useState<Rates | null>(null);

  // Filter states
  const [orderFilter, setOrderFilter] = useState({ status: "all", type: "all" });
  const [userSearch, setUserSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("pending");
  const [sellerFilter, setSellerFilter] = useState("all");

  // Pagination
  const [orderPage, setOrderPage] = useState(1);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedKyc, setSelectedKyc] = useState<KycApplication | null>(null);

  // Rate editing
  const [editRates, setEditRates] = useState({
    buyRate: "",
    sellRate: "",
    vipBuyRate: "",
    vipSellRate: "",
    platformFee: "",
    minAmount: "",
    maxAmount: "",
  });

  // Check auth on mount
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession") || localStorage.getItem("admin_session");
    if (!adminSession) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);

    try {
      switch (activeTab) {
        case "dashboard":
          const statsRes = await fetch("/api/admin/stats");
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.stats);
          break;

        case "orders":
          const ordersRes = await fetch(`/api/admin/orders?status=${orderFilter.status}&type=${orderFilter.type}&page=${orderPage}`);
          const ordersData = await ordersRes.json();
          if (ordersData.success) setOrders(ordersData.orders);
          break;

        case "users":
          const usersRes = await fetch(`/api/admin/users?search=${userSearch}`);
          const usersData = await usersRes.json();
          if (usersData.success) setUsers(usersData.users);
          break;

        case "kyc":
          const kycRes = await fetch(`/api/admin/kyc?status=${kycFilter}`);
          const kycData = await kycRes.json();
          if (kycData.success) setKycApplications(kycData.kycApplications);
          break;

        case "sellers":
          const sellersRes = await fetch(`/api/admin/sellers?status=${sellerFilter}`);
          const sellersData = await sellersRes.json();
          if (sellersData.success) setSellers(sellersData.sellers);
          break;

        case "rates":
          const ratesRes = await fetch("/api/admin/rates");
          const ratesData = await ratesRes.json();
          if (ratesData.success) {
            setRates(ratesData.rates);
            setEditRates({
              buyRate: String(ratesData.rates.buy_rate),
              sellRate: String(ratesData.rates.sell_rate),
              vipBuyRate: String(ratesData.rates.vip_buy_rate),
              vipSellRate: String(ratesData.rates.vip_sell_rate),
              platformFee: String(ratesData.rates.platform_fee_percent),
              minAmount: String(ratesData.rates.min_trade_amount),
              maxAmount: String(ratesData.rates.max_trade_amount),
            });
          }
          break;
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab, orderFilter, orderPage, userSearch, kycFilter, sellerFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    localStorage.removeItem("admin_session");
    router.push("/admin/login");
  };

  // Action handlers
  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Order action failed:", error);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (error) {
      console.error("User action failed:", error);
    }
  };

  const handleKycAction = async (kycId: string, action: string, rejectionReason?: string) => {
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kycId, action, rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setSelectedKyc(null);
      }
    } catch (error) {
      console.error("KYC action failed:", error);
    }
  };

  const handleSellerAction = async (sellerId: string, action: string) => {
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, action }),
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (error) {
      console.error("Seller action failed:", error);
    }
  };

  const handleUpdateRates = async () => {
    try {
      const res = await fetch("/api/admin/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyRate: parseFloat(editRates.buyRate),
          sellRate: parseFloat(editRates.sellRate),
          vipBuyRate: parseFloat(editRates.vipBuyRate),
          vipSellRate: parseFloat(editRates.vipSellRate),
          platformFee: parseFloat(editRates.platformFee),
          minAmount: parseFloat(editRates.minAmount),
          maxAmount: parseFloat(editRates.maxAmount),
        }),
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (error) {
      console.error("Rate update failed:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string = "INR") => {
    if (currency === "INR") {
      return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    }
    return `${amount.toLocaleString()} USDT`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="SwapEase" width={40} height={40} className="rounded-xl" />
            <div>
              <span className="font-bold text-white">SwapEase</span>
              <p className="text-[10px] text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-surface hover:text-white"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
              {tab.id === "kyc" && stats?.pendingKyc ? (
                <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                  {stats.pendingKyc}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h1 className="text-xl font-bold text-white capitalize">{activeTab.replace("_", " ")}</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-surface text-white text-[12px] rounded-lg hover:bg-surface/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && stats && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="size-4 text-primary" />
                        <span className="text-[11px] text-muted-foreground">Total Users</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="size-4 text-amber-400" />
                        <span className="text-[11px] text-muted-foreground">Pending Orders</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stats.pendingBuyOrders + stats.pendingSellOrders}</p>
                      <p className="text-[10px] text-muted-foreground">Buy: {stats.pendingBuyOrders} | Sell: {stats.pendingSellOrders}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="size-4 text-green-400" />
                        <span className="text-[11px] text-muted-foreground">Today&apos;s Volume</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{formatCurrency(stats.todayVolume, "USDT")}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="size-4 text-green-400" />
                        <span className="text-[11px] text-muted-foreground">Total Revenue</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                  </div>

                  {/* Secondary Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-[11px] text-muted-foreground mb-1">Active Sellers</p>
                      <p className="text-xl font-bold text-white">{stats.activeSellers}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-[11px] text-muted-foreground mb-1">Pending KYC</p>
                      <p className="text-xl font-bold text-amber-400">{stats.pendingKyc}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-[11px] text-muted-foreground mb-1">Total Volume</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(stats.totalVolume, "USDT")}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-3">
                    <select
                      value={orderFilter.status}
                      onChange={(e) => setOrderFilter({ ...orderFilter, status: e.target.value })}
                      className="px-3 py-2 bg-surface border border-border rounded-lg text-white text-[12px]"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="escrow_waiting">Escrow Waiting</option>
                      <option value="payment_pending">Payment Pending</option>
                      <option value="payment_uploaded">Payment Uploaded</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="disputed">Disputed</option>
                    </select>
                    <select
                      value={orderFilter.type}
                      onChange={(e) => setOrderFilter({ ...orderFilter, type: e.target.value })}
                      className="px-3 py-2 bg-surface border border-border rounded-lg text-white text-[12px]"
                    >
                      <option value="all">All Types</option>
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-surface">
                        <tr>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Order</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Type</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Amount</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Date</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-surface/50">
                            <td className="px-4 py-3">
                              <p className="text-[12px] font-medium text-white">{order.order_number || order.id.slice(0, 8)}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                order.type === "buy" ? "bg-primary/15 text-primary" : "bg-green-500/15 text-green-400"
                              }`}>
                                {order.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-[12px] text-white">{order.usdt_amount} USDT</p>
                              <p className="text-[10px] text-muted-foreground">{formatCurrency(order.inr_amount)}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                                {order.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-muted-foreground">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="p-1.5 hover:bg-surface rounded text-muted-foreground hover:text-white"
                                >
                                  <Eye className="size-3.5" />
                                </button>
                                {order.status === "payment_uploaded" && (
                                  <>
                                    <button
                                      onClick={() => handleOrderAction(order.id, "release")}
                                      className="p-1.5 hover:bg-green-500/15 rounded text-green-400"
                                    >
                                      <Check className="size-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleOrderAction(order.id, "reject")}
                                      className="p-1.5 hover:bg-red-500/15 rounded text-red-400"
                                    >
                                      <X className="size-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {orders.length === 0 && (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">
                        No orders found
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                      disabled={orderPage === 1}
                      className="p-2 bg-surface rounded-lg text-white disabled:opacity-50"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="px-4 py-2 text-[12px] text-white">Page {orderPage}</span>
                    <button
                      onClick={() => setOrderPage((p) => p + 1)}
                      disabled={orders.length < 20}
                      className="p-2 bg-surface rounded-lg text-white disabled:opacity-50"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-white text-[12px] placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* Users Table */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-surface">
                        <tr>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">User</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Contact</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Trades</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Joined</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-surface/50">
                            <td className="px-4 py-3">
                              <p className="text-[12px] font-medium text-white">{user.name || "No name"}</p>
                              <p className="text-[10px] text-muted-foreground">{user.role}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-[11px] text-white">{user.email}</p>
                              <p className="text-[10px] text-muted-foreground">{user.phone}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 flex-wrap">
                                {user.is_verified && (
                                  <span className="px-1.5 py-0.5 bg-green-500/15 text-green-400 text-[9px] rounded">Verified</span>
                                )}
                                {user.is_seller && (
                                  <span className="px-1.5 py-0.5 bg-primary/15 text-primary text-[9px] rounded">Seller</span>
                                )}
                                {user.is_blocked && (
                                  <span className="px-1.5 py-0.5 bg-red-500/15 text-red-400 text-[9px] rounded">Blocked</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-white">{user.total_trades}</td>
                            <td className="px-4 py-3 text-[11px] text-muted-foreground">
                              {formatDate(user.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {user.is_blocked ? (
                                  <button
                                    onClick={() => handleUserAction(user.id, "unblock")}
                                    className="px-2 py-1 bg-green-500/15 text-green-400 text-[10px] rounded hover:bg-green-500/25"
                                  >
                                    Unblock
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUserAction(user.id, "block")}
                                    className="px-2 py-1 bg-red-500/15 text-red-400 text-[10px] rounded hover:bg-red-500/25"
                                  >
                                    Block
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {users.length === 0 && (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">
                        No users found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* KYC Tab */}
              {activeTab === "kyc" && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-2">
                    {["pending", "approved", "rejected", "all"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setKycFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          kycFilter === status
                            ? "bg-primary text-white"
                            : "bg-surface text-muted-foreground hover:text-white"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* KYC Cards */}
                  <div className="grid gap-4">
                    {kycApplications.map((kyc) => (
                      <div key={kyc.id} className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-[14px] font-medium text-white">{kyc.full_name}</p>
                            <p className="text-[11px] text-muted-foreground">{kyc.email} | {kyc.phone}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[kyc.status]}`}>
                            {kyc.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground">PAN</p>
                            <p className="text-[11px] text-white">{kyc.pan_number}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Aadhaar</p>
                            <p className="text-[11px] text-white">{kyc.aadhaar_number?.slice(0, 4)}****</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Bank</p>
                            <p className="text-[11px] text-white">{kyc.bank_name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">UPI</p>
                            <p className="text-[11px] text-white">{kyc.upi_id}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedKyc(kyc)}
                            className="px-3 py-1.5 bg-surface text-white text-[11px] rounded-lg hover:bg-surface/80"
                          >
                            View Details
                          </button>
                          {kyc.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleKycAction(kyc.id, "approve")}
                                className="px-3 py-1.5 bg-green-500/15 text-green-400 text-[11px] rounded-lg hover:bg-green-500/25"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleKycAction(kyc.id, "reject", "Documents not clear")}
                                className="px-3 py-1.5 bg-red-500/15 text-red-400 text-[11px] rounded-lg hover:bg-red-500/25"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {kycApplications.length === 0 && (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">
                        No KYC applications found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sellers Tab */}
              {activeTab === "sellers" && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-2">
                    {["all", "verified", "unverified"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSellerFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          sellerFilter === status
                            ? "bg-primary text-white"
                            : "bg-surface text-muted-foreground hover:text-white"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Sellers Table */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-surface">
                        <tr>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Seller</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Balance</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Rate</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Stats</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {sellers.map((seller) => (
                          <tr key={seller.id} className="hover:bg-surface/50">
                            <td className="px-4 py-3">
                              <p className="text-[12px] font-medium text-white">{seller.name}</p>
                              <p className="text-[10px] text-muted-foreground">{seller.upi_id}</p>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-white">
                              {seller.available_usdt} USDT
                            </td>
                            <td className="px-4 py-3 text-[12px] text-white">
                              ₹{seller.rate}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-[11px] text-white">{seller.completion_rate}% completion</p>
                              <p className="text-[10px] text-muted-foreground">{seller.avg_response_time} min avg</p>
                            </td>
                            <td className="px-4 py-3">
                              {seller.is_verified ? (
                                <span className="px-2 py-0.5 bg-green-500/15 text-green-400 text-[10px] rounded">Verified</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 text-[10px] rounded">Unverified</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {seller.is_verified ? (
                                  <button
                                    onClick={() => handleSellerAction(seller.id, "unverify")}
                                    className="px-2 py-1 bg-amber-500/15 text-amber-400 text-[10px] rounded"
                                  >
                                    Unverify
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSellerAction(seller.id, "verify")}
                                    className="px-2 py-1 bg-green-500/15 text-green-400 text-[10px] rounded"
                                  >
                                    Verify
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {sellers.length === 0 && (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">
                        No sellers found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rates Tab */}
              {activeTab === "rates" && rates && (
                <div className="max-w-2xl space-y-6">
                  {/* Current Rates Display */}
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-[14px] font-semibold text-white mb-4">Current Live Rates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground mb-1">Buy Rate (User pays)</p>
                        <p className="text-xl font-bold text-white">₹{rates.buy_rate}</p>
                      </div>
                      <div className="bg-surface rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground mb-1">Sell Rate (User receives)</p>
                        <p className="text-xl font-bold text-white">₹{rates.sell_rate}</p>
                      </div>
                      <div className="bg-surface rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground mb-1">VIP Buy Rate</p>
                        <p className="text-lg font-bold text-amber-400">₹{rates.vip_buy_rate}</p>
                      </div>
                      <div className="bg-surface rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground mb-1">VIP Sell Rate</p>
                        <p className="text-lg font-bold text-amber-400">₹{rates.vip_sell_rate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Rates Form */}
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-[14px] font-semibold text-white mb-4">Update Rates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">Buy Rate</label>
                        <input
                          type="number"
                          value={editRates.buyRate}
                          onChange={(e) => setEditRates({ ...editRates, buyRate: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-[13px]"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">Sell Rate</label>
                        <input
                          type="number"
                          value={editRates.sellRate}
                          onChange={(e) => setEditRates({ ...editRates, sellRate: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-[13px]"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">VIP Buy Rate</label>
                        <input
                          type="number"
                          value={editRates.vipBuyRate}
                          onChange={(e) => setEditRates({ ...editRates, vipBuyRate: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-[13px]"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">VIP Sell Rate</label>
                        <input
                          type="number"
                          value={editRates.vipSellRate}
                          onChange={(e) => setEditRates({ ...editRates, vipSellRate: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-[13px]"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">Platform Fee %</label>
                        <input
                          type="number"
                          value={editRates.platformFee}
                          onChange={(e) => setEditRates({ ...editRates, platformFee: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-[13px]"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">Min Trade Amount</label>
                        <input
                          type="number"
                          value={editRates.minAmount}
                          onChange={(e) => setEditRates({ ...editRates, minAmount: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-[13px]"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleUpdateRates}
                      className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold rounded-lg transition-colors"
                    >
                      Update Rates
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-white">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-surface rounded">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Order ID</p>
                  <p className="text-[12px] text-white font-mono">{selectedOrder.order_number || selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Type</p>
                  <p className="text-[12px] text-white capitalize">{selectedOrder.type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">USDT Amount</p>
                  <p className="text-[12px] text-white">{selectedOrder.usdt_amount} USDT</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">INR Amount</p>
                  <p className="text-[12px] text-white">{formatCurrency(selectedOrder.inr_amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Date</p>
                  <p className="text-[12px] text-white">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {selectedOrder.buyer_wallet && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Buyer Wallet</p>
                  <div className="flex items-center gap-2 bg-surface p-2 rounded-lg">
                    <p className="text-[11px] text-white font-mono flex-1 truncate">{selectedOrder.buyer_wallet}</p>
                    <button onClick={() => copyToClipboard(selectedOrder.buyer_wallet!)} className="p-1 hover:bg-card rounded">
                      <Copy className="size-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )}

              {selectedOrder.seller_upi && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Seller UPI</p>
                  <div className="flex items-center gap-2 bg-surface p-2 rounded-lg">
                    <p className="text-[11px] text-white font-mono flex-1">{selectedOrder.seller_upi}</p>
                    <button onClick={() => copyToClipboard(selectedOrder.seller_upi!)} className="p-1 hover:bg-card rounded">
                      <Copy className="size-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )}

              {selectedOrder.utr_number && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">UTR Number</p>
                  <p className="text-[12px] text-white font-mono">{selectedOrder.utr_number}</p>
                </div>
              )}

              {selectedOrder.payment_screenshot && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Payment Screenshot</p>
                  <a
                    href={selectedOrder.payment_screenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary text-[12px] hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    View Screenshot
                  </a>
                </div>
              )}

              {selectedOrder.status === "payment_uploaded" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleOrderAction(selectedOrder.id, "release")}
                    className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-[13px] font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="size-4" />
                    Release Payment
                  </button>
                  <button
                    onClick={() => handleOrderAction(selectedOrder.id, "reject")}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <XCircle className="size-4" />
                    Reject
                  </button>
                </div>
              )}

              {selectedOrder.status === "disputed" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-400 mb-1">
                    <AlertCircle className="size-4" />
                    <span className="text-[12px] font-medium">Dispute Active</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">This order has been disputed and requires manual resolution.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KYC Detail Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-white">KYC Application Details</h3>
              <button onClick={() => setSelectedKyc(null)} className="p-1 hover:bg-surface rounded">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Personal Info */}
              <div>
                <h4 className="text-[12px] font-semibold text-primary mb-2">Personal Information</h4>
                <div className="grid grid-cols-2 gap-3 bg-surface rounded-lg p-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Full Name</p>
                    <p className="text-[12px] text-white">{selectedKyc.full_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Phone</p>
                    <p className="text-[12px] text-white">{selectedKyc.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Email</p>
                    <p className="text-[12px] text-white">{selectedKyc.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">PAN Number</p>
                    <p className="text-[12px] text-white font-mono">{selectedKyc.pan_number}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-[12px] font-semibold text-primary mb-2">Documents</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedKyc.aadhaar_front_url && (
                    <a href={selectedKyc.aadhaar_front_url} target="_blank" rel="noopener noreferrer" className="bg-surface rounded-lg p-3 hover:bg-surface/80">
                      <p className="text-[10px] text-muted-foreground mb-1">Aadhaar Front</p>
                      <p className="text-[11px] text-primary flex items-center gap-1"><ExternalLink className="size-3" /> View</p>
                    </a>
                  )}
                  {selectedKyc.aadhaar_back_url && (
                    <a href={selectedKyc.aadhaar_back_url} target="_blank" rel="noopener noreferrer" className="bg-surface rounded-lg p-3 hover:bg-surface/80">
                      <p className="text-[10px] text-muted-foreground mb-1">Aadhaar Back</p>
                      <p className="text-[11px] text-primary flex items-center gap-1"><ExternalLink className="size-3" /> View</p>
                    </a>
                  )}
                  {selectedKyc.pan_card_url && (
                    <a href={selectedKyc.pan_card_url} target="_blank" rel="noopener noreferrer" className="bg-surface rounded-lg p-3 hover:bg-surface/80">
                      <p className="text-[10px] text-muted-foreground mb-1">PAN Card</p>
                      <p className="text-[11px] text-primary flex items-center gap-1"><ExternalLink className="size-3" /> View</p>
                    </a>
                  )}
                  {selectedKyc.selfie_url && (
                    <a href={selectedKyc.selfie_url} target="_blank" rel="noopener noreferrer" className="bg-surface rounded-lg p-3 hover:bg-surface/80">
                      <p className="text-[10px] text-muted-foreground mb-1">Selfie</p>
                      <p className="text-[11px] text-primary flex items-center gap-1"><ExternalLink className="size-3" /> View</p>
                    </a>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="text-[12px] font-semibold text-primary mb-2">Bank Details</h4>
                <div className="grid grid-cols-2 gap-3 bg-surface rounded-lg p-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Bank Name</p>
                    <p className="text-[12px] text-white">{selectedKyc.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Account Number</p>
                    <p className="text-[12px] text-white font-mono">{selectedKyc.bank_account_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">IFSC Code</p>
                    <p className="text-[12px] text-white font-mono">{selectedKyc.bank_ifsc}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">UPI ID</p>
                    <p className="text-[12px] text-white">{selectedKyc.upi_id}</p>
                  </div>
                </div>
              </div>

              {/* Wallet */}
              <div>
                <h4 className="text-[12px] font-semibold text-primary mb-2">USDT Wallet</h4>
                <div className="bg-surface rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary/15 text-primary text-[10px] rounded">{selectedKyc.usdt_network}</span>
                  </div>
                  <p className="text-[11px] text-white font-mono break-all">{selectedKyc.usdt_wallet_address}</p>
                </div>
              </div>

              {/* Actions */}
              {selectedKyc.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleKycAction(selectedKyc.id, "approve")}
                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-[13px] font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="size-4" />
                    Approve KYC
                  </button>
                  <button
                    onClick={() => handleKycAction(selectedKyc.id, "reject", "Documents not clear or incomplete")}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <XCircle className="size-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
