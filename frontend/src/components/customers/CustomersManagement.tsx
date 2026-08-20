"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
  UserX,
  X,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import CustomerDetailsModal from "@/components/models/CustomerDetailsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DASHBOARD_ICONS_PATH } from "@/lib/constants";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import {
  fetchBranches,
  fetchClosureAnalysis,
  fetchCustomers,
  fetchCustomerStatsFromList,
} from "@/services/remoteApi";
import type { ClosureReasonStat, Customer, CustomerTab } from "@/types";

const PAGE_SIZE = 10;

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalNewCustomers: 0,
    accountDeleted: 0,
  });
  const [closureReasons, setClosureReasons] = useState<ClosureReasonStat[]>([]);
  const [tab, setTab] = useState<CustomerTab>("directory");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchBranches()
      .then((branches) => setBranchOptions(branches.map((b) => b.name)))
      .catch(() => setBranchOptions([]));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [list, closure] = await Promise.all([
          fetchCustomers(),
          fetchClosureAnalysis(),
        ]);
        const customerStats = await fetchCustomerStatsFromList(list);
        setCustomers(list);
        setStats(customerStats);
        setClosureReasons(closure);
      } catch (error) {
        console.error("Failed to load customers", error);
        setCustomers([]);
      }
    }
    load();
  }, []);

  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (branchFilter !== "all") {
      result = result.filter((c) =>
        c.branches?.some((b) => b.name === branchFilter)
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      );
    }

    return result;
  }, [customers, search, statusFilter, branchFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );
  const showingFrom = filteredCustomers.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(
    startIndex + PAGE_SIZE,
    filteredCustomers.length
  );

  const openView = (customer: Customer) => {
    setViewCustomer(customer);
    setDetailsOpen(true);
  };

  const resetPage = () => setCurrentPage(1);

  const handleDownloadCsv = () => {
    if (tab === "closure-analysis") {
      downloadCsv(
        `closure-analysis-${new Date().toISOString().slice(0, 10)}.csv`,
        ["Reason", "Count"],
        closureReasons.map((row) => [row.reason, row.count])
      );
      return;
    }

    downloadCsv(
      `customers-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Customer name", "Email", "Phone number", "Orders", "Spend", "Status"],
      filteredCustomers.map((c) => [
        c.name,
        c.email,
        c.phone,
        c.orders,
        c.spend,
        c.status,
      ])
    );
  };

  const statCards = [
    {
      label: "Total Customers",
      value: String(stats.totalCustomers),
      logo: `${DASHBOARD_ICONS_PATH}/total_users.svg`,
    },
    {
      label: "Total New Customers",
      value: String(stats.totalNewCustomers),
      logo: `${DASHBOARD_ICONS_PATH}/total_users.svg`,
    },
    {
      label: "Account Deleted",
      value: String(stats.accountDeleted),
      logo: `${DASHBOARD_ICONS_PATH}/pending_orders.svg`,
    },
  ];

  return (
    <>
      <DashboardHeader title="Customer management" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F2F2F3] px-4 py-3">
        <div className="relative">
          <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#00562C]" />
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
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
        <Button
          type="button"
          onClick={handleDownloadCsv}
          className="h-10 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]"
        >
          <Download className="size-4" />
          Download CSV
        </Button>
      </div>

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
              className="h-11 min-w-[140px] cursor-pointer appearance-none rounded-full border-none bg-white py-2 pr-9 pl-9 text-sm outline-none"
            >
              <option value="all">Status</option>
              <option value="Active">Active</option>
              <option value="Account closed">Account closed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTab("directory");
              resetPage();
            }}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === "directory"
                ? "bg-[#00562C] text-white"
                : "bg-white text-gray-600 hover:text-gray-900"
            )}
          >
            Customer Directory
          </button>
          <button
            type="button"
            onClick={() => setTab("closure-analysis")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === "closure-analysis"
                ? "bg-[#00562C] text-white"
                : "bg-white text-gray-600 hover:text-gray-900"
            )}
          >
            Account Closure Analysis
          </button>
        </div>

        {tab === "directory" ? (
          <div className="overflow-hidden rounded-xl bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#F2F2F3] text-gray-500">
                    <th className="px-4 py-3 font-medium">Customer name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Phone number</th>
                    <th className="px-4 py-3 font-medium">Orders</th>
                    <th className="px-4 py-3 font-medium">Spend</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-gray-500"
                      >
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    pageCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b-2 border-[#F2F2F3] bg-white hover:bg-gray-50/60"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-[#e8f5ee] text-xs font-semibold text-[#00562C]">
                              {customer.initials}
                            </div>
                            <span className="text-gray-900">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {customer.email}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {customer.phone}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {customer.orders}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {customer.spend}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                              customer.status === "Active"
                                ? "bg-green-500"
                                : "bg-red-500"
                            )}
                          >
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openView(customer)}
                            className="flex size-8 items-center justify-center rounded-full bg-[#F2F2F3] text-[#00562C] hover:bg-[#e8f5ee]"
                            aria-label={`View ${customer.name}`}
                          >
                            <Eye className="size-4" />
                          </button>
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
                {String(showingTo).padStart(2, "0")} of{" "}
                {filteredCustomers.length} Customers
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
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {closureReasons.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-white px-4 py-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white">
                  {item.isOther ? (
                    <UserX className="size-5" />
                  ) : (
                    <X className="size-5" />
                  )}
                </div>
                <p
                  className={cn(
                    "flex-1 text-sm font-medium",
                    item.isOther ? "text-red-500" : "text-gray-800"
                  )}
                >
                  {item.reason}
                </p>
                <p className="shrink-0 text-sm font-semibold text-gray-900">
                  {String(item.count).padStart(2, "0")} Customer
                  {item.count === 1 ? "" : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomerDetailsModal
        open={detailsOpen}
        customer={viewCustomer}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}
