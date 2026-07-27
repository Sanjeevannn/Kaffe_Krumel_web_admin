"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { LOGO_PATH } from "@/lib/constants";
import type { NavItem } from "@/types";

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
}

export default function DashboardLayout({
  children,
  navItems,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <Sidebar
        navItems={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[#00562C] hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </button>
          <Image
            src={LOGO_PATH}
            alt="Kaffee Krümel"
            width={40}
            height={40}
            className="h-9 w-auto object-contain"
          />
        </div>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-4 lg:gap-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
