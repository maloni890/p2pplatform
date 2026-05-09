import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";

    let query = `
      SELECT 
        a.*,
        s.name as seller_name,
        s.total_trades,
        s.completion_rate,
        u.email as seller_email,
        u.phone as seller_phone
      FROM ads a
      LEFT JOIN sellers s ON a.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
    `;

    const filters = [];
    if (status !== "all") {
      filters.push(`a.is_active = ${status === "active" ? true : false}`);
    }
    if (type !== "all") {
      filters.push(`a.type = '${type}'`);
    }

    if (filters.length > 0) {
      query += ` WHERE ${filters.join(" AND ")}`;
    }

    query += ` ORDER BY a.created_at DESC LIMIT 100`;

    const ads = await sql(query);

    return NextResponse.json({ success: true, ads });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId, action } = body;

    if (!adId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    let result;

    if (action === "deactivate") {
      result = await sql`
        UPDATE ads 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${adId}::uuid
        RETURNING *
      `;
    } else if (action === "activate") {
      result = await sql`
        UPDATE ads 
        SET is_active = true, updated_at = NOW()
        WHERE id = ${adId}::uuid
        RETURNING *
      `;
    } else if (action === "delete") {
      result = await sql`
        DELETE FROM ads 
        WHERE id = ${adId}::uuid
        RETURNING *
      `;
    }

    return NextResponse.json({ success: true, ad: result?.[0] });
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update ad" },
      { status: 500 }
    );
  }
}
