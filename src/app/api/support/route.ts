import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

// Generate ticket number
function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

// GET - Fetch user's tickets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    let tickets;
    if (userId) {
      tickets = await sql`
        SELECT * FROM support_tickets 
        WHERE user_id = ${userId}::uuid
        ORDER BY created_at DESC
      `;
    } else if (email) {
      tickets = await sql`
        SELECT * FROM support_tickets 
        WHERE user_email = ${email}
        ORDER BY created_at DESC
      `;
    } else {
      return NextResponse.json({ success: false, error: "User ID or email required" }, { status: 400 });
    }

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tickets" }, { status: 500 });
  }
}

// POST - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail, userPhone, subject, category, message, orderId } = body;

    if (!userEmail || !subject || !message || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const ticketNumber = generateTicketNumber();

    const result = await sql`
      INSERT INTO support_tickets (
        ticket_number, user_id, user_name, user_email, user_phone, 
        subject, category, message, order_id, status, priority
      ) VALUES (
        ${ticketNumber},
        ${userId || null}::uuid,
        ${userName || "Guest"},
        ${userEmail},
        ${userPhone || null},
        ${subject},
        ${category},
        ${message},
        ${orderId || null},
        'open',
        ${category === "urgent" || category === "payment_issue" ? "high" : "normal"}
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      ticket: result[0],
      message: `Ticket ${ticketNumber} created successfully` 
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ success: false, error: "Failed to create ticket" }, { status: 500 });
  }
}
