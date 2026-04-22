# 🖥️ User Manual — Railway Management System

## Accessing the Application

**Live URL:** [https://railway-ms.vercel.app](https://railway-ms.vercel.app)

Login using your **Employee ID** and **Password** assigned by the administrator.

---

## 👑 Admin Guide

### Dashboard
- Displays a snapshot of total employees, pending leaves, active transfers, and recent notifications.
- Quick-access cards link to each module.

---

### Employee Directory
- View all registered employees in a searchable list.
- Click any employee to view full details.
- Edit employee details including personal info, bank details, designations, and contact.
- Upload or change an employee's profile photo.

---

### Register Employee
- Navigate to **Register Employee** in the sidebar.
- Fill in all required fields (name, DOB, designation, department, Aadhaar, PAN, bank details, etc.).
- A secure temporary password is auto-generated and shown upon registration.
- Share the Employee ID and temporary password with the new employee securely.

---

### Salary Management
- Go to **Salary** in the sidebar.
- Select an employee to view or update their pay structure (Basic Pay, HRA, DA, TA, deductions).
- Click **Generate Payslip** to produce a downloadable PDF payslip for any month.
- Salary history is maintained and viewable per employee.

---

### Leave Management
- View all pending leave applications under **Leaves**.
- Each request shows: Employee, Leave Type, Dates, Reason.
- Click **Approve** or **Reject** (add remarks if needed).
- Employee is automatically notified of the decision.

---

### Transfers
- Navigate to **Transfers**.
- Click **+ New Transfer** to initiate a transfer (select employee, from/to division, transfer date).
- All historical transfers are listed per employee.

---

### Railway Pass
- Navigate to **Railway Pass**.
- Issue a new pass for an employee (pass number, validity, class, station details, dependants).
- View and manage active and expired passes.

---

### Documents
- Navigate to **Documents**.
- Select an employee and upload documents (PDF, JPG, PNG).
- Documents are stored securely on Cloudinary.
- Click any document link to view/download.

---

### Meetings & Conferences
- Navigate to **Meetings** in the sidebar.
- Click **➕ Schedule New Meeting** to open the scheduling form.

**Filling the Form:**
1. Enter a **Meeting Title**.
2. Select the **Date** and **Time**.
3. Choose **Type**: Online (provide a Zoom/Meet/Webex link) or Offline (provide a room/location).
4. Write an **Agenda**.
5. Select **Participants** using the checklist — all selected employees receive an in-app notification.
6. Optionally attach documents (PDFs, images) — circulars, notes, etc.
7. Click **✨ Send Invitations & Schedule**.

**After the Meeting:**
- Click **📄 Upload MoM** on any non-completed meeting card.
- Upload the Minutes of Meeting document.
- Click **✅ Save MoM & Complete** — the meeting status changes to `Completed` and the MoM is available to all participants.

---

### Announcements
- Navigate to **Announcements**.
- Click **+ New Announcement**, add a title and content, and publish.
- All employees immediately see the announcement in their portal.

---

### Profile
- Click **Profile** in the sidebar.
- Update your name, contact details, and upload a profile photo.
- Use **Change Password** to update your login password.

---

## 👤 Employee Guide

### Dashboard
- See a personalised summary: upcoming meetings with live countdown, leave balance, recent salary, and notices.

---

### Profile
- View and update your personal information.
- Upload a profile photo.
- Use **Change Password** to change your password.

---

### Salary
- View your monthly salary structure.
- Download PDF payslips for any available month.

---

### Leaves
- Click **Apply for Leave**.
- Select leave type (CL, EL, SL, etc.), date range, and reason.
- Track your application status (Pending / Approved / Rejected).
- You'll receive an in-app notification when admin takes action.

---

### Transfers
- View your complete transfer history (dates, from/to division).

---

### Railway Pass
- View the status of your issued railway concessional pass.
- See validity, class, and dependent information.

---

### Documents
- View and download your personal documents uploaded by the admin.

---

### Meetings & Conferences
- View all meetings you have been invited to.
- Each meeting card shows: title, date/time, type, agenda, and a **live countdown timer** for upcoming meetings.
- If the meeting link is online, it is displayed for direct access.
- Attached documents and circulars can be downloaded directly.
- Click **✓ Confirm Attendance** to let the admin know you will attend.
- After the meeting, view the **Minutes of Meeting (MoM)** document when published.

---

### Announcements
- Read all broadcast notices from the administration.

---

### Notifications
- Click the 🔔 bell icon in the top-right corner.
- See all recent notifications: new meetings, leave decisions, new documents.
