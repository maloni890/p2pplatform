"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  MessageSquare,
  ShieldCheck,
  Lock,
  Star,
  User,
} from "lucide-react";

interface ChatConversation {
  id: string;
  username: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isVerified: boolean;
  isMerchant: boolean;
  isEncrypted: boolean;
  orderId?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = "SwapUser";

  useEffect(() => {
    const mockConversations: ChatConversation[] = [
      {
        id: "1",
        username: "CryptoKing_91",
        lastMessage: "Payment received, releasing USDT now",
        timestamp: "2 min ago",
        unreadCount: 2,
        isVerified: true,
        isMerchant: true,
        isEncrypted: true,
        orderId: "ORD-8472",
      },
      {
        id: "2",
        username: "USDTTrader",
        lastMessage: "Please confirm your bank details",
        timestamp: "15 min ago",
        unreadCount: 0,
        isVerified: true,
        isMerchant: false,
        isEncrypted: true,
        orderId: "ORD-8456",
      },
      {
        id: "3",
        username: "FastExchange",
        lastMessage: "Order completed successfully!",
        timestamp: "1 hour ago",
        unreadCount: 0,
        isVerified: true,
        isMerchant: true,
        isEncrypted: false,
      },
      {
        id: "4",
        username: "NewBuyer_22",
        lastMessage: "Hi, is this ad still available?",
        timestamp: "3 hours ago",
        unreadCount: 1,
        isVerified: false,
        isMerchant: false,
        isEncrypted: false,
      },
      {
        id: "5",
        username: "P2PMaster",
        lastMessage: "Thanks for the smooth transaction",
        timestamp: "Yesterday",
        unreadCount: 0,
        isVerified: true,
        isMerchant: true,
        isEncrypted: true,
        orderId: "ORD-8401",
      },
    ];
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 300);
  }, []);

  const filteredConversations = conversations.filter((conv) =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0d1117] pb-[52px]">
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(77,124,254,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Bar - 44px */}
      <div className="sticky top-0 z-20 bg-[#0d1117] border-b border-[#21262d]">
        <div className="h-[44px] flex items-center justify-between px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="size-5 text-white" />
          </button>
          <span className="text-[15px] font-bold text-white">P2P Message</span>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-[#161b22] flex items-center justify-center">
              <User className="size-4 text-[#7d8590]" />
            </div>
            <button className="size-7 rounded-full bg-[#161b22] flex items-center justify-center">
              <Plus className="size-4 text-[#7d8590]" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7d8590]" />
          <input
            type="text"
            placeholder="Search by nickname"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-10 pr-4 bg-[#161b22] border border-[#21262d] rounded text-[13px] text-white placeholder:text-[#7d8590] focus:outline-none focus:border-[#f0b90b]"
          />
        </div>
      </div>

      {/* Go to Main Chat - Special Item */}
      <Link
        href="/chat/main"
        className="flex items-center gap-3 px-4 py-4 border-b border-[#21262d] hover:bg-[#161b22] transition-colors"
      >
        <div className="size-11 rounded-full bg-[#1677ff]/20 flex items-center justify-center">
          <MessageSquare className="size-5 text-[#1677ff]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-white">Go to Main Chat</p>
          <p className="text-[12px] text-[#7d8590]">Chat as {currentUser}</p>
        </div>
      </Link>

      {/* Chat List */}
      <div className="divide-y divide-[#21262d]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-6 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="size-12 text-[#7d8590] mx-auto mb-3 opacity-40" />
            <p className="text-[13px] text-[#7d8590]">No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className="flex items-center gap-3 px-4 h-[72px] hover:bg-[#161b22] transition-colors"
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className={`size-11 rounded-full flex items-center justify-center text-[15px] font-bold ${
                    conv.isMerchant
                      ? "bg-[#f0b90b]/20 text-[#f0b90b]"
                      : "bg-[#1677ff]/20 text-[#1677ff]"
                  }`}
                >
                  {conv.isMerchant ? (
                    <ShieldCheck className="size-5" />
                  ) : (
                    formatInitial(conv.username)
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-white truncate">
                    {conv.username}
                  </span>
                  {conv.isVerified && (
                    <Star className="size-3 text-[#f0b90b] fill-[#f0b90b]" />
                  )}
                  {conv.isEncrypted && (
                    <Lock className="size-3 text-[#0ecb81]" />
                  )}
                </div>
                <p className="text-[12px] text-[#7d8590] truncate mt-0.5">
                  {conv.lastMessage}
                </p>
              </div>

              {/* Right Side */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[11px] text-[#7d8590]">{conv.timestamp}</span>
                {conv.unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1.5 bg-[#f0b90b] text-[#0d1117] text-[11px] font-bold rounded-full flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
    </div>
    </div>
  );
}
