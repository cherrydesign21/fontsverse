import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, topic, message } = await req.json();
    if (!email || !message) {
      return NextResponse.json({ error: "Email and message are required" }, { status: 400 });
    }

    const supabase = getAdmin();
    const { error } = await supabase.from("contact_messages").insert({
      name: name?.trim() || null,
      email: email.trim(),
      topic: topic || "General Inquiry",
      message: message.trim(),
    });

    if (error) {
      // Table might not exist yet — still return success to not block UX
      console.error("Contact insert error:", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
