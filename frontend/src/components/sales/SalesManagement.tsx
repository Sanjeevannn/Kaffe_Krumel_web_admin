"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Download,
  Filter,
  Search,
  Store,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DASHBOARD_ICONS_PATH } from "@/lib/constants";
import {
  fetchBranchPerformance,
  fetchBranches,
  fetchSalesStats,
  fetchTopProducts,
} from "@/services/remoteApi";
import type { BranchPerformance, OrderPeriod, SalesProduct, SalesTab } from "@/types";

const PRODUCTS_PAGE_SIZE = 11;
const BRANCH_PAGE_SIZE = 5;

const EMPTY_SALES_STATS = [
  {
    label: "Product Sold",
    value: "0",
    logo: `${DASHBOARD_ICONS_PATH}/product_sold.svg`,
  },
  {
    label: "Today's Revenue",
    value: "0,00 €",
    logo: `${DASHBOARD_ICONS_PATH}/todays_revenue.svg`,
  },
  {
    label: "Weekly Revenue",
    value: "0,00 €",
    logo: `${DASHBOARD_ICONS_PATH}/weekly_revenue.svg`,
  },
  {
    label: "Monthly Revenue",
    value: "0,00 €",
    logo: `${DASHBOARD_ICONS_PATH}/monthly_revenue.svg`,
  },
  {
    label: "Total Revenue",
    value: "0,00 €",
    logo: `${DASHBOARD_ICONS_PATH}/total_revenue.svg`,
  },
];

interface SalesManagementProps {
  role?: "superadmin" | "admin";
}

export default function SalesManagement({
  role = "superadmin",
}: SalesManagementProps) {
  const isSuperadmin = role === "superadmin";
  const [tab, setTab] = useState<SalesTab>("top-products");
  const [salesProducts, setSalesProducts] = useState<SalesProduct[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([]);
  const [statCards, setStatCards] = useState(EMPTY_SALES_STATS);
  const [loadError, setLoadError] = useState("");
  const [period, setPeriod] = useState<OrderPeriod>("now");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const subCategories = useMemo(() => {
    const names = new Set<string>();
    salesProducts.forEach((p) => names.add(p.subCategory));
    return Array.from(names).sort();
  }, [salesProducts]);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await fetchSalesStats(period);
        setStatCards([
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
        ]);
        setLoadError("");
      } catch (error) {
        console.error("Failed to load sales stats", error);
        setStatCards(EMPTY_SALES_STATS);
        setLoadError("Unable to load sales data from server.");
      }
    }
    loadStats();
  }, [period]);

  useEffect(() => {
    fetchBranches()
      .then((branches) => setBranchOptions(branches.map((b) => b.name)))
      .catch(() => setBranchOptions([]));
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await fetchTopProducts({
          period,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          subCategory: subCategoryFilter !== "all" ? subCategoryFilter : undefined,
          search: search.trim() || undefined,
        });
        setSalesProducts(products);
      } catch (error) {
        console.error("Failed to load top products", error);
      }
    }
    loadProducts();
  }, [period, categoryFilter, subCategoryFilter, search]);

  useEffect(() => {
    if (!isSuperadmin) return;
    async function loadBranches() {
      try {
        const branches = await fetchBranchPerformance(period);
        setBranchPerformance(branches);
      } catch (error) {
        console.error("Failed to load branch performance", error);
      }
    }
    loadBranches();
  }, [period, isSuperadmin]);

  const filteredProducts = useMemo(() => {
    if (branchFilter === "all") return salesProducts;
    return salesProducts.filter((p) => p.branch === branchFilter);
  }, [salesProducts, branchFilter]);

  const filteredBranches = useMemo(() => {
    let result = branchPerformance;
    if (branchFilter !== "all") {
      result = result.filter((b) => b.name === branchFilter);
    }
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter(
      (b) =>
        b.name.toLowerCase().includes(q) || b.area.toLowerCase().includes(q)
    );
  }, [search, branchPerformance, branchFilter]);

  const isProductsTab = isSuperadmin ? tab === "top-products" : true;
  const pageSize = isProductsTab ? PRODUCTS_PAGE_SIZE : BRANCH_PAGE_SIZE;
  const totalItems = isProductsTab
    ? filteredProducts.length
    : filteredBranches.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageProducts = filteredProducts.slice(startIndex, startIndex + pageSize);
  const pageBranches = filteredBranches.slice(startIndex, startIndex + pageSize);

  const showingFrom = totalItems === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, totalItems);

  const resetPage = () => setCurrentPage(1);

  return (
    <>
      <DashboardHeader title="Sales management" />

      {loadError ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {loadError}
        </div>
      ) : null}

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
            {branchOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
        </div>
        <Button className="h-10 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]">
          <Download className="size-4" />
          Download CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Filters + Table container */}
      <div className="overflow-hidden rounded-2xl bg-[#F2F2F3] p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex rounded-full bg-white p-1">
            {(
              [
                { key: "now", label: "Now" },
                { key: "weekly", label: "Weekly" },
                { key: "monthly", label: "Monthly" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setPeriod(t.key);
                  resetPage();
                }}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium text-[#00562C] transition-colors",
                  period === t.key ? "bg-[#e8f5ee]" : "hover:bg-[#e8f5ee]/60"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Calendar className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#00562C]" />
            <Input
              type="date"
              defaultValue="2025-04-12"
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
                resetPage();
              }}
              className="h-11 rounded-full border-none bg-white pl-10"
            />
          </div>
        </div>

        {/* Tabs + category filters */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTab("top-products");
                resetPage();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isProductsTab
                  ? "bg-[#00562C] text-white"
                  : "bg-white text-gray-600 hover:text-gray-900"
              )}
            >
              Top Products
            </button>
            {isSuperadmin && (
              <button
                type="button"
                onClick={() => {
                  setTab("branch-performance");
                  resetPage();
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  !isProductsTab
                    ? "bg-[#00562C] text-white"
                    : "bg-white text-gray-600 hover:text-gray-900"
                )}
              >
                Branch Sales Performance
              </button>
            )}
          </div>

          {isProductsTab && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#00562C]" />
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    resetPage();
                  }}
                  className="h-10 min-w-[130px] cursor-pointer appearance-none rounded-full border-none bg-white py-2 pr-9 pl-9 text-sm text-gray-700 outline-none"
                >
                  <option value="all">Category</option>
                  <option value="Food">Food</option>
                  <option value="Drinks">Drinks</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#00562C]" />
                <select
                  value={subCategoryFilter}
                  onChange={(e) => {
                    setSubCategoryFilter(e.target.value);
                    resetPage();
                  }}
                  className="h-10 min-w-[150px] cursor-pointer appearance-none rounded-full border-none bg-white py-2 pr-9 pl-9 text-sm text-gray-700 outline-none"
                >
                  <option value="all">Sub Category</option>
                  {subCategories.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          )}
        </div>

        {isProductsTab ? (
          <div className="overflow-hidden rounded-xl bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#F2F2F3] bg-white text-gray-500">
                    <th className="px-4 py-3 font-medium">Item Name</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Sub Category</th>
                    <th className="px-4 py-3 font-medium">Branch</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {pageProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="bg-white px-4 py-10 text-center text-gray-500"
                      >
                        No sales found for this filter.
                      </td>
                    </tr>
                  ) : (
                    pageProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b-2 border-[#F2F2F3] bg-white hover:bg-gray-50/80"
                      >
                        <td className="max-w-[220px] px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e8f5ee]">
                              <Coffee className="size-4 text-[#00562C]" />
                            </div>
                            <span className="text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {product.category}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {product.subCategory}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {product.branch}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {product.unit}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          € {product.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              showingFrom={showingFrom}
              showingTo={showingTo}
              totalItems={totalItems}
              totalPages={totalPages}
              safePage={safePage}
              onPageChange={setCurrentPage}
              label="Sales"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pageBranches.length === 0 ? (
              <div className="rounded-xl bg-white px-4 py-10 text-center text-gray-500">
                No branch performance found.
              </div>
            ) : (
              pageBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="grid grid-cols-1 items-center gap-3 rounded-xl bg-white px-5 py-4 sm:grid-cols-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#e8f5ee]">
                      <Store className="size-5 text-[#00562C]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {branch.name}
                      </p>
                      <p className="text-sm text-gray-500">{branch.area}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {branch.totalRevenue}
                    </p>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {branch.totalOrders}
                    </p>
                    <p className="text-sm text-gray-500">Total Orders</p>
                  </div>
                </div>
              ))
            )}
            <div className="overflow-hidden rounded-xl bg-white">
              <Pagination
                showingFrom={showingFrom}
                showingTo={showingTo}
                totalItems={totalItems}
                totalPages={totalPages}
                safePage={safePage}
                onPageChange={setCurrentPage}
                label="Branch Sales Performance"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Pagination({
  showingFrom,
  showingTo,
  totalItems,
  totalPages,
  safePage,
  onPageChange,
  label,
}: {
  showingFrom: number;
  showingTo: number;
  totalItems: number;
  totalPages: number;
  safePage: number;
  onPageChange: (page: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#F2F2F3] bg-white px-4 py-3">
      <p className="text-sm text-gray-500">
        Showing {String(showingFrom).padStart(2, "0")}-
        {String(showingTo).padStart(2, "0")} of {totalItems} {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          className="rounded-full p-2 text-gray-500 hover:bg-[#F2F2F3] disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
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
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          className="rounded-full p-2 text-gray-500 hover:bg-[#F2F2F3] disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
