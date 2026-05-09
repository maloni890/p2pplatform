import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minAmount = parseFloat(searchParams.get("minAmount") || "0");

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get pending buy orders (buyers looking to buy USDT)
    const buyers = await sql`
      SELECT 
        o.id,
        o.order_number,
        o.buyer_id,
        o.buyer_name,
        o.usdt_amount,
        o.inr_amount,
        o.rate,
        o.status,
        o.created_at
      FROM orders o
      WHERE o.type = 'buy' 
        AND o.status = 'pending'
        AND o.usdt_amount >= ${minAmount}
      ORDER BY o.rate DESC, o.created_at ASC
      LIMIT 20
    `;

    return NextResponse.json({ buyers, success: true });
  } catch (error) {
    console.error("Error fetching buyers:", error);
    return NextResponse.json(
      { error: "Failed to fetch buyers", success: false },
      { status: 500 }
    );
  }
}
