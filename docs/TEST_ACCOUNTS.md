# 🔑 Test Accounts — Railway Management System

These accounts are created by running `node db/seed.js`.

---

## Admin Account

| Field | Value |
|---|---|
| Employee ID | `ADM001` |
| Password | `admin123` |
| Name | Railway Admin |
| Role | admin |

---

## Employee Accounts

| Name | Employee ID | Password | Department |
|---|---|---|---|
| Rajesh Kumar | EMP101 | Rajesh@1985 | Operations |
| Priya Menon | EMP102 | Priya@1990 | Finance |
| Santosh Rao | EMP103 | Arjun@1988 | Engineering |
| Deepa Nair | EMP104 | Sneha@1992 | HR |
| Amit Sharma | EMP105 | Vikram@1987 | IT |

---

## Notes

- All employees have pre-seeded salary records, leave history, and document entries.
- The admin account has full privileges across all modules.
- Employees have read-only access to Meetings, Transfers, and Railway Pass data.
- Passwords can be changed via **Profile → Change Password** after first login.

---

> ⚠️ **Security:** These are test credentials only. Change all passwords before using in any real environment.
