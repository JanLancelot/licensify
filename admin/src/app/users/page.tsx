"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useToast } from "@/context/ToastContext";
import {
  ShieldCheck,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";



export default function UsersPage() {
  const currentUser = useQuery(api.auth.users.getCurrentUserProfile);
  const { success, error: showError } = useToast();

  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const users = useQuery(api.auth.users.listAllUsersAdmin, {
    role:
      roleFilter !== "all"
        ? (roleFilter as "student" | "admin" | "content_manager")
        : undefined,
    search: searchQuery.trim() || undefined,
  });

  const updateRole = useMutation(api.auth.users.updateRole);
  const toggleUserActive = useMutation(api.auth.users.toggleUserActive);

  // Role Edit Modal
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<"student" | "admin" | "content_manager">("student");
  const [saving, setSaving] = useState(false);

  const openEditRoleModal = (u: any) => {
    setEditingUser(u);
    setSelectedRole(u.role);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      await updateRole({
        targetUserId: editingUser._id,
        newRole: selectedRole,
      });
      success(`Role for ${editingUser.username} updated to ${selectedRole}.`);
      setEditingUser(null);
    } catch (err: any) {
      showError(err?.message || "Failed to update role. Admin permissions required.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (targetUser: any) => {
    const nextStatus = !targetUser.isActive;
    try {
      await toggleUserActive({
        targetUserId: targetUser._id,
        isActive: nextStatus,
      });
      success(
        nextStatus
          ? `User ${targetUser.username} account activated.`
          : `User ${targetUser.username} account suspended.`
      );
    } catch (err: any) {
      showError(err?.message || "Failed to update account status.");
    }
  };

  if (users === undefined || currentUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blueprint-500 animate-spin" />
          <p className="text-sm text-studio-500">Loading user directory...</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-studio-900 dark:text-studio-50">
            User Directory & Access Control
          </h2>
          <p className="text-sm text-studio-500 dark:text-studio-400">
            Manage candidates, assign staff roles (Admin / Content Manager), and handle account suspensions.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-studio-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, email, or name..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blueprint-500"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="student">Candidates / Students</option>
            <option value="content_manager">Content Managers</option>
            <option value="admin">System Administrators</option>
          </select>
        </div>

        <span className="text-xs text-studio-500">
          Showing <strong className="text-studio-800 dark:text-studio-200">{users.length}</strong> accounts
        </span>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-studio-100/60 dark:bg-studio-850/60 text-studio-500 uppercase tracking-wider text-[11px] font-semibold border-b border-studio-200/60 dark:border-studio-800/60">
              <tr>
                <th className="p-4 sm:px-6">Candidate / User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right sm:pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-200/60 dark:divide-studio-800/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-studio-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = currentUser?._id === u._id;
                  const isSuspended = u.isActive === false;

                  return (
                    <tr key={u._id} className="hover:bg-studio-100/30 dark:hover:bg-studio-850/30 transition-colors">
                      <td className="p-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blueprint-500/10 text-blueprint-500 flex items-center justify-center font-bold text-xs uppercase border border-blueprint-500/20">
                            {u.username.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-studio-900 dark:text-studio-100">
                                {u.firstName || u.lastName
                                  ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                                  : u.username}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blueprint-500/10 text-blueprint-500">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-studio-500 text-[11px]">{u.email || `@${u.username}`}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            u.role === "admin"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              : u.role === "content_manager"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                              : "bg-blueprint-500/10 text-blueprint-600 dark:text-blueprint-400 border-blueprint-500/20"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{u.role.replace("_", " ")}</span>
                        </span>
                      </td>

                      <td className="p-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                            <XCircle className="w-3.5 h-3.5" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-studio-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-studio-500 text-[11px]">
                        {u.lastActiveAt
                          ? new Date(u.lastActiveAt).toLocaleDateString()
                          : "Never"}
                      </td>

                      <td className="p-4 text-right sm:pr-6">
                        {isAdmin && !isCurrent ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditRoleModal(u)}
                              title="Change Role"
                              className="px-2.5 py-1 rounded-lg bg-studio-200/80 dark:bg-studio-800 hover:bg-studio-300 dark:hover:bg-studio-700 text-studio-800 dark:text-studio-200 text-xs font-semibold transition-colors"
                            >
                              Role
                            </button>
                            <button
                              onClick={() => handleToggleActive(u)}
                              title={isSuspended ? "Reactivate Account" : "Suspend Account"}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                isSuspended
                                  ? "text-emerald-500 hover:bg-emerald-500/10"
                                  : "text-rose-500 hover:bg-rose-500/10"
                              }`}
                            >
                              {isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-studio-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Modify User Role"
        description="Adjust permission tier and studio access."
        icon={<ShieldCheck className="w-5 h-5" />}
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-4 py-2 rounded-xl text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="role-form"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Role</span>
            </button>
          </>
        }
      >
        {editingUser && (
          <form id="role-form" onSubmit={handleSaveRole} className="space-y-4">
            <p className="text-xs text-studio-500 mb-2">
              Assign role privileges for <strong className="text-studio-900 dark:text-studio-100">{editingUser.username}</strong> ({editingUser.email || "No email"}):
            </p>
            <div className="space-y-2">
              {[
                {
                  role: "student",
                  label: "Candidate / Student",
                  desc: "Can take practice quizzes, browse flashcards, and review notes.",
                },
                {
                  role: "content_manager",
                  label: "Content Manager",
                  desc: "Can create and edit questions, subjects, study notes, and flashcards.",
                },
                {
                  role: "admin",
                  label: "System Administrator",
                  desc: "Full permissions including role assignment, account moderation, and exams.",
                },
              ].map((r) => (
                <label
                  key={r.role}
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    selectedRole === r.role
                      ? "bg-blueprint-500/10 border-blueprint-500/40 text-blueprint-600 dark:text-blueprint-400"
                      : "bg-studio-100/50 dark:bg-studio-850/50 border-studio-200/60 dark:border-studio-800/60 text-studio-700 dark:text-studio-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="roleSelect"
                    value={r.role}
                    checked={selectedRole === r.role}
                    onChange={() => setSelectedRole(r.role as any)}
                    className="mt-1 text-blueprint-600"
                  />
                  <div>
                    <p className="font-bold text-xs text-studio-900 dark:text-studio-100">
                      {r.label}
                    </p>
                    <p className="text-[11px] text-studio-500 mt-0.5">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
