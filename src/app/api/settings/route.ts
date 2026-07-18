import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Settings PUT: Unauthorized", authError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.name !== undefined) updates.name = body.name;
    if (body.currency !== undefined) updates.currency = body.currency;
    if (body.incomeSources !== undefined) updates.income_sources = body.incomeSources;

    console.log("Settings PUT: updating user", user.id, "with", Object.keys(updates));

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("id, name, email, currency, income_sources")
      .single();

    if (error) {
      console.error("Settings PUT: Supabase error", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("Settings PUT: success, currency =", data?.currency);
    return NextResponse.json(data);
  } catch (e) {
    console.error("Settings PUT: exception", e);
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
