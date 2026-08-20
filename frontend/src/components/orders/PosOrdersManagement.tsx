"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import DeleteOrderDialog from "@/components/dialogs/DeleteOrderDialog";
import PosOrderDetailsModal from "@/components/models/PosOrderDetailsModal";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { DASHBOARD_ICONS_PATH } from "@/lib/constants";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import {
  deletePosOrder,
  fetchBranches,
  fetchPosOrderStats,
  fetchPosOrders,
} from "@/services/remoteApi";
import type { Order, OrderPeriod, OrderStats, OrderStatus, PosOrderType } from "@/types";

const PAGE_SIZE = 10;

function todayISODate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function resolveOrderType(order: Order): PosOrderType {
  const raw = String(order.orderType ?? "").toLowerCase();
  if (raw === "combo offer" || raw === "combo") return "Combo Offer";
  return "Normal";
}

const TYPE_STYLES: Record<PosOrderType, string> = {
  "Combo Offer": "bg-[#9B7EBD] text-white",
  Normal: "bg-[#2BBBAD] text-white",
};

interface PosOrdersManagementProps {
  role?: "superadmin" | "admin";
}

export default function PosOrdersManagement({
  role = "superadmin",
}: PosOrdersManagementProps) {
  const isSuperadmin = role === "superadmin";
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    productSold: "0",
    todaysRevenue: "0.00 €",
    weeklyRevenue: "0.00 €",
    monthlyRevenue: "0.00 €",
    totalRevenue: "0.00 €",
  });
  const [period, setPeriod] = useState<OrderPeriod>("now");
  const [selectedDate, setSelectedDate] = useState(todayISODate());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const useDateFilter = period === "now";
  const adminBranch = !isSuperadmin ? user?.branch : undefined;

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
    async function load() {
      try {
        const branch =
          adminBranch ||
          (branchFilter !== "all" ? branchFilter : undefined);
        const [orderList, orderStats] = await Promise.all([
          fetchPosOrders({
            ...(useDateFilter ? { date: selectedDate } : { period }),
            status:
              statusFilter !== "all" ? (statusFilter as OrderStatus) : undefined,
            branch,
            search: search.trim() || undefined,
          }),
          fetchPosOrderStats({
            ...(useDateFilter ? { date: selectedDate } : { period }),
            branch,
          }),
        ]);
        setOrders(orderList);
        setStats(orderStats);
      } catch (error) {
        console.error("Failed to load POS orders", error);
        setOrders([]);
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          inProgressOrders: 0,
          completedOrders: 0,
          totalCustomers: 0,
          productSold: "0",
          todaysRevenue: "0.00 €",
          weeklyRevenue: "0.00 €",
          monthlyRevenue: "0.00 €",
          totalRevenue: "0.00 €",
        });
      }
    }
    load();
  }, [
    period,
    selectedDate,
    useDateFilter,
    statusFilter,
    branchFilter,
    search,
    adminBranch,
  ]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageOrders = orders.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePeriodChange = (next: OrderPeriod) => {
    setPeriod(next);
    if (next === "now") setSelectedDate(todayISODate());
    setCurrentPage(1);
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value || todayISODate());
    setPeriod("now");
    setCurrentPage(1);
  };

  const handleDelete = async (orderId: string) => {
    try {
      await deletePosOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setViewOrder(null);
      setDetailsOpen(false);
      setDeleteOpen(false);
      setDeleteOrderId(null);
    } catch (error) {
      console.error("Failed to delete order", error);
    }
  };

  const openDelete = (orderId: string) => {
    setDeleteOrderId(orderId);
    setDeleteOpen(true);
  };

  const openView = (order: Order) => {
    setViewOrder(order);
    setDetailsOpen(true);
  };

  const handleDownloadCsv = () => {
    const headers = isSuperadmin
      ? ["Order ID", "Branch", "Item", "Amount", "Type"]
      : ["Order ID", "Item", "Amount", "Type"];

    const rows = orders.map((order) => {
      const orderType = resolveOrderType(order);
      return isSuperadmin
        ? [
            order.id,
            order.branch,
            order.itemCount,
            order.amount.toFixed(2),
            orderType,
          ]
        : [order.id, order.itemCount, order.amount.toFixed(2), orderType];
    });

    downloadCsv(
      `pos-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows
    );
  };

  const showingFrom = orders.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + PAGE_SIZE, orders.length);

  const posStatCards = [
    {
      label: "Product Sold",
      value: stats.productSold,
      logo: `${DASHBOARD_ICONS_PATH}/product_sold.svg`,
    },
    {
      label: "Today's Revenue",
      value: stats.todaysRevenue,
      logo: `${DASHBOARD_ICONS_PATH}/todays_revenue.svg`,
    },
    {
      label: "Weekly Revenue",
      value: stats.weeklyRevenue,
      logo: `${DASHBOARD_ICONS_PATH}/weekly_revenue.svg`,
    },
    {
      label: "Monthly Revenue",
      value: stats.monthlyRevenue,
      logo: `${DASHBOARD_ICONS_PATH}/monthly_revenue.svg`,
    },
    {
      label: "Total Revenue",
      value: stats.totalRevenue,
      logo: `${DASHBOARD_ICONS_PATH}/total_revenue.svg`,
    },
  ];

  return (
    <>
      <DashboardHeader title="POS order management" />

      {isSuperadmin && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 rounded-full border-none bg-white px-4 text-sm shadow-sm outline-none"
          >
            <option value="all">All Branch</option>
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={handleDownloadCsv}
            className="h-11 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]"
          >
            <Download className="size-4" />
            Download CSV
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {posStatCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#F2F2F3] p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex rounded-full bg-white p-1">
            {(
              [
                { key: "now", label: "Now" },
                { key: "weekly", label: "Weekly" },
                { key: "monthly", label: "Monthly" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handlePeriodChange(tab.key)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium text-[#00562C] transition-colors",
                  period === tab.key
                    ? "bg-[#e8f5ee]"
                    : "hover:bg-[#e8f5ee]/60"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Calendar className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#00562C]" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="h-11 w-[160px] rounded-full border-none bg-white pl-10"
            />
          </div>

          <div className="relative min-w-[150px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-full border-none bg-white pl-10"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#00562C]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 min-w-[140px] cursor-pointer appearance-none rounded-full border-none bg-white py-2 pr-9 pl-9 text-sm text-gray-700 outline-none"
            >
              <option value="all">Status</option>
              <option value="Pending">Pending</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Ready">Ready</option>
              <option value="Completed">Completed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
          </div>

          {!isSuperadmin && (
            <Button
              type="button"
              onClick={handleDownloadCsv}
              className="h-11 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]"
            >
              <Download className="size-4" />
              Download CSV
            </Button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl bg-white">
          <div className="overflow-x-auto">
            <table
              className={cn(
                "w-full text-left text-sm",
                isSuperadmin ? "min-w-[900px]" : "min-w-[700px]"
              )}
            >
              <thead>
                <tr className="border-b-2 border-[#F2F2F3] bg-white text-gray-500">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  {isSuperadmin && (
                    <th className="px-4 py-3 font-medium">Branch</th>
                  )}
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isSuperadmin ? 6 : 5}
                      className="bg-white px-4 py-10 text-center text-gray-500"
                    >
                      No orders found for this filter.
                    </td>
                  </tr>
                ) : (
                  pageOrders.map((order) => {
                    const orderType = resolveOrderType(order);
                    return (
                      <tr
                        key={order.id}
                        className="border-b-2 border-[#F2F2F3] bg-white hover:bg-gray-50/80"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {order.id}
                        </td>
                        {isSuperadmin && (
                          <td className="px-4 py-3 text-gray-700">
                            {order.branch}
                          </td>
                        )}
                        <td className="px-4 py-3 text-gray-700">
                          {order.itemCount}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          € {order.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                              TYPE_STYLES[orderType]
                            )}
                          >
                            {orderType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openView(order)}
                              className="flex size-8 items-center justify-center rounded-full text-[#00562C] hover:bg-[#e8f5ee]"
                              aria-label={`View ${order.id}`}
                            >
                              <Eye className="size-5 text-[#00562C]" />
                            </button>
                            {isSuperadmin && (
                              <ActionIcon
                                type="delete"
                                size={18}
                                onClick={() => openDelete(order.id)}
                                label={`Delete ${order.id}`}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#F2F2F3] bg-white px-4 py-3">
            <p className="text-sm text-gray-500">
              Showing {String(showingFrom).padStart(2, "0")}-
              {String(showingTo).padStart(2, "0")} of {orders.length} Orders
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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

      <PosOrderDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        order={
          viewOrder
            ? orders.find((o) => o.id === viewOrder.id) ?? viewOrder
            : null
        }
        onDelete={(id) => openDelete(id)}
      />

      <DeleteOrderDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteOrderId(null);
        }}
        onConfirm={() => {
          if (deleteOrderId) handleDelete(deleteOrderId);
        }}
      />
    </>
  );
}
