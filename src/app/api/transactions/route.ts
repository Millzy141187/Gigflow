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
    const txn = {
      user_id: user.id,
      type: body.type,
      amount: Number(body.amount),
      category: body.category || "uncategorized",
      description: body.description,
      source: body.source || null,
      date: body.date || new Date().toISOString(),
      deductible: body.deductible || false,
    };

    const { data, error } = await supabase.from("transactions").insert(txn).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(toCamelCase(data), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
