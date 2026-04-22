# Deployment Guide — Railway Management System

Deploy the full application for **free** using:

| Part | Service | Cost |
|---|---|---|
| Frontend (React) | **Vercel** | Free |
| Backend (Node.js) | **Render** | Free (750 hrs/month) |
| Database (PostgreSQL) | **Neon** | Free (0.5 GB) |
| File Storage | **Cloudinary** | Free (25 GB) |

> This guide deploys everything for showcase/demo purposes.  
> All services used have generous free tiers with no credit card required.

---

## Before You Start

Make sure you have:
- Your project code pushed to a **GitHub repository** (public or private)
- A Cloudinary account with credentials (already set up)
- Accounts on: [Vercel](https://vercel.com), [Render](https://render.com), [Neon](https://neon.tech)

---

## Step 1 — Push Code to GitHub

If you haven't already:

```bash
cd "c:\My Projects\Railway"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/railway-management.git
git push -u origin main
```

> Create the GitHub repo first at [github.com/new](https://github.com/new)

---

## Step 2 — Setup Database on Neon (Free PostgreSQL)

**Neon gives you a free cloud PostgreSQL database.**

1. Go to [neon.tech](https://neon.tech) → Sign up (GitHub login works)
2. Click **"Create a project"**
3. Name it `railway-management`, choose a region close to you
4. Once created, click **"Connection Details"**
5. Copy the **Connection String** — it looks like:
   ```
   postgresql://username:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
   ```
6. **Save this** — you'll need it for Render (backend)

**Run your migration on Neon:**

Install the Neon CLI or use their web SQL editor:
- In the Neon dashboard → **SQL Editor**
- Copy and paste the entire content of `backend/db/migrate.js` SQL (the CREATE TABLE statements)
- Run it

Or connect via psql:
```bash
psql "postgresql://username:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require" -f backend/db/migrate.sql
```

---

## Step 3 — Deploy Backend on Render

**Render gives you a free Node.js server.**

1. Go to [render.com](https://render.com) → Sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `railway-management-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Under **"Environment Variables"**, add all your `.env` values:

   | Key | Value |
   |---|---|
   | `PORT` | `5000` |
   | `DB_HOST` | *(from Neon — the host part of your connection string)* |
   | `DB_USER` | *(from Neon)* |
   | `DB_PASSWORD` | *(from Neon)* |
   | `DB_NAME` | `neondb` *(or your Neon DB name)* |
   | `DB_PORT` | `5432` |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | *(any long random string)* |
   | `CLOUDINARY_CLOUD_NAME` | `dfflkbsmt` |
   | `CLOUDINARY_API_KEY` | `664658325196824` |
   | `CLOUDINARY_API_SECRET` | *(your secret)* |

6. Click **"Create Web Service"**
7. Wait for deployment (2–5 minutes)
8. Copy your backend URL — it will look like: `https://railway-management-backend.onrender.com`

> **Important:** Add SSL support for Neon. In `backend/config/db.js`, make sure SSL is enabled when `DB_SSL=true`.

---

## Step 4 — Update Frontend API URL

Before deploying the frontend, update the API base URL from `localhost` to your Render URL.

**Option A (Quick — create .env file in frontend):**

Create `frontend/.env.production`:
```env
VITE_API_URL=https://railway-management-backend.onrender.com
```

Then replace all `http://localhost:5000` occurrences in your frontend pages with `import.meta.env.VITE_API_URL`.

**Option B (Simpler for now — global find & replace):**

In VS Code: `Ctrl+Shift+H` (Find & Replace in all files)
- Find: `http://localhost:5000`
- Replace: `https://railway-management-backend.onrender.com`
- Click **Replace All**

Commit and push the change.

---

## Step 5 — Deploy Frontend on Vercel

**Vercel gives you instant free hosting for React/Vite apps.**

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **"Deploy"**
6. Done! In ~2 minutes you'll get a URL like: `https://railway-management.vercel.app`

---

## Step 6 — Seed Data on Production

After both backend and DB are deployed, seed your test data:

1. Open the Neon SQL Editor (or use psql with the Neon connection string)
2. Run your seed SQL to create the admin account and test employees

Or create a one-time endpoint in your backend to trigger seeding (then remove it after).

---

## Final Checklist

| Item | Status |
|---|---|
| GitHub repo with latest code | ✅ |
| Neon DB created + migration run | ✅ |
| Render backend deployed + env vars set | ✅ |
| Frontend API URL updated to Render URL | ✅ |
| Vercel frontend deployed | ✅ |
| Test login with ADM001 / admin123 | ✅ |
| Test document upload (Cloudinary) | ✅ |

---

## Troubleshooting

### "Cannot connect to database"
- Verify all DB env vars on Render match your Neon connection details
- Make sure `DB_SSL=true` is set and your `db.js` handles SSL

### "CORS error" on frontend
- In `backend/server.js`, update CORS to allow your Vercel URL:
  ```js
  app.use(cors({ origin: ['https://your-app.vercel.app', 'http://localhost:5173'] }));
  ```

### "Render app sleeps after 15 min"
- This is normal on Render's free tier — first request after idle wakes it (takes ~30 sec)
- For always-on, upgrade to a paid plan or use an uptime monitor like [UptimeRobot](https://uptimerobot.com) (free) to ping your app every 10 minutes

### "Cloudinary upload fails on production"
- Ensure your Cloudinary env vars are correctly set on Render
- Double-check there are no extra spaces in the values

---

## Estimated Costs

| Service | Limit | Cost |
|---|---|---|
| Vercel | 100 GB bandwidth/month | Free |
| Render | 750 hours/month (1 service = always on) | Free |
| Neon | 0.5 GB storage, 190 compute hours/month | Free |
| Cloudinary | 25 GB storage + bandwidth | Free |

**Total: $0/month** for a showcase/demo project.
