# API & Server Actions Documentation - Industry Mirror

Industry Mirror utilizes **Next.js 15 Server Actions** (`"use server"`) as its primary data bridge between client-side user interfaces and server-side logic/database layers. This guarantees end-to-end type safety and removes the need for traditional HTTP REST controllers.

---

## 🔒 Security & Request Handling

All Server Actions implement the following safeguards:
1. **User Authentication**: Validates credentials via Supabase Server Clients.
2. **Schema Validation**: All input arguments are parsed using Zod schemas located in `src/validators/index.ts`.
3. **RBAC Verification**: Checks user metadata roles before resolving database requests.
4. **Structured JSON Responses**: Returns a consistent `ApiResponse<T>` wrapper:
   ```typescript
   export type ApiResponse<T = void> = {
     success: boolean;
     data?: T;
     error?: string;
     message?: string;
   };
   ```

---

## 🔑 Authentication Module (`src/features/auth/actions.ts`)

### `loginAction`
- **Purpose**: Authenticates credentials and logs activity.
- **Input**: `LoginInput` (Email & Password)
- **Output**: `ApiResponse<{ role: string; redirectUrl: string }>`
- **Errors**: `ZodError` for invalid formats; `401` equivalents for credentials failure or deactivated status.

### `registerAction`
- **Purpose**: Creates Supabase auth credentials, synced database record, and initializes a blank Student Profile.
- **Input**: `RegisterInput` (Name, Email, Password, University ID, Study Program ID, Semester, Target Career ID)
- **Output**: `ApiResponse`
- **Transactions**: Employs Prisma transactions. If DB creation fails, Supabase Auth user registration is automatically rolled back using the Supabase admin client.

---

## 🎓 Student Module (`src/features/student/actions.ts`)

### `updateStudentProfileAction`
- **Purpose**: Modifies the student's NIM, Semester, Bio, Phone, and target career.
- **Input**: Profile details.
- **Output**: `ApiResponse`

### `addStudentGradeAction` / `updateStudentGradeAction` / `deleteStudentGradeAction`
- **Purpose**: CRUD operations for academic course grades. Modifying grades automatically triggers a recalculation of the Career Fit Score.
- **Input**: Course ID, Grade value (0-100), semester context.
- **Output**: `ApiResponse`

### `getAiRecommendationAction`
- **Purpose**: Fetches the personalized AI feedback and learning roadmap.
- **Input**: Student Profile ID, Career Target Name, and optional `forceRefresh` flag.
- **Output**: `ApiResponse<AiRecommendationOutput>`
- **Caching**: Employs caching logic to retrieve stored JSON if the previous generation is less than 24 hours old.

---

## 🏛️ University Module (`src/features/university/actions.ts`)

### `getUniversityDashboardAction`
- **Purpose**: Fetches aggregated statistics for university administrators.
- **Output**: `ApiResponse<UniversityDashboardData>`
- **Contents**: Average GPA, Student enrollment metrics, distribution charts, and critical course indices.

### `generateCurriculumAnalysisAction`
- **Purpose**: Aggregates academic grades across the department and queries Groq to construct a Markdown curriculum evaluation.
- **Input**: Study Program ID.
- **Output**: `ApiResponse<string>` (Markdown Report)

---

## 🛠️ Admin Module (`src/features/admin/actions.ts`)

Contains core CRUD mutations for managing:
- Universities (`createUniversity`, `updateUniversity`, `deleteUniversity`)
- Study Programs (`createStudyProgram`, `updateStudyProgram`, `deleteStudyProgram`)
- Courses (`createCourse`, `updateCourse`, `deleteCourse`)
- Career Weights (`updateCareerWeights`)
