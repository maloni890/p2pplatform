"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, ClipboardList, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",   href: "/home",    icon: Home },
  { label: "P2P",    href: "/p2p",     icon: ArrowLeftRight },
  { label: "Orders", href: "/orders",  icon: ClipboardList },
  { label: "Chat",   href: "/chat",    icon: MessageCircle },
  { label: "Profile",href: "/profile", icon: User },
];

export default function BottomNav({ chatBadge = 0 }: { chatBadge?: number }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        height: 52,
        background: "#0d1117",
        borderTop: "1px solid #21262d",
      }}
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/home" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            style={{ color: active ? "#e6edf3" : "#7d8590" }}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={active ? 2 : 1.5} />
              {label === "Chat" && chatBadge > 0 && (
                <span
                  className="absolute -top-1 -right-1.5 flex items-center justify-center rounded-full text-white font-bold"
                  style={{
                    minWidth: 16,
                    height: 16,
                    fontSize: 9,
                    background: "#4d7cfe",
                    padding: "0 3px",
                  }}
                >
                  {chatBadge > 99 ? "99+" : chatBadge}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, lineHeight: 1 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
