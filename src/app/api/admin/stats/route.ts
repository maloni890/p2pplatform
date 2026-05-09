import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    // Get total users count
    const usersResult = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'user'`;
    const totalUsers = parseInt(usersResult[0]?.count || "0");

    // Get pending buy orders count
    const pendingBuyResult = await sql`SELECT COUNT(*) as count FROM orders WHERE type = 'buy' AND status IN ('pending', 'escrow_waiting', 'payment_pending')`;
    const pendingBuyOrders = parseInt(pendingBuyResult[0]?.count || "0");

    // Get pending sell orders count
    const pendingSellResult = await sql`SELECT COUNT(*) as count FROM orders WHERE type = 'sell' AND status IN ('pending', 'escrow_waiting', 'payment_pending')`;
    const pendingSellOrders = parseInt(pendingSellResult[0]?.count || "0");

    // Get today's volume
    const todayVolumeResult = await sql`
      SELECT COALESCE(SUM(usdt_amount), 0) as volume 
      FROM orders 
      WHERE status = 'completed' 
      AND created_at >= CURRENT_DATE
    `;
    const todayVolume = parseFloat(todayVolumeResult[0]?.volume || "0");

    // Get total volume
    const totalVolumeResult = await sql`
      SELECT COALESCE(SUM(usdt_amount), 0) as volume 
      FROM orders 
      WHERE status = 'completed'
    `;
    const totalVolume = parseFloat(totalVolumeResult[0]?.volume || "0");

    // Get pending KYC count
    const pendingKycResult = await sql`SELECT COUNT(*) as count FROM seller_kyc WHERE status = 'pending'`;
    const pendingKyc = parseInt(pendingKycResult[0]?.count || "0");

    // Get active sellers count
    const activeSellersResult = await sql`SELECT COUNT(*) as count FROM sellers WHERE is_verified = true`;
    const activeSellers = parseInt(activeSellersResult[0]?.count || "0");

    // Calculate platform revenue (0.5% of completed trades)
    const revenueResult = await sql`
      SELECT COALESCE(SUM(inr_amount * 0.005), 0) as revenue 
      FROM orders 
      WHERE status = 'completed'
    `;
    const totalRevenue = parseFloat(revenueResult[0]?.revenue || "0");

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        pendingBuyOrders,
        pendingSellOrders,
        todayVolume,
        totalVolume,
        pendingKyc,
        activeSellers,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
