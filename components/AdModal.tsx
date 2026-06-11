"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";
import { Overlay } from "./AuthModal";

interface Props { onClose: () => void }

export default function AdModal({ onClose }: Props) {
  const { user }   = useAuth();
  const { notify } = useNotif();
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr]             = useState("");

  const [title, setTitle]     = useState("");
  const [tagline, setTagline] = useState("");
  const [url, setUrl]         = useState("");
  const [email, setEmail]     = useState(user?.email ?? "");
  const [budget, setBudget]   = useState("");

  const submit = async () => {
    setErr("");
    if (!title.trim()) { setErr("Ad title is required."); return; }
    if (!url.trim() || !/^https?:\/\//.test(url)) { setErr("Enter a valid URL starting with https://"); return; }
    if (!email.trim()) { setErr("Contact email is required."); return; }

    setLoading(true);
    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(), tagline: tagline.trim() || null,
        destination_url: url.trim(), contact_email: email.trim(),
        budget: budget ? parseFloat(budget) : null,
        submitted_by: user?.id || null,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok || json.error) { setErr(json.error || "Submission failed"); return; }
    setSubmitted(true);
    notify("Ad request submitted! We'll review within 24 hours. ✓");
  };

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Post an Ad</h2>
      <p className="text-gray-400 text-sm mb-5">Reach designers &amp; developers on FontsVerse</p>

      {!submitted ? (
        <>
          <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2.5 mb-4">
            <p className="text-violet-600 text-[12px] font-medium mb-1">📊 Ad Pricing</p>
            <p className="text-gray-500 text-[11px]">Ads are reviewed manually. We'll contact you at your email to confirm pricing and go-live date.</p>
          </div>

          <label className="text-gray-400 text-xs block mb-1">Ad Title *</label>
          <input className="fv-input mb-3" placeholder="e.g. DesignPro — Professional Font Licensing"
            value={title} onChange={e => { setTitle(e.target.value); setErr(""); }} />

          <label className="text-gray-400 text-xs block mb-1">Tagline</label>
          <input className="fv-input mb-3" placeholder="One-liner (max 100 chars)"
            value={tagline} onChange={e => setTagline(e.target.value)} maxLength={100} />

          <label className="text-gray-400 text-xs block mb-1">Destination URL *</label>
          <input className="fv-input mb-3" placeholder="https://yoursite.com" type="url"
            value={url} onChange={e => { setUrl(e.target.value); setErr(""); }} />

          <label className="text-gray-400 text-xs block mb-1">Contact Email *</label>
          <input className="fv-input mb-3" placeholder="you@company.com" type="email"
            value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} />

          <label className="text-gray-400 text-xs block mb-1">Monthly Budget (USD)</label>
          <input className="fv-input mb-4" placeholder="e.g. 100" type="number" min="1"
            value={budget} onChange={e => setBudget(e.target.value)} />

          {err && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
              <p className="text-red-500 text-[12px]">⚠ {err}</p>
            </div>
          )}

          <button onClick={submit} disabled={loading} className="fv-btn-primary w-full disabled:opacity-50">
            {loading ? "Submitting…" : "Submit Ad Request"}
          </button>
        </>
      ) : (
        <div className="text-center py-6">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-gray-900 font-bold text-lg mb-2">Request received!</p>
          <p className="text-gray-400 text-sm mb-1">We'll review your ad and email you at</p>
          <p className="text-violet-500 text-sm font-mono mb-5">{email}</p>
          <p className="text-gray-300 text-xs mb-5">Usually within 24 hours</p>
          <button onClick={onClose} className="fv-btn-primary w-auto! px-8">Done</button>
        </div>
      )}
    </Overlay>
  );
}
