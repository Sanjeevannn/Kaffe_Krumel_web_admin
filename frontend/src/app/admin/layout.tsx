"use client";

import type { ReactNode } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout navItems={ADMIN_NAV}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
