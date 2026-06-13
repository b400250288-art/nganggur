# Database Documentation - Industry Mirror

Industry Mirror utilizes a PostgreSQL database hosted on Supabase, with schema synchronization and query building handled through Prisma ORM.

---

## 📊 Entity Relationship Diagram & Schema Design

All primary keys use UUIDs (`uuid_generate_v4()`) for scalability and security. Audit fields (`created_at`, `updated_at`, `deleted_at`) are present in all tables to support soft deletion and track mutations.

### 1. Enum Definitions

- **`UserRole`**: `student` | `university` | `admin`
- **`CareerFitCategory`**: `excellent` | `good` | `moderate` | `weak` | `poor`
- **`NotificationType`**: `info` | `success` | `warning` | `error`
- **`GradeScale`**: `A` | `AB` | `B` | `BC` | `C` | `D` | `E`

### 2. Database Tables

#### `users`
- Stores user accounts synced with Supabase Auth identities.
- `id` (UUID, PK)
- `auth_id` (Text, Unique) - Maps to `auth.users.id` in Supabase Auth.
- `email` (Text, Unique)
- `full_name` (Text)
- `role` (UserRole)
- `avatar_url` (Text, Nullable)
- `is_active` (Boolean, Default: `true`)
- `created_at`, `updated_at`, `deleted_at`

#### `universities`
- Academic institutions onboarded onto the B2B SaaS.
- `id` (UUID, PK)
- `name` (Text, Unique)
- `code` (Text, Unique)
- `address`, `city`, `province` (Text, Nullable)
- `website`, `email`, `phone`, `logo_url`, `accreditation` (Text, Nullable)
- `is_active` (Boolean, Default: `true`)
- `created_at`, `updated_at`, `deleted_at`

#### `study_programs`
- Departments belonging to a university (e.g., S1 Akuntansi).
- `id` (UUID, PK)
- `university_id` (UUID, FK -> `universities.id`)
- `name` (Text)
- `code` (Text)
- `degree` (Text, Default: `S1`)
- `accreditation` (Text, Nullable)
- `is_active` (Boolean, Default: `true`)
- `created_at`, `updated_at`, `deleted_at`
- *Constraints*: Unique combination of `[university_id, code]`.

#### `career_targets`
- Roles matched to academic profiles (e.g., Tax Consultant).
- `id` (UUID, PK)
- `study_program_id` (UUID, FK -> `study_programs.id`)
- `name` (Text)
- `description` (Text, Nullable)
- `industry_field` (Text)
- `linkedin_keyword`, `jobstreet_keyword`, `glints_keyword` (Text)
- `is_active` (Boolean, Default: `true`)
- `created_at`, `updated_at`, `deleted_at`

#### `courses`
- Curricular classes taught in study programs.
- `id` (UUID, PK)
- `study_program_id` (UUID, FK -> `study_programs.id`)
- `name` (Text)
- `code` (Text)
- `credits` (Int, Default: 3)
- `semester` (Int)
- `description` (Text, Nullable)
- `is_active` (Boolean, Default: `true`)
- `created_at`, `updated_at`, `deleted_at`
- *Constraints*: Unique combination of `[study_program_id, code]`.

#### `student_profiles`
- Extended profile details for students.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`, Unique)
- `study_program_id` (UUID, FK -> `study_programs.id`)
- `career_target_id` (UUID, FK -> `career_targets.id`, Nullable)
- `nim` (Text, Unique, Nullable)
- `semester` (Int, Default: 1)
- `gpa` (Decimal, Default: 0.00)
- `bio`, `phone_number` (Text, Nullable)
- `birth_date` (Date, Nullable)
- `created_at`, `updated_at`, `deleted_at`

#### `student_grades`
- Grades mapped by students to courses.
- `id` (UUID, PK)
- `student_profile_id` (UUID, FK -> `student_profiles.id`)
- `course_id` (UUID, FK -> `courses.id`)
- `numeric_grade` (Decimal, 0-100)
- `letter_grade` (GradeScale, Nullable)
- `semester` (Int)
- `academic_year` (Text)
- `notes` (Text, Nullable)
- `created_at`, `updated_at`, `deleted_at`
- *Constraints*: Unique combination of `[student_profile_id, course_id]`.

#### `career_weights`
- Coefficient weights indicating how vital a course is to a target career.
- `id` (UUID, PK)
- `career_target_id` (UUID, FK -> `career_targets.id`)
- `course_id` (UUID, FK -> `courses.id`)
- `weight` (Decimal, e.g., 0.4000 = 40%)
- `created_at`, `updated_at`, `deleted_at`
- *Constraints*: Unique combination of `[career_target_id, course_id]`.

#### `career_scores`
- Normalized match score output from the Career Fit Engine.
- `id` (UUID, PK)
- `student_profile_id` (UUID, FK -> `student_profiles.id`)
- `career_target_id` (UUID, FK -> `career_targets.id`)
- `score` (Decimal, 0-100)
- `category` (CareerFitCategory)
- `computed_at` (DateTime, Default: `now`)
- `created_at`, `updated_at`, `deleted_at`
- *Constraints*: Unique combination of `[student_profile_id, career_target_id]`.

#### `ai_recommendations`
- Structured learning pathway output from Groq.
- `id` (UUID, PK)
- `student_profile_id` (UUID, FK -> `student_profiles.id`)
- `career_target_name` (Text)
- `strengths`, `weaknesses`, `skill_gap`, `certifications`, `courses`, `roadmap` (JSON)
- `raw_response` (Text, Nullable)
- `model` (Text, Default: `llama-3.3-70b-versatile`)
- `generated_at`, `created_at`, `updated_at`, `deleted_at`

#### `job_recommendations`
- Cached job-search linkages.
- `id` (UUID, PK)
- `student_profile_id` (UUID, FK -> `student_profiles.id`)
- `career_target_name` (Text)
- `linkedin_url`, `jobstreet_url`, `glints_url` (Text)
- `created_at`, `updated_at`, `deleted_at`

#### `university_admins`
- Administrative users managing university analysis access.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`, Unique)
- `university_id` (UUID, FK -> `universities.id`)
- `position` (Text, Nullable)
- `created_at`, `updated_at`, `deleted_at`

#### `activity_logs`
- Append-only system audit log.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`, Nullable)
- `action`, `resource` (Text)
- `resource_id`, `ip_address`, `user_agent` (Text, Nullable)
- `metadata` (JSON, Nullable)
- `created_at`

#### `notifications`
- Alerts targeted to specific platform users.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`)
- `type` (NotificationType)
- `title`, `message` (Text)
- `is_read` (Boolean, Default: `false`)
- `action_url` (Text, Nullable)
- `created_at`, `updated_at`

#### `system_settings`
- Admin-controlled global application variables.
- `id` (UUID, PK)
- `key` (Text, Unique)
- `value` (Text)
- `type` (Text, Default: `string`)
- `label` (Text, Nullable)
- `created_at`, `updated_at`

---

## 🔒 Row Level Security (RLS) Configuration

Row Level Security is enabled across all tables on Supabase. JWT tokens claims are decoded to enforce database level safety rules.

1. **Helper Functions**:
   - `auth.user_id()` extracts the logged-in user's UUID from JWT claims.
   - `auth.jwt_role()` retrieves user roles (`student`, `university`, `admin`) mapped inside `user_metadata`.

2. **Policy Enforcement Policies**:
   - **`users` / `student_profiles` / `student_grades`**: Enforces that students may only run CRUD actions on records that directly map to their own `user_id` or `student_profile_id`.
   - **`university_admins`**: Restricts university insights access to academic profiles registered within their matching `university_id` bounds.
   - **`system_settings` / `courses` / `career_targets`**: Serves as read-only endpoints for students and university managers, while providing full write/update authority to the `admin` role.
   - **`activity_logs`**: Write-only (`INSERT`) actions allowed for authenticated users. Read (`SELECT`) operations are restricted strictly to system administrators.
