import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minAmount = parseFloat(searchParams.get("minAmount") || "0");

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const sellers = await sql`
      SELECT 
        id,
        user_id,
        name,
        username,
        avatar_initials,
        is_verified,
        is_online,
        available_usdt,
        rate,
        upi_id,
        bank_account,
        bank_ifsc,
        bank_name,
        completion_rate,
        avg_response_time,
        total_trades,
        rating,
        min_limit,
        max_limit,
        created_at
      FROM sellers 
      WHERE is_verified = true 
        AND available_usdt >= ${minAmount}
      ORDER BY completion_rate DESC, total_trades DESC
      LIMIT 20
    `;

    // Ensure all numeric fields are properly typed as numbers
    const formattedSellers = sellers.map((seller: any) => ({
      ...seller,
      completion_rate: Number(seller.completion_rate) || 0,
      rate: Number(seller.rate) || 0,
      available_usdt: Number(seller.available_usdt) || 0,
      total_trades: Number(seller.total_trades) || 0,
      avg_response_time: Number(seller.avg_response_time) || 0,
      min_limit: Number(seller.min_limit) || 0,
      max_limit: Number(seller.max_limit) || 0,
      rating: Number(seller.rating) || 0,
    }));

    return NextResponse.json({ sellers: formattedSellers, success: true });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json(
      { error: "Failed to fetch sellers", success: false },
      { status: 500 }
    );
  }
}
