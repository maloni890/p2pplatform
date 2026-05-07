"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const TICKET_CATEGORIES = [
  { id: "payment", label: "Payment Issue", icon: AlertTriangle },
  { id: "trade", label: "Trade Problem", icon: FileText },
  { id: "kyc", label: "KYC Verification", icon: CheckCircle2 },
  { id: "other", label: "Other", icon: HelpCircle },
];

export default function SupportPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<"contact" | "ticket">("contact");
  const [ticketForm, setTicketForm] = useState({
    category: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

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
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Support ticket submitted! We'll get back to you soon.");
    setTicketForm({ category: "", subject: "", message: "" });
    setSubmitting(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-white/70 text-sm mt-1">
            Get help via WhatsApp or raise a ticket
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-card rounded-xl p-1 border border-border">
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "contact"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Contact Us
          </button>
          <button
            onClick={() => setActiveTab("ticket")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "ticket"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Raise Ticket
          </button>
        </div>

        {activeTab === "contact" ? (
          <>
            {/* WhatsApp - Primary */}
            <button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] rounded-2xl p-6 text-white text-left hover:bg-[#20BD5A] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="size-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Chat on WhatsApp</h3>
                  <p className="text-white/80 text-sm">
                    Fastest way to get support
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-sm">
                <Clock className="size-4" />
                Available 24/7 - Typical response: 5 mins
              </div>
            </button>

            {/* Other Contact Options */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCall}
                className="bg-card rounded-2xl border border-border p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <Phone className="size-6" />
                </div>
                <h3 className="font-semibold text-foreground">Call Us</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  +91 98765 43210
                </p>
              </button>

              <button
                onClick={handleEmail}
                className="bg-card rounded-2xl border border-border p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <Mail className="size-6" />
                </div>
                <h3 className="font-semibold text-foreground">Email</h3>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  support@swapease.com
                </p>
              </button>
            </div>

            {/* Support Hours */}
            <div className="bg-muted/50 rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Support Hours
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                WhatsApp: 24/7 availability
              </p>
              <p className="text-sm text-muted-foreground">
                Phone: Mon-Sat, 9 AM - 9 PM IST
              </p>
              <p className="text-sm text-muted-foreground">
                Email: Response within 24 hours
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Ticket Form */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TICKET_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setTicketForm({ ...ticketForm, category: cat.id })
                      }
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
                        ticketForm.category === cat.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <cat.icon className="size-4" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  value={ticketForm.message}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, message: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitTicket}
                disabled={submitting}
                className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-5" />
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
