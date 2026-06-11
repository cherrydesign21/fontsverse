"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase, DBFont } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

interface UserFontsCtx {
  fonts: DBFont[];
  loading: boolean;
  refetch: () => Promise<void>;
  removeFont: (id: string) => Promise<void>;
}

const Ctx = createContext<UserFontsCtx>({
  fonts: [], loading: false,
  refetch: async () => {}, removeFont: async () => {},
});

export function UserFontsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [fonts, setFonts] = useState<DBFont[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!user) { setFonts([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("fonts")
      .select("*")
      .eq("uploaded_by", user.id)
      .order("created_at", { ascending: false });
    if (data) setFonts(data as DBFont[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { refetch(); }, [refetch]);

  const removeFont = async (id: string) => {
    await supabase.from("fonts").delete().eq("id", id);
    setFonts(p => p.filter(f => f.id !== id));
  };

  return (
    <Ctx.Provider value={{ fonts, loading, refetch, removeFont }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUserFonts() { return useContext(Ctx); }
