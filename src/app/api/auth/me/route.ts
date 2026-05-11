import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const result = await sql`
      SELECT id, name, email, phone, role, referral_code, referred_by,
             is_verified, is_blocked, total_trades, created_at
      FROM users
      WHERE id = ${userId}::uuid
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    const user = result[0];
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      my_referral_code: user.referral_code,
      referral_code: user.referred_by,
      is_phone_verified: true,
      is_email_verified: true,
      is_verified_trader: user.is_verified,
      total_trades: user.total_trades,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("[v0] Me error:", error);
    return NextResponse.json({ detail: "Failed to get user" }, { status: 500 });
  }
}
