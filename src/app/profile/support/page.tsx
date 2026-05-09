"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  HelpCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

const TICKET_CATEGORIES = [
  { id: "payment_issue", label: "Payment Issue", icon: AlertTriangle },
  { id: "trade_problem", label: "Trade Problem", icon: FileText },
  { id: "kyc_verification", label: "KYC Verification", icon: CheckCircle2 },
  { id: "account", label: "Account Issue", icon: HelpCircle },
  { id: "urgent", label: "Urgent", icon: AlertTriangle },
  { id: "other", label: "Other", icon: MessageSquare },
];

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  priority: string;
  admin_reply: string | null;
  created_at: string;
  replied_at: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  in_progress: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  resolved: "bg-green-500/15 text-green-400 border-green-500/30",
  closed: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export default function SupportPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<"contact" | "ticket" | "my_tickets">("contact");
  const [ticketForm, setTicketForm] = useState({
    category: "",
    subject: "",
    message: "",
    orderId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!user?.email) return;
    setLoadingTickets(true);
    try {
      const res = await fetch(`/api/support?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user && activeTab === "my_tickets") {
      fetchTickets();
    }
  }, [user, activeTab, fetchTickets]);

  const handleWhatsApp = () => {
    window.open("https://wa.me/919876543210?text=Hi, I need help with SwapEase", "_blank");
  };

  const handleCall = () => {
    window.location.href = "tel:+919876543210";
  };

  const handleEmail = () => {
    window.location.href = "mailto:support@swapease.com";
  };

  const handleSubmitTicket = async () => {
    if (!ticketForm.category || !ticketForm.subject || !ticketForm.message) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name || user?.username,
          userEmail: user?.email,
          userPhone: user?.phone,
          subject: ticketForm.subject,
          category: ticketForm.category,
          message: ticketForm.message,
          orderId: ticketForm.orderId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Ticket ${data.ticket.ticket_number} created successfully!`);
        setTicketForm({ category: "", subject: "", message: "", orderId: "" });
        setActiveTab("my_tickets");
        fetchTickets();
      } else {
        toast.error(data.error || "Failed to create ticket");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryLabel = (cat: string) => {
    return TICKET_CATEGORIES.find((c) => c.id === cat)?.label || cat;
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

      <div className="relative z-10">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-[#8b5cf6] px-4 py-6">
        <div className="max-w-lg mx-auto">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span className="text-[13px]">Back to Profile</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Support</h1>
          <p className="text-white/70 text-[11px] mt-1">
            Get help via WhatsApp or raise a ticket
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-3 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 py-2 px-2 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === "contact"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => setActiveTab("ticket")}
            className={`flex-1 py-2 px-2 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === "ticket"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            New Ticket
          </button>
          <button
            onClick={() => setActiveTab("my_tickets")}
            className={`flex-1 py-2 px-2 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === "my_tickets"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Tickets
          </button>
        </div>

        {activeTab === "contact" ? (
          <>
            {/* WhatsApp - Primary */}
            <button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] rounded-xl p-4 text-white text-left hover:bg-[#20BD5A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[14px]">Chat on WhatsApp</h3>
                  <p className="text-white/80 text-[11px]">Fastest way to get support</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-[10px]">
                <Clock className="size-3" />
                Available 24/7 - Typical response: 5 mins
              </div>
            </button>

            {/* Other Contact Options */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCall}
                className="bg-card rounded-xl border border-border p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Phone className="size-4" />
                </div>
                <h3 className="font-semibold text-[12px] text-foreground">Call Us</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">+91 98765 43210</p>
              </button>

              <button
                onClick={handleEmail}
                className="bg-card rounded-xl border border-border p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Mail className="size-4" />
                </div>
                <h3 className="font-semibold text-[12px] text-foreground">Email</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">support@swapease.com</p>
              </button>
            </div>

            {/* Support Hours */}
            <div className="bg-muted/50 rounded-xl p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="size-3 text-muted-foreground" />
                <span className="text-[11px] font-medium text-foreground">Support Hours</span>
              </div>
              <p className="text-[10px] text-muted-foreground">WhatsApp: 24/7 availability</p>
              <p className="text-[10px] text-muted-foreground">Phone: Mon-Sat, 9 AM - 9 PM IST</p>
              <p className="text-[10px] text-muted-foreground">Email: Response within 24 hours</p>
            </div>
          </>
        ) : activeTab === "ticket" ? (
          <>
            {/* Ticket Form */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TICKET_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setTicketForm({ ...ticketForm, category: cat.id })}
                      className={`flex items-center gap-1.5 p-2 rounded-lg border transition-colors ${
                        ticketForm.category === cat.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <cat.icon className="size-3" />
                      <span className="text-[10px] font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order ID (optional) */}
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Order ID (optional)
                </label>
                <input
                  type="text"
                  value={ticketForm.orderId}
                  onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., ORD-ABC123"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Message *
                </label>
                <textarea
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitTicket}
                disabled={submitting}
                className="w-full py-2.5 bg-primary text-white text-[12px] font-semibold rounded-full hover:bg-[#5d8cff] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* My Tickets */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[13px] font-semibold text-foreground">My Tickets</h2>
              <button
                onClick={fetchTickets}
                disabled={loadingTickets}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <RefreshCw className={`size-4 text-muted-foreground ${loadingTickets ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingTickets ? (
              <div className="flex justify-center py-8">
                <div className="size-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <MessageSquare className="size-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-[12px] text-muted-foreground mb-3">No tickets yet</p>
                <button
                  onClick={() => setActiveTab("ticket")}
                  className="px-4 py-2 bg-primary text-white text-[11px] font-semibold rounded-full"
                >
                  Create New Ticket
                </button>
              </div>
            ) : selectedTicket ? (
              /* Ticket Detail View */
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-3 border-b border-border">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="inline-flex items-center gap-1 text-[11px] text-primary mb-2"
                  >
                    <ArrowLeft className="size-3" />
                    Back to list
                  </button>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{selectedTicket.ticket_number}</p>
                      <h3 className="text-[13px] font-semibold text-foreground">{selectedTicket.subject}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.open}`}>
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-muted rounded-full text-[9px] text-muted-foreground">
                      {getCategoryLabel(selectedTicket.category)}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {formatDate(selectedTicket.created_at)}
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  {/* User message */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground mb-1">Your message</p>
                    <p className="text-[11px] text-foreground whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>

                  {/* Admin reply */}
                  {selectedTicket.admin_reply && (
                    <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                      <p className="text-[10px] text-primary mb-1">Support Reply</p>
                      <p className="text-[11px] text-foreground whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
                      {selectedTicket.replied_at && (
                        <p className="text-[9px] text-muted-foreground mt-2">
                          {formatDate(selectedTicket.replied_at)}
                        </p>
                      )}
                    </div>
                  )}

                  {!selectedTicket.admin_reply && selectedTicket.status === "open" && (
                    <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                      <p className="text-[11px] text-amber-400">Waiting for support response...</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Tickets List */
              <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] text-muted-foreground">{ticket.ticket_number}</span>
                          {ticket.priority === "high" && (
                            <span className="px-1.5 py-0.5 bg-red-500/15 text-red-400 rounded text-[8px] font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-foreground truncate">{ticket.subject}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(ticket.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-medium border ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                    {ticket.admin_reply && (
                      <div className="mt-2 flex items-center gap-1 text-[9px] text-primary">
                        <CheckCircle2 className="size-3" />
                        Reply received
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
