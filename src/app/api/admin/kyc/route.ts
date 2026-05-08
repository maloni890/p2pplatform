import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let kycApplications;
    let totalCount;

    if (status !== "all") {
      kycApplications = await sql`
        SELECT k.*, u.name as user_name, u.email as user_email
        FROM seller_kyc k
        LEFT JOIN users u ON k.user_id = u.id
        WHERE k.status = ${status}
        ORDER BY k.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM seller_kyc WHERE status = ${status}`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    } else {
      kycApplications = await sql`
        SELECT k.*, u.name as user_name, u.email as user_email
        FROM seller_kyc k
        LEFT JOIN users u ON k.user_id = u.id
        ORDER BY k.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countResult = await sql`SELECT COUNT(*) as count FROM seller_kyc`;
      totalCount = parseInt(String(countResult[0]?.count || "0"));
    }

    return NextResponse.json({
      success: true,
      kycApplications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Admin KYC error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch KYC applications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { kycId, action, rejectionReason, adminId } = body;

    if (!kycId || !action) {
      return NextResponse.json({ success: false, error: "Missing kycId or action" }, { status: 400 });
    }

    if (action === "approve") {
      // Update KYC status
      await sql`
        UPDATE seller_kyc 
        SET status = 'approved', 
            reviewed_by = ${adminId || null}::uuid,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${kycId}::uuid
      `;

      // Get user_id from KYC application
      const kycResult = await sql`SELECT user_id, full_name, upi_id, usdt_wallet_address, usdt_network FROM seller_kyc WHERE id = ${kycId}::uuid`;
      
      if (kycResult.length > 0) {
        const kyc = kycResult[0];
        
        // Update user to be a seller
        await sql`UPDATE users SET is_seller = true, is_verified = true, updated_at = NOW() WHERE id = ${kyc.user_id}::uuid`;
        
        // Create seller record
        await sql`
          INSERT INTO sellers (user_id, name, is_verified, available_usdt, rate, upi_id, completion_rate, avg_response_time, wallet_address, network)
          VALUES (${kyc.user_id}::uuid, ${kyc.full_name}, true, 0, 106.35, ${kyc.upi_id}, 100, 5, ${kyc.usdt_wallet_address}, ${kyc.usdt_network})
          ON CONFLICT (user_id) DO UPDATE SET is_verified = true, updated_at = NOW()
        `;
      }
    } else if (action === "reject") {
      await sql`
        UPDATE seller_kyc 
        SET status = 'rejected', 
            rejection_reason = ${rejectionReason || 'Application rejected'},
            reviewed_by = ${adminId || null}::uuid,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${kycId}::uuid
      `;
    }

    return NextResponse.json({ success: true, message: `KYC ${action}d successfully` });
  } catch (error) {
    console.error("Admin KYC update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update KYC" }, { status: 500 });
  }
}
