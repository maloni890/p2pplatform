import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.*,
        s.name as seller_name,
        s.upi_id as seller_upi
      FROM orders o
      LEFT JOIN sellers s ON o.seller_id = s.id
      WHERE 1=1
    `;

    if (status !== "all") {
      query += ` AND o.status = '${status}'`;
    }
    if (type !== "all") {
      query += ` AND o.type = '${type}'`;
    }

    query += ` ORDER BY o.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const orders = await sql(query);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as count FROM orders WHERE 1=1`;
    if (status !== "all") countQuery += ` AND status = '${status}'`;
    if (type !== "all") countQuery += ` AND type = '${type}'`;
    
    const countResult = await sql(countQuery);
    const totalCount = parseInt(countResult[0]?.count || "0");

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
      WHERE id = ${orderId}
    `;

    return NextResponse.json({ success: true, message: `Order ${action}d successfully` });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}
