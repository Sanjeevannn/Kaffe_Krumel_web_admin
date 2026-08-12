"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import StatCard from "@/components/dashboard/StatCard";
import { buildDashboardStats } from "@/lib/dashboardStats";
import {
  fetchBranches,
  fetchOrders,
  fetchProducts,
  fetchStaffUsers,
} from "@/services/remoteApi";
import type {
  BranchRecord,
  DashboardCategory,
  DashboardStat,
  Order,
  ProductRecord,
  StaffUser,
} from "@/types";

type DashboardBaseData = {
  orders: Order[];
  products: ProductRecord[];
  branches: BranchRecord[];
  staff: StaffUser[];
};

export default function DashboardContent() {
  const [category, setCategory] = useState<DashboardCategory>("all");
  const [baseData, setBaseData] = useState<DashboardBaseData | null>(null);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    async function load() {
      try {
        const [orders, products, branches, staff] = await Promise.all([
          fetchOrders({ period: "all" }),
          fetchProducts(),
          fetchBranches(),
          fetchStaffUsers(),
        ]);

        if (cancelled) return;

        const nextBaseData = { orders, products, branches, staff };
        setBaseData(nextBaseData);
        setStats(
          buildDashboardStats(orders, products, branches, staff, category)
        );
        setError("");
      } catch {
        if (cancelled) return;
        setBaseData(null);
        setStats([]);
        setError("Unable to load dashboard stats. Please check your connection.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!baseData) return;
    setStats(
      buildDashboardStats(
        baseData.orders,
        baseData.products,
        baseData.branches,
        baseData.staff,
        category
      )
    );
  }, [category, baseData]);

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <DashboardToolbar
        category={category}
        onCategoryChange={setCategory}
      />
      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
          {loading
            ? Array.from({ length: Math.max(0, 10 - stats.length) }).map(
                (_, index) => (
                  <div
                    key={`loading-${index}`}
                    className="h-[120px] animate-pulse rounded-2xl bg-[#F2F2F3]"
                  />
                )
              )
            : null}
        </div>
      )}
    </>
  );
}
