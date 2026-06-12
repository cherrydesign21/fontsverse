"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, Profile } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
}

const Ctx = createContext<AuthCtx>({
  user: null, profile: null, session: null,
  isAdmin: false, loading: true,
  signUp: async () => ({}), signIn: async () => ({}),
  signOut: async () => {}, updateProfile: async () => {},
  updatePassword: async () => ({}),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    if (data) setProfile(data as Profile);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) await loadProfile(session.user.id);
        else setProfile(null);
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fontsverse.vercel.app";
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { name },
        emailRedirectTo: `${siteUrl}/`,
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (patch: Partial<Profile>) => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", user.id)
      .select()
      .single();
    if (data) setProfile(data as Profile);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return error ? { error: error.message } : {};
  };

  return (
    <Ctx.Provider value={{
      user, profile, session,
      isAdmin: profile?.role === "admin",
      loading,
      signUp, signIn, signOut, updateProfile, updatePassword,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() { return useContext(Ctx); }
