"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProductBranchInfo } from "@/types";

interface SelectedBranchesPanelProps {
  branches: ProductBranchInfo[];
  totalCount: number;
}

export default function SelectedBranchesPanel({
  branches,
  totalCount,
}: SelectedBranchesPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((branch) => branch.name.toLowerCase().includes(q));
  }, [branches, search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="h-11 rounded-full border-none bg-[#F2F2F3] pl-9 shadow-none"
        />
      </div>
      <div className="rounded-xl bg-[#e8f5ee] px-4 py-2 text-sm font-medium text-[#00562C]">
        {branches.length} selected of {totalCount} Branch
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-xl bg-[#F2F2F3] px-4 py-6 text-center text-sm text-gray-500">
          No selected branches.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((branch) => (
            <div
              key={branch.id}
              className={cn(
                "rounded-xl bg-[#F2F2F3] px-4 py-3 text-sm font-medium text-gray-800"
              )}
            >
              {branch.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
