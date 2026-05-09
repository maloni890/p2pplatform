import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Use different queries based on filters
    let orders;
    let totalCount;

    if (status !== "all" && type !== "all") {
      orders = await sql`
        SELECT o.*, s.name as seller_name, s.upi_id as seller_upi
        FROM orders o
        LEFT JOIN sellers s ON o.seller_id = s.id
        WHERE o.status = ${status} AND o.type = ${type}
        ORDER BY o.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM orders WHERE status = ${status} AND type = ${type}`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else if (status !== "all") {
      orders = await sql`
        SELECT o.*, s.name as seller_name, s.upi_id as seller_upi
        FROM orders o
        LEFT JOIN sellers s ON o.seller_id = s.id
        WHERE o.status = ${status}
        ORDER BY o.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM orders WHERE status = ${status}`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else if (type !== "all") {
      orders = await sql`
        SELECT o.*, s.name as seller_name, s.upi_id as seller_upi
        FROM orders o
        LEFT JOIN sellers s ON o.seller_id = s.id
        WHERE o.type = ${type}
        ORDER BY o.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM orders WHERE type = ${type}`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else {
      orders = await sql`
        SELECT o.*, s.name as seller_name, s.upi_id as seller_upi
        FROM orders o
        LEFT JOIN sellers s ON o.seller_id = s.id
        ORDER BY o.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM orders`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    }

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const body = await request.json();
    const { orderId, action, adminNote } = body;

    if (!orderId || !action) {
      return NextResponse.json({ success: false, error: "Missing orderId or action" }, { status: 400 });
    }

    let newStatus = "";
    switch (action) {
      case "approve":
        newStatus = "completed";
        break;
      case "reject":
        newStatus = "cancelled";
        break;
      case "release":
        newStatus = "completed";
        break;
      case "dispute":
        newStatus = "disputed";
        break;
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    await sql`
      UPDATE orders 
      SET status = ${newStatus}, 
          admin_note = ${adminNote || null},
          updated_at = NOW()
      WHERE id = ${orderId}::uuid
    `;

    return NextResponse.json({ success: true, message: `Order ${action}d successfully` });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}
