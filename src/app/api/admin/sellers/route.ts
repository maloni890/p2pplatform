import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        s.*,
        u.email as user_email,
        u.phone as user_phone,
        u.is_blocked as user_blocked
      FROM sellers s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;

    if (status === "verified") {
      query += ` AND s.is_verified = true`;
    } else if (status === "unverified") {
      query += ` AND s.is_verified = false`;
    }

    if (search) {
      query += ` AND (s.name ILIKE '%${search}%' OR s.upi_id ILIKE '%${search}%' OR u.email ILIKE '%${search}%')`;
    }

    query += ` ORDER BY s.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const sellers = await sql(query);

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM sellers s LEFT JOIN users u ON s.user_id = u.id WHERE 1=1`;
    if (status === "verified") countQuery += ` AND s.is_verified = true`;
    else if (status === "unverified") countQuery += ` AND s.is_verified = false`;
    if (search) countQuery += ` AND (s.name ILIKE '%${search}%' OR s.upi_id ILIKE '%${search}%' OR u.email ILIKE '%${search}%')`;
    
    const countResult = await sql(countQuery);
    const totalCount = parseInt(countResult[0]?.count || "0");

    return NextResponse.json({
      success: true,
      sellers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Admin sellers error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch sellers" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellerId, action, rate, availableUsdt } = body;

    if (!sellerId || !action) {
      return NextResponse.json({ success: false, error: "Missing sellerId or action" }, { status: 400 });
    }

    switch (action) {
      case "verify":
        await sql`UPDATE sellers SET is_verified = true, updated_at = NOW() WHERE id = ${sellerId}`;
        break;
      case "unverify":
        await sql`UPDATE sellers SET is_verified = false, updated_at = NOW() WHERE id = ${sellerId}`;
        break;
      case "update_rate":
        await sql`UPDATE sellers SET rate = ${rate}, updated_at = NOW() WHERE id = ${sellerId}`;
        break;
      case "update_balance":
        await sql`UPDATE sellers SET available_usdt = ${availableUsdt}, updated_at = NOW() WHERE id = ${sellerId}`;
        break;
      case "block":
        const sellerResult = await sql`SELECT user_id FROM sellers WHERE id = ${sellerId}`;
        if (sellerResult.length > 0) {
          await sql`UPDATE users SET is_blocked = true WHERE id = ${sellerResult[0].user_id}`;
        }
        break;
      case "unblock":
        const sellerResult2 = await sql`SELECT user_id FROM sellers WHERE id = ${sellerId}`;
        if (sellerResult2.length > 0) {
          await sql`UPDATE users SET is_blocked = false WHERE id = ${sellerResult2[0].user_id}`;
        }
        break;
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Seller ${action}d successfully` });
  } catch (error) {
    console.error("Admin seller update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update seller" }, { status: 500 });
  }
}
