# FontsVerse — Launch Checklist

## 🚀 Deploy to Vercel (Free, 5 minutes)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "FontsVerse v1.0 - launch ready"
git remote add origin https://github.com/YOUR_USERNAME/fontsverse.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to **vercel.com** → "Add New Project"
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy** — done in ~60 seconds

### Step 3: Custom Domain (optional)
- In Vercel dashboard → Settings → Domains
- Add `fontsverse.app` or your domain
- Add the DNS records Vercel shows you

---

## 👤 Accounts on Launch Day

### Admin Account (pre-seeded)
- **Email:** `admin@fontsverse.app`
- **Password:** `admin123`
- ⚠️ Change this password immediately after first login

### Create User Accounts
- Any visitor can click "Sign In" → "Create Account"
- Accounts are stored in the browser's localStorage
- ⚠️ See "Production Upgrade" below

---

## 🔑 Admin vs User Differences

| Feature | Admin 👑 | User 👤 |
|---|---|---|
| Upload own fonts | ✅ | ✅ |
| Set own fonts public/private | ✅ | ✅ |
| Get integration code | ✅ | ✅ |
| Download fonts | ✅ | ✅ |
| Access /admin page | ✅ | 🚫 |
| Add fonts to platform catalogue | ✅ | 🚫 |
| Remove platform fonts | ✅ | 🚫 |
| Toggle any font's visibility | ✅ | 🚫 |
| See registered user count | ✅ | 🚫 |

---

## ⚠️ Before Going Fully Public (Production Upgrades)

The v1 launch uses **localStorage** for auth — fine for demo/beta, needs upgrading for production:

### Option A: Supabase (recommended, free tier)
```bash
npm install @supabase/supabase-js
```
- Create project at supabase.com
- Replace `lib/auth.ts` with Supabase auth calls
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel env vars

### Option B: Clerk (easiest)
```bash
npm install @clerk/nextjs
```
- clerk.com — handles auth UI, sessions, roles automatically
- ~1 hour to integrate

### Font Storage
- Upload real font files to **Cloudflare R2** or **Supabase Storage** (both free tiers)
- Add an API route `/api/upload` to handle actual file storage

---

## 📦 Current Tech Stack
- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS v4
- **Auth:** localStorage (upgrade to Supabase/Clerk for prod)
- **Storage:** None yet (upgrade to R2/Supabase Storage)
- **Deploy:** Vercel
