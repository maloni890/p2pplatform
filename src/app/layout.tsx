import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwapEase — Buy & Sell USDT | Get INR Instantly",
  description:
    "India's fastest P2P USDT trading platform. Buy and sell USDT directly with INR. Instant payout, 100% secure, zero fees, best rates.",
  keywords: ["USDT", "P2P trading", "crypto", "buy USDT", "sell USDT", "INR", "India", "instant payout"],
};

export const viewport: Viewport = {
  themeColor: "#0d0d1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-[#0d0d1a] antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-gradient-dark">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
