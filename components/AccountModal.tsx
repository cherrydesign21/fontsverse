"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserFonts } from "@/context/UserFontsContext";
import { useNotif } from "@/context/NotifContext";
import { supabase } from "@/lib/supabase";
import { Overlay } from "./AuthModal";

interface Props { onClose: () => void }

export default function AccountModal({ onClose }: Props) {
  const { user, profile, isAdmin, updateProfile } = useAuth();
  const { fonts }  = useUserFonts();
  const { notify } = useNotif();

  const [name, setName]       = useState(profile?.name ?? "");
  const [saved, setSaved]     = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSaved, setPassSaved] = useState(false);

  if (!profile) return null;

  const avatarLetter = (profile.name?.trim() || profile.email || user?.email || "U")[0].toUpperCase();

  const save = async () => {
    if (!name.trim()) return;
    await updateProfile({ name: name.trim() });
    setSaved(true);
    notify("Profile updated ✓");
    setTimeout(() => setSaved(false), 2000);
  };

  const changePassword = async () => {
    setPassError("");
    if (!newPass) { setPassError("Enter a new password"); return; }
    if (newPass.length < 6) { setPassError("Password must be at least 6 characters"); return; }
    if (newPass !== confPass) { setPassError("Passwords do not match"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) { setPassError(error.message); return; }
    setNewPass(""); setConfPass("");
    setPassSaved(true);
    notify("Password changed ✓");
    setTimeout(() => setPassSaved(false), 2000);
  };

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-xl font-bold text-gray-900 mb-5">Account Settings</h2>

      {/* Avatar + info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg,#FFB703,#FB8500)" }}>
          {avatarLetter}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-gray-900 font-semibold">{profile.name?.trim() || profile.email}</p>
            {isAdmin && <span className="text-[9px] bg-amber-100 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
          </div>
          <p className="text-gray-400 text-xs">{profile.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Name */}
        <div>
          <label className="text-gray-400 text-xs block mb-1.5">Display Name</label>
          <input className="fv-input" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && save()} />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="text-gray-400 text-xs block mb-1.5">Email Address</label>
          <input className="fv-input text-gray-400" value={profile.email} readOnly
            style={{ background: "#f9fafb", cursor: "default" }} />
          <p className="text-gray-300 text-[10px] mt-1 ml-0.5">Email changes require contacting support</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-gray-900">{fonts.length}</p>
            <p className="text-gray-400 text-[11px] mt-0.5">Uploaded Fonts</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-gray-900 capitalize">{profile.role}</p>
            <p className="text-gray-400 text-[11px] mt-0.5">Account Role</p>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-amber-700 text-[12px]">
              👑 Admin account · <a href="/admin" className="underline">Open full dashboard →</a>
            </p>
          </div>
        )}

        <button onClick={save} className="fv-btn-primary w-full"
          style={saved ? { background: "#059669" } : {}}>
          {saved ? "✓ Saved" : "Save Changes"}
        </button>

        {/* Password change */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-gray-500 text-xs font-semibold mb-2.5">Change Password</p>
          <div className="space-y-2">
            <input className="fv-input" type="password" placeholder="New password (min. 6 characters)"
              value={newPass} onChange={e => setNewPass(e.target.value)} />
            <input className="fv-input" type="password" placeholder="Confirm new password"
              value={confPass} onChange={e => setConfPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && changePassword()} />
            {passError && <p className="text-red-500 text-xs">{passError}</p>}
            <button onClick={changePassword}
              className="w-full py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm
                hover:bg-gray-100 hover:border-gray-300 transition-all font-medium"
              style={passSaved ? { background: "#d1fae5", borderColor: "#6ee7b7", color: "#059669" } : {}}>
              {passSaved ? "✓ Password Updated" : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
