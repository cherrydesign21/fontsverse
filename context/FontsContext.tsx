"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase, DBFont } from "@/lib/supabase";

interface FontsCtx {
  fonts: DBFont[];
  loading: boolean;
  refetch: () => Promise<void>;
  addFont: (font: Partial<DBFont>) => Promise<{ data?: DBFont; error?: string }>;
  updateFont: (id: string, patch: Partial<DBFont>) => Promise<void>;
  removeFont: (id: string) => Promise<void>;
  incrementDownload: (id: string) => Promise<void>;
}

const Ctx = createContext<FontsCtx>({
  fonts: [], loading: true,
  refetch: async () => {}, addFont: async () => ({}),
  updateFont: async () => {}, removeFont: async () => {},
  incrementDownload: async () => {},
});

export function FontsProvider({ children }: { children: ReactNode }) {
  const [fonts, setFonts] = useState<DBFont[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("fonts")
      .select("*")
      .eq("is_public", true)
      .order("downloads", { ascending: false });
    if (data) setFonts(data as DBFont[]);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const addFont = async (font: Partial<DBFont>) => {
    const { data, error } = await supabase
      .from("fonts")
      .insert(font)
      .select()
      .single();
    if (error) return { error: error.message };
    setFonts(p => [data as DBFont, ...p]);
    return { data: data as DBFont };
  };

  const updateFont = async (id: string, patch: Partial<DBFont>) => {
    const { data } = await supabase.from("fonts").update(patch).eq("id", id).select().single();
    if (data) setFonts(p => p.map(f => f.id === id ? data as DBFont : f));
  };

  const removeFont = async (id: string) => {
    await supabase.from("fonts").delete().eq("id", id);
    setFonts(p => p.filter(f => f.id !== id));
  };

  const incrementDownload = async (id: string) => {
    const font = fonts.find(f => f.id === id);
    if (!font) return;
    const newCount = (font.downloads || 0) + 1;
    await supabase.from("fonts").update({ downloads: newCount }).eq("id", id);
    setFonts(p => p.map(f => f.id === id ? { ...f, downloads: newCount } : f));
  };

  return (
    <Ctx.Provider value={{ fonts, loading, refetch, addFont, updateFont, removeFont, incrementDownload }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFonts() { return useContext(Ctx); }
