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
import OrderDetailsModal from "@/components/models/OrderDetailsModal";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DASHBOARD_ICONS_PATH } from "@/lib/constants";
import {
  advanceOrderStatus,
  deleteOrder,
  fetchBranches,
  fetchOrderStats,
  fetchOrders,
} from "@/services/remoteApi";
import type { Order, OrderPeriod, OrderStats, OrderStatus } from "@/types";

const PAGE_SIZE = 10;

function todayISODate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-gray-400 text-white",
  "In-Progress": "bg-orange-500 text-white",
  Ready: "bg-amber-400 text-white",
  Completed: "bg-green-500 text-white",
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  Pending: "In-Progress",
  "In-Progress": "Ready",
  Ready: "Completed",
  Completed: null,
};

interface OrdersManagementProps {
  role?: "superadmin" | "admin";
}

export default function OrdersManagement({
  role = "superadmin",
}: OrdersManagementProps) {
  const isSuperadmin = role === "superadmin";
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    productSold: "0",
    todaysRevenue: "0,00 €",
    weeklyRevenue: "0,00 €",
    monthlyRevenue: "0,00 €",
    totalRevenue: "0,00 €",
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

  const filteredOrders = orders;
  const useDateFilter = period === "now";

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [orderList, orderStats] = await Promise.all([
          fetchOrders({
            ...(useDateFilter ? { date: selectedDate } : { period }),
            status:
              statusFilter !== "all" ? (statusFilter as OrderStatus) : undefined,
            branch: branchFilter !== "all" ? branchFilter : undefined,
            search: search.trim() || undefined,
          }),
          fetchOrderStats({
            ...(useDateFilter ? { date: selectedDate } : { period }),
            branch: branchFilter !== "all" ? branchFilter : undefined,
          }),
        ]);
        setOrders(orderList);
        setStats(orderStats);
      } catch (error) {
        console.error("Failed to load orders", error);
      }
    }
    load();
  }, [period, selectedDate, useDateFilter, statusFilter, branchFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageOrders = filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);

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
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setViewOrder(null);
      setDetailsOpen(false);
      setDeleteOpen(false);
      setDeleteOrderId(null);
    } catch (error) {
      console.error("Failed to delete order", error);
    }
  };

  const handleAdvanceStatus = async (orderId: string) => {
    try {
      const updated = await advanceOrderStatus(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      setViewOrder((prev) => (prev?.id === orderId ? updated : prev));
    } catch (error) {
      console.error("Failed to advance order status", error);
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

  const showingFrom = filteredOrders.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + PAGE_SIZE, filteredOrders.length);

  const orderStatCards = [
    {
      label: "Total orders",
      value: String(stats.totalOrders),
      logo: `${DASHBOARD_ICONS_PATH}/pending_orders.svg`,
    },
    {
      label: "Pending orders",
      value: String(stats.pendingOrders),
      logo: `${DASHBOARD_ICONS_PATH}/pending_orders.svg`,
    },
    {
      label: "In progress Orders",
      value: String(stats.inProgressOrders),
      logo: `${DASHBOARD_ICONS_PATH}/pending_orders.svg`,
    },
    {
      label: "Completed Orders",
      value: String(stats.completedOrders),
      logo: `${DASHBOARD_ICONS_PATH}/pending_orders.svg`,
    },
    {
      label: "Total Customers",
      value: String(stats.totalCustomers),
      logo: `${DASHBOARD_ICONS_PATH}/total_users.svg`,
    },
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
      <DashboardHeader title="Order management" />

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
            <option value="all">All Branches</option>
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <Button className="h-11 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]">
            <Download className="size-4" />
            Download CSV
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {orderStatCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Filters + Table — #F2F2F3 container, white table */}
      <div className="overflow-hidden rounded-2xl bg-[#F2F2F3] p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex rounded-full bg-white p-1">
            {(
              [
                { key: "now", label: "Daily" },
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
            <Button className="h-11 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]">
              <Download className="size-4" />
              Download CSV
            </Button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[#F2F2F3] bg-white text-gray-500">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer name</th>
                  {isSuperadmin && (
                    <th className="px-4 py-3 font-medium">Branch</th>
                  )}
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isSuperadmin ? 8 : 7}
                      className="bg-white px-4 py-10 text-center text-gray-500"
                    >
                      No orders found for this filter.
                    </td>
                  </tr>
                ) : (
                  pageOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b-2 border-[#F2F2F3] bg-white hover:bg-gray-50/80"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-[#e8f5ee] text-xs font-semibold text-[#00562C]">
                            {order.customerInitials}
                          </div>
                          <span className="text-gray-900">{order.customerName}</span>
                        </div>
                      </td>
                      {isSuperadmin && (
                        <td className="px-4 py-3 text-gray-700">{order.branch}</td>
                      )}
                      <td className="px-4 py-3 text-gray-700">{order.email}</td>
                      <td className="px-4 py-3 text-gray-700">{order.itemCount}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {order.amount.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                            STATUS_STYLES[order.status]
                          )}
                        >
                          {order.status}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#F2F2F3] bg-white px-4 py-3">
            <p className="text-sm text-gray-500">
              Showing {String(showingFrom).padStart(2, "0")}-
              {String(showingTo).padStart(2, "0")} of {filteredOrders.length}{" "}
              Orders
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

      <OrderDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        order={
          viewOrder
            ? orders.find((o) => o.id === viewOrder.id) ?? viewOrder
            : null
        }
        onDelete={(id) => {
          openDelete(id);
        }}
        onAdvanceStatus={handleAdvanceStatus}
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
