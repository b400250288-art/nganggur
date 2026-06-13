# Production Readiness Checklist - Industry Mirror

Before taking the Industry Mirror platform live to users, ensure the following settings and audits are completed.

---

## 📋 Checklist

### 1. Database Configuration
- [ ] Enable PostgreSQL connection pooling (pgbouncer) suffix `?pgbouncer=true` on the `DATABASE_URL` for high-frequency server action connections.
- [ ] Confirm direct migrations and seed operations run using the `DIRECT_URL` (Port 5432).
- [ ] Execute the `prisma/rls_policies.sql` script in the database editor and verify RLS is active (`true`) for all tables.
- [ ] Set up automated daily database backups within Supabase or AWS RDS.

### 2. Authentication Settings
- [ ] Turn off Supabase email signup debugging and verify SMTP settings are linked to Resend or a transactional provider.
- [ ] Restrict redirect URIs in Supabase Auth config to only contain production paths (`https://[your-domain]/reset-password`).
- [ ] Test password policy enforcement (minimum 8 characters, capital/lowercase letters, and numbers).

### 3. AI & Integrations Configuration
- [ ] Set up a billing threshold and alerts on Groq Cloud Dashboard.
- [ ] Double-check that fallback models (`llama-3.1-8b-instant`) trigger properly when primary models exceed rate-limits.
- [ ] Confirm AI caching parameters (e.g. `AI_CACHE_HOURS = 24`) prevent duplicate requests from exhausting API budgets.

### 4. Hosting & CDN
- [ ] Configure custom domain headers in Vercel.
- [ ] Set up CDN and cache purging for static resources.
- [ ] Enable strict Content Security Policies (CSP) and HTTP Strict Transport Security (HSTS) headers.
- [ ] Confirm error pages (`404` and `500`) display consistent branding and contact routes.

### 5. Monitoring & Maintenance
- [ ] Connect Sentry to track clientside and serverside crashes.
- [ ] Confirm Sentry source maps upload successfully during Vercel build phase.
- [ ] Verify that database audit logs successfully track login, register, and CRUD mutations.
- [ ] Configure a maintenance toggle value under `system_settings` to disable platform features during updates.
