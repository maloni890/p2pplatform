"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  CreditCard,
  User,
} from "lucide-react";

interface KYCDocument {
  type: "aadhaar" | "pan";
  status: "pending" | "verified" | "rejected" | "not_uploaded";
  number?: string;
  uploaded_at?: string;
}

export default function KYCPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [documents, setDocuments] = useState<KYCDocument[]>([
    { type: "aadhaar", status: "not_uploaded" },
    { type: "pan", status: "not_uploaded" },
  ]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleUpload = async (type: "aadhaar" | "pan") => {
    const number = type === "aadhaar" ? aadhaarNumber : panNumber;

    if (type === "aadhaar" && !/^\d{12}$/.test(aadhaarNumber)) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    if (type === "pan" && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) {
      toast.error("Please enter a valid PAN number (e.g., ABCDE1234F)");
      return;
    }

    setUploading(type);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setDocuments(
      documents.map((doc) =>
        doc.type === type
          ? { ...doc, status: "pending", number, uploaded_at: new Date().toISOString() }
          : doc
      )
    );
    setUploading(null);
    toast.success(`${type === "aadhaar" ? "Aadhaar" : "PAN"} submitted for verification`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            <CheckCircle2 className="size-3" />
            Verified
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 text-xs font-medium rounded-full">
            <Clock className="size-3" />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 text-xs font-medium rounded-full">
            <AlertCircle className="size-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
            Not Uploaded
          </span>
        );
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const aadhaarDoc = documents.find((d) => d.type === "aadhaar");
  const panDoc = documents.find((d) => d.type === "pan");

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
          <h1 className="text-2xl font-bold text-white">KYC Verification</h1>
          <p className="text-white/70 text-sm mt-1">
            Complete your identity verification
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              Verification Progress
            </span>
            <span className="text-sm text-muted-foreground">
              {documents.filter((d) => d.status === "verified").length}/2
              Completed
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${(documents.filter((d) => d.status === "verified").length / 2) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Aadhaar Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <User className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Aadhaar Card</h3>
                  <p className="text-xs text-muted-foreground">
                    Government ID Proof
                  </p>
                </div>
              </div>
              {getStatusBadge(aadhaarDoc?.status || "not_uploaded")}
            </div>
          </div>

          {aadhaarDoc?.status === "not_uploaded" ||
          aadhaarDoc?.status === "rejected" ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) =>
                    setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))
                  }
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Enter 12-digit Aadhaar number"
                />
              </div>

              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload Aadhaar front & back images
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="aadhaar-upload"
                />
                <label
                  htmlFor="aadhaar-upload"
                  className="inline-block mt-3 px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                >
                  Choose Files
                </label>
              </div>

              <button
                onClick={() => handleUpload("aadhaar")}
                disabled={uploading === "aadhaar"}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading === "aadhaar" ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="size-5" />
                    Submit Aadhaar
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Number:</span>
                <span className="font-mono text-foreground">
                  XXXX XXXX {aadhaarDoc?.number?.slice(-4) || "XXXX"}
                </span>
              </div>
              {aadhaarDoc?.uploaded_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Submitted on{" "}
                  {new Date(aadhaarDoc.uploaded_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* PAN Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <CreditCard className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">PAN Card</h3>
                  <p className="text-xs text-muted-foreground">
                    Tax Identification
                  </p>
                </div>
              </div>
              {getStatusBadge(panDoc?.status || "not_uploaded")}
            </div>
          </div>

          {panDoc?.status === "not_uploaded" || panDoc?.status === "rejected" ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) =>
                    setPanNumber(e.target.value.toUpperCase().slice(0, 10))
                  }
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Enter PAN (e.g., ABCDE1234F)"
                />
              </div>

              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload PAN card image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="pan-upload"
                />
                <label
                  htmlFor="pan-upload"
                  className="inline-block mt-3 px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                >
                  Choose File
                </label>
              </div>

              <button
                onClick={() => handleUpload("pan")}
                disabled={uploading === "pan"}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading === "pan" ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="size-5" />
                    Submit PAN
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Number:</span>
                <span className="font-mono text-foreground">
                  {panDoc?.number?.slice(0, 2)}XXX{panDoc?.number?.slice(-3)}
                </span>
              </div>
              {panDoc?.uploaded_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Submitted on{" "}
                  {new Date(panDoc.uploaded_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
          <h4 className="font-semibold text-foreground mb-2">
            Why is KYC required?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Compliance with RBI regulations</li>
            <li>- Secure your account from fraud</li>
            <li>- Enable higher transaction limits</li>
            <li>- Faster withdrawals to bank account</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
