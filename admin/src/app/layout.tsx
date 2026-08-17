import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "LICENSIFY Studio — Board Exam Admin Portal",
  description: "Architecture Licensure Examination (ALE) content management dashboard & question bank studio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-studio-50 dark:bg-studio-950 text-studio-900 dark:text-studio-50 min-h-screen">
        <Providers>
          <AuthGuard>
            <AppShell>{children}</AppShell>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}

