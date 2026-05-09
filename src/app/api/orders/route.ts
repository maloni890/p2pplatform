import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "edge";

// Generate order number
function generateOrderNumber() {
  const prefix = "SE";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// GET - Fetch orders for a user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status");

  try {
    const sql = neon(process.env.DATABASE_URL!);

    if (orderId) {
      const order = await sql`
        SELECT * FROM orders WHERE id = ${orderId}::uuid
      `;
      return NextResponse.json({ order: order[0] || null, success: true });
    }

    let orders;
    if (status) {
      orders = await sql`
        SELECT * FROM orders 
        WHERE (buyer_id = ${userId} OR seller_user_id = ${userId})
          AND status = ${status}
        ORDER BY created_at DESC
        LIMIT 50
      `;
    } else {
      orders = await sql`
        SELECT * FROM orders 
        WHERE buyer_id = ${userId} OR seller_user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 50
      `;
    }

    return NextResponse.json({ orders, success: true });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", success: false },
      { status: 500 }
    );
  }
}

// POST - Create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      buyerId,
      buyerName,
      sellerId,
      sellerUserId,
      sellerName,
      type,
      usdtAmount,
      inrAmount,
      rate,
      commission,
      paymentMethod,
      buyerWalletAddress,
      buyerWalletNetwork,
    } = body;

    const sql = neon(process.env.DATABASE_URL!);
    const orderNumber = generateOrderNumber();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const result = await sql`
      INSERT INTO orders (
        id,
        order_number,
        buyer_id,
        buyer_name,
        seller_id,
        seller_user_id,
        seller_name,
        type,
        usdt_amount,
        inr_amount,
        rate,
        commission,
        status,
        payment_method,
        buyer_wallet_address,
        buyer_wallet_network,
        created_at,
        updated_at,
        expires_at
      ) VALUES (
        gen_random_uuid(),
        ${orderNumber},
        ${buyerId},
        ${buyerName},
        ${sellerId}::uuid,
        ${sellerUserId},
        ${sellerName},
        ${type},
        ${usdtAmount},
        ${inrAmount},
        ${rate},
        ${commission},
        'pending',
        ${paymentMethod || 'UPI'},
        ${buyerWalletAddress || null},
        ${buyerWalletNetwork || null},
        NOW(),
        NOW(),
        ${expiresAt.toISOString()}
      )
      RETURNING *
    `;

    return NextResponse.json({ order: result[0], success: true });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order", success: false },
      { status: 500 }
    );
  }
}

// PATCH - Update order status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, paymentScreenshot, utrNumber, txHash, disputeReason, buyerWalletAddress, buyerWalletNetwork } = body;

    const sql = neon(process.env.DATABASE_URL!);

    const updates: Record<string, string | null | undefined> = { status };
    
    let result;
    
    if (paymentScreenshot) {
      result = await sql`
        UPDATE orders 
        SET status = ${status}, 
            payment_screenshot = ${paymentScreenshot},
            utr_number = ${utrNumber || null},
            updated_at = NOW()
        WHERE id = ${orderId}::uuid
        RETURNING *
      `;
    } else if (txHash) {
      result = await sql`
        UPDATE orders 
        SET status = ${status}, 
            tx_hash = ${txHash},
            updated_at = NOW()
        WHERE id = ${orderId}::uuid
        RETURNING *
      `;
    } else if (disputeReason) {
      result = await sql`
        UPDATE orders 
        SET status = 'disputed', 
            dispute_reason = ${disputeReason},
            updated_at = NOW()
        WHERE id = ${orderId}::uuid
        RETURNING *
      `;
    } else if (buyerWalletAddress) {
      result = await sql`
        UPDATE orders 
        SET status = ${status},
            buyer_wallet_address = ${buyerWalletAddress},
            buyer_wallet_network = ${buyerWalletNetwork || 'TRC20'},
            updated_at = NOW()
        WHERE id = ${orderId}::uuid
        RETURNING *
      `;
    } else {
      result = await sql`
        UPDATE orders 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${orderId}::uuid
        RETURNING *
      `;
    }

    return NextResponse.json({ order: result[0], success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order", success: false },
      { status: 500 }
    );
  }
}
