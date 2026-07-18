import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { seedDemoData } from "@/lib/db-supabase";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    // Update profile name if provided (use upsert with conflict key)
    if (name) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email!,
        name,
        currency: "USD",
        income_sources: [],
        onboarding_complete: true,
      }, { onConflict: "id" });
    }

    // Seed demo data for new users
    await seedDemoData(user.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to setup account." }, { status: 500 });
  }
}
