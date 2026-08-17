"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  Layers,
  FileQuestion,
  BookOpen,
  GalleryVerticalEnd,
  Award,
  Users,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Compass,
  ChevronRight,
  Shield,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
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

  // If on login page, don't wrap with AppShell sidebar
  if (pathname === "/login") {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-studio-50 dark:bg-studio-950 text-studio-900 dark:text-studio-50">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col glass-panel border-r border-studio-200/80 dark:border-studio-800/80 transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* App Branding */}
        <div className="p-6 flex items-center justify-between border-b border-studio-200/60 dark:border-studio-800/60">
          <NextLink href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blueprint-600 to-blueprint-400 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-studio-900 dark:text-white">
                  LICENSIFY
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blueprint-500/10 text-blueprint-600 dark:text-blueprint-400 border border-blueprint-500/20">
                  Studio
                </span>
              </div>
              <p className="text-xs text-studio-500 dark:text-studio-400">ALE Admin & Curriculum</p>
            </div>
          </NextLink>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-studio-500 hover:bg-studio-100 dark:hover:bg-studio-800 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-studio-400 dark:text-studio-500 uppercase">
            Curriculum Studio
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <NextLink
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                  isActive
                    ? "bg-blueprint-600 text-white shadow-sm shadow-blueprint-500/30"
                    : "text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-850 hover:text-studio-900 dark:hover:text-studio-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-studio-400 dark:text-studio-500 group-hover:text-blueprint-500"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </NextLink>
            );
          })}
        </div>

        {/* User Card & Settings */}
        <div className="p-4 border-t border-studio-200/60 dark:border-studio-800/60">
          <div className="p-3 rounded-xl bg-studio-100/60 dark:bg-studio-850/60 border border-studio-200/60 dark:border-studio-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blueprint-500/10 flex-shrink-0 flex items-center justify-center text-blueprint-500 font-semibold text-xs border border-blueprint-500/20">
                {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold truncate text-studio-900 dark:text-studio-100">
                  {user?.username || "Admin User"}
                </p>
                <div className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-blueprint-500" />
                  <span className="text-[10px] text-studio-500 capitalize">{user?.role || "Staff"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                title="Toggle Dark / Light mode"
                className="p-1.5 rounded-lg text-studio-500 hover:text-studio-900 dark:hover:text-studio-100 hover:bg-studio-200/50 dark:hover:bg-studio-800 transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-studio-600" />}
              </button>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 rounded-lg text-studio-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-72 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-8 glass-panel border-b border-studio-200/80 dark:border-studio-800/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl text-studio-600 dark:text-studio-300 hover:bg-studio-100 dark:hover:bg-studio-800 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-studio-900 dark:text-studio-50">
                {NAV_ITEMS.find((i) => i.href === pathname)?.name || "ALE Studio"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-8 bg-blueprint-grid">
          {children}
        </main>
      </div>
    </div>
  );
}
