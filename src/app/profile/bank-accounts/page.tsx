"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Landmark,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder: string;
  is_primary: boolean;
}

const DEMO_ACCOUNTS: BankAccount[] = [
  {
    id: "1",
    bank_name: "HDFC Bank",
    account_number: "XXXX XXXX 1234",
    ifsc_code: "HDFC0001234",
    account_holder: "John Doe",
    is_primary: true,
  },
  {
    id: "2",
    bank_name: "SBI",
    account_number: "XXXX XXXX 5678",
    ifsc_code: "SBIN0001234",
    account_holder: "John Doe",
    is_primary: false,
  },
];

export default function BankAccountsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [accounts, setAccounts] = useState<BankAccount[]>(DEMO_ACCOUNTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleAddAccount = async () => {
    if (
      !newAccount.bank_name ||
      !newAccount.account_number ||
      !newAccount.ifsc_code ||
      !newAccount.account_holder
    ) {
      toast.error("Please fill all fields");
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const account: BankAccount = {
      id: Date.now().toString(),
      ...newAccount,
      is_primary: accounts.length === 0,
    };

    setAccounts([...accounts, account]);
    setShowAddModal(false);
    setNewAccount({
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      account_holder: "",
    });
    setSaving(false);
    toast.success("Bank account added successfully");
  };

  const handleDelete = (id: string) => {
    setAccounts(accounts.filter((a) => a.id !== id));
    toast.success("Bank account removed");
  };

  const handleSetPrimary = (id: string) => {
    setAccounts(
      accounts.map((a) => ({
        ...a,
        is_primary: a.id === id,
      }))
    );
    toast.success("Primary account updated");
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
      <div className="bg-gradient-to-r from-primary to-emerald-600 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Bank Accounts</h1>
          <p className="text-white/70 text-sm mt-1">
            Manage your linked bank accounts
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* Add Account Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full mb-4 py-4 bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="size-5" />
          Add New Bank Account
        </button>

        {/* Account List */}
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-card rounded-2xl border border-border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Landmark className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {account.bank_name}
                      </h3>
                      {account.is_primary && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {account.account_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      IFSC: {account.ifsc_code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {account.account_holder}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!account.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(account.id)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Set as primary"
                    >
                      <CheckCircle2 className="size-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <Landmark className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No bank accounts added yet</p>
          </div>
        )}
      </main>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-card rounded-t-3xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Add Bank Account
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={newAccount.bank_name}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, bank_name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g., HDFC Bank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={newAccount.account_number}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        account_number: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={newAccount.ifsc_code}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        ifsc_code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g., HDFC0001234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={newAccount.account_holder}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        account_holder: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Name as per bank records"
                  />
                </div>

                <button
                  onClick={handleAddAccount}
                  disabled={saving}
                  className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="size-5" />
                      Add Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
