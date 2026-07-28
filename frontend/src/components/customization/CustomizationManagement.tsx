"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ConfirmSaveCustomizationDialog from "@/components/dialogs/ConfirmSaveCustomizationDialog";
import DeleteCustomizationDialog from "@/components/dialogs/DeleteCustomizationDialog";
import CustomizationFormModal from "@/components/models/CustomizationFormModal";
import CustomizationDetailsModal from "@/components/models/CustomizationDetailsModal";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createCustomization,
  deleteCustomization,
  fetchCustomizations,
  updateCustomization,
  updateCustomizationStatus,
} from "@/services/remoteApi";
import type {
  CustomizationFormData,
  CustomizationRecord,
  CustomizationStatus,
} from "@/types";

const PAGE_SIZE = 20;

export default function CustomizationManagement() {
  const [customizations, setCustomizations] = useState<CustomizationRecord[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<CustomizationRecord | null>(
    null
  );
  const [pendingForm, setPendingForm] = useState<CustomizationFormData | null>(
    null
  );
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<CustomizationRecord | null>(null);

  const filtered = useMemo(() => {
    let result = customizations;
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [customizations, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + PAGE_SIZE, filtered.length);

  const currentViewItem = viewItem
    ? (customizations.find((c) => c.id === viewItem.id) ?? viewItem)
    : null;

  const resetPage = () => setCurrentPage(1);

  useEffect(() => {
    fetchCustomizations()
      .then(setCustomizations)
      .catch((error) => console.error("Failed to load customizations", error));
  }, []);

  const deriveStatus = (groups: CustomizationFormData["groups"]): CustomizationStatus => {
    if (groups.length === 0) return "Active";
    return groups.every((g) => g.status === "Active") ? "Active" : "Inactive";
  };

  const openCreate = () => {
    setFormMode("create");
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: CustomizationRecord) => {
    setFormMode("edit");
    setEditingItem(item);
    setFormOpen(true);
  };

  const openView = (item: CustomizationRecord) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const openDelete = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSaveRequest = (data: CustomizationFormData) => {
    setPendingForm(data);
    setSaveConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingForm) return;

    try {
      if (formMode === "create") {
        const created = await createCustomization(pendingForm);
        setCustomizations((prev) => [created, ...prev]);
      } else if (editingItem) {
        const updated = await updateCustomization(editingItem.id, pendingForm);
        setCustomizations((prev) =>
          prev.map((c) => (c.id === editingItem.id ? updated : c))
        );
      }

      setPendingForm(null);
      setFormOpen(false);
      setEditingItem(null);
      setSaveConfirmOpen(false);
    } catch (error) {
      console.error("Failed to save customization", error);
      setSaveConfirmOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteCustomization(deleteId);
      setCustomizations((prev) => prev.filter((c) => c.id !== deleteId));
      if (viewItem?.id === deleteId) {
        setViewOpen(false);
        setViewItem(null);
      }
      setDeleteId(null);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete customization", error);
    }
  };

  const handleToggleStatus = async (id: number, status: CustomizationStatus) => {
    try {
      const updated = await updateCustomizationStatus(id, status);
      setCustomizations((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <>
      <DashboardHeader title="Customization management" />

      <div className="overflow-hidden rounded-2xl bg-[#F2F2F3] p-3 sm:p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
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
            Add Customization
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
          {pageItems.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => openView(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openView(item);
              }}
              className="flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="px-3 pt-4 pb-2 text-center">
                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.groups.length} Groups
                </p>
              </div>

              <div
                className={cn(
                  "mx-3 flex items-center justify-center rounded-lg py-1.5 text-xs font-medium text-white",
                  item.status === "Active" ? "bg-[#49AE20]" : "bg-[#FF0000]"
                )}
              >
                {item.status === "Active" ? "Active" : "In -Active"}
              </div>

              <div className="flex items-center justify-center gap-2 px-3 py-3">
                <ActionIcon
                  type="edit"
                  buttonClassName="size-9 rounded-lg border border-gray-200 bg-white"
                  onClick={() => openEdit(item)}
                />
                <ActionIcon
                  type="delete"
                  buttonClassName="size-9 rounded-lg border border-gray-200 bg-white"
                  onClick={() => openDelete(item.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {pageItems.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">
            No customizations found.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
          <p className="text-sm text-gray-600">
            Showing {String(showingFrom).padStart(2, "0")}-
            {String(showingTo).padStart(2, "0")} of {filtered.length}{" "}
            Customization
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex size-8 items-center justify-center rounded-full text-gray-600 hover:bg-[#F2F2F3] disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from(
              { length: Math.min(3, totalPages) },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                  safePage === page
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
              className="flex size-8 items-center justify-center rounded-full text-gray-600 hover:bg-[#F2F2F3] disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <CustomizationDetailsModal
        open={viewOpen}
        customization={currentViewItem}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewItem(null);
        }}
        onEdit={openEdit}
        onDelete={openDelete}
        onToggleStatus={handleToggleStatus}
      />

      <CustomizationFormModal
        open={formOpen}
        mode={formMode}
        customization={editingItem}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        onSaveRequest={handleSaveRequest}
      />

      <ConfirmSaveCustomizationDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        onConfirm={handleConfirmSave}
        customizationName={pendingForm?.name}
      />

      <DeleteCustomizationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
