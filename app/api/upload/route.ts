import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

const ALLOWED = ["font/ttf","font/otf","font/woff","font/woff2",
  "application/octet-stream","application/x-font-ttf",
  "application/x-font-woff","application/font-woff2",
  "application/font-sfnt","application/vnd.ms-fontobject"];

export async function POST(req: NextRequest) {
  const supabaseAdmin = getAdmin();
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const userId   = formData.get("userId") as string | null;
    const fontName = formData.get("fontName") as string || "Untitled Font";
    const category = formData.get("category") as string || "Sans-Serif";
    const isPublic = formData.get("isPublic") === "true";
    const project  = formData.get("project") as string || "";

    if (!file)   return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    // Validate file type
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["ttf","otf","woff","woff2"].includes(ext))
      return NextResponse.json({ error: "Only TTF, OTF, WOFF, WOFF2 files are supported." }, { status: 400 });

    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: "File must be under 10MB." }, { status: 400 });

    const slug      = fontName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const timestamp = Date.now();
    const basePath  = `${userId}/${slug}-${timestamp}`;
    const filePath  = `${basePath}/original.${ext}`;

    // Upload original file to Supabase Storage
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("fonts")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage.from("fonts").getPublicUrl(filePath);

    // Insert font record into DB
    const { data: font, error: dbError } = await supabaseAdmin
      .from("fonts")
      .insert({
        name: fontName,
        slug: `${slug}-${timestamp}`,
        category,
        is_public: isPublic,
        uploaded_by: userId,
        added_by_admin: false,
        file_original: filePath,
        // We store one URL for now; real conversion would generate all formats
        file_ttf:  ext === "ttf"   ? filePath : null,
        file_woff: ext === "woff"  ? filePath : null,
        file_woff2:ext === "woff2" ? filePath : null,
        bg_color:   "#13132e",
        text_color: "#a78bfa",
        font_family: `'${fontName}', system-ui, sans-serif`,
        font_weight: "700",
        font_style:  "normal",
        letter_spacing: "0px",
        downloads: 0,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up storage if DB insert fails
      await supabaseAdmin.storage.from("fonts").remove([filePath]);
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      font,
      fileUrl: publicUrl,
      formats: { [ext]: publicUrl },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
