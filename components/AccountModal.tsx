"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserFonts } from "@/context/UserFontsContext";
import { useNotif } from "@/context/NotifContext";
import { Overlay } from "./AuthModal";

interface Props { onClose: () => void }

export default function AccountModal({ onClose }: Props) {
  const { profile, isAdmin, updateProfile } = useAuth();
  const { fonts }  = useUserFonts();
  const { notify } = useNotif();
  const [name, setName]   = useState(profile?.name ?? "");
  const [saved, setSaved] = useState(false);
  if (!profile) return null;

  const save = async () => {
    if (!name.trim()) return;
    await updateProfile({ name: name.trim() });
    setSaved(true); notify("Profile updated ✓");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-xl font-bold text-gray-900 mb-5">Account Settings</h2>
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0
          ${isAdmin ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-violet-500 to-pink-500"}`}>
          {profile.name[0].toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-gray-900 font-semibold">{profile.name}</p>
            {isAdmin && <span className="text-[9px] bg-amber-100 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
          </div>
          <p className="text-gray-400 text-xs">{profile.email}</p>
        </div>
      </div>

      <label className="text-gray-400 text-xs block mb-1.5">Display Name</label>
      <input className="fv-input mb-4" value={name} onChange={e => setName(e.target.value)} />

      <div className="grid grid-cols-2 gap-2 mb-4">
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
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          <p className="text-amber-700 text-[12px]">
            👑 Admin account · <a href="/admin" className="underline">Open full dashboard →</a>
          </p>
        </div>
      )}

      <button onClick={save} className={`fv-btn-primary w-full ${saved ? "!bg-emerald-600" : ""}`}>
        {saved ? "✓ Saved" : "Save Changes"}
      </button>
    </Overlay>
  );
}
