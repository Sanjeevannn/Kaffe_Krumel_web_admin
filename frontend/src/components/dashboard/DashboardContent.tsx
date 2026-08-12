"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/contexts/AuthContext";
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

function fallbackBranch(user: NonNullable<ReturnType<typeof useAuth>["user"]>): BranchRecord[] {
  if (!user?.branch) return [];
  const emptyHours = {
    openHour: "",
    openMinute: "",
    openPeriod: "AM" as const,
    closeHour: "",
    closeMinute: "",
    closePeriod: "PM" as const,
  };
  return [
    {
      id: user.branchId ?? 0,
      name: user.branch,
      manager: "",
      location: "",
      status: "Active",
      description: "",
      locationName: "",
      locationCode: "",
      street: "",
      city: "",
      country: "",
      latitude: "",
      longitude: "",
      contactNumber: "",
      email: "",
      weekdayHours: emptyHours,
      saturdayHours: emptyHours,
      sundayHours: emptyHours,
    },
  ];
}

export default function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const [category, setCategory] = useState<DashboardCategory>("all");
  const [baseData, setBaseData] = useState<DashboardBaseData | null>(null);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    async function load() {
      try {
        const branchFilter =
          user?.role === "admin" && user.branch ? user.branch : undefined;

        const [ordersResult, productsResult, branchesResult, staffResult] =
          await Promise.allSettled([
            fetchOrders({ period: "all", branch: branchFilter }),
            fetchProducts(),
            fetchBranches(),
            fetchStaffUsers(
              branchFilter ? { branch: branchFilter } : undefined
            ),
          ]);

        if (ordersResult.status === "rejected") {
          throw ordersResult.reason;
        }
        if (productsResult.status === "rejected") {
          throw productsResult.reason;
        }

        const orders = ordersResult.value;
        const products = productsResult.value;
        const branches =
          branchesResult.status === "fulfilled"
            ? branchesResult.value
            : user
              ? fallbackBranch(user)
              : [];
        const staff =
          staffResult.status === "fulfilled" ? staffResult.value : [];

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
  }, [authLoading, user]);

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

  const showLoading = authLoading || loading;

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
          {showLoading
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
