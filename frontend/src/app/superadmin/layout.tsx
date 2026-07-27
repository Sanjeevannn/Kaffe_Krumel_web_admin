"use client";

import type { ReactNode } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { SUPERADMIN_NAV } from "@/lib/navigation";

export default function SuperadminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRole="superadmin">
      <DashboardLayout navItems={SUPERADMIN_NAV}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
