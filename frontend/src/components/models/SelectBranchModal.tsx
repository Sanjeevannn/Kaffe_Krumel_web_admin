"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { BranchRecord } from "@/types";

interface SelectBranchModalProps {
  open: boolean;
  branches: BranchRecord[];
  selectedIds: number[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (branchIds: number[]) => void;
}

export default function SelectBranchModal({
  open,
  branches,
  selectedIds,
  onOpenChange,
  onConfirm,
}: SelectBranchModalProps) {
  const [search, setSearch] = useState("");
  const [draftIds, setDraftIds] = useState<number[]>(selectedIds);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setDraftIds(selectedIds);
  }, [open, selectedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((branch) => branch.name.toLowerCase().includes(q));
  }, [branches, search]);

  const toggle = (id: number) => {
    setDraftIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[70]"
        className="z-[70] flex max-h-[90dvh] w-[calc(100%-1.5rem)] !max-w-[720px] flex-col gap-0 overflow-hidden rounded-3xl border-none p-0 shadow-xl sm:p-0"
      >
        <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
          <DialogHeader className="mb-4 flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Select branch
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1 text-[#00562C] hover:bg-[#F2F2F3]"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </DialogHeader>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-10 rounded-full border-none bg-[#F2F2F3] pl-9 shadow-none"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraftIds(branches.map((branch) => branch.id))}
              className="h-10 rounded-full border-gray-200 bg-white px-4 text-sm text-gray-800"
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraftIds([])}
              className="h-10 rounded-full border-gray-200 bg-white px-4 text-sm text-gray-800"
            >
              Clear all
            </Button>
          </div>

          <div className="mb-3 rounded-xl bg-[#e8f5ee] px-4 py-2 text-sm font-medium text-[#00562C]">
            {draftIds.length} selected of {branches.length} Branch
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((branch) => {
                const checked = draftIds.includes(branch.id);
                return (
                  <label
                    key={branch.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(branch.id)}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded border",
                        checked
                          ? "border-[#00562C] bg-[#00562C] text-white"
                          : "border-gray-300 bg-white"
                      )}
                    >
                      {checked ? (
                        <svg viewBox="0 0 16 16" className="size-3.5 fill-none stroke-white stroke-[2.5]">
                          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                        </svg>
                      ) : null}
                    </span>
                    <span className="truncate">{branch.name}</span>
                  </label>
                );
              })}
            </div>
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No branches found.
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            onClick={() => {
              onConfirm(draftIds);
              onOpenChange(false);
            }}
            className="mt-5 h-11 w-full rounded-xl bg-[#00562C] text-white hover:bg-[#004522]"
          >
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
