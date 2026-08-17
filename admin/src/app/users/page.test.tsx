import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import UsersPage from "./page";
import { getFunctionName } from "convex/server";

const mockUpdateRole = vi.fn().mockResolvedValue({ success: true });
const mockToggleActive = vi.fn().mockResolvedValue({ success: true });

const currentUser = {
  _id: "admin_super",
  username: "SuperAdmin",
  role: "admin",
};

const sampleUsers = [
  {
    _id: "user_cand_1",
    username: "candidate_alex",
    email: "alex@example.com",
    role: "student",
    isActive: true,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
  {
    _id: "user_staff_2",
    username: "faculty_maria",
    email: "maria@example.com",
    role: "content_manager",
    isActive: true,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
];

vi.mock("convex/react", () => ({
  useQuery: (queryRef: any) => {
    const fnName = getFunctionName(queryRef);
    if (fnName === "users:getCurrentUserProfile") return currentUser;
    if (fnName === "users:listAllUsersAdmin") return sampleUsers;
    return [];
  },
  useMutation: (mutationRef: any) => {
    const fnName = getFunctionName(mutationRef);
    if (fnName === "users:toggleUserActive") return mockToggleActive;
    return mockUpdateRole;
  },
}));

describe("Users & RBAC Directory Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user roster with roles and statuses", () => {
    render(<UsersPage />);

    expect(screen.getByText("User Directory & Access Control")).toBeInTheDocument();
    expect(screen.getByText("candidate_alex")).toBeInTheDocument();
    expect(screen.getByText("faculty_maria")).toBeInTheDocument();
    expect(screen.getByText("student")).toBeInTheDocument();
    expect(screen.getByText("content manager")).toBeInTheDocument();
  });

  it("opens role editor and allows modifying user role", async () => {
    render(<UsersPage />);

    const roleButtons = screen.getAllByTitle("Change Role");
    expect(roleButtons.length).toBeGreaterThan(0);
    fireEvent.click(roleButtons[0]);

    expect(screen.getByText("Modify User Role")).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: /Save Role/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalled();
    });
  });

  it("allows toggling account suspension status", async () => {
    render(<UsersPage />);

    const suspendButtons = screen.getAllByTitle("Suspend Account");
    expect(suspendButtons.length).toBeGreaterThan(0);
    fireEvent.click(suspendButtons[0]);

    await waitFor(() => {
      expect(mockToggleActive).toHaveBeenCalled();
    });
  });
});
