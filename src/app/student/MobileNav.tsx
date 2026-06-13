"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  BrainCircuit,
  User,
} from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Kelola Nilai",
      href: "/student/grades",
      icon: GraduationCap,
    },
    {
      name: "Rekomendasi AI",
      href: "/student/recommendations",
      icon: BrainCircuit,
    },
    {
      name: "Profil",
      href: "/student/profile",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-border md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex h-16 items-center justify-around px-2 pb-[env(safe-area-inset-bottom,0px)]">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all duration-200 ${
                isActive
                  ? "text-teal-600 dark:text-teal-400 font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
