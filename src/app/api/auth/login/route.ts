import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || "Invalid credentials." }, { status: 401 });
    }

    // Fetch the user's profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.email,
        currency: profile?.currency || "USD",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
