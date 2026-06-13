# Deployment Guide - Industry Mirror

This guide outlines instructions for deploying Industry Mirror to production using **Vercel** for hosting the Next.js app and **Supabase** for database/authentication.

---

## 💾 Supabase Setup

### 1. Database Setup
1. Create a new Supabase project.
2. Retrieve the connection strings from **Project Settings > Database**:
   - **Transaction Pooler**: Port `6543` (set as `DATABASE_URL` with `?pgbouncer=true` suffix).
   - **Direct Connection**: Port `5432` (set as `DIRECT_URL`).

### 2. Run Database Migrations
Deploy the database schema using Prisma from your local development environment:
```bash
# Push database schema directly
npx prisma db push

# Apply Row Level Security (RLS) policies
# Execute the SQL statements from prisma/rls_policies.sql inside Supabase's SQL Editor.
```

### 3. Setup Supabase Authentication
1. Go to **Authentication > Providers > Email**. Enable:
   - *SignUp confirmation* (Optional, but recommended for production).
   - *Secure password changes*.
2. Go to **Authentication > URL Configuration**:
   - Set **Site URL** to your production domain (e.g. `https://industrymirror.id`).
   - Add Redirect URLs: `https://industrymirror.id/reset-password` and `http://localhost:3000/reset-password`.

---

## ⚡ Vercel Deployment

### 1. Project Configuration
Deploy the project to Vercel via the Vercel Dashboard or using the Vercel CLI:
```bash
vercel deploy --prod
```

### 2. Environment Variables Configuration
Ensure the following variables are configured in the Vercel Project Dashboard under **Settings > Environment Variables**:

| Variable Name | Description | Example / Source |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Production app domain | `https://industrymirror.id` |
| `NODE_ENV` | Environment | `production` |
| `DATABASE_URL` | Transaction pooled Postgres URL | `postgresql://postgres...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct connection Postgres URL | `postgresql://postgres...:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase endpoint | `https://[REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase Anonymous token | Obtain from API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role token | Obtain from API settings (Keep secret!) |
| `GROQ_API_KEY` | Groq AI Cloud Credentials | `gsk_...` |
| `RESEND_API_KEY` | Resend API Credentials | `re_...` |
| `RESEND_FROM_EMAIL` | Domain email to send from | `noreply@yourdomain.com` |

---

## 📈 Monitoring & Integrations (Production)

### 1. Sentry Configuration
To configure exception and performance tracking:
1. Link your Sentry project with the Vercel deployment.
2. In Vercel, configure:
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
3. Sentry source maps will automatically build and upload during the Next.js compilation step.

### 2. Resend Email Integration
Configure your custom email domain inside the Resend dashboard and add the matching DNS records (SPF, DKIM, DMARC) in your domain registrar to ensure high email deliverability.
