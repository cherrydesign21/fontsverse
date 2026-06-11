import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// GET — fetch active ads (public) or all ads (admin)
export async function GET(req: NextRequest) {
  const admin = req.nextUrl.searchParams.get("admin") === "1";

  const query = supabaseAdmin.from("ads").select("*").order("created_at", { ascending: false });
  if (!admin) query.eq("status", "active");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ads: data });
}

// POST — submit a new ad request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, tagline, destination_url, contact_email, budget, submitted_by } = body;

    if (!title || !destination_url || !contact_email)
      return NextResponse.json({ error: "Title, URL and email are required." }, { status: 400 });

    if (!/^https?:\/\//.test(destination_url))
      return NextResponse.json({ error: "Destination URL must start with http:// or https://" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("ads")
      .insert({ title, tagline, destination_url, contact_email, budget: budget || null,
                submitted_by: submitted_by || null, status: "pending" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, ad: data });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — admin approves/rejects/activates ad
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, review_note, reviewed_by } = body;
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("ads")
      .update({ status, review_note: review_note || null, reviewed_by: reviewed_by || null })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, ad: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
