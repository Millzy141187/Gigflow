import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCamelCase } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const gig = {
      user_id: user.id,
      title: body.title,
      client: body.client || "Unknown",
      expected_amount: Number(body.expectedAmount) || 0,
      expected_date: body.expectedDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      probability: body.probability || "likely",
      status: body.status || "upcoming",
    };

    const { data, error } = await supabase.from("gigs").insert(gig).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(toCamelCase(data), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.probability !== undefined) dbUpdates.probability = updates.probability;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.client !== undefined) dbUpdates.client = updates.client;
    if (updates.expectedAmount !== undefined) dbUpdates.expected_amount = Number(updates.expectedAmount);
    if (updates.expectedDate !== undefined) dbUpdates.expected_date = updates.expectedDate;

    const { data, error } = await supabase.from("gigs").update(dbUpdates).eq("id", id).eq("user_id", user.id).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(toCamelCase(data));
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
