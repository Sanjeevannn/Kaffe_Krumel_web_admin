"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DashboardCategory } from "@/types";

const TABS: { key: DashboardCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "food", label: "Food" },
  { key: "drinks", label: "Drinks" },
];

interface DashboardToolbarProps {
  category: DashboardCategory;
  onCategoryChange: (category: DashboardCategory) => void;
}

export default function DashboardToolbar({
  category,
  onCategoryChange,
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-full bg-white p-1 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onCategoryChange(tab.key)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              category === tab.key
                ? "bg-[#e8f5ee] text-[#00562C]"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative min-w-[150px] flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search"
          className="h-11 rounded-full border-none bg-white pl-10 shadow-sm"
        />
      </div>
    </div>
  );
}
