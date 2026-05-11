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

    let sellers;
    let totalCount;

    const searchPattern = `%${search}%`;

    // Handle different filter combinations
    if (status === "verified" && search) {
      sellers = await sql`
        SELECT s.*, u.email as user_email, u.phone as user_phone, u.is_blocked as user_blocked
        FROM sellers s
        LEFT JOIN users u ON s.user_id::uuid = u.id
        WHERE s.is_verified = true AND (s.name ILIKE ${searchPattern} OR s.upi_id ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`
        SELECT COUNT(*) as count FROM sellers s LEFT JOIN users u ON s.user_id::uuid = u.id
        WHERE s.is_verified = true AND (s.name ILIKE ${searchPattern} OR s.upi_id ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
      `;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else if (status === "unverified" && search) {
      sellers = await sql`
        SELECT s.*, u.email as user_email, u.phone as user_phone, u.is_blocked as user_blocked
        FROM sellers s
        LEFT JOIN users u ON s.user_id::uuid = u.id
        WHERE s.is_verified = false AND (s.name ILIKE ${searchPattern} OR s.upi_id ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`
        SELECT COUNT(*) as count FROM sellers s LEFT JOIN users u ON s.user_id::uuid = u.id
        WHERE s.is_verified = false AND (s.name ILIKE ${searchPattern} OR s.upi_id ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
      `;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else if (status === "verified") {
      sellers = await sql`
        SELECT s.*, u.email as user_email, u.phone as user_phone, u.is_blocked as user_blocked
        FROM sellers s
        LEFT JOIN users u ON s.user_id::uuid = u.id
        WHERE s.is_verified = true
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM sellers WHERE is_verified = true`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else if (status === "unverified") {
      sellers = await sql`
        SELECT s.*, u.email as user_email, u.phone as user_phone, u.is_blocked as user_blocked
        FROM sellers s
        LEFT JOIN users u ON s.user_id::uuid = u.id
        WHERE s.is_verified = false
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM sellers WHERE is_verified = false`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else if (search) {
      sellers = await sql`
        SELECT s.*, u.email as user_email, u.phone as user_phone, u.is_blocked as user_blocked
        FROM sellers s
        LEFT JOIN users u ON s.user_id::uuid = u.id
        WHERE s.name ILIKE ${searchPattern} OR s.upi_id ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`
        SELECT COUNT(*) as count FROM sellers s LEFT JOIN users u ON s.user_id::uuid = u.id
        WHERE s.name ILIKE ${searchPattern} OR s.upi_id ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}
      `;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else {
      sellers = await sql`
        SELECT s.*, u.email as user_email, u.phone as user_phone, u.is_blocked as user_blocked
        FROM sellers s
        LEFT JOIN users u ON s.user_id::uuid = u.id
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM sellers`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    }

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
        await sql`UPDATE sellers SET is_verified = true, updated_at = NOW() WHERE id = ${sellerId}::uuid`;
        break;
      case "unverify":
        await sql`UPDATE sellers SET is_verified = false, updated_at = NOW() WHERE id = ${sellerId}::uuid`;
        break;
      case "update_rate":
        await sql`UPDATE sellers SET rate = ${rate}, updated_at = NOW() WHERE id = ${sellerId}::uuid`;
        break;
      case "update_balance":
        await sql`UPDATE sellers SET available_usdt = ${availableUsdt}, updated_at = NOW() WHERE id = ${sellerId}::uuid`;
        break;
      case "block":
        const sellerResult = await sql`SELECT user_id FROM sellers WHERE id = ${sellerId}::uuid`;
        if (sellerResult.length > 0) {
          await sql`UPDATE users SET is_blocked = true WHERE id = ${sellerResult[0].user_id}::uuid`;
        }
        break;
      case "unblock":
        const sellerResult2 = await sql`SELECT user_id FROM sellers WHERE id = ${sellerId}::uuid`;
        if (sellerResult2.length > 0) {
          await sql`UPDATE users SET is_blocked = false WHERE id = ${sellerResult2[0].user_id}::uuid`;
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
