import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Fetch ads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "buy";

    // For buy type, we show sell ads. For sell type, we show buy ads.
    const adType = type === "buy" ? "sell" : "buy";

    const ads = await sql`
      SELECT 
        a.*,
        s.name as seller_name,
        s.total_trades,
        s.completion_rate,
        s.is_verified
      FROM ads a
      LEFT JOIN sellers s ON a.seller_id = s.id
      WHERE a.type = ${adType} AND a.is_active = true
      ORDER BY a.price ASC
      LIMIT 50
    `;

    return NextResponse.json({ success: true, ads });
  } catch (error) {
    console.error("Error fetching ads:", error);
    // Return mock data on error
    return NextResponse.json({
      success: true,
      ads: [],
    });
  }
}

// POST - Create new ad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      priceType,
      price,
      totalAmount,
      minLimit,
      maxLimit,
      paymentMethods,
      timeLimit,
      autoReply,
      terms,
      sellerId,
    } = body;

    if (!price || !totalAmount || !minLimit || !maxLimit || !paymentMethods?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO ads (
        seller_id, type, price_type, price, total_amount,
        min_limit, max_limit, payment_methods, time_limit,
        auto_reply, terms, is_active
      ) VALUES (
        ${sellerId || null}, ${type}, ${priceType}, ${price}, ${totalAmount},
        ${minLimit}, ${maxLimit}, ${JSON.stringify(paymentMethods)}, ${timeLimit},
        ${autoReply || null}, ${terms || null}, true
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      ad: result[0],
      message: "Ad posted successfully",
    });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create ad" },
      { status: 500 }
    );
  }
}
