# Project Details — Railway Management System

A complete technical reference for developers.

---

## Overview

The Railway Management System is a role-based web application designed to manage employee operations for a railway organization. It provides secure, separate portals for administrators and employees.

---

## Architecture

```
┌─────────────────────┐       HTTP/REST       ┌────────────────────────┐
│   React Frontend    │ ◄──────────────────► │  Node.js/Express API   │
│   (Vite, SPA)       │                       │  (REST API Server)     │
└─────────────────────┘                       └──────────┬─────────────┘
                                                         │
                              ┌──────────────────────────┤
                              │                          │
                   ┌──────────▼─────────┐    ┌──────────▼──────────┐
                   │    PostgreSQL DB    │    │  Cloudinary Storage  │
                   │  (metadata, users, │    │  (PDF, DOC, images)  │
                   │   leaves, etc.)    │    │                       │
                   └────────────────────┘    └──────────────────────┘
```

---

## Technology Stack — Detailed

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI component framework |
| Vite | 5+ | Build tool and dev server |
| React Router DOM | v6 | Client-side routing, protected routes |
| Axios | latest | HTTP requests to backend API |
| jsPDF | latest | PDF generation (payslips) |
| jsPDF-AutoTable | latest | Table rendering in PDFs |
| html2canvas | latest | HTML-to-image for PDF |
| DOMPurify | latest | Sanitize HTML in announcements |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4 | Web framework / API routing |
| pg (node-postgres) | latest | PostgreSQL client |
| bcrypt | latest | Password hashing |
| jsonwebtoken | latest | JWT creation and verification |
| multer | latest | Multipart file upload handling |
| cloudinary | latest | Cloud file storage (upload/delete) |
| firebase-admin | latest | Firebase SDK (Auth, legacy) |
| dotenv | latest | Environment variable management |
| cors | latest | Cross-origin request handling |

### Database

| Technology | Purpose |
|---|---|
| PostgreSQL 14+ | Relational database for all data |

### Cloud Services

| Service | Purpose | Free Tier |
|---|---|---|
| Cloudinary | File storage (PDFs, images, docs) | 25 GB storage + bandwidth |
| Firebase (optional) | Auth / legacy integration | Free Spark plan |

---

## Database Schema

### `employees` table
The core table storing all user accounts (both admin and employees).

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Internal auto ID |
| employee_id | VARCHAR | Login username (e.g., EMP101) |
| name | VARCHAR | Full name |
| email | VARCHAR | Email address |
| password | VARCHAR | bcrypt-hashed password |
| role | VARCHAR | `admin` or `employee` |
| phone_number | VARCHAR | Phone |
| date_of_birth | DATE | Date of birth |
| gender | VARCHAR | Gender |
| marital_status | VARCHAR | Marital status |
| department | VARCHAR | Department name |
| designation | VARCHAR | Job title |
| joining_date | DATE | Date joined |
| employment_type | VARCHAR | Full-time, Contract, etc. |
| work_location | VARCHAR | City/location |
| salary | NUMERIC | Annual CTC |
| aadhaar_number | VARCHAR | Aadhaar ID |
| pan_number | VARCHAR | PAN card |
| leave_count | INTEGER | Leaves taken |
| is_first_login | BOOLEAN | Forces password change |
| created_at | TIMESTAMP | Registration time |

### `documents` table
Stores document metadata. Files are stored in Cloudinary.

| Column | Type | Description |
|---|---|---|
| doc_id | SERIAL PK | Document ID |
| emp_id | INTEGER FK | References employees.id |
| title | VARCHAR | Document label |
| category | VARCHAR | Salary, Leave, ID Proof, etc. |
| file_url | TEXT | Cloudinary HTTPS URL |
| file_name | TEXT | Original filename |
| file_type | VARCHAR | MIME type |
| file_size | INTEGER | Bytes |
| uploaded_by | VARCHAR | Uploader's employee_id |
| storage_public_id | TEXT | Cloudinary public_id for deletion |
| uploaded_at | TIMESTAMP | Upload time |

### `leaves` table
Tracks all leave applications and their approval status.

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Leave ID |
| emp_id | INTEGER FK | Applicant employee |
| subject | VARCHAR | Leave subject |
| reason | TEXT | Detailed reason |
| status | VARCHAR | `pending`, `approved`, `rejected` |
| applied_at | TIMESTAMP | Application date |
| start_date | DATE | Leave start |
| end_date | DATE | Leave end |

### `transfers` table
Tracks transfer requests from employees.

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Transfer ID |
| emp_id | INTEGER FK | Requesting employee |
| current_location | VARCHAR | Current posting |
| requested_location | VARCHAR | Desired location |
| reason | TEXT | Reason for transfer |
| status | VARCHAR | `pending`, `approved`, `rejected` |
| applied_at | TIMESTAMP | Request date |

### `announcements` table
Admin-posted notices visible to all employees.

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Announcement ID |
| title | VARCHAR | Headline |
| content | TEXT | Full message (HTML allowed, sanitized) |
| created_by | VARCHAR | Admin who posted it |
| created_at | TIMESTAMP | Post time |

### `salary_history` table
Monthly payroll records for each employee.

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Record ID |
| emp_id | INTEGER FK | Employee |
| month | INTEGER | 1–12 |
| year | INTEGER | e.g., 2026 |
| gross_salary | NUMERIC | Before deductions |
| deductions | NUMERIC | Total deductions |
| net_salary | NUMERIC | Take-home pay |
| generated_at | TIMESTAMP | When calculated |

### `notifications` table
System notifications delivered to employees.

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Notification ID |
| emp_id | INTEGER FK | Target employee |
| message | TEXT | Notification text |
| type | VARCHAR | `leave`, `transfer`, `salary`, `general` |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | When generated |

---

## API Endpoints

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Login and receive JWT |

### Employees
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /api/employees | Admin | List all employees |
| GET | /api/employees/me | Any | Get own profile |
| POST | /api/employees | Admin | Register new employee |
| PUT | /api/employees/admin/profile | Admin | Update admin name/username/password |
| PUT | /api/employees/:id/salary | Admin | Update employee salary |
| POST | /api/employees/:id/reset-password | Admin | Reset employee password |
| DELETE | /api/employees/:id | Admin | Delete employee |

### Documents
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/documents/upload | Any auth | Upload a file to Cloudinary |
| GET | /api/documents/all | Admin | All documents (filterable) |
| GET | /api/documents/:emp_id | Self or Admin | Get employee's documents |
| DELETE | /api/documents/:doc_id | Admin | Delete from Cloudinary + DB |

### Leaves
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/leaves | Employee | Apply for leave |
| GET | /api/leaves | Admin | All leave requests |
| GET | /api/leaves/my | Employee | Own leave requests |
| PUT | /api/leaves/:id/approve | Admin | Approve leave |
| PUT | /api/leaves/:id/reject | Admin | Reject leave |

### Transfers
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/transfers | Employee | Request transfer |
| GET | /api/transfers | Admin | All transfer requests |
| GET | /api/transfers/my | Employee | Own transfers |
| PUT | /api/transfers/:id/approve | Admin | Approve transfer |
| PUT | /api/transfers/:id/reject | Admin | Reject transfer |

### Salary
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /api/salary/:emp_id | Admin/Self | Get salary history |
| POST | /api/salary/generate | Admin | Generate monthly payslip |

### Announcements
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /api/announcements | Any auth | Get all announcements |
| POST | /api/announcements | Admin | Post announcement |
| PUT | /api/announcements/:id | Admin | Edit announcement |
| DELETE | /api/announcements/:id | Admin | Delete announcement |

---

## Security

- **Authentication:** JWT tokens stored in `localStorage`, sent as `Authorization: Bearer <token>` header
- **Password Hashing:** All passwords are bcrypt-hashed with salt rounds = 10
- **Role Enforcement:** `verifyToken` middleware checks JWT on all protected routes; `isAdmin` middleware additionally checks for admin role
- **Document Access:** Employees can only access their own documents (enforced in controller)
- **File Validation:** File type and size validated at both multer middleware level and controller level
- **Input Sanitization:** Announcement content sanitized with DOMPurify before rendering

---

## File Upload Flow

```
User selects file
    ↓
Frontend validation (type, size, title)
    ↓
FormData sent to POST /api/documents/upload
    ↓
Multer parses file → stored in memory buffer
    ↓
Controller validates (type, size, employee exists, access control)
    ↓
Cloudinary.uploader.upload_stream() → file uploaded
    ↓
Cloudinary returns { secure_url, public_id }
    ↓
Metadata saved to PostgreSQL documents table
    ↓
Response returned to frontend with document record
```

---

## PDF Generation

Payslips are generated **entirely in the browser** using jsPDF:
- No server involvement
- Monthly payslip: portrait A4 with full salary breakdown
- Annual payslip: landscape A4 with 12-month summary table + year-to-date totals
- Railway branding in header (organization name, logo placeholder)

---

## Known Limitations / Notes

- The project uses `localStorage` for token storage (acceptable for internal tools; for public apps consider `httpOnly` cookies)
- Firebase is initialized but its Storage is not used (replaced by Cloudinary)
- The chunk size warning in Vite build is due to jsPDF/html2canvas bundling — not a functional issue
- No email notification system is implemented (notifications are in-app only)
