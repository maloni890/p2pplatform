import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";

    let ads;

    if (status === "all" && type === "all") {
      ads = await sql`
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
        ORDER BY a.created_at DESC
        LIMIT 100
      `;
    } else if (status !== "all" && type === "all") {
      const isActive = status === "active";
      ads = await sql`
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
        WHERE a.is_active = ${isActive}
        ORDER BY a.created_at DESC
        LIMIT 100
      `;
    } else if (status === "all" && type !== "all") {
      ads = await sql`
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
        WHERE a.type = ${type}
        ORDER BY a.created_at DESC
        LIMIT 100
      `;
    } else {
      const isActive = status === "active";
      ads = await sql`
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
        WHERE a.is_active = ${isActive} AND a.type = ${type}
        ORDER BY a.created_at DESC
        LIMIT 100
      `;
    }

    // Ensure numeric fields are properly typed
    const formatted = ads.map((ad: any) => ({
      ...ad,
      price: Number(ad.price) || 0,
      total_amount: Number(ad.total_amount) || 0,
      available_amount: Number(ad.available_amount) || 0,
      min_limit: Number(ad.min_limit) || 0,
      max_limit: Number(ad.max_limit) || 0,
      time_limit: Number(ad.time_limit) || 0,
      completion_rate: Number(ad.completion_rate) || 0,
      total_trades: Number(ad.total_trades) || 0,
    }));

    return NextResponse.json({ success: true, ads: formatted });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
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
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
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
