import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

function generateReferralCode(): string {
  return "SE" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, referral_code } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { detail: "Name, email, phone and password are required" },
        { status: 400 }
      );
    }

    // Check for duplicate email or phone
    const existing = await sql`
      SELECT id, email, phone FROM users
      WHERE email = ${email} OR phone = ${phone}
      LIMIT 1
    `;

    if (existing.length > 0) {
      const dup = existing[0];
      if (dup.email === email) {
        return NextResponse.json(
          { detail: "An account with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { detail: "Phone number already registered" },
        { status: 409 }
      );
    }

    // Validate referral code if provided
    if (referral_code) {
      const referrer = await sql`
        SELECT id FROM users WHERE referral_code = ${referral_code} LIMIT 1
      `;
      if (referrer.length === 0) {
        return NextResponse.json(
          { detail: "Invalid referral code" },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const myReferralCode = generateReferralCode();

    const result = await sql`
      INSERT INTO users (name, email, phone, password_hash, role, referral_code, referred_by, is_verified, total_trades)
      VALUES (
        ${name},
        ${email},
        ${phone},
        ${passwordHash},
        'user',
        ${myReferralCode},
        ${referral_code || null},
        false,
        0
      )
      RETURNING id, name, email, phone, role, referral_code, referred_by, is_verified, total_trades, created_at
    `;

    const user = result[0];
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      my_referral_code: user.referral_code,
      referral_code: user.referred_by,
      is_phone_verified: false,
      is_email_verified: false,
      is_verified_trader: user.is_verified,
      total_trades: user.total_trades,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("[v0] Register error:", error);
    return NextResponse.json(
      { detail: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
