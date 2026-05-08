import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

// GET - Fetch all tickets for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = `
      SELECT * FROM support_tickets 
      WHERE 1=1
    `;
    const params: string[] = [];

    if (status && status !== "all") {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (category && category !== "all") {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (ticket_number ILIKE $${params.length} OR user_name ILIKE $${params.length} OR user_email ILIKE $${params.length} OR subject ILIKE $${params.length})`;
    }

    query += ` ORDER BY 
      CASE WHEN status = 'open' THEN 0 ELSE 1 END,
      CASE WHEN priority = 'high' THEN 0 WHEN priority = 'normal' THEN 1 ELSE 2 END,
      created_at DESC
    `;

    // Use parameterized query based on filters
    let tickets;
    if (status && status !== "all" && category && category !== "all" && search) {
      tickets = await sql`
        SELECT * FROM support_tickets 
        WHERE status = ${status} AND category = ${category} 
        AND (ticket_number ILIKE ${'%' + search + '%'} OR user_name ILIKE ${'%' + search + '%'} OR user_email ILIKE ${'%' + search + '%'} OR subject ILIKE ${'%' + search + '%'})
        ORDER BY CASE WHEN status = 'open' THEN 0 ELSE 1 END, CASE WHEN priority = 'high' THEN 0 ELSE 1 END, created_at DESC
      `;
    } else if (status && status !== "all" && category && category !== "all") {
      tickets = await sql`
        SELECT * FROM support_tickets WHERE status = ${status} AND category = ${category}
        ORDER BY CASE WHEN status = 'open' THEN 0 ELSE 1 END, CASE WHEN priority = 'high' THEN 0 ELSE 1 END, created_at DESC
      `;
    } else if (status && status !== "all") {
      tickets = await sql`
        SELECT * FROM support_tickets WHERE status = ${status}
        ORDER BY CASE WHEN status = 'open' THEN 0 ELSE 1 END, CASE WHEN priority = 'high' THEN 0 ELSE 1 END, created_at DESC
      `;
    } else if (category && category !== "all") {
      tickets = await sql`
        SELECT * FROM support_tickets WHERE category = ${category}
        ORDER BY CASE WHEN status = 'open' THEN 0 ELSE 1 END, CASE WHEN priority = 'high' THEN 0 ELSE 1 END, created_at DESC
      `;
    } else if (search) {
      tickets = await sql`
        SELECT * FROM support_tickets 
        WHERE ticket_number ILIKE ${'%' + search + '%'} OR user_name ILIKE ${'%' + search + '%'} OR user_email ILIKE ${'%' + search + '%'} OR subject ILIKE ${'%' + search + '%'}
        ORDER BY CASE WHEN status = 'open' THEN 0 ELSE 1 END, CASE WHEN priority = 'high' THEN 0 ELSE 1 END, created_at DESC
      `;
    } else {
      tickets = await sql`
        SELECT * FROM support_tickets 
        ORDER BY CASE WHEN status = 'open' THEN 0 ELSE 1 END, CASE WHEN priority = 'high' THEN 0 ELSE 1 END, created_at DESC
      `;
    }

    // Get counts
    const counts = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'open') as open_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE priority = 'high' AND status = 'open') as urgent_count,
        COUNT(*) as total_count
      FROM support_tickets
    `;

    return NextResponse.json({ 
      success: true, 
      tickets,
      counts: counts[0]
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tickets" }, { status: 500 });
  }
}

// PATCH - Update ticket (reply, change status)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, status, adminReply, repliedBy, priority } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "Ticket ID required" }, { status: 400 });
    }

    let result;
    if (adminReply) {
      result = await sql`
        UPDATE support_tickets 
        SET 
          admin_reply = ${adminReply},
          replied_by = ${repliedBy || null}::uuid,
          replied_at = NOW(),
          status = COALESCE(${status}, 'in_progress'),
          updated_at = NOW()
        WHERE id = ${ticketId}::uuid
        RETURNING *
      `;
    } else if (status) {
      result = await sql`
        UPDATE support_tickets 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${ticketId}::uuid
        RETURNING *
      `;
    } else if (priority) {
      result = await sql`
        UPDATE support_tickets 
        SET priority = ${priority}, updated_at = NOW()
        WHERE id = ${ticketId}::uuid
        RETURNING *
      `;
    }

    return NextResponse.json({ success: true, ticket: result?.[0] });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ success: false, error: "Failed to update ticket" }, { status: 500 });
  }
}
