"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CupSoda,
  Settings2,
  BadgePercent,
  ChartLine,
  ClipboardList,
  Store,
  Users,
  UserRound,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LOGO_PATH } from "@/lib/constants";
import type { NavIcon, NavItem } from "@/types";

const iconMap: Record<NavIcon, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "cup-soda": CupSoda,
  "settings-2": Settings2,
  "badge-percent": BadgePercent,
  "chart-line": ChartLine,
  "clipboard-list": ClipboardList,
  store: Store,
  users: Users,
  "user-round": UserRound,
};

interface SidebarProps {
  navItems: NavItem[];
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  navItems,
  open = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-[220px] shrink-0 flex-col overflow-y-auto rounded-r-[28px] bg-[#00562C] px-4 py-6 text-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-lg p-1.5 text-white/80 hover:bg-white/10 lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>

      <div className="mb-8 flex justify-center">
        <Image
          src={LOGO_PATH}
          alt="Kaffee Krümel"
          width={120}
          height={120}
          className="h-20 w-auto object-contain lg:h-24"
          priority
        />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-white/10" : "hover:bg-white/10"
              )}
            >
              {isActive && (
                <span className="absolute top-1/2 -left-4 h-9 w-1.5 -translate-y-1/2 rounded-r-full bg-white" />
              )}
              <Icon className="size-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <span className="size-2 rounded-full bg-white" />}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-white/10"
      >
        <LogOut className="size-5" />
        Log out
      </button>
      </aside>
    </>
  );
}
