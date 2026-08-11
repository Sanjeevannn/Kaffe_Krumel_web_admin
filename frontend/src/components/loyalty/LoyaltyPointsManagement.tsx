"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Star,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LoyaltySettingEditModal from "@/components/models/LoyaltySettingEditModal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  fetchBranches,
  fetchLoyaltyHistory,
  fetchLoyaltyRules,
  fetchLoyaltyStats,
  updateLoyaltyRules,
  type LoyaltyHistoryRow,
  type LoyaltyRules,
  type LoyaltyStats,
} from "@/services/remoteApi";
import type { LoyaltySettingRule, LoyaltyTab } from "@/types";

const PAGE_SIZE = 10;

interface LoyaltyPointsManagementProps {
  variant?: "admin" | "superadmin";
}

const initialsFrom = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

function rulesToSettings(rules: LoyaltyRules): LoyaltySettingRule[] {
  return [
    {
      id: "maxRedeemPerOrder",
      section: "general",
      sectionTitle: "General Setting",
      label: "Minimum points needed for redemption",
      value: String(rules.maxRedeemPerOrder),
    },
    {
      id: "pointValueEuro",
      section: "general",
      sectionTitle: "General Setting",
      label: "Points per euro spent",
      value: String(rules.pointValueEuro),
    },
  ];
}

export default function LoyaltyPointsManagement({
  variant = "superadmin",
}: LoyaltyPointsManagementProps) {
  const isSuperadmin = variant === "superadmin";
  const canEdit = isSuperadmin;

  const [tab, setTab] = useState<LoyaltyTab>("history");
  const [history, setHistory] = useState<LoyaltyHistoryRow[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [stats, setStats] = useState<LoyaltyStats>({
    totalIssued: 0,
    totalRedeemed: 0,
    activePoints: 0,
  });
  const [settings, setSettings] = useState<LoyaltySettingRule[]>([]);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [editOpen, setEditOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LoyaltySettingRule | null>(
    null
  );

  const resetPage = () => setCurrentPage(1);

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
    fetchLoyaltyRules()
      .then((rules) => setSettings(rulesToSettings(rules)))
      .catch(() => setSettings([]));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const branch = isSuperadmin && branchFilter !== "all" ? branchFilter : undefined;
        const [historyPage, loyaltyStats] = await Promise.all([
          fetchLoyaltyHistory({
            branch,
            search: search.trim() || undefined,
            page: currentPage,
            limit: PAGE_SIZE,
          }),
          fetchLoyaltyStats({ branch }),
        ]);
        setHistory(historyPage.items);
        setHistoryTotal(historyPage.total);
        setStats(loyaltyStats);
      } catch (error) {
        console.error("Failed to load loyalty points data", error);
      }
    }
    load();
  }, [isSuperadmin, branchFilter, search, currentPage]);

  const totalPages = Math.max(1, Math.ceil(historyTotal / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const showingFrom = historyTotal === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, historyTotal);

  const pageNumbers = useMemo(
    () =>
      Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
        if (totalPages <= 3) return i + 1;
        if (safePage <= 2) return i + 1;
        if (safePage >= totalPages - 1) return totalPages - 2 + i;
        return safePage - 1 + i;
      }),
    [totalPages, safePage]
  );

  const openEdit = (rule: LoyaltySettingRule) => {
    setEditingRule(rule);
    setEditOpen(true);
  };

  const handleSaveSetting = async (ruleId: string, value: string) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    try {
      const updated = await updateLoyaltyRules({ [ruleId]: numeric });
      setSettings(rulesToSettings(updated));
    } catch (error) {
      console.error("Failed to update loyalty rule", error);
    }
  };

  return (
    <>
      <DashboardHeader title="Loyalty Points management" />

      <div className="overflow-hidden rounded-2xl bg-[#F2F2F3] p-3 sm:p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-full bg-white p-1">
            <button
              type="button"
              onClick={() => {
                setTab("history");
                resetPage();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === "history"
                  ? "bg-[#CBF0CB] text-[#00562C]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Points history
            </button>
            <button
              type="button"
              onClick={() => setTab("settings")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === "settings"
                  ? "bg-[#CBF0CB] text-[#00562C]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Settings
            </button>
          </div>

          {tab === "history" && isSuperadmin ? (
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
              <StatCard label="Total points issued" value={String(stats.totalIssued)} />
              <StatCard
                label="Total points redeemed"
                value={String(stats.totalRedeemed)}
                valueClassName="text-[#FF0000]"
              />
              <StatCard
                label="Active points"
                value={String(stats.activePoints)}
                valueClassName="text-[#49AE20]"
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
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#F2F2F3] text-gray-500">
                      <th className="px-4 py-3 font-medium">Customer name</th>
                      <th className="px-4 py-3 font-medium">Order Id</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      {isSuperadmin ? (
                        <th className="px-4 py-3 font-medium">Branch</th>
                      ) : null}
                      <th className="px-4 py-3 font-medium">Points</th>
                      <th className="px-4 py-3 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td
                          colSpan={isSuperadmin ? 6 : 5}
                          className="px-4 py-10 text-center text-gray-500"
                        >
                          No loyalty activity found.
                        </td>
                      </tr>
                    ) : (
                      history.map((row, index) => (
                        <tr
                          key={row.id}
                          className={cn(
                            "border-b border-[#F2F2F3] last:border-none",
                            index % 2 === 1 && "bg-[#FAFAFA]"
                          )}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#CBF0CB] text-xs font-semibold text-[#00562C]">
                                {initialsFrom(row.customerName || "?")}
                              </span>
                              <span className="font-medium text-gray-900">
                                {row.customerName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{row.orderId}</td>
                          <td className="px-4 py-3 text-gray-700">
                            {new Date(row.createdAt).toLocaleDateString("en-GB")}
                          </td>
                          {isSuperadmin ? (
                            <td className="px-4 py-3 text-gray-700">{row.branch}</td>
                          ) : null}
                          <td
                            className={cn(
                              "px-4 py-3 font-semibold",
                              row.points >= 0
                                ? "text-[#49AE20]"
                                : "text-[#FF0000]"
                            )}
                          >
                            {row.points >= 0
                              ? `+ ${row.points}`
                              : `- ${Math.abs(row.points)}`}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {row.orderAmount != null ? `€ ${row.orderAmount.toFixed(2)}` : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <p className="text-sm text-gray-500">
                Showing {String(showingFrom).padStart(2, "0")}-
                {String(showingTo).padStart(2, "0")} of{" "}
                {historyTotal} Points history
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
          </>
        ) : (
          <div className="grid max-w-2xl grid-cols-1 gap-4">
            <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-gray-900">
                General Settings
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#F2F2F3] text-gray-500">
                      <th className="py-2 pr-3 font-medium">Rule</th>
                      <th className="py-2 pr-3 font-medium">Value</th>
                      {canEdit ? (
                        <th className="py-2 font-medium">Action</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((rule) => (
                      <tr
                        key={rule.id}
                        className="border-b border-[#F2F2F3] last:border-none"
                      >
                        <td className="py-3 pr-3 text-gray-800">
                          {rule.label}
                        </td>
                        <td className="py-3 pr-3 font-semibold text-gray-900">
                          {rule.value}
                        </td>
                        {canEdit ? (
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() => openEdit(rule)}
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-[#00562C]/20 bg-[#E8F7EA] text-[#00562C] hover:bg-[#CBF0CB]"
                              aria-label={`Edit ${rule.label}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src="/edit.svg"
                                alt=""
                                className="size-3.5"
                              />
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {canEdit ? (
        <LoyaltySettingEditModal
          open={editOpen}
          rule={editingRule}
          onOpenChange={setEditOpen}
          onSave={handleSaveSetting}
        />
      ) : null}
    </>
  );
}

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-[#FFF4D6] text-[#E6A800]">
        <Star className="size-4 fill-current" />
      </div>
      <p className={cn("text-lg font-bold text-gray-900", valueClassName)}>
        {value}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
