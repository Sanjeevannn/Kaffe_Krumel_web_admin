"use client";

import { Bell, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardHeaderProps {
  title?: string;
}

export default function DashboardHeader({
  title = "Product management",
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const roleLabel =
    user?.role === "superadmin"
      ? "Superadmin"
      : user?.staffRole
        ? `${user.staffRole}${user.branch ? ` · ${user.branch}` : ""}`
        : user?.role === "admin"
          ? "Admin"
          : "Admin";

  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl bg-[#F2F2F3] px-4 py-3 sm:px-6 sm:py-4">
      <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-gray-200">
            <UserRound className="size-4 text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-800">{roleLabel}</span>
        </div>
      </div>
    </header>
  );
}
