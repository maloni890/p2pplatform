"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, Check, Loader2 } from "lucide-react";

type AdType = "buy" | "sell";
type PriceType = "fixed" | "floating";

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI", color: "#3b82f6" },
  { id: "imps", name: "IMPS", color: "#f97316" },
  { id: "bank", name: "Bank Transfer", color: "#f0b90b" },
  { id: "gpay", name: "Google Pay", color: "#22c55e" },
  { id: "phonepe", name: "PhonePe", color: "#8b5cf6" },
  { id: "paytm", name: "Paytm", color: "#00baf2" },
];

const TIME_LIMITS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "60 minutes" },
];

export default function PostAdPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [adType, setAdType] = useState<AdType>("sell");
  const [priceType, setPriceType] = useState<PriceType>("fixed");
  const [price, setPrice] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [minLimit, setMinLimit] = useState("");
  const [maxLimit, setMaxLimit] = useState("");
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState(15);
  const [autoReply, setAutoReply] = useState("");
  const [terms, setTerms] = useState("");
  const [showTimeLimitDropdown, setShowTimeLimitDropdown] = useState(false);

  const togglePayment = (id: string) => {
    setSelectedPayments((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!price || !totalAmount || !minLimit || !maxLimit || selectedPayments.length === 0) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: adType,
          priceType,
          price: parseFloat(price),
          totalAmount: parseFloat(totalAmount),
          minLimit: parseFloat(minLimit),
          maxLimit: parseFloat(maxLimit),
          paymentMethods: selectedPayments,
          timeLimit,
          autoReply,
          terms,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/p2p");
      } else {
        alert(data.error || "Failed to post ad");
      }
    } catch {
      alert("Failed to post ad");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* TOP BAR */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 44, background: "#0d1117", borderBottom: "1px solid #21262d" }}
      >
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ChevronLeft size={22} color="#e6edf3" />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3" }}>Post Ad</span>
        <div style={{ width: 22 }} />
      </div>

      {/* FORM */}
      <div className="p-4 pb-24 space-y-5">
        {/* Ad Type */}
        <div>
          <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
            I want to
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setAdType("buy")}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 600,
                color: adType === "buy" ? "#fff" : "#7d8590",
                background: adType === "buy" ? "#0ecb81" : "#161b22",
                border: adType === "buy" ? "none" : "1px solid #21262d",
              }}
            >
              Buy USDT
            </button>
            <button
              onClick={() => setAdType("sell")}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 600,
                color: adType === "sell" ? "#fff" : "#7d8590",
                background: adType === "sell" ? "#f6465d" : "#161b22",
                border: adType === "sell" ? "none" : "1px solid #21262d",
              }}
            >
              Sell USDT
            </button>
          </div>
        </div>

        {/* Asset & Currency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
              Asset
            </label>
            <div
              className="flex items-center justify-between px-3"
              style={{
                height: 40,
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 13, color: "#e6edf3" }}>USDT</span>
              <ChevronDown size={16} color="#7d8590" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
              Currency
            </label>
            <div
              className="flex items-center justify-between px-3"
              style={{
                height: 40,
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 13, color: "#e6edf3" }}>INR</span>
              <ChevronDown size={16} color="#7d8590" />
            </div>
          </div>
        </div>

        {/* Price Type */}
        <div>
          <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
            Price Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setPriceType("fixed")}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
                color: priceType === "fixed" ? "#e6edf3" : "#7d8590",
                background: priceType === "fixed" ? "#21262d" : "#161b22",
                border: priceType === "fixed" ? "1px solid #f0b90b" : "1px solid #21262d",
              }}
            >
              Fixed
            </button>
            <button
              onClick={() => setPriceType("floating")}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
                color: priceType === "floating" ? "#e6edf3" : "#7d8590",
                background: priceType === "floating" ? "#21262d" : "#161b22",
                border: priceType === "floating" ? "1px solid #f0b90b" : "1px solid #21262d",
              }}
            >
              Floating
            </button>
          </div>
        </div>

        {/* Price */}
        <div>
          <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
            Price (INR per USDT)
          </label>
          <div
            className="flex items-center px-3"
            style={{
              height: 44,
              background: "#161b22",
              border: "1px solid #21262d",
              borderRadius: 4,
            }}
          >
            <span style={{ fontSize: 14, color: "#7d8590", marginRight: 8 }}>₹</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 15,
                color: "#e6edf3",
              }}
            />
          </div>
        </div>

        {/* Total Amount */}
        <div>
          <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
            Total Amount (USDT)
          </label>
          <div
            className="flex items-center px-3"
            style={{
              height: 44,
              background: "#161b22",
              border: "1px solid #21262d",
              borderRadius: 4,
            }}
          >
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 15,
                color: "#e6edf3",
              }}
            />
            <span style={{ fontSize: 13, color: "#7d8590" }}>USDT</span>
          </div>
        </div>

        {/* Order Limits */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
              Min Order (INR)
            </label>
            <div
              className="flex items-center px-3"
              style={{
                height: 40,
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 13, color: "#7d8590", marginRight: 4 }}>₹</span>
              <input
                type="number"
                value={minLimit}
                onChange={(e) => setMinLimit(e.target.value)}
                placeholder="1,000"
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
          <div>
            <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
              Max Order (INR)
            </label>
            <div
              className="flex items-center px-3"
              style={{
                height: 40,
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 13, color: "#7d8590", marginRight: 4 }}>₹</span>
              <input
                type="number"
                value={maxLimit}
                onChange={(e) => setMaxLimit(e.target.value)}
                placeholder="100,000"
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
        </div>

        {/* Payment Methods */}
        <div>
          <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
            Payment Methods
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => togglePayment(pm.id)}
                className="flex items-center justify-between px-3"
                style={{
                  height: 40,
                  borderRadius: 4,
                  fontSize: 12,
                  color: selectedPayments.includes(pm.id) ? "#e6edf3" : "#7d8590",
                  background: selectedPayments.includes(pm.id) ? "#21262d" : "#161b22",
                  border: selectedPayments.includes(pm.id) ? `1px solid ${pm.color}` : "1px solid #21262d",
                }}
              >
                <div className="flex items-center gap-2">
                  <div style={{ width: 3, height: 14, background: pm.color, borderRadius: 2 }} />
                  <span>{pm.name}</span>
                </div>
                {selectedPayments.includes(pm.id) && <Check size={14} color={pm.color} />}
              </button>
            ))}
          </div>
        </div>

        {/* Time Limit */}
        <div>
          <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
            Payment Time Limit
          </label>
          <div className="relative">
            <button
              onClick={() => setShowTimeLimitDropdown(!showTimeLimitDropdown)}
              className="flex items-center justify-between w-full px-3"
              style={{
                height: 40,
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 13, color: "#e6edf3" }}>
                {TIME_LIMITS.find((t) => t.value === timeLimit)?.label}
              </span>
              <ChevronDown size={16} color="#7d8590" />
            </button>
            {showTimeLimitDropdown && (
              <div
                className="absolute left-0 right-0 mt-1 rounded overflow-hidden z-10"
                style={{ background: "#161b22", border: "1px solid #21262d" }}
              >
                {TIME_LIMITS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => {
                      setTimeLimit(t.value);
                      setShowTimeLimitDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#21262d]"
                    style={{
                      fontSize: 13,
                      color: timeLimit === t.value ? "#f0b90b" : "#e6edf3",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Auto Reply */}
        <div>
          <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
            Auto Reply Message (Optional)
          </label>
          <textarea
            value={autoReply}
            onChange={(e) => setAutoReply(e.target.value)}
            placeholder="This message will be sent automatically when a trade starts..."
            rows={3}
            style={{
              width: "100%",
              padding: 12,
              background: "#161b22",
              border: "1px solid #21262d",
              borderRadius: 4,
              fontSize: 13,
              color: "#e6edf3",
              resize: "none",
            }}
          />
        </div>

        {/* Terms */}
        <div>
          <label style={{ fontSize: 12, color: "#7d8590", display: "block", marginBottom: 8 }}>
            Terms & Conditions (Optional)
          </label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Add any specific requirements for trading with you..."
            rows={3}
            style={{
              width: "100%",
              padding: 12,
              background: "#161b22",
              border: "1px solid #21262d",
              borderRadius: 4,
              fontSize: 13,
              color: "#e6edf3",
              resize: "none",
            }}
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div
        className="fixed left-0 right-0 p-4"
        style={{ bottom: 52, background: "#0d1117", borderTop: "1px solid #21262d" }}
      >
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-full"
          style={{
            height: 44,
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 700,
            color: "#000",
            background: "#f0b90b",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Post Ad
        </button>
      </div>
    </div>
  );
}
