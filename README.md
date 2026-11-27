# QuickLunch — Smart Canteen Queue & Token System

Zero-dependency Node.js + Supabase + Vercel prototype for **Innovation & Design Thinking Lab (`AID151`)** — **Theme 1: Campus & Community (Canteen Queue Management)**.

## Project Structure

```text
SmartCanteen/
├── api/                     # Vercel Serverless Functions (/api/*)
│   ├── state.js
│   ├── orders.js
│   ├── orders/[id]/status.js
│   ├── walkin.js
│   ├── menu/[id]/toggle.js
│   └── demo/{rush,reset}.js
├── lib/                     # Shared business logic (used by both Vercel & server.js)
│   ├── env.js
│   ├── supabaseClient.js
│   ├── canteenStore.js
│   └── httpHelpers.js
├── public/                  # Frontend UI + Offline QR SVG Generator
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── qr.js
├── supabase/
│   └── schema.sql           # Database tables + RLS policies
├── server.js                # Local dev server (also falls back to memory if no .env)
├── vercel.json              # Cache-control headers for Vercel
├── .env.example             # Safe env template (never commit .env!)
└── .gitignore
```

---

## Step 1: Create Tables in Supabase (One-Time)

1. Open your **Supabase Dashboard** → **SQL Editor** → **New query**.
2. Copy everything from `supabase/schema.sql` and click **Run**.
3. Wait for `Success`. The app automatically seeds the canteen menu and starter tokens on first load!

---

## Step 2: Push Safely to Your Friend's GitHub Repo

1. Your friend creates a new repo on GitHub (e.g., `SmartCanteen`) and adds you under **Settings → Collaborators**.
2. From your laptop inside `SmartCanteen`:
   ```bash
   git init
   git add .
   git status   # Confirm .env is NOT listed (it is ignored by .gitignore)
   git commit -m "QuickBite Smart Canteen prototype with Supabase + Vercel"
   git branch -M main
   git remote add origin https://github.com/FRIEND-USERNAME/SmartCanteen.git
   git push -u origin main
   ```

---

## Step 3: Deploy on Vercel (Always-On, No Sleep!)

1. Sign in to **vercel.com** with GitHub → **Add New → Project** → import `SmartCanteen`.
2. Open **Environment Variables** before clicking Deploy and add:
   - `SUPABASE_URL` = `https://czheoiiwcrppcipajeom.supabase.co`
   - `SUPABASE_SECRET_KEY` = *(your `sb_secret_...` key from `.env`)*
3. Click **Deploy**. Your friend gets a permanent live URL (e.g., `https://smart-canteen-xxx.vercel.app`) that works across **multiple phones** and **never sleeps**!

---

## Local Testing (Laptop)

Double-click `start.bat` or run:
```bash
node server.js
```
Open `http://localhost:3000/?view=demo` for the **Examiner Split-Screen Viva Demo**.
