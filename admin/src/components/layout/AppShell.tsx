"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useTheme } from "@/context/ThemeContext";
import { BrandMark } from "@/components/brand/BrandMark";
import {
  LayoutDashboard, Layers, FileQuestion, BookOpen, GalleryVerticalEnd,
  Award, Users, Megaphone, Sun, Moon, LogOut, Menu, X, ChevronRight, Shield,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Curriculum", href: "/curriculum", icon: Layers },
  { name: "Question Bank", href: "/questions", icon: FileQuestion },
  { name: "Mock Exams", href: "/quizzes", icon: Award },
  { name: "Study Notes", href: "/materials", icon: BookOpen },
  { name: "Flashcards", href: "/flashcards", icon: GalleryVerticalEnd },
  { name: "Users & Roles", href: "/users", icon: Users },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUserProfile);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/login") return <>{children}</>;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-studio-50 dark:bg-studio-950 text-studio-900 dark:text-studio-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-brand-yellow focus:text-brand-olive focus:p-3 focus:rounded-lg">
        Skip to content
      </a>
      {mobileOpen && (
        <button
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        id="admin-navigation"
        aria-label="Admin navigation"
        onKeyDown={(event) => {
          if (event.key === "Escape") setMobileOpen(false);
        }}
        className={`brand-sidebar fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col bg-brand-olive text-white border-r border-white/10 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0 visible" : "-translate-x-full invisible md:visible"
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-white/15">
          <NextLink href="/" aria-label="P App home" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <BrandMark />
            <div>
              <span className="block font-bold text-lg tracking-tight">P App</span>
              <span className="block mt-0.5 text-[10px] font-medium tracking-[0.2em] uppercase text-brand-200">Admin Studio</span>
            </div>
          </NextLink>
          <button onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="p-2 rounded-lg text-brand-100 hover:bg-white/10 md:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-7 space-y-1">
          <div className="px-3 pb-3 text-[10px] font-semibold tracking-[0.16em] text-brand-200 uppercase">Curriculum Studio</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <NextLink
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-3 rounded-lg font-medium text-sm transition-colors ${
                  isActive ? "bg-brand-yellow text-brand-olive" : "text-brand-50/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px]" />
                  {item.name}
                </span>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </NextLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/15">
          <div className="flex items-center gap-3 px-1 pb-4">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-brand-100 text-sm font-semibold shrink-0">
              {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.username || "Admin User"}</p>
              <div className="flex items-center gap-1 mt-0.5 text-brand-200">
                <Shield className="w-3 h-3" />
                <span className="text-xs capitalize">{user?.role?.replaceAll("_", " ") || "Staff"}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={toggleTheme} title="Toggle Dark / Light mode" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className="flex items-center justify-center gap-2 rounded-lg border border-white/20 py-2.5 text-xs text-brand-50 hover:bg-white/10 transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button onClick={handleSignOut} title="Sign out" className="flex items-center justify-center gap-2 rounded-lg border border-white/20 py-2.5 text-xs text-brand-50 hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-8 bg-white dark:bg-studio-900 border-b border-studio-200 dark:border-studio-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="admin-navigation" className="p-2 rounded-lg text-studio-600 dark:text-studio-300 hover:bg-studio-100 dark:hover:bg-studio-800 md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <span className="hidden sm:block text-xs text-studio-500 dark:text-studio-400">Workspace</span>
            <ChevronRight className="hidden sm:block w-3.5 h-3.5 text-studio-400" />
            <h1 className="text-sm font-semibold">{NAV_ITEMS.find((item) => item.href === pathname)?.name || "P App Admin"}</h1>
          </div>
          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-studio-500 dark:text-studio-400">ALE Admin</span>
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
