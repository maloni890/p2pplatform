import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Fetch core user record
    const userRows = await sql`
      SELECT id, name, email, phone, role, is_seller, is_blocked, is_verified,
             total_trades, referral_code, referred_by, created_at, updated_at
      FROM users
      WHERE id = ${userId}::uuid
    `;

    if (!userRows.length) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const user = userRows[0];

    // Fetch order stats for this user
    const statsRows = await sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'buy')  AS total_buy_orders,
        COUNT(*) FILTER (WHERE type = 'sell') AS total_sell_orders,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_trades,
        COUNT(*) FILTER (WHERE status = 'disputed')  AS disputed_trades,
        COALESCE(SUM(usdt_amount), 0) AS total_volume_usdt,
        COALESCE(SUM(inr_amount),  0) AS total_volume_inr
      FROM orders
      WHERE buyer_id = ${userId}::uuid
         OR seller_id = ${userId}::uuid
    `;

    // Fetch 5 most recent orders
    const recentOrders = await sql`
      SELECT id, order_number, type, usdt_amount, inr_amount, status, created_at
      FROM orders
      WHERE buyer_id = ${userId}::uuid
         OR seller_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const stats = statsRows[0] || {};

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        total_buy_orders:   parseInt(String(stats.total_buy_orders  || 0)),
        total_sell_orders:  parseInt(String(stats.total_sell_orders || 0)),
        completed_trades:   parseInt(String(stats.completed_trades  || 0)),
        disputed_trades:    parseInt(String(stats.disputed_trades   || 0)),
        total_volume_usdt:  parseFloat(String(stats.total_volume_usdt || 0)),
        total_volume_inr:   parseFloat(String(stats.total_volume_inr  || 0)),
        recent_orders:      recentOrders,
      },
    });
  } catch (error) {
    console.error("User detail error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user details" }, { status: 500 });
  }
}
