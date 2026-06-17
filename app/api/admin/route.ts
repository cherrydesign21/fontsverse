import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// GET — admin stats or sub-resources (type=users|messages|fonts)
export async function GET(req: NextRequest) {
  const supabaseAdmin = getAdmin();
  const type = req.nextUrl.searchParams.get("type");

  if (type === "users") {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email, role, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data ?? [] });
  }

  if (type === "messages") {
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .select("id, name, email, topic, message, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ messages: [] });
    return NextResponse.json({ messages: data ?? [] });
  }

  if (type === "allfonts") {
    const { data, error } = await supabaseAdmin
      .from("fonts")
      .select("id, name, category, is_public, downloads, created_at, uploaded_by, profiles(name, email)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ fonts: data ?? [] });
  }

  // Default: stats
  const [fontsRes, usersRes, downloadsRes, adsRes] = await Promise.all([
    supabaseAdmin.from("fonts").select("id, is_public", { count: "exact" }),
    supabaseAdmin.from("profiles").select("id, role", { count: "exact" }),
    supabaseAdmin.from("download_events").select("id", { count: "exact" }),
    supabaseAdmin.from("ads").select("id, status"),
  ]);

  return NextResponse.json({
    totalFonts:     fontsRes.count ?? 0,
    publicFonts:    fontsRes.data?.filter(f => f.is_public).length ?? 0,
    totalUsers:     usersRes.count ?? 0,
    adminUsers:     usersRes.data?.filter(u => u.role === "admin").length ?? 0,
    totalDownloads: downloadsRes.count ?? 0,
    pendingAds:     adsRes.data?.filter(a => a.status === "pending").length ?? 0,
    activeAds:      adsRes.data?.filter(a => a.status === "active").length ?? 0,
  });
}

// POST — promote user to admin (super admin action)
export async function POST(req: NextRequest) {
  const supabaseAdmin = getAdmin();
  const { email, role } = await req.json();
  if (!email || !role) return NextResponse.json({ error: "email and role required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ role })
    .eq("email", email)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, profile: data });
}
