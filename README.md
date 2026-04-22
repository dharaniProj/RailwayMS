# 🚂 Railway Management System (RailwayMS)

> A full-stack Employee & Operations Management System for Indian Railways — built with **React**, **Node.js**, **PostgreSQL**, and **Cloudinary**. Deployed live on **Vercel** + **Render** + **Neon**.

🌐 **Live App:** [railway-ms.vercel.app](https://railway-ms.vercel.app)  
🔌 **API:** [railwayms.onrender.com](https://railwayms.onrender.com)

---

## ✨ Features

### 👑 Admin Portal
| Module | Capabilities |
|---|---|
| **Dashboard** | System overview — employees, leaves, transfers, recent activity |
| **Employee Directory** | Full CRUD, profile photos, 15+ fields (Aadhaar, PAN, designation, etc.) |
| **Register Employee** | Dedicated onboarding portal with auto-password generation |
| **Salary** | Manage pay structure, generate PDF payslips, full salary history |
| **Leaves** | Approve / reject leave requests, view leave calendar |
| **Transfers** | Initiate and track employee transfers between divisions |
| **Railway Pass** | Issue, manage, and renew railway concessional passes |
| **Documents** | Upload and manage employee documents via Cloudinary |
| **Meetings & Conferences** | Schedule meetings, invite participants, attach documents, upload MoM |
| **Announcements** | Broadcast notices to all employees |
| **Profile** | Admin profile management with photo upload |
| **Notifications** | Real-time in-app notifications for all key actions |

### 👤 Employee Portal
| Module | Capabilities |
|---|---|
| **Dashboard** | Personalised overview of leaves, salary, recent notices |
| **Profile** | View & update personal details, upload profile photo |
| **Salary** | View salary slips, download PDF payslips |
| **Leaves** | Apply for leave, track approval status |
| **Transfers** | View own transfer history |
| **Railway Pass** | Request and view railway pass status |
| **Documents** | Access personal uploaded documents |
| **Meetings & Conferences** | View scheduled meetings, confirm attendance, download attachments, view MoM |
| **Announcements** | Read broadcast notices |
| **Notifications** | In-app notifications for meetings, leave decisions, etc. |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Backend** | Node.js 18+, Express.js |
| **Database** | PostgreSQL (via Neon serverless in production) |
| **File Storage** | Cloudinary (images + documents) |
| **Authentication** | JWT (JSON Web Tokens) + bcrypt |
| **PDF Generation** | jsPDF + jsPDF-AutoTable |
| **HTTP Client** | Axios |
| **Hosting (Frontend)** | Vercel |
| **Hosting (Backend)** | Render |
| **Hosting (Database)** | Neon |

---

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v14 or higher (for local development)
- [Git](https://git-scm.com/)
- A free [Cloudinary](https://cloudinary.com) account

---

## ⚙️ Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/dharaniProj/RailwayMS.git
cd RailwayMS
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
# Server
PORT=5000

# PostgreSQL (local)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/railway_management

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (from cloudinary.com/console → API Keys)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Setup the Database

```bash
# Create the database (one-time)
psql -U postgres -c "CREATE DATABASE railway_management;"

# Run main schema migration
cd backend
node db/migrate.js

# Run additional schema migrations
node db/migrate_v2.js
node db/comprehensive_migrate.js
node db/migrate_meetings.js
```

### 4. Seed Test Data (Optional)

```bash
node db/seed.js
```

> Creates the admin account + 5 test employees with salary history, leaves, and transfers.

### 5. Setup the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 6. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
# Runs at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Runs at http://localhost:5173
```

---

## 🗂 Project Structure

```
RailwayMS/
├── backend/
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection pool
│   │   └── cloudinary.js      # Cloudinary SDK configuration
│   ├── controllers/           # Business logic handlers
│   │   ├── auth.js
│   │   ├── employee.js
│   │   ├── salary.js
│   │   ├── leave.js
│   │   ├── transfer.js
│   │   ├── document.js
│   │   ├── railwayPass.js
│   │   ├── announcement.js
│   │   ├── notification.js
│   │   └── meeting.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verifyToken + isAdmin guards
│   ├── routes/                # Express route definitions
│   │   ├── auth.js
│   │   ├── employee.js
│   │   ├── salary.js
│   │   ├── leave.js
│   │   ├── transfer.js
│   │   ├── document.js
│   │   ├── railwayPass.js
│   │   ├── announcement.js
│   │   ├── notification.js
│   │   └── meeting.js
│   ├── db/
│   │   ├── migrate.js           # Core schema (employees, auth)
│   │   ├── migrate_v2.js        # Extended employee fields
│   │   ├── comprehensive_migrate.js  # Salary, leaves, transfers, docs
│   │   ├── migrate_meetings.js  # Meetings module tables
│   │   ├── migrate_salary.js    # Salary extended fields
│   │   ├── fix_schema.js        # One-off schema patches
│   │   ├── seed.js              # Full test data seed
│   │   └── seed_samples.js      # Minimal seed (for fresh environments)
│   └── server.js              # App entry point + route registration
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminProfile.jsx
│       │   ├── AdminSalary.jsx
│       │   ├── AdminMeetings.jsx
│       │   ├── RegisterEmployee.jsx
│       │   ├── EmployeeDashboard.jsx
│       │   ├── EmployeeProfile.jsx
│       │   ├── EmployeeSalary.jsx
│       │   ├── EmployeeMeetings.jsx
│       │   ├── Leaves.jsx
│       │   ├── Transfers.jsx
│       │   ├── Documents.jsx
│       │   ├── RailwayPass.jsx
│       │   ├── Announcements.jsx
│       │   └── ChangePassword.jsx
│       ├── components/
│       │   ├── Sidebar.jsx         # Shared navigation sidebar
│       │   └── NotificationCenter.jsx
│       ├── apiConfig.js            # Central API base URL config
│       ├── App.jsx                 # Route definitions
│       └── index.css              # Global design system
│
└── docs/
    ├── DEPLOYMENT.md          # Step-by-step deployment guide
    ├── MANUAL.md              # User manual for Admin & Employee
    ├── PROJECT_DETAILS.md     # Full technical specification
    └── TEST_ACCOUNTS.md       # Default login credentials
```

---

## 🔐 Default Login Credentials

| Role | Employee ID | Password |
|---|---|---|
| Admin | ADM001 | admin123 |
| Employee | EMP101 | Rajesh@1985 |
| Employee | EMP102 | Priya@1990 |
| Employee | EMP103 | Arjun@1988 |
| Employee | EMP104 | Sneha@1992 |
| Employee | EMP105 | Vikram@1987 |

> See `docs/TEST_ACCOUNTS.md` for full details.

---

## 🌐 API Endpoints Overview

All routes are prefixed with `/api`:

| Endpoint | Description |
|---|---|
| `/api/auth` | Login, token validation |
| `/api/employees` | Employee CRUD, profile photo upload |
| `/api/salary` | Pay structure, payslip generation |
| `/api/leaves` | Leave applications and approvals |
| `/api/transfers` | Transfer records |
| `/api/documents` | Document upload/download (Cloudinary) |
| `/api/railwayPass` | Railway pass management |
| `/api/announcements` | Broadcast notices |
| `/api/notifications` | In-app notification feed |
| `/api/meetings` | Meeting scheduling, participants, MoM |

---

## 🚀 Deployment

This project is deployed **fully** using:
- **Frontend** → [Vercel](https://vercel.com) (auto-deploy on `git push`)
- **Backend** → [Render](https://render.com) (Web Service, auto-deploy)
- **Database** → [Neon](https://neon.tech) (serverless PostgreSQL)
- **File Storage** → [Cloudinary](https://cloudinary.com) (Document & Image storage)

See `docs/DEPLOYMENT.md` for complete step-by-step deployment instructions.

---

## 📄 License

This project is developed by SuryaVanapalli14
contact @ suryavanapalli14@gmail.com
