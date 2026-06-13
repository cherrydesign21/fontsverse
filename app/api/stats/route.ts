import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600; // cache for 1 hour

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function GET() {
  try {
    const supabase = getAdmin();
    const [countRes, downloadsRes] = await Promise.all([
      supabase.from("fonts").select("id", { count: "exact", head: true }).eq("is_public", true),
      supabase.from("fonts").select("downloads").eq("is_public", true),
    ]);
    const totalFonts     = countRes.count ?? 0;
    const totalDownloads = downloadsRes.data?.reduce((s, f) => s + (f.downloads || 0), 0) ?? 0;
    return NextResponse.json({ totalFonts, totalDownloads });
  } catch {
    return NextResponse.json({ totalFonts: 0, totalDownloads: 0 });
  }
}
