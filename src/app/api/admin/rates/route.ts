import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const rates = await sql`SELECT * FROM platform_rates ORDER BY updated_at DESC LIMIT 1`;
    
    if (rates.length === 0) {
      // Return default rates
      return NextResponse.json({
        success: true,
        rates: {
          buy_rate: 106.50,
          sell_rate: 106.00,
          vip_buy_rate: 106.30,
          vip_sell_rate: 106.20,
          platform_fee_percent: 0.50,
          min_trade_amount: 10.00,
          max_trade_amount: 50000.00,
        },
      });
    }

    return NextResponse.json({
      success: true,
      rates: rates[0],
    });
  } catch (error) {
    console.error("Admin rates error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch rates" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const body = await request.json();
    const { buyRate, sellRate, vipBuyRate, vipSellRate, platformFee, minAmount, maxAmount, adminId, adminName } = body;

    // Validate inputs
    if (!buyRate || !sellRate) {
      return NextResponse.json({ success: false, error: "Buy rate and sell rate are required" }, { status: 400 });
    }

    // Get current rates for history
    const currentRates = await sql`SELECT * FROM platform_rates ORDER BY updated_at DESC LIMIT 1`;

    // Update rates
    if (currentRates.length > 0) {
      await sql`
        UPDATE platform_rates 
        SET buy_rate = ${buyRate},
            sell_rate = ${sellRate},
            vip_buy_rate = ${vipBuyRate || buyRate - 0.20},
            vip_sell_rate = ${vipSellRate || sellRate + 0.20},
            platform_fee_percent = ${platformFee || 0.50},
            min_trade_amount = ${minAmount || 10},
            max_trade_amount = ${maxAmount || 50000},
            updated_by = ${adminId || null},
            updated_at = NOW()
      `;
    } else {
      await sql`
        INSERT INTO platform_rates (buy_rate, sell_rate, vip_buy_rate, vip_sell_rate, platform_fee_percent, min_trade_amount, max_trade_amount, updated_by)
        VALUES (${buyRate}, ${sellRate}, ${vipBuyRate || buyRate - 0.20}, ${vipSellRate || sellRate + 0.20}, ${platformFee || 0.50}, ${minAmount || 10}, ${maxAmount || 50000}, ${adminId || null})
      `;
    }

    // Add to rate history
    await sql`
      INSERT INTO rate_history (buy_rate, sell_rate, vip_buy_rate, vip_sell_rate, platform_fee_percent, changed_by, changed_by_name)
      VALUES (${buyRate}, ${sellRate}, ${vipBuyRate || buyRate - 0.20}, ${vipSellRate || sellRate + 0.20}, ${platformFee || 0.50}, ${adminId || null}, ${adminName || 'Admin'})
    `;

    return NextResponse.json({ success: true, message: "Rates updated successfully" });
  } catch (error) {
    console.error("Admin rates update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update rates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    // Get rate history
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const history = await sql`
      SELECT * FROM rate_history 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Admin rate history error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch rate history" }, { status: 500 });
  }
}
