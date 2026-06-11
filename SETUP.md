# FontsVerse — Final Setup (10 minutes)

## Step 1: Run the SQL schema in Supabase

1. Go to supabase.com → your project
2. Click **SQL Editor** (left menu)
3. Click **New query**
4. Open the file `supabase/schema.sql` from this project
5. Paste the entire contents into the editor
6. Click **Run** (green button)

This creates all tables, storage buckets, security rules, and seeds 12 fonts automatically.

---

## Step 2: Get your Supabase keys

Go to **Settings → API** in your Supabase project:

- **anon/public key** → copy it (starts with `eyJ...`)
- **service_role key** → copy it (starts with `eyJ...`) — keep this secret!

---

## Step 3: Set environment variables in Vercel

When you deploy to Vercel, add these in **Settings → Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jgwwnvlvzpvupivmlopj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |

---

## Step 4: Create your admin account

1. Open your deployed site
2. Click **Sign In** → **Create Account**
3. Register with any email/password
4. Go to **Supabase → Table Editor → profiles**
5. Find your row, click it, change `role` from `user` to `admin`
6. Save — you are now admin

---

## What's working now

| Feature | Status |
|---|---|
| User registration & login | ✅ Real Supabase auth |
| Session persistence (page refresh) | ✅ |
| Font upload → Supabase Storage | ✅ Real files stored |
| Font browse → Supabase DB | ✅ Real database |
| Admin vs User roles | ✅ Enforced in DB + UI |
| Ad submissions → Supabase DB | ✅ Saved permanently |
| Admin ad approval | ✅ Approve/reject workflow |
| Live ad strip on homepage | ✅ Shows approved ads |
| Font downloads tracked | ✅ |
| Search autopopulate | ✅ |
| Integration code (8 frameworks) | ✅ |

## AdSense (later)

Once your site has traffic:
1. Apply at google.com/adsense
2. Add `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js">` to layout.tsx
3. Replace the ad strip with an AdSense unit

