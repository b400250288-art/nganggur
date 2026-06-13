"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/validators";
import type { ApiResponse, SelectOption } from "@/types";

/**
 * Log in a user using Supabase Auth and verify their database state.
 */
export async function loginAction(
  input: LoginInput,
): Promise<ApiResponse<{ role: string; redirectUrl: string }>> {
  try {
    const validated = loginSchema.parse(input);
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || "Email atau password salah",
      };
    }

    const authUser = authData.user;

    // Retrieve the user from our Prisma DB
    const dbUser = await prisma.user.findUnique({
      where: { authId: authUser.id },
    });

    if (!dbUser) {
      // If auth exists but database entry does not, sign out and throw error
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Akun Anda terdaftar di autentikasi tetapi profil tidak ditemukan",
      };
    }

    if (!dbUser.isActive || dbUser.deletedAt) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Akun Anda telah dinonaktifkan. Hubungi administrator.",
      };
    }

    // Log the successful login activity
    await prisma.activityLog.create({
      data: {
        userId: dbUser.id,
        action: "login",
        resource: "user",
        resourceId: dbUser.id,
      },
    });

    let redirectUrl = "/login";
    switch (dbUser.role) {
      case "student":
        redirectUrl = "/student/dashboard";
        break;
      case "university":
        redirectUrl = "/university/dashboard";
        break;
      case "admin":
        redirectUrl = "/admin/dashboard";
        break;
    }

    return {
      success: true,
      data: {
        role: dbUser.role,
        redirectUrl,
      },
      message: "Login berhasil",
    };
  } catch (error) {
    console.error("Login action error:", error);
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Input tidak valid",
      };
    }
    const err = error as Error;
    return {
      success: false,
      error: err.message || "Terjadi kesalahan sistem",
    };
  }
}

/**
 * Registers a new student:
 * 1. Creates Supabase auth account.
 * 2. Syncs user to Prisma DB.
 * 3. Creates Student Profile.
 * Rollbacks Supabase auth user if database steps fail.
 */
export async function registerAction(input: RegisterInput): Promise<ApiResponse> {
  let createdAuthUserId: string | null = null;

  try {
    const validated = registerSchema.parse(input);
    const supabase = await createClient();

    // 1. Sign up user via Supabase Auth using Admin API (bypasses email confirmation SMTP rate limit)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        role: "student",
        full_name: validated.fullName,
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || "Registrasi autentikasi gagal",
      };
    }

    createdAuthUserId = authData.user.id;

    // 2. Insert into Prisma DB
    await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.create({
        data: {
          authId: authData.user!.id,
          email: validated.email,
          fullName: validated.fullName,
          role: "student",
        },
      });

      await tx.studentProfile.create({
        data: {
          userId: dbUser.id,
          studyProgramId: validated.studyProgramId,
          careerTargetId: validated.careerTargetId,
          semester: validated.semester,
          gpa: 0.0,
        },
      });

      // Log the registration activity
      await tx.activityLog.create({
        data: {
          userId: dbUser.id,
          action: "register",
          resource: "user",
          resourceId: dbUser.id,
        },
      });
    });

    return {
      success: true,
      message: "Registrasi berhasil. Silakan cek email Anda untuk konfirmasi (jika diperlukan).",
    };
  } catch (error) {
    console.error("Registration action error:", error);

    // Rollback Supabase user using admin client to maintain transactional consistency
    if (createdAuthUserId) {
      try {
        console.log(`Rolling back Supabase user: ${createdAuthUserId}`);
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
      } catch (rollbackError) {
        console.error("Critical: Supabase rollback failed during registration:", rollbackError);
      }
    }

    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Input tidak valid",
      };
    }
    const err = error as Error;
    return {
      success: false,
      error: err.message || "Terjadi kesalahan saat menyimpan data",
    };
  }
}

/**
 * Triggers a password reset email via Supabase.
 */
export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ApiResponse> {
  try {
    const validated = forgotPasswordSchema.parse(input);
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Email instruksi reset password telah dikirim.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Input tidak valid",
      };
    }
    const err = error as Error;
    return {
      success: false,
      error: err.message || "Terjadi kesalahan",
    };
  }
}

/**
 * Updates password for currently logged-in user (following redirection).
 */
export async function resetPasswordAction(input: ResetPasswordInput): Promise<ApiResponse> {
  try {
    const validated = resetPasswordSchema.parse(input);
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: validated.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Password berhasil diperbarui. Silakan login kembali.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Input tidak valid",
      };
    }
    const err = error as Error;
    return {
      success: false,
      error: err.message || "Terjadi kesalahan",
    };
  }
}

/**
 * Signs out the user.
 */
export async function logoutAction(): Promise<ApiResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Logout berhasil",
    };
  } catch (error) {
    console.error("Logout error:", error);
    const err = error as Error;
    return { success: false, error: err.message || "Terjadi kesalahan" };
  }
}

/**
 * Options fetchers for registration dynamic dropdowns
 */

export async function getUniversityOptions(): Promise<SelectOption[]> {
  try {
    const universities = await prisma.university.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return universities.map((u) => ({
      value: u.id,
      label: u.name,
    }));
  } catch (error) {
    console.error("Error fetching universities:", error);
    return [];
  }
}

export async function getStudyProgramOptions(universityId: string): Promise<SelectOption[]> {
  try {
    if (!universityId) return [];

    const programs = await prisma.studyProgram.findMany({
      where: { universityId, isActive: true, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, degree: true },
    });

    return programs.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  } catch (error) {
    console.error("Error fetching study programs:", error);
    return [];
  }
}

export async function getCareerTargetOptions(studyProgramId: string): Promise<SelectOption[]> {
  try {
    if (!studyProgramId) return [];

    const careers = await prisma.careerTarget.findMany({
      where: { studyProgramId, isActive: true, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, industryField: true },
    });

    return careers.map((c) => ({
      value: c.id,
      label: `${c.name} (${c.industryField})`,
    }));
  } catch (error) {
    console.error("Error fetching career targets:", error);
    return [];
  }
}
