import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  GraduationCap,
  BrainCircuit,
  User,
  LogOut,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import MobileNav from "./MobileNav";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Fetch the full student profile including study program & target career
  const user = await prisma.user.findUnique({
    where: { authId: authUser.id },
    include: {
      studentProfile: {
        include: {
          studyProgram: true,
          careerTarget: true,
        },
      },
    },
  });

  if (!user || user.role !== "student" || !user.studentProfile) {
    redirect("/login");
  }

  const profile = user.studentProfile;
  const targetCareerName = profile.careerTarget?.name || "Belum dipilih";

  // Logout server action handler
  async function handleLogout() {
    "use server";
    await logoutAction();
    redirect("/login");
  }

  const navigation = [
    {
      name: "Dashboard Overview",
      href: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Input & Kelola Nilai",
      href: "/student/grades",
      icon: GraduationCap,
    },
    {
      name: "Rekomendasi AI & Karir",
      href: "/student/recommendations",
      icon: BrainCircuit,
    },
    {
      name: "Profil Saya",
      href: "/student/profile",
      icon: User,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card text-card-foreground shrink-0">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-foreground">
            Industry Mirror
          </span>
        </div>

        {/* User Mini Card */}
        <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Mahasiswa
          </p>
          <p className="font-bold text-sm text-foreground line-clamp-1 mt-1">
            {user.fullName}
          </p>
          <p className="text-[10px] text-muted-foreground line-clamp-1">
            {profile.studyProgram.name} &bull; Smt {profile.semester}
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:text-primary transition-all duration-200"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-border">
          <form action={handleLogout}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Log out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6 text-card-foreground">
          <div className="flex items-center gap-2 max-w-[60%] sm:max-w-none overflow-hidden">
            <span className="text-xs font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-900 border border-border px-3 py-1 rounded-full truncate">
              Target Karir: <span className="text-primary font-bold">{targetCareerName}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-foreground">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            {/* Simple Mobile Logout Button */}
            <form action={handleLogout} className="md:hidden">
              <Button size="icon" variant="ghost" className="text-red-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </header>

        {/* Page content scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="mx-auto max-w-5xl space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
