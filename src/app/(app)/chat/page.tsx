"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, MessageCircle } from "lucide-react";

const MOCK_CHATS = [
  {
    id: "1", name: "Rahul Kumar", initials: "RK", online: true,
    lastMsg: "Payment sent, please check.", time: "2m ago", unread: 2, orderId: "ORD-001",
  },
  {
    id: "2", name: "Support Team", initials: "SE", online: true,
    lastMsg: "How can we help you today?", time: "1h ago", unread: 0, orderId: null,
  },
  {
    id: "3", name: "Priya Shah", initials: "PS", online: false,
    lastMsg: "Trade completed successfully.", time: "Yesterday", unread: 0, orderId: "ORD-002",
  },
];

export default function ChatPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_CHATS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "#0d1117", minHeight: "100%", fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 13 }}>

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 44, background: "#0d1117", borderBottom: "1px solid #21262d" }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3" }}>Messages</span>
      </div>

      {/* ── SEARCH ──────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="flex items-center gap-2 px-3"
          style={{ height: 36, background: "#161b22", border: "1px solid #21262d", borderRadius: 4 }}
        >
          <Search size={14} color="#7d8590" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#e6edf3" }}
          />
        </div>
      </div>

      {/* ── CHAT LIST ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <MessageCircle size={40} color="#21262d" />
          <p style={{ fontSize: 14, color: "#7d8590" }}>No conversations yet</p>
          <Link
            href="/p2p"
            style={{ padding: "8px 20px", background: "#f0b90b", color: "#000", borderRadius: 4, fontSize: 13, fontWeight: 600 }}
          >
            Start a Trade
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {filtered.map((chat, idx) => (
            <Link
              key={chat.id}
              href={chat.orderId ? `/trade/${chat.orderId}` : "/profile/support"}
              style={{ textDecoration: "none" }}
            >
              <div
                className="flex items-center gap-3 px-4"
                style={{
                  height: 72,
                  borderBottom: idx < filtered.length - 1 ? "1px solid #21262d" : "none",
                  background: "#0d1117",
                }}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 44, height: 44, background: "#21262d", fontSize: 14, fontWeight: 700, color: "#e6edf3" }}
                  >
                    {chat.initials}
                  </div>
                  {chat.online && (
                    <span
                      className="absolute bottom-0 right-0 rounded-full border-2"
                      style={{ width: 10, height: 10, background: "#0ecb81", borderColor: "#0d1117" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>{chat.name}</span>
                    <span style={{ fontSize: 11, color: "#484f58" }}>{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span
                      style={{
                        fontSize: 12,
                        color: "#7d8590",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "80%",
                      }}
                    >
                      {chat.lastMsg}
                    </span>
                    {chat.unread > 0 && (
                      <span
                        className="flex items-center justify-center rounded-full text-black font-bold ml-2 shrink-0"
                        style={{ minWidth: 18, height: 18, fontSize: 10, background: "#f0b90b", padding: "0 4px" }}
                      >
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  {chat.orderId && (
                    <span style={{ fontSize: 10, color: "#484f58" }}>Order #{chat.orderId}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
