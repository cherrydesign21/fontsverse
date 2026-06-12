import { createClient } from "@supabase/supabase-js";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client (used in components)
export const supabase = createClient(URL, ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Types matching our schema
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  plan: "free" | "pro";
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  avatar_url?: string;
  created_at: string;
}

export interface DBFont {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  bg_color: string;
  text_color: string;
  font_family: string;
  font_weight: string;
  font_style: string;
  letter_spacing: string;
  is_public: boolean;
  is_featured: boolean;
  uploaded_by?: string;
  added_by_admin: boolean;
  downloads: number;
  file_ttf?: string;
  file_woff?: string;
  file_woff2?: string;
  file_svg?: string;
  file_original?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Ad {
  id: string;
  title: string;
  tagline?: string;
  destination_url: string;
  contact_email: string;
  budget?: number;
  status: "pending" | "approved" | "rejected" | "active" | "paused";
  image_url?: string;
  submitted_by?: string;
  review_note?: string;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
}

// ── Storage helpers ───────────────────────────────────────────────────────
export function getFontFileUrl(path: string): string {
  const { data } = supabase.storage.from("fonts").getPublicUrl(path);
  return data.publicUrl;
}

export function getAdImageUrl(path: string): string {
  const { data } = supabase.storage.from("ad-images").getPublicUrl(path);
  return data.publicUrl;
}
