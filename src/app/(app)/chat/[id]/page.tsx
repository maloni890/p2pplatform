"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Info,
  MoreVertical,
  Paperclip,
  Send,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  AlertTriangle,
  X,
  Check,
  CheckCheck,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  isRead: boolean;
}

interface OrderInfo {
  id: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  total: number;
  status: "pending" | "paid" | "completed" | "cancelled" | "disputed";
}

export default function ChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [orderExpanded, setOrderExpanded] = useState(true);
  const [sellerName] = useState("CryptoKing_91");
  const [orderId] = useState("ORD-8472");
  const [orderInfo] = useState<OrderInfo>({
    id: "ORD-8472",
    type: "buy",
    amount: 500,
    price: 92.50,
    total: 46250,
    status: "paid",
  });

  useEffect(() => {
    // Mock messages
    const mockMessages: Message[] = [
      {
        id: "1",
        text: "Hi, I want to buy 500 USDT",
        timestamp: "10:30 AM",
        isMine: true,
        isRead: true,
      },
      {
        id: "2",
        text: "Sure! Please transfer INR 46,250 to my bank account. Details are in the order.",
        timestamp: "10:31 AM",
        isMine: false,
        isRead: true,
      },
      {
        id: "3",
        text: "Payment sent. Please check your account.",
        timestamp: "10:35 AM",
        isMine: true,
        isRead: true,
      },
      {
        id: "4",
        text: "Let me verify the payment...",
        timestamp: "10:36 AM",
        isMine: false,
        isRead: true,
      },
      {
        id: "5",
        text: "Payment received, releasing USDT now",
        timestamp: "10:38 AM",
        isMine: false,
        isRead: true,
      },
    ];
    setMessages(mockMessages);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMine: true,
      isRead: false,
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    inputRef.current?.focus();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-[#0ecb81] bg-[#0ecb81]/10";
      case "paid": return "text-[#1677ff] bg-[#1677ff]/10";
      case "pending": return "text-[#f0b90b] bg-[#f0b90b]/10";
      case "cancelled": return "text-[#7d8590] bg-[#7d8590]/10";
      case "disputed": return "text-[#f6465d] bg-[#f6465d]/10";
      default: return "text-[#7d8590] bg-[#7d8590]/10";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Top Bar - 44px */}
      <div className="sticky top-0 z-20 bg-[#0d1117] border-b border-[#21262d]">
        <div className="h-[44px] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 -ml-1">
              <ArrowLeft className="size-5 text-white" />
            </button>
            <div>
              <p className="text-[14px] font-bold text-white leading-tight">{sellerName}</p>
              <p className="text-[10px] text-[#7d8590]">Order #{orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2">
              <Info className="size-5 text-[#7d8590]" />
            </button>
            <button className="p-2">
              <MoreVertical className="size-5 text-[#7d8590]" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Summary Card (Pinned) */}
      <div className="bg-[#161b22] border-b border-[#21262d]">
        <button
          onClick={() => setOrderExpanded(!orderExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className={`text-[13px] font-semibold ${orderInfo.type === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
              {orderInfo.type === "buy" ? "Buy" : "Sell"} USDT
            </span>
            <span className="text-[13px] text-white font-medium">
              {orderInfo.amount.toLocaleString()} USDT
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(orderInfo.status)}`}>
              {getStatusLabel(orderInfo.status)}
            </span>
          </div>
          {orderExpanded ? (
            <ChevronUp className="size-4 text-[#7d8590]" />
          ) : (
            <ChevronDown className="size-4 text-[#7d8590]" />
          )}
        </button>
        
        {orderExpanded && (
          <div className="px-4 pb-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-[#7d8590]">Price</p>
              <p className="text-[12px] text-white font-medium">INR {orderInfo.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#7d8590]">Amount</p>
              <p className="text-[12px] text-white font-medium">{orderInfo.amount} USDT</p>
            </div>
            <div>
              <p className="text-[10px] text-[#7d8590]">Total</p>
              <p className="text-[12px] text-white font-medium">INR {orderInfo.total.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 ${
                  msg.isMine
                    ? "bg-[#1677ff] rounded-[12px_0_12px_12px]"
                    : "bg-[#161b22] rounded-[0_12px_12px_12px]"
                }`}
              >
                <p className="text-[13px] text-white whitespace-pre-wrap break-words">
                  {msg.text}
                </p>
                <div className={`flex items-center gap-1 mt-1 ${msg.isMine ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px] text-white/60">{msg.timestamp}</span>
                  {msg.isMine && (
                    msg.isRead ? (
                      <CheckCheck className="size-3 text-white/60" />
                    ) : (
                      <Check className="size-3 text-white/60" />
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 bg-[#0d1117] border-t border-[#21262d]">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] border border-[#21262d] rounded text-[11px] text-white whitespace-nowrap">
            <ImageIcon className="size-3.5" />
            Transfer Proof
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] border border-[#21262d] rounded text-[11px] text-white whitespace-nowrap">
            <AlertTriangle className="size-3.5" />
            Appeal
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] border border-[#21262d] rounded text-[11px] text-white whitespace-nowrap">
            <X className="size-3.5" />
            Cancel
          </button>
        </div>
      </div>

      {/* Bottom Input */}
      <div className="bg-[#161b22] border-t border-[#21262d] px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <button className="p-1.5">
            <Paperclip className="size-5 text-[#7d8590]" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-10 px-4 bg-[#0d1117] border border-[#21262d] rounded-full text-[13px] text-white placeholder:text-[#7d8590] focus:outline-none focus:border-[#f0b90b]"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`size-10 rounded-full flex items-center justify-center transition-colors ${
              newMessage.trim()
                ? "bg-[#f0b90b] text-[#0d1117]"
                : "bg-[#21262d] text-[#7d8590]"
            }`}
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
