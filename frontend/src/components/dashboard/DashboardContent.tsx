"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import StatCard from "@/components/dashboard/StatCard";
import { fetchDashboardStats } from "@/services/remoteApi";
import type { DashboardStat } from "@/types";

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats()
      .then((data) => {
        setStats(data);
        setError("");
      })
      .catch(() => {
        setStats([]);
        setError("Unable to load dashboard stats. Please check your connection.");
      });
  }, []);

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <DashboardToolbar />
      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}
    </>
  );
}
