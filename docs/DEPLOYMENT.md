# 🚀 Deployment Guide — Railway Management System

This guide walks you through deploying RailwayMS completely for free using:
- **Neon** — serverless PostgreSQL database
- **Cloudinary** — file storage
- **Render** — Node.js backend hosting
- **Vercel** — React frontend hosting

---

## Step 1: Database — Neon

1. Sign up at [neon.tech](https://neon.tech) (free tier).
2. Create a new project (e.g., `railway-management`).
3. Copy the **Connection String** (looks like `postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require`).
4. In your Neon SQL editor, run the migrations in this order:

```sql
-- (Paste and run each file's contents sequentially)
-- 1. backend/db/migrate.js
-- 2. backend/db/migrate_v2.js
-- 3. backend/db/comprehensive_migrate.js
-- 4. backend/db/migrate_salary.js
-- 5. backend/db/migrate_meetings.js
-- 6. backend/db/fix_schema.js
```

Or run them locally against the Neon URL:
```bash
DATABASE_URL="your_neon_connection_string" node db/migrate.js
DATABASE_URL="your_neon_connection_string" node db/migrate_v2.js
DATABASE_URL="your_neon_connection_string" node db/comprehensive_migrate.js
DATABASE_URL="your_neon_connection_string" node db/migrate_salary.js
DATABASE_URL="your_neon_connection_string" node db/migrate_meetings.js
DATABASE_URL="your_neon_connection_string" node db/fix_schema.js
```

5. Seed initial data:
```bash
DATABASE_URL="your_neon_connection_string" node db/seed.js
```

---

## Step 2: File Storage — Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier).
2. Go to **Dashboard → API Keys**.
3. Note down:
   - Cloud Name
   - API Key
   - API Secret

---

## Step 3: Backend — Render

1. Sign up at [render.com](https://render.com).
2. Click **New → Web Service**.
3. Connect your GitHub repository (`dharaniProj/RailwayMS`).
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add the following **Environment Variables** in Render dashboard:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | A long random string (e.g. generate with `openssl rand -hex 32`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

6. Click **Deploy** — Render will build and start your backend.
7. Note your backend URL: `https://railwayms.onrender.com` (or your assigned subdomain).

---

## Step 4: Frontend — Vercel

1. Sign up at [vercel.com](https://vercel.com).
2. Click **Add New Project** → Import your GitHub repository.
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the following **Environment Variable** in Vercel dashboard:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://railwayms.onrender.com` (your Render URL) |

5. Click **Deploy**.
6. Your frontend is now live at `https://railway-ms.vercel.app`.

---

## Step 5: Configure CORS (if using a custom domain)

If you use a custom domain for Vercel, add it to Render's environment:

| Key | Value |
|---|---|
| `CORS_ORIGIN` | `https://your-custom-domain.com` |

The backend's CORS config also auto-allows all `*.vercel.app` subdomains for this project.

---

## Auto-Deployment

Both Vercel and Render are connected to the GitHub repository. Any `git push` to the `main` branch will:
- Trigger a **Vercel** frontend redeploy automatically.
- Trigger a **Render** backend redeploy automatically.

---

## Health Check

After deployment, verify the backend is running:
```
GET https://railwayms.onrender.com/
→ { "status": "ok", "service": "Railway Management System API" }
```

---

## ⚠️ Important Notes

- **Render free tier sleeps** after 15 minutes of inactivity. First request after sleep may take ~30 seconds.
- **Neon free tier** has a compute-pause feature — first DB query after idle may be slightly slow.
- Do **not** commit `.env` files to Git — they are in `.gitignore`.
