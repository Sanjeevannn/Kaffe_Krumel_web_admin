"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Store,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import ConfirmSaveUserDialog from "@/components/dialogs/ConfirmSaveUserDialog";
import DeleteUserDialog from "@/components/dialogs/DeleteUserDialog";
import UserFormModal from "@/components/models/UserFormModal";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DASHBOARD_ICONS_PATH } from "@/lib/constants";
import {
  createStaffUser,
  deleteStaffUser,
  fetchBranches,
  fetchStaffStats,
  fetchStaffUsers,
  updateStaffStatus,
  updateStaffUser,
} from "@/services/remoteApi";
import type {
  BranchRecord,
  StaffRole,
  StaffStatus,
  StaffUser,
  StaffUserFormData,
} from "@/types";

const PAGE_SIZE = 10;

export default function UsersManagement() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [stats, setStats] = useState({
    totalBranch: 0,
    totalUsers: 0,
    admin: 0,
    cashier: 0,
  });
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [pendingForm, setPendingForm] = useState<StaffUserFormData | null>(null);

  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const filteredUsers = useMemo(() => {
    let result = users;

    if (branchFilter !== "all") {
      result = result.filter((u) => u.branch === branchFilter);
    }
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.manager.toLowerCase().includes(q) ||
          u.branch.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, search, branchFilter, roleFilter, statusFilter]);

  useEffect(() => {
    async function load() {
      try {
        const [staff, staffStats, branches] = await Promise.all([
          fetchStaffUsers(),
          fetchStaffStats(),
          fetchBranches(),
        ]);
        setUsers(staff);
        setStats(staffStats);
        setBranches(branches);
      } catch (error) {
        console.error("Failed to load users", error);
        setUsers([]);
        setBranches([]);
      }
    }
    load();
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = filteredUsers.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + PAGE_SIZE, filteredUsers.length);

  const openCreate = () => {
    setFormMode("create");
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEdit = (user: StaffUser) => {
    setFormMode("edit");
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: StaffUserFormData) => {
    setPendingForm(data);
    setSaveConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingForm || !pendingForm.role) return;

    try {
      if (formMode === "create") {
        const created = await createStaffUser(pendingForm);
        setUsers((prev) => [created, ...prev]);
        setCurrentPage(1);
      } else if (editingUser) {
        const updated = await updateStaffUser(editingUser.id, pendingForm);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? updated : u))
        );
      }
      const staffStats = await fetchStaffStats();
      setStats(staffStats);

      setPendingForm(null);
      setFormOpen(false);
      setEditingUser(null);
      setSaveConfirmOpen(false);
    } catch (error) {
      console.error("Failed to save user", error);
      setSaveConfirmOpen(false);
    }
  };

  const openDelete = (id: number) => {
    setDeleteUserId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteUserId == null) return;
    try {
      await deleteStaffUser(deleteUserId);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
      const staffStats = await fetchStaffStats();
      setStats(staffStats);
      setDeleteUserId(null);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const updateStatus = async (id: number, status: StaffStatus) => {
    try {
      const updated = await updateStaffStatus(id, status);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (error) {
      console.error("Failed to update user status", error);
    }
  };

  const resetPage = () => setCurrentPage(1);

  const statCards = [
    {
      label: "Total Branch",
      value: String(stats.totalBranch),
      logo: `${DASHBOARD_ICONS_PATH}/total_branch.svg`,
    },
    {
      label: "Total Users",
      value: String(stats.totalUsers),
      logo: `${DASHBOARD_ICONS_PATH}/total_users.svg`,
    },
    {
      label: "Admin",
      value: String(stats.admin),
      logo: `${DASHBOARD_ICONS_PATH}/admin.svg`,
    },
    {
      label: "Cashier",
      value: String(stats.cashier),
      logo: `${DASHBOARD_ICONS_PATH}/cashier.svg`,
    },
  ];

  return (
    <>
      <DashboardHeader title="User management" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F2F2F3] px-4 py-3">
        <div className="relative">
          <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#00562C]" />
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              resetPage();
            }}
            className="h-10 min-w-[170px] cursor-pointer appearance-none rounded-full border-none bg-white py-2 pr-9 pl-9 text-sm text-gray-700 outline-none"
          >
            <option value="all">Select Branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
        </div>
        <Button
          onClick={openCreate}
          className="h-10 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]"
        >
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#F2F2F3] p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[150px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="h-11 rounded-full border-none bg-white pl-10"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                resetPage();
              }}
              className="h-11 min-w-[120px] cursor-pointer appearance-none rounded-full border-none bg-white py-2 pr-9 pl-9 text-sm outline-none"
            >
              <option value="all">Role</option>
              <option value="Admin">Admin</option>
              <option value="Cashier">Cashier</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                resetPage();
              }}
              className="h-11 min-w-[120px] cursor-pointer appearance-none rounded-full border-none bg-white py-2 pr-9 pl-9 text-sm outline-none"
            >
              <option value="all">Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[#F2F2F3] text-gray-500">
                  <th className="px-4 py-3 font-medium">Branch</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Manager</th>
                  <th className="px-4 py-3 font-medium">Created at</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  pageUsers.map((user) => (
                    <tr
                      key={user.id != null ? `user-${user.id}` : user.email}
                      className="border-b-2 border-[#F2F2F3] bg-white hover:bg-gray-50/60"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-[#e8f5ee]">
                            <Store className="size-4 text-[#00562C]" />
                          </div>
                          <span className="text-gray-900">{user.branch}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{user.email}</td>
                      <td className="px-4 py-3 text-gray-700">{user.manager}</td>
                      <td className="px-4 py-3 text-gray-700">{user.createdAt}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                            user.role === "Admin"
                              ? "bg-violet-500"
                              : "bg-cyan-500"
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative inline-block">
                          <select
                            value={user.status}
                            onChange={(e) =>
                              updateStatus(
                                user.id,
                                e.target.value as StaffStatus
                              )
                            }
                            className={cn(
                              "h-8 cursor-pointer appearance-none rounded-full py-1 pr-7 pl-3 text-xs font-medium text-white outline-none",
                              user.status === "Active"
                                ? "bg-green-500"
                                : "bg-red-500"
                            )}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-white" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ActionIcon
                            type="edit"
                            onClick={() => openEdit(user)}
                            label={`Edit ${user.email}`}
                          />
                          <ActionIcon
                            type="delete"
                            onClick={() => openDelete(user.id)}
                            label={`Delete ${user.email}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#F2F2F3] px-4 py-3">
            <p className="text-sm text-gray-500">
              Showing {String(showingFrom).padStart(2, "0")}-
              {String(showingTo).padStart(2, "0")} of {filteredUsers.length}{" "}
              Branch
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-full p-2 text-gray-500 hover:bg-[#F2F2F3] disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(0, 5)
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                      page === safePage
                        ? "bg-[#e8f5ee] text-[#00562C]"
                        : "text-gray-600 hover:bg-[#F2F2F3]"
                    )}
                  >
                    {page}
                  </button>
                ))}
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="rounded-full p-2 text-gray-500 hover:bg-[#F2F2F3] disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <UserFormModal
        open={formOpen}
        mode={formMode}
        user={editingUser}
        branches={branches}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
      />

      <ConfirmSaveUserDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        onConfirm={handleConfirmSave}
      />

      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteUserId(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
