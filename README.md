# Industry Mirror

> **"Career Intelligence Platform for Economics Students"**

Industry Mirror is a production-ready Career Intelligence Platform designed specifically for Economics students in Indonesia. Built as a B2B2C SaaS platform, it connects academic achievements (grades) with real-world industry career targets using a custom-weighted Career Fit Engine and Groq AI recommendation service (Llama-3.3-70b-versatile).

---

## 🚀 Key Features

1. **Student Career Readiness Engine**: Map course grades against target career profiles (e.g., Auditor, Financial Analyst, Brand Manager) using a customized weights matrix.
2. **Groq AI-powered Roadmap & gap Analysis**: Generates personalized learning paths, courses, and certifications based on the student's academic weaknesses.
3. **Automated Job Search Queries**: Direct linkages to LinkedIn, JobStreet, and Glints for targeted career roles.
4. **University & Faculty Analytics Dashboard**: Aggregated dashboards showing student performance distribution, career choices, and systemic course weaknesses.
5. **AI Curriculum Improvement Report**: Automated curriculum evaluation based on aggregate student cohorts to improve course offerings.
6. **Robust RBAC (Role-Based Access Control)**: Restricts features for Student, University Admins, and Super Admins.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, Shadcn UI, Framer Motion, Lucide React, Zustand, React Hook Form, Zod.
- **Backend & Database**: Next.js Server Actions & Route Handlers, Supabase PostgreSQL, Prisma ORM.
- **Authentication**: Supabase Auth (integrated with custom RBAC middleware).
- **AI Integrations**: Groq SDK (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`).
- **Analytics**: Recharts.
- **Monitoring & Email**: Sentry, Resend.
- **Testing**: Vitest, React Testing Library.

---

## 📁 Folder Structure

The application layout is structured as follows:

```text
src/
├── app/                  # Next.js pages, layouts, and route handlers
├── components/           # Reusable UI elements (Shadcn) & providers
├── features/             # Business modules (admin, auth, landing, student, university)
│   ├── [module]/
│   │   ├── components/   # Feature-specific components
│   │   └── actions.ts    # Server Actions for DB queries and mutators
├── hooks/                # Custom React hooks (e.g., use-toast)
├── lib/                  # Shared configurations (Supabase, Prisma, env parser)
├── services/             # Core engines (Groq AI, Career Fit, Job Search)
├── stores/               # Client-side stores (Zustand)
├── tests/                # Vitest unit and integration tests
├── types/                # TypeScript type definitions
└── validators/           # Zod schema validation rules
```

---

## ⚙️ Local Setup Instructions

### 1. Prerequisites
- **Node.js**: v20 or later
- **npm**: v10 or later
- **Supabase**: A free Supabase project for Auth, PostgreSQL, and Database storage.
- **Groq API Key**: A valid Groq Cloud API Key.

### 2. Environment Setup
Clone this repository and create a `.env` file (copied from `.env.example`):
```bash
cp .env.example .env
```
Fill in the variables including `DATABASE_URL` (direct/pooler), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `GROQ_API_KEY`.

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Seeding
Push the schema to your Supabase PostgreSQL instance and seed the database with demo admin, university, and student records:
```bash
# Generate Prisma Client
npm run db:generate

# Push migrations/schemas to database
npm run db:push

# Seed default mock data
npm run db:seed
```

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing and Linting

- **Run Tests**: `npm run test`
- **Lint Code**: `npm run lint`
- **Format Code**: `npm run format`

---

## 📖 Additional Documentation

For detailed information on design, database schemas, and compliance:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and tech patterns.
- [DATABASE.md](./DATABASE.md) - ERD representation and supabase policies.
- [API.md](./API.md) - Server actions and route API structure.
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercel & Supabase deployment guides.
- [SECURITY.md](./SECURITY.md) - Access controls, RLS, and data safety.
