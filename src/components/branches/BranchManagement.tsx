"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Search,
  Store,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import ConfirmSaveBranchDialog from "@/components/dialogs/ConfirmSaveBranchDialog";
import DeleteBranchDialog from "@/components/dialogs/DeleteBranchDialog";
import BranchDetailsModal from "@/components/models/BranchDetailsModal";
import BranchFormModal from "@/components/models/BranchFormModal";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DASHBOARD_ICONS_PATH } from "@/lib/constants";
import { getBranchStats, INITIAL_BRANCHES } from "@/services/branchService";
import type { BranchFormData, BranchRecord, BranchStatus } from "@/types";

const PAGE_SIZE = 10;

export default function BranchManagement() {
  const [branches, setBranches] = useState<BranchRecord[]>(INITIAL_BRANCHES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingBranch, setEditingBranch] = useState<BranchRecord | null>(null);
  const [pendingForm, setPendingForm] = useState<BranchFormData | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewBranch, setViewBranch] = useState<BranchRecord | null>(null);

  const filtered = useMemo(() => {
    let result = branches;
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.manager.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q)
      );
    }
    return result;
  }, [branches, search, statusFilter]);

  const stats = useMemo(() => getBranchStats(branches), [branches]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageBranches = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + PAGE_SIZE, filtered.length);

  const openCreate = () => {
    setFormMode("create");
    setEditingBranch(null);
    setFormOpen(true);
  };

  const openEdit = (branch: BranchRecord) => {
    setFormMode("edit");
    setEditingBranch(branch);
    setFormOpen(true);
  };

  const handleSaveRequest = (data: BranchFormData) => {
    setPendingForm(data);
    setSaveConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!pendingForm) return;

    const location = `${pendingForm.street}, ${pendingForm.city}, ${pendingForm.country}`;

    if (formMode === "create") {
      const newBranch: BranchRecord = {
        id: Date.now(),
        location,
        status: "Active",
        ...pendingForm,
      };
      setBranches((prev) => [newBranch, ...prev]);
      setCurrentPage(1);
    } else if (editingBranch) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === editingBranch.id
            ? {
                ...b,
                ...pendingForm,
                location,
              }
            : b
        )
      );
    }

    setPendingForm(null);
    setFormOpen(false);
    setEditingBranch(null);
  };

  const openDelete = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId == null) return;
    setBranches((prev) => prev.filter((b) => b.id !== deleteId));
    setDeleteId(null);
    setViewOpen(false);
    setViewBranch(null);
  };

  const handleToggleStatus = (branchId: number, status: BranchStatus) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === branchId ? { ...b, status } : b))
    );
  };

  const currentViewBranch = viewBranch
    ? (branches.find((b) => b.id === viewBranch.id) ?? viewBranch)
    : null;

  const resetPage = () => setCurrentPage(1);

  const statCards = [
    {
      label: "Total Branch",
      value: String(stats.totalBranch),
      logo: `${DASHBOARD_ICONS_PATH}/total_branch.svg`,
    },
    {
      label: "Active Branch",
      value: String(stats.activeBranch).padStart(2, "0"),
      logo: `${DASHBOARD_ICONS_PATH}/admin.svg`,
    },
    {
      label: "In Active Branch",
      value: String(stats.inactiveBranch).padStart(2, "0"),
      logo: `${DASHBOARD_ICONS_PATH}/pending_orders.svg`,
    },
  ];

  return (
    <>
      <DashboardHeader title="Branch management" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
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

          <Button
            onClick={openCreate}
            className="h-11 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]"
          >
            Add Branch
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[#F2F2F3] text-gray-500">
                  <th className="px-4 py-3 font-medium">Branch</th>
                  <th className="px-4 py-3 font-medium">Manager</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageBranches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No branches found.
                    </td>
                  </tr>
                ) : (
                  pageBranches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="border-b-2 border-[#F2F2F3] bg-white hover:bg-gray-50/60"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-[#e8f5ee]">
                            <Store className="size-4 text-[#00562C]" />
                          </div>
                          <span className="text-gray-900">{branch.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{branch.manager}</td>
                      <td className="max-w-[280px] px-4 py-3 text-gray-700">
                        {branch.location}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                            branch.status === "Active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          )}
                        >
                          {branch.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setViewBranch(branch);
                              setViewOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-[#00562C] hover:bg-[#e8f5ee]"
                            aria-label={`View ${branch.name}`}
                          >
                            <Eye className="size-4" />
                          </button>
                          <ActionIcon
                            type="edit"
                            onClick={() => openEdit(branch)}
                            label={`Edit ${branch.name}`}
                          />
                          <ActionIcon
                            type="delete"
                            onClick={() => openDelete(branch.id)}
                            label={`Delete ${branch.name}`}
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
              {String(showingTo).padStart(2, "0")} of {filtered.length} Branch
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

      <BranchFormModal
        open={formOpen}
        mode={formMode}
        branch={editingBranch}
        onOpenChange={setFormOpen}
        onSaveRequest={handleSaveRequest}
      />

      <ConfirmSaveBranchDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        onConfirm={handleConfirmSave}
        branchName={pendingForm?.name || "Kaffee Krumel"}
      />

      <DeleteBranchDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <BranchDetailsModal
        open={viewOpen}
        branch={currentViewBranch}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewBranch(null);
        }}
        onEdit={openEdit}
        onDelete={openDelete}
        onToggleStatus={handleToggleStatus}
      />
    </>
  );
}
