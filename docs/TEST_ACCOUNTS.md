# Test Accounts — Railway Management System

These are the verified, working login credentials based on the current database.

---

## Admin Account

| Field | Value |
|---|---|
| **Employee ID (Login)** | ADM001 |
| **Password** | admin123 |
| **Role** | Administrator |
| **Name** | System Admin |

**Admin can:** Register employees, manage leaves/transfers, upload/delete documents for anyone, edit salaries, download payslips, post announcements, edit own profile.

---

## Employee Accounts

> Passwords follow the pattern: `FirstName@BirthYear`

### EMP101 — Rajesh Kumar
| Field | Value |
|---|---|
| **Employee ID** | EMP101 |
| **Password** | `Rajesh@1985` |
| **Date of Birth** | 15 June 1985 |

---

### EMP102 — Priya Menon
| Field | Value |
|---|---|
| **Employee ID** | EMP102 |
| **Password** | `Priya@1992` |
| **Date of Birth** | 22 March 1992 |

---

### EMP103 — Santosh Rao
| Field | Value |
|---|---|
| **Employee ID** | EMP103 |
| **Password** | `Santosh@1990` |
| **Date of Birth** | 8 November 1990 |

---

### EMP104 — Deepa Nair
| Field | Value |
|---|---|
| **Employee ID** | EMP104 |
| **Password** | `Deepa@1994` |
| **Date of Birth** | 30 July 1994 |

---

### EMP105 — Amit Sharma
| Field | Value |
|---|---|
| **Employee ID** | EMP105 |
| **Password** | `Amit@1988` |
| **Date of Birth** | 17 January 1988 |

---

## Password Generation Rule

When an admin registers a new employee, the system auto-generates a password:

```
Format:  FirstName@BirthYear
Example: John Doe, born 12 May 1990  →  John@1990
```

The admin tells the employee this password. On first login, the employee will be prompted to change it.

---

## Notes
- All passwords are stored as bcrypt hashes in the database — the values above are the plain-text equivalents for testing only.
- Do not use these credentials in a real production environment.
- If a password stops working, the admin can reset it from the employee list page (the reset will regenerate `FirstName@BirthYear`).
