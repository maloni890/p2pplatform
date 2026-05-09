import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Generate ticket number
function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

// GET - Fetch user's tickets
export async function GET(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    let tickets;
    if (userId && isValidUUID(userId)) {
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

// Helper: check if a string is a valid UUID
function isValidUUID(str: string | null | undefined): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// POST - Create new ticket
export async function POST(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const body = await request.json();
    const { userId, userName, userEmail, userPhone, subject, category, message, orderId } = body;

    if (!userEmail || !subject || !message || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const ticketNumber = generateTicketNumber();
    // Only use userId if it is a real UUID — demo/session IDs must be stored as NULL
    const validUserId = isValidUUID(userId) ? userId : null;
    const priority = category === "urgent" || category === "payment_issue" ? "high" : "normal";

    let result;
    if (validUserId) {
      result = await sql`
        INSERT INTO support_tickets (
          ticket_number, user_id, user_name, user_email, user_phone,
          subject, category, message, order_id, status, priority
        ) VALUES (
          ${ticketNumber}, ${validUserId}::uuid,
          ${userName || "Guest"}, ${userEmail}, ${userPhone || null},
          ${subject}, ${category}, ${message}, ${orderId || null},
          'open', ${priority}
        )
        RETURNING *
      `;
    } else {
      result = await sql`
        INSERT INTO support_tickets (
          ticket_number, user_id, user_name, user_email, user_phone,
          subject, category, message, order_id, status, priority
        ) VALUES (
          ${ticketNumber}, NULL,
          ${userName || "Guest"}, ${userEmail}, ${userPhone || null},
          ${subject}, ${category}, ${message}, ${orderId || null},
          'open', ${priority}
        )
        RETURNING *
      `;
    }

    return NextResponse.json({
      success: true,
      ticket: result[0],
      message: `Ticket ${ticketNumber} created successfully`,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ success: false, error: "Failed to create ticket" }, { status: 500 });
  }
}
