# Railway Management System

> A full-stack Employee Management System for Indian Railways — built with React, Node.js, PostgreSQL, and Cloudinary.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| File Storage | Cloudinary |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| PDF Generation | jsPDF + jsPDF-AutoTable |
| HTTP Client | Axios |

---

## Prerequisites

Make sure you have these installed on your system:

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v14 or higher
- [Git](https://git-scm.com/)
- A free [Cloudinary](https://cloudinary.com) account

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/railway-management.git
cd railway-management
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

#### Create the environment file

Create a file named `.env` inside the `backend/` folder:

```env
# Server
PORT=5000

# PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=railway_management
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (get from cloudinary.com/console → API Keys)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Setup the Database

Create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE railway_management;"
```

Run the migration to create all tables:

```bash
cd backend
node db/migrate.js
```

### 4. Seed Initial Data (Optional — test data)

```bash
node db/seed.js
```

> This creates the admin account and 5 test employees with salary history.

### 5. Setup the Frontend

```bash
cd ../frontend
npm install
```

### 6. Start the Application

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```
Backend runs at: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## Project Structure

```
Railway/
├── backend/
│   ├── config/
│   │   ├── db.js            # PostgreSQL connection
│   │   ├── firebase.js      # Firebase (auth only)
│   │   └── cloudinary.js    # Cloudinary config
│   ├── controllers/         # Business logic
│   ├── middleware/          # JWT auth middleware
│   ├── routes/              # Express API routes
│   ├── db/
│   │   └── migrate.js       # DB schema creation
│   └── server.js            # Entry point
└── frontend/
    └── src/
        ├── pages/           # React page components
        ├── components/      # Shared components (Sidebar, etc.)
        └── utils/           # PDF generator, helpers
```

---

## Default Login Credentials

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

## API Base URL

All API routes are prefixed with `/api`:

```
http://localhost:5000/api/auth
http://localhost:5000/api/employees
http://localhost:5000/api/documents
http://localhost:5000/api/leaves
http://localhost:5000/api/transfers
http://localhost:5000/api/salary
http://localhost:5000/api/announcements
http://localhost:5000/api/notifications
```

---

## Deployment

See `docs/DEPLOYMENT.md` for step-by-step instructions to deploy this project for free using **Render** (backend) + **Vercel** (frontend) + **Neon** (PostgreSQL).