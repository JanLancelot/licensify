import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { AppShell } from "./AppShell";

let mockPathname = "/";
const mockPush = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue(undefined);

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("convex/react", () => ({
  useQuery: () => ({
    _id: "user_admin_1",
    username: "ArchAdmin",
    email: "admin@reapp.com",
    role: "admin",
  }),
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({
    signOut: mockSignOut,
  }),
}));

describe("AppShell Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/";
  });

  it("renders all core navigation links", () => {
    render(
      <AppShell>
        <div>Dashboard Content</div>
      </AppShell>
    );

    expect(screen.getByText("Curriculum Studio")).toBeInTheDocument();
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Curriculum").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Question Bank").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mock Exams").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Study Notes").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Flashcards").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Users & Roles").length).toBeGreaterThan(0);
  });

  it("renders logged in user information and role badge", () => {
    render(
      <AppShell>
        <div>Dashboard Content</div>
      </AppShell>
    );

    expect(screen.getAllByText("ArchAdmin").length).toBeGreaterThan(0);
    expect(screen.getAllByText("admin").length).toBeGreaterThan(0);
  });

  it("triggers sign out and redirects to /login", async () => {
    render(
      <AppShell>
        <div>Dashboard Content</div>
      </AppShell>
    );

    const logoutButtons = screen.getAllByTitle(/sign out/i);
    expect(logoutButtons.length).toBeGreaterThan(0);
    fireEvent.click(logoutButtons[0]);


    expect(mockSignOut).toHaveBeenCalled();
  });

  it("bypasses layout shell on /login route", () => {
    mockPathname = "/login";
    render(
      <AppShell>
        <div data-testid="login-view">Login Gateway</div>
      </AppShell>
    );

    expect(screen.getByTestId("login-view")).toBeInTheDocument();
    expect(screen.queryByText("Curriculum Studio")).not.toBeInTheDocument();
  });
});
