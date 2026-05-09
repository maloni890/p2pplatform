import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let users;
    let totalCount;

    const searchPattern = `%${search}%`;

    if (search && role !== "all") {
      users = await sql`
        SELECT id, name, email, phone, role, is_seller, is_blocked, is_verified, total_trades, created_at
        FROM users
        WHERE (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR phone ILIKE ${searchPattern})
        AND role = ${role}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`
        SELECT COUNT(*) as count FROM users 
        WHERE (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR phone ILIKE ${searchPattern})
        AND role = ${role}
      `;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else if (search) {
      users = await sql`
        SELECT id, name, email, phone, role, is_seller, is_blocked, is_verified, total_trades, created_at
        FROM users
        WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR phone ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`
        SELECT COUNT(*) as count FROM users 
        WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR phone ILIKE ${searchPattern}
      `;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else if (role !== "all") {
      users = await sql`
        SELECT id, name, email, phone, role, is_seller, is_blocked, is_verified, total_trades, created_at
        FROM users
        WHERE role = ${role}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM users WHERE role = ${role}`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else {
      users = await sql`
        SELECT id, name, email, phone, role, is_seller, is_blocked, is_verified, total_trades, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM users`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    }

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
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ success: false, error: "Missing userId or action" }, { status: 400 });
    }

    switch (action) {
      case "block":
        await sql`UPDATE users SET is_blocked = true, updated_at = NOW() WHERE id = ${userId}::uuid`;
        break;
      case "unblock":
        await sql`UPDATE users SET is_blocked = false, updated_at = NOW() WHERE id = ${userId}::uuid`;
        break;
      case "verify":
        await sql`UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = ${userId}::uuid`;
        break;
      case "make_seller":
        await sql`UPDATE users SET is_seller = true, updated_at = NOW() WHERE id = ${userId}::uuid`;
        break;
      case "remove_seller":
        await sql`UPDATE users SET is_seller = false, updated_at = NOW() WHERE id = ${userId}::uuid`;
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
