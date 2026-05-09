"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.add("app-shell");
    document.body.classList.add("app-shell");
    return () => {
      document.documentElement.classList.remove("app-shell");
      document.body.classList.remove("app-shell");
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#0d1117" }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-[#f0b90b] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "#0d1117", fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 13 }}
    >
      {/* Scrollable content area above the bottom nav */}
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 52 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
