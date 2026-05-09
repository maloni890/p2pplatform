import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, email, phone, password } = body;

    // Accept both {identifier, password} and {email, password}
    const loginId = identifier || email || phone;

    if (!loginId || !password) {
      return NextResponse.json(
        { detail: "Email/phone and password are required" },
        { status: 400 }
      );
    }

    // Look up by email or phone
    const result = await sql`
      SELECT id, name, email, phone, password_hash, role, referral_code, referred_by,
             is_verified, is_blocked, total_trades, created_at
      FROM users
      WHERE email = ${loginId} OR phone = ${loginId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { detail: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    const user = result[0];

    if (user.is_blocked) {
      return NextResponse.json(
        { detail: "Your account has been blocked. Please contact support." },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { detail: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

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
    console.error("[v0] Login error:", error);
    return NextResponse.json(
      { detail: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
