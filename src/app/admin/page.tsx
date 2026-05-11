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
  MessageSquare,
  Send,
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
  referral_code: string;
  referred_by: string;
  created_at: string;
  updated_at: string;
}

interface UserDetail extends User {
  total_buy_orders: number;
  total_sell_orders: number;
  total_volume_usdt: number;
  total_volume_inr: number;
  completed_trades: number;
  disputed_trades: number;
  recent_orders: {
    id: string;
    order_number: string;
    type: string;
    usdt_amount: number;
    inr_amount: number;
    status: string;
    created_at: string;
  }[];
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

interface SupportTicket {
  id: string;
  ticket_number: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  subject: string;
  category: string;
  message: string;
  order_id: string | null;
  status: string;
  priority: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

interface SupportCounts {
  open_count: number;
  in_progress_count: number;
  resolved_count: number;
  urgent_count: number;
  total_count: number;
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "kyc", label: "KYC Requests", icon: Shield },
  { id: "sellers", label: "Sellers", icon: UserCheck },
  { id: "support", label: "Support", icon: MessageSquare },
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
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [supportCounts, setSupportCounts] = useState<SupportCounts | null>(null);

  // Filter states
  const [orderFilter, setOrderFilter] = useState({ status: "all", type: "all" });
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("pending");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [supportFilter, setSupportFilter] = useState({ status: "all", category: "all" });
  const [supportSearch, setSupportSearch] = useState("");

  // Pagination
  const [orderPage, setOrderPage] = useState(1);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedKyc, setSelectedKyc] = useState<KycApplication | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

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
          const usersRes = await fetch(`/api/admin/users?search=${userSearch}&role=${userRoleFilter}`);
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

        case "support":
          const supportRes = await fetch(`/api/admin/support?status=${supportFilter.status}&category=${supportFilter.category}&search=${supportSearch}`);
          const supportData = await supportRes.json();
          if (supportData.success) {
            setSupportTickets(supportData.tickets);
            setSupportCounts(supportData.counts);
          }
          break;
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab, orderFilter, orderPage, userSearch, userRoleFilter, kycFilter, sellerFilter, supportFilter, supportSearch]);

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

  const handleTicketReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          adminReply: replyText,
          status: "in_progress",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText("");
        setSelectedTicket(null);
        fetchData();
      }
    } catch (error) {
      console.error("Reply failed:", error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleTicketStatusChange = async (ticketId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status }),
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const handleViewUser = async (userId: string) => {
    setUserDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success) setSelectedUser(data.user);
    } catch (error) {
      console.error("Failed to fetch user detail:", error);
    } finally {
      setUserDetailLoading(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      payment_issue: "Payment Issue",
      trade_problem: "Trade Problem",
      kyc_verification: "KYC Verification",
      account: "Account Issue",
      urgent: "Urgent",
      other: "Other",
    };
    return labels[cat] || cat;
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
              {tab.id === "support" && supportCounts?.open_count ? (
                <span className="ml-auto px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full">
                  {supportCounts.open_count}
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
                  {/* Filters Row */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-white text-[12px] placeholder:text-muted-foreground"
                      />
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-3 py-2 bg-surface border border-border rounded-lg text-[12px] text-white"
                    >
                      <option value="all">All Roles</option>
                      <option value="user">Users</option>
                      <option value="admin">Admins</option>
                    </select>
                    <div className="ml-auto text-[11px] text-muted-foreground">{users.length} users</div>
                  </div>

                  {/* Users Table */}
                  <div className="bg-card border border-border rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-surface border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">#</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">User</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Contact</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Role / Status</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Trades</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Referral</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Joined</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((user, idx) => (
                          <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                            <td className="px-4 py-3 text-[11px] text-muted-foreground">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                  <span className="text-[11px] font-bold text-primary">
                                    {(user.name || user.email || "?")[0].toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-[12px] font-medium text-white">{user.name || "No name"}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono">{user.id.slice(0, 8)}…</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-[11px] text-white">{user.email || "—"}</p>
                              <p className="text-[10px] text-muted-foreground">{user.phone || "—"}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                <span className={`px-1.5 py-0.5 text-[9px] rounded font-medium ${
                                  user.role === "admin"
                                    ? "bg-amber-500/15 text-amber-400"
                                    : "bg-surface text-muted-foreground"
                                }`}>
                                  {user.role}
                                </span>
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
                            <td className="px-4 py-3 text-[12px] text-white font-medium">{user.total_trades}</td>
                            <td className="px-4 py-3">
                              <p className="text-[11px] text-white font-mono">{user.referral_code || "—"}</p>
                              {user.referred_by && (
                                <p className="text-[10px] text-muted-foreground">via {user.referred_by}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-muted-foreground">
                              {formatDate(user.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleViewUser(user.id)}
                                  className="px-2 py-1 bg-primary/15 text-primary text-[10px] rounded hover:bg-primary/25 flex items-center gap-1"
                                >
                                  <Eye className="size-3" /> View
                                </button>
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
                      <div className="py-16 text-center">
                        <Users className="size-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                        <p className="text-muted-foreground text-[13px]">No users found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Detail Modal */}
              {selectedUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="p-5 border-b border-border flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {(selectedUser.name || selectedUser.email || "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-[16px] font-semibold text-white">{selectedUser.name || "No name"}</h3>
                          <p className="text-[11px] text-muted-foreground">{selectedUser.email}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedUser(null)} className="p-1.5 hover:bg-surface rounded-lg">
                        <X className="size-5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="p-5 space-y-5">
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                          selectedUser.role === "admin" ? "bg-amber-500/15 text-amber-400" : "bg-surface text-muted-foreground"
                        }`}>{selectedUser.role.toUpperCase()}</span>
                        {selectedUser.is_verified && <span className="px-2 py-0.5 bg-green-500/15 text-green-400 text-[10px] rounded">Verified</span>}
                        {selectedUser.is_seller && <span className="px-2 py-0.5 bg-primary/15 text-primary text-[10px] rounded">Seller</span>}
                        {selectedUser.is_blocked && <span className="px-2 py-0.5 bg-red-500/15 text-red-400 text-[10px] rounded">Blocked</span>}
                      </div>

                      {/* Personal Info */}
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Personal Information</p>
                        <div className="bg-surface rounded-xl p-4 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Full Name</p>
                            <p className="text-[12px] text-white font-medium">{selectedUser.name || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Phone</p>
                            <p className="text-[12px] text-white">{selectedUser.phone || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Email</p>
                            <p className="text-[12px] text-white">{selectedUser.email || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">User ID</p>
                            <p className="text-[11px] text-white font-mono">{selectedUser.id.slice(0, 18)}…</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Referral Code</p>
                            <p className="text-[12px] text-white font-mono">{selectedUser.referral_code || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Referred By</p>
                            <p className="text-[12px] text-white font-mono">{selectedUser.referred_by || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Joined</p>
                            <p className="text-[12px] text-white">{formatDate(selectedUser.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Last Updated</p>
                            <p className="text-[12px] text-white">{formatDate(selectedUser.updated_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Trade Stats */}
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trade Statistics</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-surface rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-white">{selectedUser.total_trades}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Total Trades</p>
                          </div>
                          <div className="bg-surface rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-green-400">{selectedUser.completed_trades}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Completed</p>
                          </div>
                          <div className="bg-surface rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-red-400">{selectedUser.disputed_trades}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Disputed</p>
                          </div>
                          <div className="bg-surface rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-primary">{selectedUser.total_buy_orders}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Buy Orders</p>
                          </div>
                          <div className="bg-surface rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-amber-400">{selectedUser.total_sell_orders}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Sell Orders</p>
                          </div>
                          <div className="bg-surface rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-white">{Number(selectedUser.total_volume_usdt || 0).toFixed(0)}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Vol (USDT)</p>
                          </div>
                        </div>
                      </div>

                      {/* Recent Orders */}
                      {selectedUser.recent_orders?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Orders</p>
                          <div className="bg-surface rounded-xl overflow-hidden">
                            <table className="w-full">
                              <thead className="border-b border-border">
                                <tr>
                                  <th className="px-3 py-2 text-left text-[10px] text-muted-foreground">Order</th>
                                  <th className="px-3 py-2 text-left text-[10px] text-muted-foreground">Type</th>
                                  <th className="px-3 py-2 text-left text-[10px] text-muted-foreground">Amount</th>
                                  <th className="px-3 py-2 text-left text-[10px] text-muted-foreground">Status</th>
                                  <th className="px-3 py-2 text-left text-[10px] text-muted-foreground">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {selectedUser.recent_orders.map((order) => (
                                  <tr key={order.id}>
                                    <td className="px-3 py-2 text-[11px] text-white font-mono">{order.order_number}</td>
                                    <td className="px-3 py-2">
                                      <span className={`px-1.5 py-0.5 text-[9px] rounded ${order.type === "buy" ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"}`}>
                                        {order.type.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-[11px] text-white">{Number(order.usdt_amount).toFixed(2)} USDT</td>
                                    <td className="px-3 py-2">
                                      <span className={`px-1.5 py-0.5 text-[9px] rounded ${
                                        order.status === "completed" ? "bg-green-500/15 text-green-400" :
                                        order.status === "disputed" ? "bg-red-500/15 text-red-400" :
                                        "bg-amber-500/15 text-amber-400"
                                      }`}>{order.status}</span>
                                    </td>
                                    <td className="px-3 py-2 text-[10px] text-muted-foreground">{formatDate(order.created_at)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</p>
                        <div className="flex flex-wrap gap-2">
                          {!selectedUser.is_verified && (
                            <button
                              onClick={() => { handleUserAction(selectedUser.id, "verify"); setSelectedUser({ ...selectedUser, is_verified: true }); }}
                              className="px-3 py-1.5 bg-green-500/15 text-green-400 text-[11px] rounded-lg hover:bg-green-500/25 flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="size-3.5" /> Verify User
                            </button>
                          )}
                          {!selectedUser.is_seller && (
                            <button
                              onClick={() => { handleUserAction(selectedUser.id, "make_seller"); setSelectedUser({ ...selectedUser, is_seller: true }); }}
                              className="px-3 py-1.5 bg-primary/15 text-primary text-[11px] rounded-lg hover:bg-primary/25 flex items-center gap-1.5"
                            >
                              <UserCheck className="size-3.5" /> Make Seller
                            </button>
                          )}
                          {selectedUser.is_seller && (
                            <button
                              onClick={() => { handleUserAction(selectedUser.id, "remove_seller"); setSelectedUser({ ...selectedUser, is_seller: false }); }}
                              className="px-3 py-1.5 bg-surface text-muted-foreground text-[11px] rounded-lg hover:text-white flex items-center gap-1.5"
                            >
                              <XCircle className="size-3.5" /> Remove Seller
                            </button>
                          )}
                          {selectedUser.is_blocked ? (
                            <button
                              onClick={() => { handleUserAction(selectedUser.id, "unblock"); setSelectedUser({ ...selectedUser, is_blocked: false }); }}
                              className="px-3 py-1.5 bg-green-500/15 text-green-400 text-[11px] rounded-lg hover:bg-green-500/25 flex items-center gap-1.5"
                            >
                              <Check className="size-3.5" /> Unblock User
                            </button>
                          ) : (
                            <button
                              onClick={() => { handleUserAction(selectedUser.id, "block"); setSelectedUser({ ...selectedUser, is_blocked: true }); }}
                              className="px-3 py-1.5 bg-red-500/15 text-red-400 text-[11px] rounded-lg hover:bg-red-500/25 flex items-center gap-1.5"
                            >
                              <XCircle className="size-3.5" /> Block User
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
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

              {/* Support Tab */}
              {activeTab === "support" && (
                <div className="space-y-4">
                  {/* Support Stats */}
                  {supportCounts && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-card border border-border rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground">Open</p>
                        <p className="text-xl font-bold text-amber-400">{supportCounts.open_count}</p>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground">In Progress</p>
                        <p className="text-xl font-bold text-blue-400">{supportCounts.in_progress_count}</p>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground">Resolved</p>
                        <p className="text-xl font-bold text-green-400">{supportCounts.resolved_count}</p>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground">Urgent</p>
                        <p className="text-xl font-bold text-red-400">{supportCounts.urgent_count}</p>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-white">{supportCounts.total_count}</p>
                      </div>
                    </div>
                  )}

                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={supportFilter.status}
                      onChange={(e) => setSupportFilter({ ...supportFilter, status: e.target.value })}
                      className="px-3 py-2 bg-surface border border-border rounded-lg text-[12px] text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={supportFilter.category}
                      onChange={(e) => setSupportFilter({ ...supportFilter, category: e.target.value })}
                      className="px-3 py-2 bg-surface border border-border rounded-lg text-[12px] text-white"
                    >
                      <option value="all">All Categories</option>
                      <option value="payment_issue">Payment Issue</option>
                      <option value="trade_problem">Trade Problem</option>
                      <option value="kyc_verification">KYC Verification</option>
                      <option value="account">Account</option>
                      <option value="urgent">Urgent</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={supportSearch}
                        onChange={(e) => setSupportSearch(e.target.value)}
                        placeholder="Search tickets..."
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-[12px] text-white placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Tickets Table */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-surface border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Ticket</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">User</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Subject</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Category</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Date</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {supportTickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-surface/50">
                            <td className="px-4 py-3">
                              <p className="text-[11px] font-medium text-white">{ticket.ticket_number}</p>
                              {ticket.priority === "high" && (
                                <span className="px-1.5 py-0.5 bg-red-500/15 text-red-400 text-[8px] rounded">URGENT</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-[11px] text-white">{ticket.user_name || "Guest"}</p>
                              <p className="text-[10px] text-muted-foreground">{ticket.user_email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-[11px] text-white max-w-[200px] truncate">{ticket.subject}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-surface text-[10px] text-muted-foreground rounded">
                                {getCategoryLabel(ticket.category)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 text-[10px] rounded ${
                                ticket.status === "open" ? "bg-amber-500/15 text-amber-400" :
                                ticket.status === "in_progress" ? "bg-blue-500/15 text-blue-400" :
                                ticket.status === "resolved" ? "bg-green-500/15 text-green-400" :
                                "bg-gray-500/15 text-gray-400"
                              }`}>
                                {ticket.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-muted-foreground">
                              {formatDate(ticket.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                className="px-2 py-1 bg-primary/15 text-primary text-[10px] rounded hover:bg-primary/25"
                              >
                                View / Reply
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {supportTickets.length === 0 && (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">
                        No support tickets found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ticket Detail Modal */}
              {selectedTicket && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-muted-foreground">{selectedTicket.ticket_number}</p>
                        <h3 className="text-[15px] font-semibold text-white">{selectedTicket.subject}</h3>
                      </div>
                      <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-surface rounded">
                        <X className="size-5 text-muted-foreground" />
                      </button>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {/* User Info */}
                      <div className="bg-surface rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground mb-2">From</p>
                        <p className="text-[12px] text-white font-medium">{selectedTicket.user_name || "Guest"}</p>
                        <p className="text-[11px] text-muted-foreground">{selectedTicket.user_email}</p>
                        {selectedTicket.user_phone && (
                          <p className="text-[11px] text-muted-foreground">{selectedTicket.user_phone}</p>
                        )}
                      </div>

                      {/* Ticket Details */}
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2 py-1 text-[10px] rounded ${
                          selectedTicket.status === "open" ? "bg-amber-500/15 text-amber-400" :
                          selectedTicket.status === "in_progress" ? "bg-blue-500/15 text-blue-400" :
                          selectedTicket.status === "resolved" ? "bg-green-500/15 text-green-400" :
                          "bg-gray-500/15 text-gray-400"
                        }`}>
                          {selectedTicket.status.replace("_", " ")}
                        </span>
                        <span className="px-2 py-1 bg-surface text-[10px] text-muted-foreground rounded">
                          {getCategoryLabel(selectedTicket.category)}
                        </span>
                        {selectedTicket.priority === "high" && (
                          <span className="px-2 py-1 bg-red-500/15 text-red-400 text-[10px] rounded">URGENT</span>
                        )}
                        {selectedTicket.order_id && (
                          <span className="px-2 py-1 bg-primary/15 text-primary text-[10px] rounded">
                            Order: {selectedTicket.order_id}
                          </span>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">Message</p>
                        <div className="bg-surface rounded-lg p-3">
                          <p className="text-[12px] text-white whitespace-pre-wrap">{selectedTicket.message}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatDate(selectedTicket.created_at)}</p>
                      </div>

                      {/* Previous Reply */}
                      {selectedTicket.admin_reply && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">Your Previous Reply</p>
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                            <p className="text-[12px] text-white whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
                          </div>
                          {selectedTicket.replied_at && (
                            <p className="text-[10px] text-muted-foreground mt-1">{formatDate(selectedTicket.replied_at)}</p>
                          )}
                        </div>
                      )}

                      {/* Reply Form */}
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">Reply</p>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-[12px] text-white placeholder:text-muted-foreground resize-none"
                          placeholder="Type your reply..."
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleTicketReply}
                          disabled={sendingReply || !replyText.trim()}
                          className="flex-1 py-2 bg-primary text-white text-[12px] font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {sendingReply ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                          Send Reply
                        </button>
                        {selectedTicket.status !== "resolved" && (
                          <button
                            onClick={() => {
                              handleTicketStatusChange(selectedTicket.id, "resolved");
                              setSelectedTicket(null);
                            }}
                            className="px-4 py-2 bg-green-500/15 text-green-400 text-[12px] font-medium rounded-lg flex items-center gap-2"
                          >
                            <CheckCircle2 className="size-4" />
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
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
