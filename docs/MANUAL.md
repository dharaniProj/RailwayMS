# User Manual — Railway Management System

**Version:** 1.0 | **For:** Admin and Employee Users

---

## What is this System?

The Railway Management System is a web application that helps manage railway employees. Think of it like a digital office — where admins can manage staff and employees can check their own information, apply for leaves, view documents, and more.

---

## How to Login

1. Open your browser and go to the system URL (e.g., `http://localhost:5173`)
2. You will see the **Login Page**
3. Enter your **Employee ID** (e.g., `ADM001` or `EMP101`)
4. Enter your **Password**
5. Click **Sign In**

> **First-time employees:** You will be asked to change your password right after logging in for the first time.

---

# ADMIN GUIDE

The admin has full control over the system. Here is what each section does:

---

## Dashboard

The first page you see after logging in. It shows:
- Total number of employees
- Pending leave requests count
- Pending transfer requests count
- Recent activity
- Quick links to common actions

---

## Register Employee

**Where:** Sidebar → Register Employee

Use this to add a new employee to the system.

**Steps:**
1. Fill in the employee's personal details (Name, Date of Birth, Gender, etc.)
2. Fill in their job details (Department, Designation, Salary, etc.)
3. Fill in their ID details (Aadhaar, PAN, etc.)
4. Click **Register Employee**

The system will **automatically create a password** for the new employee:
- Format: `FirstName@BirthYear`
- Example: If the employee's name is "Ravi Kumar" and born in 1988, password = `Ravi@1988`

Give this password to the employee — they will be asked to change it on first login.

---

## Employees List

**Where:** Dashboard → Employee cards

Shows all registered employees with their basic details. You can:
- View employee profile
- Reset their password if they forget it
- Delete an employee record

---

## Announcements

**Where:** Sidebar → Announcements

Post important notices for all employees to see.

**To add an announcement:**
1. Click the **+ Add Announcement** button (or similar)
2. Type a title and message
3. Click **Post**

**To edit/delete:** Use the Edit (pencil) or Remove (X) buttons on each announcement card.

---

## Leaves

**Where:** Sidebar → Leaves

Manage employee leave requests.

- You will see a list of all **Pending**, **Approved**, and **Rejected** leaves
- Click **Approve** or **Reject** on any pending request
- A calendar shows the leaves taken by each employee
- Leave counters show how many leaves each employee has used

---

## Transfers

**Where:** Sidebar → Transfers

Manage employee transfer requests.

- Review transfer requests from employees
- Click **Approve** or **Reject**
- View transfer history

---

## Salary

**Where:** Sidebar → Salary

Manage employee salaries.

**What you can do:**
- View salary breakdown for any employee (Basic, HRA, PF, etc.)
- **Edit salary:** Click the edit button next to any employee and enter the new annual salary
- **Download Payslip:** Generate and download a PDF payslip for any month
- **Download Annual Statement:** Download a full year salary statement

---

## Documents

**Where:** Sidebar → Documents

Store and manage important files for employees (PDFs, images, etc.).

**To upload a document:**
1. Click **Upload Document**
2. Select the employee the document belongs to
3. Give the document a title (e.g., "April 2026 Payslip")
4. Choose a category (Salary, Leave, ID Proof, etc.)
5. Select the file (PDF, DOC, DOCX, JPG, or PNG — max 5 MB)
6. Click **Upload Document**

The file is uploaded to the cloud (Cloudinary) and the details are saved in the database.

**To delete:** Click the **Delete** button on any document.

**To download:** Click the **Download** button.

---

## My Profile (Admin)

**Where:** Sidebar → My Profile

Update your own account information.

**What you can change:**
- Display Name
- Login Username (Employee ID)
- Password (requires your current password)

Click **Save Changes** when done.

---

# EMPLOYEE GUIDE

---

## Dashboard

After logging in, you see your personal dashboard with:
- A greeting (Good Morning / Afternoon / Evening) with your name
- Your Employee ID, Designation, and Work Location
- Quick stats: Leave count, Transfer status, etc.

---

## My Profile

**Where:** Sidebar → My Profile

View your personal and job details registered by the admin.

---

## Announcements

**Where:** Sidebar → Announcements

Read important notices posted by the admin.

---

## Leaves

**Where:** Sidebar → Leaves

**Apply for Leave:**
1. Click **Apply for Leave**
2. Enter a **Subject** (e.g., "Medical Leave - 3 Days")
3. Enter your **Reason** (explain why you need the leave)
4. Click **Apply**

Your request will show as **Pending** until the admin approves or rejects it.

**Leave Calendar:** A calendar view shows all your approved leaves.

**Leave Counter:** Shows how many leaves you have taken so far.

---

## Transfers

**Where:** Sidebar → Transfers

**Request a Transfer:**
1. Click **Request Transfer**
2. Fill in your preferred location and reason
3. Click **Submit**

The admin will review and approve or reject your request.

---

## Salary

**Where:** Sidebar → Salary

View your salary details:
- Monthly breakdown (Basic Pay, HRA, Allowances, Deductions)
- Net salary
- Salary history (past months)
- Download your payslip as a PDF

---

## Documents

**Where:** Sidebar → Documents

View and download documents uploaded for you by the admin (payslips, ID proofs, etc.).

**You can also upload your own documents:**
1. Click **Upload Document**
2. Enter a title
3. Choose a category
4. Select your file
5. Click **Upload Document**

---

## Change Password

**Where:** Sidebar (bottom) → Logout area, or forced on first login

To change your password:
1. Enter your current password
2. Enter your new password
3. Confirm the new password
4. Click **Change Password**

---

# Common Questions

**Q: I forgot my password. What do I do?**
Contact your admin. They can reset your password from the employee list.

**Q: My leave is still showing "Pending". Is that normal?**
Yes — it stays pending until the admin reviews and approves or rejects it.

**Q: Can I see other employees' documents?**
No. You can only see your own documents.

**Q: What file types can I upload?**
PDF, DOC, DOCX, JPG, and PNG files. Maximum size: 5 MB.

**Q: Where are uploaded files stored?**
All files are securely stored on Cloudinary (a cloud storage service). The database stores only the file links.

---

*For technical issues, contact your system administrator.*
