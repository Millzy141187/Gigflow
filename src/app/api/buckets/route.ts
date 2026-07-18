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
    const bucket = {
      user_id: user.id,
      name: body.name,
      type: body.type || "custom",
      target_amount: Number(body.targetAmount) || 1000,
      current_amount: Number(body.currentAmount) || 0,
      allocation_percent: Number(body.allocationPercent) || 10,
      color: body.color || "#10b981",
      icon: body.icon || "folder",
    };

    const { data, error } = await supabase.from("buckets").insert(bucket).select().single();

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

    const dbUpdates: Record<string, unknown> = {};
    if (updates.currentAmount !== undefined) dbUpdates.current_amount = Number(updates.currentAmount);
    if (updates.targetAmount !== undefined) dbUpdates.target_amount = Number(updates.targetAmount);
    if (updates.allocationPercent !== undefined) dbUpdates.allocation_percent = Number(updates.allocationPercent);
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from("buckets").update(dbUpdates).eq("id", id).eq("user_id", user.id).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(toCamelCase(data));
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
