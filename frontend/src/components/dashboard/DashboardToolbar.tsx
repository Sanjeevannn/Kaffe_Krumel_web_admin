"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Category = "food" | "drinks";

export default function DashboardToolbar() {
  const [category, setCategory] = useState<Category>("food");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-full bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setCategory("food")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            category === "food"
              ? "bg-[#e8f5ee] text-[#00562C]"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Food
        </button>
        <button
          type="button"
          onClick={() => setCategory("drinks")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            category === "drinks"
              ? "bg-[#e8f5ee] text-[#00562C]"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Drinks
        </button>
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
