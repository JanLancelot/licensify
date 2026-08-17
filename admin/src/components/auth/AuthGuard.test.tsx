import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import { AuthGuard } from "./AuthGuard";

// Mocks
const mockPush = vi.fn();
let mockPathname = "/";
let mockAuthLoading = false;
let mockIsAuthenticated = false;
let mockUser: any = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({
    isLoading: mockAuthLoading,
    isAuthenticated: mockIsAuthenticated,
  }),
  useQuery: () => mockUser,
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({
    signOut: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("AuthGuard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/";
    mockAuthLoading = false;
    mockIsAuthenticated = false;
    mockUser = null;
  });

  it("renders login page children immediately without redirection", () => {
    mockPathname = "/login";
    render(
      <AuthGuard>
        <div data-testid="login-content">Login Page</div>
      </AuthGuard>
    );

    expect(screen.getByTestId("login-content")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated users to /login", () => {
    mockPathname = "/curriculum";
    mockAuthLoading = false;
    mockIsAuthenticated = false;

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("shows authenticating loading state while session is initializing", () => {
    mockAuthLoading = true;
    mockIsAuthenticated = false;

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText(/Authenticating admin session/i)).toBeInTheDocument();
  });

  it("blocks student role and displays Access Restricted message", () => {
    mockAuthLoading = false;
    mockIsAuthenticated = true;
    mockUser = {
      _id: "user_123",
      username: "student_john",
      email: "student@example.com",
      role: "student",
      isActive: true,
    };

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText("Access Restricted")).toBeInTheDocument();
    expect(screen.getByText(/assigned the/i)).toBeInTheDocument();
    expect(screen.getByText("student")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();

  });

  it("allows access for admin role", () => {
    mockAuthLoading = false;
    mockIsAuthenticated = true;
    mockUser = {
      _id: "admin_123",
      username: "ArchAdmin",
      email: "admin@reapp.com",
      role: "admin",
      isActive: true,
    };

    render(
      <AuthGuard>
        <div data-testid="admin-dashboard">Admin Dashboard Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });

  it("allows access for content_manager role", () => {
    mockAuthLoading = false;
    mockIsAuthenticated = true;
    mockUser = {
      _id: "cm_123",
      username: "EditorJane",
      email: "editor@reapp.com",
      role: "content_manager",
      isActive: true,
    };

    render(
      <AuthGuard>
        <div data-testid="editor-content">Content Manager View</div>
      </AuthGuard>
    );

    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });
});
