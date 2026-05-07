"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  LayoutDashboard,
  ClipboardList,
  UserCog,
  Settings,
  Wallet,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  Check,
  X,
  Eye,
  Ban,
  Unlock,
  RefreshCw,
  Filter,
  Download,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Copy,
  Building2,
  CreditCard,
  FileText,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// Demo data
const DEMO_STATS = {
  totalUsers: 1284,
  pendingBuyOrders: 23,
  pendingSellOrders: 18,
  todayVolume: 125000,
  revenue: 6250,
};

const DEMO_ORDERS = [
  { id: "ORD001", type: "buy", user: "rahul_sharma", userEmail: "rahul@email.com", amount: 500, inr: 43750, status: "pending", date: "2024-01-15 14:30", paymentMethod: "UPI" },
  { id: "ORD002", type: "sell", user: "priya_patel", userEmail: "priya@email.com", amount: 1000, inr: 87000, status: "pending", date: "2024-01-15 14:25", paymentMethod: "Bank Transfer" },
  { id: "ORD003", type: "buy", user: "amit_kumar", userEmail: "amit@email.com", amount: 250, inr: 21875, status: "completed", date: "2024-01-15 13:45", paymentMethod: "UPI" },
  { id: "ORD004", type: "sell", user: "neha_singh", userEmail: "neha@email.com", amount: 750, inr: 65250, status: "completed", date: "2024-01-15 12:30", paymentMethod: "Bank Transfer" },
  { id: "ORD005", type: "buy", user: "vikram_joshi", userEmail: "vikram@email.com", amount: 2000, inr: 175000, status: "cancelled", date: "2024-01-15 11:15", paymentMethod: "UPI" },
  { id: "ORD006", type: "sell", user: "sneha_gupta", userEmail: "sneha@email.com", amount: 300, inr: 26100, status: "pending", date: "2024-01-15 10:45", paymentMethod: "Bank Transfer" },
];

const DEMO_USERS = [
  { id: "USR001", name: "Rahul Sharma", email: "rahul@email.com", phone: "+91 98765 43210", status: "active", kycStatus: "verified", totalTrades: 45, joinDate: "2024-01-01" },
  { id: "USR002", name: "Priya Patel", email: "priya@email.com", phone: "+91 87654 32109", status: "active", kycStatus: "verified", totalTrades: 32, joinDate: "2024-01-05" },
  { id: "USR003", name: "Amit Kumar", email: "amit@email.com", phone: "+91 76543 21098", status: "active", kycStatus: "pending", totalTrades: 12, joinDate: "2024-01-10" },
  { id: "USR004", name: "Neha Singh", email: "neha@email.com", phone: "+91 65432 10987", status: "blocked", kycStatus: "verified", totalTrades: 67, joinDate: "2023-12-15" },
  { id: "USR005", name: "Vikram Joshi", email: "vikram@email.com", phone: "+91 54321 09876", status: "active", kycStatus: "rejected", totalTrades: 5, joinDate: "2024-01-12" },
];

const DEMO_WITHDRAWALS = [
  { id: "WD001", user: "rahul_sharma", amount: 25000, bankName: "HDFC Bank", accountNo: "****1234", status: "pending", date: "2024-01-15 14:00" },
  { id: "WD002", user: "priya_patel", amount: 50000, bankName: "ICICI Bank", accountNo: "****5678", status: "pending", date: "2024-01-15 13:30" },
  { id: "WD003", user: "amit_kumar", amount: 15000, bankName: "SBI", accountNo: "****9012", status: "approved", date: "2024-01-15 12:00" },
  { id: "WD004", user: "neha_singh", amount: 35000, bankName: "Axis Bank", accountNo: "****3456", status: "rejected", date: "2024-01-15 10:30" },
];

type TabId = "dashboard" | "orders" | "users" | "rates" | "withdrawals";

const SIDEBAR_TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "users", label: "Users", icon: UserCog },
  { id: "rates", label: "Rate Management", icon: Settings },
  { id: "withdrawals", label: "Withdrawals", icon: Wallet },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Orders state
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<"all" | "buy" | "sell">("all");

  // Users state
  const [users, setUsers] = useState(DEMO_USERS);
  const [userSearch, setUserSearch] = useState("");

  // Rates state
  const [buyRate, setBuyRate] = useState("87.50");
  const [sellRate, setSellRate] = useState("87.00");
  const [vipBuyRate, setVipBuyRate] = useState("87.80");
  const [vipSellRate, setVipSellRate] = useState("87.20");
  const [vipEnabled, setVipEnabled] = useState(true);

  // Withdrawals state
  const [withdrawals, setWithdrawals] = useState(DEMO_WITHDRAWALS);

  // View user modal
  const [viewUser, setViewUser] = useState<typeof DEMO_USERS[0] | null>(null);

  // Check admin session
  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) {
      router.push("/admin/login");
      return;
    }
    try {
      const parsed = JSON.parse(session);
      setAdminUser({ name: parsed.name, email: parsed.email });
    } catch {
      router.push("/admin/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.push("/admin/login");
  };

  // Order actions
  const handleOrderAction = (orderId: string, action: "approve" | "reject" | "complete") => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          if (action === "approve") return { ...order, status: "completed" };
          if (action === "reject") return { ...order, status: "cancelled" };
          if (action === "complete") return { ...order, status: "completed" };
        }
        return order;
      })
    );
  };

  // User actions
  const handleUserAction = (userId: string, action: "block" | "unblock") => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          return { ...user, status: action === "block" ? "blocked" : "active" };
        }
        return user;
      })
    );
  };

  // Withdrawal actions
  const handleWithdrawalAction = (wdId: string, action: "approve" | "reject") => {
    setWithdrawals((prev) =>
      prev.map((wd) => {
        if (wd.id === wdId) {
          return { ...wd, status: action === "approve" ? "approved" : "rejected" };
        }
        return wd;
      })
    );
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (orderFilter !== "all" && order.status !== orderFilter) return false;
    if (orderTypeFilter !== "all" && order.type !== orderTypeFilter) return false;
    return true;
  });

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f14] flex items-center justify-center">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f14] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111820] border-r border-white/5 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5">
          <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">SwapEase</p>
            <p className="text-[10px] text-primary font-semibold tracking-wider uppercase">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {SIDEBAR_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                <Icon className="size-5" />
                <span>{tab.label}</span>
                {isActive && <ChevronRight className="size-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Admin User */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">
                {adminUser?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{adminUser?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{adminUser?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-[#111820] border-b border-white/5 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-bold text-white capitalize">
              {SIDEBAR_TABS.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-zinc-500">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors relative">
              <Bell className="size-5" />
              <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              <RefreshCw className="size-4" />
              Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={DEMO_STATS.totalUsers.toLocaleString()}
                  color="primary"
                />
                <StatCard
                  icon={ArrowDownCircle}
                  label="Pending Buy Orders"
                  value={DEMO_STATS.pendingBuyOrders.toString()}
                  color="blue"
                />
                <StatCard
                  icon={ArrowUpCircle}
                  label="Pending Sell Orders"
                  value={DEMO_STATS.pendingSellOrders.toString()}
                  color="orange"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Today Volume (USDT)"
                  value={DEMO_STATS.todayVolume.toLocaleString()}
                  color="emerald"
                />
                <StatCard
                  icon={DollarSign}
                  label="Revenue Earned"
                  value={`₹${DEMO_STATS.revenue.toLocaleString()}`}
                  color="purple"
                />
              </div>

              {/* Recent Orders */}
              <div className="bg-[#111820] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-sm text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-zinc-500 border-b border-white/5">
                        <th className="text-left py-3 px-4">Order ID</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-white/5 last:border-0">
                          <td className="py-3 px-4 text-sm text-zinc-300 font-mono">{order.id}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                order.type === "buy"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-orange-500/10 text-orange-400"
                              }`}
                            >
                              {order.type === "buy" ? (
                                <ArrowDownCircle className="size-3" />
                              ) : (
                                <ArrowUpCircle className="size-3" />
                              )}
                              {order.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-zinc-300">{order.user}</td>
                          <td className="py-3 px-4 text-sm text-white font-medium">
                            {order.amount} USDT
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="py-3 px-4 text-sm text-zinc-500">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-zinc-500" />
                  <span className="text-sm text-zinc-400">Filters:</span>
                </div>
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value as typeof orderFilter)}
                  className="px-3 py-2 bg-[#111820] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value as typeof orderTypeFilter)}
                  className="px-3 py-2 bg-[#111820] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="all">All Types</option>
                  <option value="buy">Buy Orders</option>
                  <option value="sell">Sell Orders</option>
                </select>
                <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-zinc-300 transition-colors">
                  <Download className="size-4" />
                  Export CSV
                </button>
              </div>

              {/* Orders Table */}
              <div className="bg-[#111820] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-zinc-500 border-b border-white/5 bg-white/5">
                        <th className="text-left py-4 px-4">Order ID</th>
                        <th className="text-left py-4 px-4">Type</th>
                        <th className="text-left py-4 px-4">User</th>
                        <th className="text-left py-4 px-4">USDT</th>
                        <th className="text-left py-4 px-4">INR</th>
                        <th className="text-left py-4 px-4">Payment</th>
                        <th className="text-left py-4 px-4">Status</th>
                        <th className="text-left py-4 px-4">Date</th>
                        <th className="text-left py-4 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-sm text-zinc-300 font-mono">{order.id}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                order.type === "buy"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-orange-500/10 text-orange-400"
                              }`}
                            >
                              {order.type === "buy" ? (
                                <ArrowDownCircle className="size-3" />
                              ) : (
                                <ArrowUpCircle className="size-3" />
                              )}
                              {order.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm text-white">{order.user}</p>
                              <p className="text-xs text-zinc-500">{order.userEmail}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-white font-medium">{order.amount}</td>
                          <td className="py-4 px-4 text-sm text-zinc-300">₹{order.inr.toLocaleString()}</td>
                          <td className="py-4 px-4 text-sm text-zinc-400">{order.paymentMethod}</td>
                          <td className="py-4 px-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="py-4 px-4 text-sm text-zinc-500">{order.date}</td>
                          <td className="py-4 px-4">
                            {order.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOrderAction(order.id, "approve")}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                  title="Approve"
                                >
                                  <Check className="size-4" />
                                </button>
                                <button
                                  onClick={() => handleOrderAction(order.id, "reject")}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                  title="Reject"
                                >
                                  <X className="size-4" />
                                </button>
                              </div>
                            )}
                            {order.status !== "pending" && (
                              <span className="text-xs text-zinc-600">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#111820] border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-[#111820] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-zinc-500 border-b border-white/5 bg-white/5">
                        <th className="text-left py-4 px-4">User ID</th>
                        <th className="text-left py-4 px-4">Name</th>
                        <th className="text-left py-4 px-4">Contact</th>
                        <th className="text-left py-4 px-4">KYC Status</th>
                        <th className="text-left py-4 px-4">Total Trades</th>
                        <th className="text-left py-4 px-4">Status</th>
                        <th className="text-left py-4 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-sm text-zinc-400 font-mono">{user.id}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                {user.name.charAt(0)}
                              </div>
                              <span className="text-sm text-white">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm text-zinc-300">{user.email}</p>
                              <p className="text-xs text-zinc-500">{user.phone}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                user.kycStatus === "verified"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : user.kycStatus === "pending"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {user.kycStatus === "verified" && <CheckCircle className="size-3" />}
                              {user.kycStatus === "pending" && <Clock className="size-3" />}
                              {user.kycStatus === "rejected" && <XCircle className="size-3" />}
                              {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-white font-medium">{user.totalTrades}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {user.status === "active" ? "Active" : "Blocked"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewUser(user)}
                                className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                title="View Details"
                              >
                                <Eye className="size-4" />
                              </button>
                              {user.status === "active" ? (
                                <button
                                  onClick={() => handleUserAction(user.id, "block")}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                  title="Block User"
                                >
                                  <Ban className="size-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(user.id, "unblock")}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                  title="Unblock User"
                                >
                                  <Unlock className="size-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Details Modal */}
              {viewUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#111820] border border-white/10 rounded-2xl w-full max-w-lg">
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                      <h3 className="text-lg font-semibold text-white">User Details</h3>
                      <button
                        onClick={() => setViewUser(null)}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        <X className="size-5" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                          {viewUser.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{viewUser.name}</h4>
                          <p className="text-sm text-zinc-500">User ID: {viewUser.id}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <InfoItem icon={Mail} label="Email" value={viewUser.email} />
                        <InfoItem icon={Building2} label="Phone" value={viewUser.phone} />
                        <InfoItem icon={FileText} label="KYC Status" value={viewUser.kycStatus} />
                        <InfoItem icon={ShoppingCart} label="Total Trades" value={viewUser.totalTrades.toString()} />
                        <InfoItem icon={Clock} label="Joined" value={viewUser.joinDate} />
                        <InfoItem icon={AlertCircle} label="Status" value={viewUser.status} />
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <h5 className="text-sm font-medium text-zinc-400 mb-3">Bank Accounts</h5>
                        <div className="p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CreditCard className="size-5 text-zinc-500" />
                            <div>
                              <p className="text-sm text-white">HDFC Bank - ****1234</p>
                              <p className="text-xs text-zinc-500">Primary Account</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rates Tab */}
          {activeTab === "rates" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Standard Rates */}
                <div className="bg-[#111820] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Standard Rates</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Buy Rate (INR per USDT)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input
                          type="number"
                          step="0.01"
                          value={buyRate}
                          onChange={(e) => setBuyRate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[#0a0f14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Sell Rate (INR per USDT)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input
                          type="number"
                          step="0.01"
                          value={sellRate}
                          onChange={(e) => setSellRate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[#0a0f14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <button className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                      Update Standard Rates
                    </button>
                  </div>
                </div>

                {/* VIP Rates */}
                <div className="bg-[#111820] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">VIP Rates</h3>
                    <button
                      onClick={() => setVipEnabled(!vipEnabled)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        vipEnabled
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-zinc-500/10 text-zinc-400"
                      }`}
                    >
                      {vipEnabled ? (
                        <ToggleRight className="size-4" />
                      ) : (
                        <ToggleLeft className="size-4" />
                      )}
                      {vipEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                  <div className={`space-y-4 ${!vipEnabled && "opacity-50 pointer-events-none"}`}>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        VIP Buy Rate (INR per USDT)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input
                          type="number"
                          step="0.01"
                          value={vipBuyRate}
                          onChange={(e) => setVipBuyRate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[#0a0f14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        VIP Sell Rate (INR per USDT)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input
                          type="number"
                          step="0.01"
                          value={vipSellRate}
                          onChange={(e) => setVipSellRate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[#0a0f14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <button className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-500/90 transition-colors">
                      Update VIP Rates
                    </button>
                  </div>
                </div>
              </div>

              {/* Rate Preview */}
              <div className="bg-[#111820] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Rate Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <p className="text-xs text-emerald-400 mb-1">Standard Buy</p>
                    <p className="text-2xl font-bold text-white">₹{buyRate}</p>
                  </div>
                  <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                    <p className="text-xs text-orange-400 mb-1">Standard Sell</p>
                    <p className="text-2xl font-bold text-white">₹{sellRate}</p>
                  </div>
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-400 mb-1">VIP Buy</p>
                    <p className="text-2xl font-bold text-white">₹{vipBuyRate}</p>
                  </div>
                  <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <p className="text-xs text-purple-400 mb-1">VIP Sell</p>
                    <p className="text-2xl font-bold text-white">₹{vipSellRate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div className="space-y-6">
              <div className="bg-[#111820] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-zinc-500 border-b border-white/5 bg-white/5">
                        <th className="text-left py-4 px-4">Request ID</th>
                        <th className="text-left py-4 px-4">User</th>
                        <th className="text-left py-4 px-4">Amount</th>
                        <th className="text-left py-4 px-4">Bank Details</th>
                        <th className="text-left py-4 px-4">Status</th>
                        <th className="text-left py-4 px-4">Date</th>
                        <th className="text-left py-4 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((wd) => (
                        <tr key={wd.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-sm text-zinc-400 font-mono">{wd.id}</td>
                          <td className="py-4 px-4 text-sm text-white">{wd.user}</td>
                          <td className="py-4 px-4">
                            <span className="text-lg font-semibold text-white">
                              ₹{wd.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm text-zinc-300">{wd.bankName}</p>
                              <p className="text-xs text-zinc-500">A/C: {wd.accountNo}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={wd.status} />
                          </td>
                          <td className="py-4 px-4 text-sm text-zinc-500">{wd.date}</td>
                          <td className="py-4 px-4">
                            {wd.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleWithdrawalAction(wd.id, "approve")}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                  title="Approve"
                                >
                                  <Check className="size-4" />
                                </button>
                                <button
                                  onClick={() => handleWithdrawalAction(wd.id, "reject")}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                  title="Reject"
                                >
                                  <X className="size-4" />
                                </button>
                              </div>
                            )}
                            {wd.status !== "pending" && (
                              <span className="text-xs text-zinc-600">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "primary" | "blue" | "orange" | "emerald" | "purple";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-400",
    orange: "bg-orange-500/10 text-orange-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <div className="bg-[#111820] border border-white/5 rounded-2xl p-5">
      <div className={`size-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-400",
    completed: "bg-emerald-500/10 text-emerald-400",
    approved: "bg-emerald-500/10 text-emerald-400",
    cancelled: "bg-red-500/10 text-red-400",
    rejected: "bg-red-500/10 text-red-400",
  };

  const icons = {
    pending: Clock,
    completed: CheckCircle,
    approved: CheckCircle,
    cancelled: XCircle,
    rejected: XCircle,
  };

  const Icon = icons[status as keyof typeof icons] || AlertCircle;
  const style = styles[status as keyof typeof styles] || "bg-zinc-500/10 text-zinc-400";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      <Icon className="size-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
      <Icon className="size-4 text-zinc-500" />
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}

// Missing Mail import alias
const Mail = AlertCircle;
