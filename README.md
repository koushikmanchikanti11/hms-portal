# 🏥 HMS Platform — Multi-Tenant Hospital Management System

---

## 👥 Team Members

| # | Name | Role |
|---|------|------|
| 1 | **M Kiran Koushik** | Team Member |
| 2 | **P Sharanya** | Team Member |
| 3 | **P Pragna Reddy** | Team Member |
| 4 | **T Nishanth** | Team Member |
| 5 | **V Sreenivasulu** | Team Member |

---

## 🚀 Project Overview

The **HMS Platform** is a production-grade, cloud-native Multi-Tenant Hospital Management System. Multiple hospitals operate on a single shared infrastructure with **zero data leakage** between tenants — think of it as *"Shopify for Hospitals"*.

Every hospital is a **tenant** with:
- Their own isolated patients, doctors, records, billing, and pharmacy data
- Their own admin user and staff accounts
- Their own dashboard and analytics
- **Zero visibility into any other hospital's data**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Authentication** | Better Auth |
| **Database** | Neon DB (Serverless PostgreSQL) |
| **ORM** | Prisma ORM |
| **Charts** | Recharts |
| **Deployment** | Vercel |

---

## 👤 User Roles

| Role | Scope | Capabilities |
|------|-------|-------------|
| **Super Admin** | System-wide | Create hospitals, manage all tenants |
| **Hospital Admin** | Own hospital | All 15 modules, full CRUD |
| **Doctor** | Own records | Appointments, records, prescriptions |
| **Receptionist** | Hospital | Patients, appointments, billing, queue |
| **Nurse** | Hospital | Vitals tracking, records, beds |
| **Pharmacist** | Hospital | Pharmacy, prescription dispensing |
| **Accountant** | Hospital | Billing, financial reports |
| **Patient** | Own data only | View appointments, records, prescriptions |

---

## 📦 Core Modules (Phase 1 — MVP)

- 👥 **Patient Management** — Registration, profiles, complete history
- 🩺 **Doctor Management** — Directory, specializations, availability
- 📅 **Appointment Scheduling** — OP/IP booking, status tracking, filters
- 📋 **Medical Records** — OP/IP records, diagnosis, clinical notes
- 💰 **Billing & Invoicing** — Dynamic invoices, payment tracking, print view
- 🔬 **Pharmacy** — Stock management, expiry alerts, low stock badges

---

## ✨ Extended Modules (Phase 2)

- 💊 **Prescriptions** — Structured medicine line items, printable slip, pharmacy dispensing
- 🧑‍💻 **Patient Portal** — Self-service dashboard (appointments, records, prescriptions)
- 🚨 **Emergency Module** — Live triage board, fast intake, auto-refresh
- 🛏️ **Bed Management** — Visual bed map, ward management, one-click assign/discharge
- 🩸 **Blood Bank** — Inventory by blood group, donor registry, expiry alerts
- 🫧 **Oxygen Cylinders** — Cylinder tracking, status lifecycle, assignment
- 👔 **Staff Dashboards** — Role-based dashboards for 6 staff sub-roles

---

## ⚙️ Setup & Installation

```bash
# 1. Unzip and install dependencies
unzip hms-production.zip && cd hms
npm install

# 2. Install shadcn/ui components
npx shadcn@latest add button input label card table badge dialog form select toast

# 3. Configure environment variables
cp .env.example .env.local
# Fill in your Neon DB URLs and Better Auth secret

# 4. Push schema to database
npx prisma db push
npx prisma generate

# 5. Seed demo data
npm run db:seed

# 6. Start development server
npm run dev
```

---

## 🔐 Environment Variables

```env
DATABASE_URL=           # Neon DB pooled connection string
DIRECT_URL=             # Neon DB direct connection string
BETTER_AUTH_SECRET=     # Run: openssl rand -base64 32
BETTER_AUTH_URL=        # e.g. https://your-hms.vercel.app
NEXT_PUBLIC_APP_URL=    # Same as BETTER_AUTH_URL
SUPER_ADMIN_EMAIL=      # Seed script super admin email
SUPER_ADMIN_PASSWORD=   # Seed script super admin password
```

---

## 🧪 Demo Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@hms.com` | `SuperAdmin@2026` |
| Hospital Admin | `admin@apollo.com` | `Apollo@2026` |
| Doctor | `priya.apollo@hms.com` | `Doctor@2026` |
| Patient | `patient@apollo.com` | `Patient@2026` |

---

## 📂 Project Structure

```
hms/
├── app/
│   ├── (auth)/login/          # Universal login page
│   ├── (super-admin)/         # Super admin dashboard & hospitals
│   ├── (hospital)/            # All hospital modules
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── doctors/
│   │   ├── appointments/
│   │   ├── records/
│   │   ├── prescriptions/
│   │   ├── emergency/
│   │   ├── beds/
│   │   ├── blood-bank/
│   │   ├── oxygen/
│   │   ├── billing/
│   │   └── pharmacy/
│   ├── (patient)/             # Patient self-service portal
│   └── api/                   # 23+ API routes
├── components/                # Reusable UI components
├── lib/                       # Auth, DB, utilities
├── prisma/                    # Schema & migrations
└── scripts/                   # Seed script
```

---

## 🔒 Security Highlights

- `hospitalId` always read from **session** — never from URL or request body
- Every Prisma query scoped with `where: { hospitalId }`
- bcrypt password hashing (12 rounds)
- Middleware-enforced route protection
- Role-based access control on every API route
- Patient data isolated by `patientId` from session


---

*HealthTech Hackathon 2K26 — 3rd Year · Multi-Tenant HMS*
*Stack: Next.js · Prisma · Tailwind CSS · Better Auth · Neon DB*
# hms-portal
