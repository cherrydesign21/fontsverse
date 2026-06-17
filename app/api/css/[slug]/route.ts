import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getFontFaceCSS } from "@/lib/fonts";
import type { DBFont } from "@/lib/supabase";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase
    .from("fonts")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!data) {
    return new NextResponse(`/* Font "${slug}" not found */`, {
      status: 404,
      headers: { "Content-Type": "text/css" },
    });
  }

  const css = getFontFaceCSS(data as DBFont) || `/* No file available for ${slug} */`;
  return new NextResponse(css, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
