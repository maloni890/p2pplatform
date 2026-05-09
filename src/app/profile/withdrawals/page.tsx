"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Landmark,
} from "lucide-react";

interface Withdrawal {
  id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  created_at: string;
  completed_at?: string;
}

const DEMO_WITHDRAWALS: Withdrawal[] = [
  {
    id: "WD-2026-001",
    amount: 46225,
    bank_name: "HDFC Bank",
    account_number: "XXXX1234",
    status: "COMPLETED",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "WD-2026-002",
    amount: 92450,
    bank_name: "HDFC Bank",
    account_number: "XXXX1234",
    status: "PENDING",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "WD-2026-003",
    amount: 69337,
    bank_name: "SBI",
    account_number: "XXXX5678",
    status: "COMPLETED",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "WD-2026-004",
    amount: 23112,
    bank_name: "HDFC Bank",
    account_number: "XXXX1234",
    status: "FAILED",
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Processing",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  COMPLETED: {
    label: "Credited",
    icon: CheckCircle2,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

export default function WithdrawalsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [withdrawals] = useState<Withdrawal[]>(DEMO_WITHDRAWALS);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stats
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "COMPLETED")
    .reduce((sum, w) => sum + w.amount, 0);
  const pendingAmount = withdrawals
    .filter((w) => w.status === "PENDING")
    .reduce((sum, w) => sum + w.amount, 0);

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
          <h1 className="text-2xl font-bold text-white">Withdrawal History</h1>
          <p className="text-white/70 text-sm mt-1">
            Track your INR withdrawals
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Withdrawn</p>
            <p className="text-xl font-bold text-foreground">
              {totalWithdrawn.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="text-xl font-bold text-amber-600">
              {pendingAmount.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="space-y-3">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-card rounded-2xl border border-border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <ArrowDownRight className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {withdrawal.amount.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {withdrawal.id}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${STATUS_CONFIG[withdrawal.status].className}`}
                >
                  {STATUS_CONFIG[withdrawal.status].label}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Landmark className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground">
                      {withdrawal.bank_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      A/C: {withdrawal.account_number}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Requested: {formatDate(withdrawal.created_at)}
                </p>
                {withdrawal.completed_at && (
                  <p className="text-xs text-primary">
                    Credited: {formatDate(withdrawal.completed_at)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {withdrawals.length === 0 && (
          <div className="text-center py-12">
            <ArrowDownRight className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No withdrawals yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
