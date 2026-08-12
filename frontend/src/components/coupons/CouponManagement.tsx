"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ConfirmSaveCouponDialog from "@/components/dialogs/ConfirmSaveCouponDialog";
import DeleteCouponDialog from "@/components/dialogs/DeleteCouponDialog";
import CouponDetailsModal from "@/components/models/CouponDetailsModal";
import CouponFormModal from "@/components/models/CouponFormModal";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import {
  couponStatusClass,
  couponStatusLabel,
  formatEuro,
  mapCouponHistoryRow,
  resolveCouponStatus,
} from "@/services/couponService";
import {
  createCoupon,
  deleteCoupon as deleteCouponApi,
  fetchBranches,
  fetchCouponHistory,
  fetchCoupons,
  updateCoupon,
  updateCouponStatus,
} from "@/services/remoteApi";
import type {
  CouponFormData,
  CouponHistoryRecord,
  CouponRecord,
  CouponStatus,
  CouponTab,
} from "@/types";

const PAGE_SIZE = 10;

interface CouponManagementProps {
  /** admin = full CRUD; superadmin = view-only manage table */
  variant?: "admin" | "superadmin";
}

export default function CouponManagement({
  variant = "admin",
}: CouponManagementProps) {
  const isSuperadmin = variant === "superadmin";
  const canManage = !isSuperadmin;

  const [tab, setTab] = useState<CouponTab>("history");
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [history, setHistory] = useState<CouponHistoryRecord[]>([]);
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCoupon, setEditingCoupon] = useState<CouponRecord | null>(null);
  const [pendingForm, setPendingForm] = useState<CouponFormData | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewCoupon, setViewCoupon] = useState<CouponRecord | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  const resetPage = () => setCurrentPage(1);

  const loadCoupons = async () => {
    try {
      const list = await fetchCoupons();
      setCoupons(list);
    } catch (error) {
      console.error("Failed to load coupons", error);
      setCoupons([]);
    }
  };

  const loadHistory = async () => {
    try {
      const branch =
        isSuperadmin && branchFilter !== "all" ? branchFilter : undefined;
      const data = await fetchCouponHistory({
        branch,
        page: 1,
        limit: 100,
      });
      setHistory(data.items.map(mapCouponHistoryRow));
    } catch (error) {
      console.error("Failed to load coupon history", error);
      setHistory([]);
    }
  };

  useEffect(() => {
    if (!isSuperadmin) return;
    fetchBranches()
      .then((branches) =>
        setBranchOptions(
          branches
            .map((b) => b.name)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
        )
      )
      .catch(() => setBranchOptions([]));
  }, [isSuperadmin]);

  useEffect(() => {
    void loadCoupons();
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [isSuperadmin, branchFilter]);

  const filteredHistory = useMemo(() => {
    let result = history;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (row) =>
          row.customerName.toLowerCase().includes(q) ||
          row.orderId.toLowerCase().includes(q) ||
          row.couponId.toLowerCase().includes(q) ||
          row.branch.toLowerCase().includes(q)
      );
    }
    return result;
  }, [history, search]);

  const filteredCoupons = useMemo(() => {
    let result = coupons.map((c) => ({
      ...c,
      status: resolveCouponStatus(c.validityTo, c.status),
    }));
    if (isSuperadmin && branchFilter !== "all") {
      result = result.filter((c) => c.branch === branchFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.couponId.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.branch.toLowerCase().includes(q) ||
          c.discount.toLowerCase().includes(q)
      );
    }
    return result;
  }, [coupons, search, statusFilter, branchFilter, isSuperadmin]);

  const source = tab === "history" ? filteredHistory : filteredCoupons;
  const totalPages = Math.max(1, Math.ceil(source.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageRows = source.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = source.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + PAGE_SIZE, source.length);

  const activeCoupons = coupons.filter(
    (c) => resolveCouponStatus(c.validityTo, c.status) === "Active"
  ).length;

  const totalDiscountGiven = history.reduce(
    (sum, row) => sum + (row.savingAmount || 0),
    0
  );

  const currentViewCoupon = viewCoupon
    ? (coupons.find((c) => c.id === viewCoupon.id) ?? viewCoupon)
    : null;

  const openCreate = () => {
    setFormMode("create");
    setEditingCoupon(null);
    setFormOpen(true);
  };

  const openEdit = (coupon: CouponRecord) => {
    setViewOpen(false);
    setFormMode("edit");
    setEditingCoupon(coupon);
    setFormOpen(true);
  };

  const openView = (coupon: CouponRecord) => {
    setViewCoupon(coupon);
    setViewOpen(true);
  };

  const openDelete = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSaveRequest = (data: CouponFormData) => {
    setActionError("");
    setPendingForm(data);
    setSaveConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingForm) return;
    try {
      if (formMode === "create") {
        await createCoupon(pendingForm);
        setTab("manage");
        setCurrentPage(1);
      } else if (editingCoupon) {
        const updated = await updateCoupon(editingCoupon.id, pendingForm);
        setViewCoupon((prev) =>
          prev?.id === editingCoupon.id ? updated : prev
        );
      }
      setPendingForm(null);
      setEditingCoupon(null);
      setFormOpen(false);
      setSaveConfirmOpen(false);
      setActionError("");
      await loadCoupons();
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to save coupon";
      setActionError(message);
      setSaveConfirmOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await deleteCouponApi(deleteId);
      if (viewCoupon?.id === deleteId) {
        setViewOpen(false);
        setViewCoupon(null);
      }
      setDeleteId(null);
      setDeleteOpen(false);
      setActionError("");
      await loadCoupons();
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to delete coupon";
      setActionError(message);
    }
  };

  const handleToggleStatus = async (
    couponId: number,
    status: CouponStatus
  ) => {
    if (status !== "Active" && status !== "Inactive") return;
    try {
      const updated = await updateCouponStatus(couponId, status);
      setCoupons((prev) =>
        prev.map((c) => (c.id === couponId ? updated : c))
      );
      setViewCoupon((prev) => (prev?.id === couponId ? updated : prev));
    } catch (error) {
      console.error("Failed to update coupon status", error);
    }
  };

  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
    if (totalPages <= 3) return i + 1;
    if (safePage <= 2) return i + 1;
    if (safePage >= totalPages - 1) return totalPages - 2 + i;
    return safePage - 1 + i;
  });

  const showBranchColumn = isSuperadmin;

  return (
    <>
      <DashboardHeader title="Coupon management" />

      {actionError ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl bg-[#F2F2F3] p-3 sm:p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-full bg-white p-1">
            <button
              type="button"
              onClick={() => {
                setTab("history");
                setStatusFilter("all");
                resetPage();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === "history"
                  ? "bg-[#CBF0CB] text-[#00562C]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Coupon history
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("manage");
                resetPage();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === "manage"
                  ? "bg-[#CBF0CB] text-[#00562C]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Manage coupon
            </button>
          </div>

          {isSuperadmin ? (
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
                {branchOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
            </div>
          ) : null}
        </div>

        {tab === "history" ? (
          <>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <HistoryStatCard
                label="Total coupons used"
                value={history.length.toLocaleString()}
              />
              <HistoryStatCard
                label="Total discount given"
                value={formatEuro(String(totalDiscountGiven))}
              />
              <HistoryStatCard
                label="Active Coupons"
                value={String(activeCoupons)}
              />
            </div>

            <div className="relative mb-3">
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

            <div className="overflow-hidden rounded-xl bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#F2F2F3] text-gray-500">
                      <th className="px-4 py-3 font-medium">Customer name</th>
                      <th className="px-4 py-3 font-medium">Order Id</th>
                      <th className="px-4 py-3 font-medium">C_Id</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      {showBranchColumn ? (
                        <th className="px-4 py-3 font-medium">Branch</th>
                      ) : null}
                      <th className="px-4 py-3 font-medium">Order Total</th>
                      <th className="px-4 py-3 font-medium">Saving</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={showBranchColumn ? 7 : 6}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No coupon history yet.
                        </td>
                      </tr>
                    ) : (
                      (pageRows as CouponHistoryRecord[]).map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-[#F2F2F3] last:border-none"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#CBF0CB] text-xs font-semibold text-[#00562C]">
                                {row.customerInitials}
                              </span>
                              <span className="font-medium text-gray-900">
                                {row.customerName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {row.orderId}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {row.couponId}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{row.date}</td>
                          {showBranchColumn ? (
                            <td className="px-4 py-3 text-gray-700">
                              {row.branch}
                            </td>
                          ) : null}
                          <td className="px-4 py-3 text-gray-700">
                            {row.orderTotal}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#FF0000]">
                            {row.saving}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
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
                  className="h-11 min-w-[140px] cursor-pointer appearance-none rounded-full border-none bg-white py-2 pr-9 pl-9 text-sm outline-none"
                >
                  <option value="all">Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
              </div>

              {canManage ? (
                <Button
                  type="button"
                  onClick={openCreate}
                  className="h-11 rounded-xl bg-[#00562C] px-4 text-white hover:bg-[#004522]"
                >
                  <Plus className="size-4" />
                  Add Coupon
                </Button>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-xl bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#F2F2F3] text-gray-500">
                      <th className="px-4 py-3 font-medium">C_Id</th>
                      <th className="px-4 py-3 font-medium">Title</th>
                      {showBranchColumn ? (
                        <th className="px-4 py-3 font-medium">Branch</th>
                      ) : null}
                      <th className="px-4 py-3 font-medium">Discount</th>
                      <th className="px-4 py-3 font-medium">Validity</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={showBranchColumn ? 7 : 6}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No coupons yet.
                        </td>
                      </tr>
                    ) : (
                      (pageRows as CouponRecord[]).map((coupon) => (
                        <tr
                          key={coupon.id}
                          className="border-b border-[#F2F2F3] last:border-none"
                        >
                          <td className="px-4 py-3 text-gray-700">
                            {coupon.couponId}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {coupon.title}
                          </td>
                          {showBranchColumn ? (
                            <td className="px-4 py-3 text-gray-700">
                              {coupon.branch}
                            </td>
                          ) : null}
                          <td className="px-4 py-3 text-gray-700">
                            {coupon.discount} %
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {coupon.validityFrom} - {coupon.validityTo}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                                couponStatusClass(coupon.status)
                              )}
                            >
                              {couponStatusLabel(coupon.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openView(coupon)}
                                className="rounded-lg p-1.5 text-[#00562C] hover:bg-[#F2F2F3]"
                                aria-label="View coupon"
                              >
                                <Eye className="size-4" />
                              </button>
                              {canManage ? (
                                <>
                                  <ActionIcon
                                    type="edit"
                                    onClick={() => openEdit(coupon)}
                                    label="Edit coupon"
                                  />
                                  <ActionIcon
                                    type="delete"
                                    onClick={() => openDelete(coupon.id)}
                                    label="Delete coupon"
                                  />
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-sm text-gray-500">
            Showing {String(showingFrom).padStart(2, "0")}-
            {String(showingTo).padStart(2, "0")} of {source.length}{" "}
            {tab === "history" ? "Coupon history" : "Coupon"}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg p-2 text-gray-500 hover:bg-white disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg text-sm font-medium",
                  page === safePage
                    ? "bg-[#CBF0CB] text-[#00562C]"
                    : "text-gray-600 hover:bg-white"
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
              className="rounded-lg p-2 text-gray-500 hover:bg-white disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {canManage ? (
        <>
          <CouponFormModal
            open={formOpen}
            mode={formMode}
            coupon={editingCoupon}
            onOpenChange={setFormOpen}
            onSaveRequest={handleSaveRequest}
          />
          <ConfirmSaveCouponDialog
            open={saveConfirmOpen}
            onOpenChange={setSaveConfirmOpen}
            onConfirm={() => {
              void handleConfirmSave();
            }}
          />
          <DeleteCouponDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onConfirm={() => {
              void handleConfirmDelete();
            }}
          />
        </>
      ) : null}

      <CouponDetailsModal
        open={viewOpen}
        readOnly={isSuperadmin}
        coupon={
          currentViewCoupon
            ? {
                ...currentViewCoupon,
                status: resolveCouponStatus(
                  currentViewCoupon.validityTo,
                  currentViewCoupon.status
                ),
              }
            : null
        }
        onOpenChange={setViewOpen}
        onEdit={canManage ? openEdit : undefined}
        onToggleStatus={canManage ? handleToggleStatus : undefined}
        onDelete={canManage ? openDelete : undefined}
      />
    </>
  );
}

function HistoryStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-[#CBF0CB] text-[#00562C]">
        <BadgePercent className="size-4" />
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
