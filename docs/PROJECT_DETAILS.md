# 📚 Project Details — Railway Management System

## Overview

The **Railway Management System (RailwayMS)** is a full-stack web application designed to digitise and streamline employee operations for an Indian Railways division. It replaces manual/paper-based processes with a secure, role-based digital platform.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (Vercel)                   │
│  React 18 SPA  →  React Router v6  →  Axios        │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS / REST API
┌───────────────────────▼─────────────────────────────┐
│                  BACKEND (Render)                   │
│  Node.js + Express  →  JWT Auth  →  Multer          │
└──────────┬─────────────────────────┬────────────────┘
           │ SQL (pg pool)           │ Upload
┌──────────▼──────────┐   ┌─────────▼──────────────────┐
│  PostgreSQL (Neon)  │   │  Cloudinary (File Storage)  │
└─────────────────────┘   └────────────────────────────┘
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|---|---|
| `employees` | Master employee record — personal, employment, financial info |
| `salary_records` | Monthly salary history per employee |
| `leave_applications` | Leave requests with status tracking |
| `transfers` | Employee inter-division transfer records |
| `documents` | Document metadata — Cloudinary URL, file name, type |
| `railway_passes` | Concessional travel pass records |
| `announcements` | Broadcast notices from admin |
| `notifications` | In-app notification feed |
| `meetings` | Meeting schedule, type, agenda, MoM URL |
| `meeting_participants` | Many-to-many: meetings ↔ employees + attendance status |
| `meeting_documents` | Documents attached to specific meetings |

### Key Relationships

- An employee can have **many** salary records, leaves, transfers, documents, railway passes.
- A meeting has **many** participants and **many** attached documents.
- Notifications are linked to individual employees.

---

## Authentication & Security

- **JWT-based stateless auth** — tokens are issued on login, stored in `localStorage`.
- All protected routes use the `verifyToken` middleware.
- Admin-only routes additionally require `isAdmin` middleware.
- Passwords are hashed with **bcrypt** (salt rounds: 10).
- CORS is strictly configured to only allow the Vercel deployment and localhost.

---

## Modules — Technical Detail

### 1. Employee Management
- Full CRUD for employee records.
- Stores 15+ fields: name, DOB, Aadhaar, PAN, designation, department, grade pay, bank details, emergency contact.
- Profile photo upload to Cloudinary (`image` resource type).

### 2. Salary Module
- Admin sets monthly pay structure (basic + allowances + deductions).
- PDF payslip generation client-side using **jsPDF**.
- Employees can view and download their own payslips.

### 3. Leave Management
- Employees apply for CL, EL, SL, etc.
- Admin approves/rejects with remarks.
- Status badges (Pending / Approved / Rejected) with real-time notification on decision.

### 4. Transfer Module
- Admin creates transfer records (from division, to division, date).
- Employees can view their own transfer history.

### 5. Documents
- Employees upload personal documents (Aadhaar, PAN, certificates, payslips).
- Files stored on Cloudinary using `image` resource type for universal delivery (PDFs included).
- Secure download via Cloudinary signed URLs.

### 6. Railway Pass
- Admin issues concessional rail passes.
- Tracks pass number, validity, class, dependent details.

### 7. Meetings & Conferences *(Latest Module)*
- Admin schedules meetings (title, date/time, type: Online/Offline, link/location, agenda).
- Multi-participant selection with checkbox UI.
- Document attachment (circulars, notes) uploaded to Cloudinary.
- **Live countdown timer** on Employee portal for upcoming meetings.
- Employees confirm attendance — updates `meeting_participants.status`.
- Admin uploads **Minutes of Meeting (MoM)** — marks meeting as Completed.
- Automated in-app notifications sent to all participants on meeting creation.

### 8. Announcements
- Admin broadcasts notices to all employees.
- Employees see announcements on their dashboard.

### 9. Notifications
- In-app notification center (bell icon in header).
- Notifications triggered for: new meetings, leave decisions, new documents.

---

## Cloudinary Strategy

All files (including PDFs) are uploaded using the `image` resource type. This avoids Cloudinary's strict `raw` delivery access controls which block direct file viewing on the free plan. This applies to:
- Employee documents
- Meeting attachments
- Minutes of Meeting (MoM)

---

## Frontend Design System

Global styles in `frontend/src/index.css`:

| Token | Value |
|---|---|
| `--primary` | `#2f2f8f` (Indian Railways blue) |
| `--primary-dark` | `#222272` |
| `--primary-light` | `#4a4ab8` |
| `--success` | `#22c55e` |
| `--danger` | `#ef4444` |
| `--warning` | `#f59e0b` |
| Font | Inter (Google Fonts) |

Key CSS classes: `.card`, `.btn`, `.btn-outline`, `.btn-danger`, `.input-group`, `.badge`, `.alert-*`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000, Render uses 10000) |
| `DATABASE_URL` | Full PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CORS_ORIGIN` | *(Optional)* Extra comma-separated allowed origins |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |

---

## Migration Scripts

Run these in order for a fresh database:

```bash
node db/migrate.js              # Core: employees, auth
node db/migrate_v2.js           # Extended employee fields
node db/comprehensive_migrate.js # Salary, leaves, transfers, docs, notifications
node db/migrate_salary.js       # Salary extended columns
node db/migrate_meetings.js     # Meetings, participants, meeting_documents
node db/fix_schema.js           # Schema patches (safe to re-run)
```

---

## Known Limitations / Future Work

- Email notifications (SMTP) are not yet integrated — currently in-app only.
- No calendar export (iCal) for meetings yet.
- No mobile-responsive layout (optimised for desktop).
- Single-region PostgreSQL — no read replicas.
