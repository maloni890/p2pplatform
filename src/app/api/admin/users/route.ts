import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id, name, email, phone, role, is_seller, is_blocked, is_verified,
        total_trades, created_at
      FROM users
      WHERE 1=1
    `;

    if (search) {
      query += ` AND (name ILIKE '%${search}%' OR email ILIKE '%${search}%' OR phone ILIKE '%${search}%')`;
    }
    if (role !== "all") {
      query += ` AND role = '${role}'`;
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const users = await sql(query);

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM users WHERE 1=1`;
    if (search) countQuery += ` AND (name ILIKE '%${search}%' OR email ILIKE '%${search}%' OR phone ILIKE '%${search}%')`;
    if (role !== "all") countQuery += ` AND role = '${role}'`;
    
    const countResult = await sql(countQuery);
    const totalCount = parseInt(countResult[0]?.count || "0");

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ success: false, error: "Missing userId or action" }, { status: 400 });
    }

    switch (action) {
      case "block":
        await sql`UPDATE users SET is_blocked = true, updated_at = NOW() WHERE id = ${userId}`;
        break;
      case "unblock":
        await sql`UPDATE users SET is_blocked = false, updated_at = NOW() WHERE id = ${userId}`;
        break;
      case "verify":
        await sql`UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = ${userId}`;
        break;
      case "make_seller":
        await sql`UPDATE users SET is_seller = true, updated_at = NOW() WHERE id = ${userId}`;
        break;
      case "remove_seller":
        await sql`UPDATE users SET is_seller = false, updated_at = NOW() WHERE id = ${userId}`;
        break;
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `User ${action}ed successfully` });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}
