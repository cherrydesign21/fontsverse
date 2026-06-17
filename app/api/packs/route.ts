import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/*
  Requires this Supabase migration to run first:
  ─────────────────────────────────────────────
  CREATE TABLE font_packs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    font1_id UUID REFERENCES fonts(id) ON DELETE CASCADE,
    font2_id UUID REFERENCES fonts(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE font_packs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "packs_public_read" ON font_packs FOR SELECT USING (is_public = true);
  CREATE POLICY "packs_admin_all"   ON font_packs USING (true) WITH CHECK (true);
*/

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function GET() {
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("font_packs")
    .select(`
      id, name, description, is_public, created_at,
      font1:fonts!font_packs_font1_id_fkey(id, name, slug, bg_color, text_color, font_family, font_weight, font_style, file_woff2, file_woff, file_ttf),
      font2:fonts!font_packs_font2_id_fkey(id, name, slug, bg_color, text_color, font_family, font_weight, font_style, file_woff2, file_woff, file_ttf)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    // Table likely doesn't exist yet
    return NextResponse.json({ packs: [], setup_required: true });
  }
  return NextResponse.json({ packs: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = getAdmin();
  const { name, description, font1_id, font2_id } = await req.json();
  if (!name || !font1_id || !font2_id) {
    return NextResponse.json({ error: "name, font1_id and font2_id are required" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("font_packs")
    .insert({ name, description, font1_id, font2_id, is_public: true })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pack: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = getAdmin();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await supabase.from("font_packs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
