"use client";

import { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SelectedBranchesPanel from "@/components/models/SelectedBranchesPanel";
import { cn } from "@/lib/utils";
import { fetchBranches } from "@/services/remoteApi";
import type { ProductRecord, ProductStatus } from "@/types";

interface ProductDetailsModalProps {
  open: boolean;
  product: ProductRecord | null;
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: ProductRecord) => void;
  onDelete?: (productId: number) => void;
  onToggleStatus?: (productId: number, status: ProductStatus) => void;
}

export default function ProductDetailsModal({
  open,
  product,
  readOnly = false,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductDetailsModalProps) {
  const [tab, setTab] = useState<"view" | "branches">("view");
  const [totalBranches, setTotalBranches] = useState(0);

  useEffect(() => {
    if (!open) {
      setTab("view");
      return;
    }
    fetchBranches()
      .then((list) => setTotalBranches(list.length))
      .catch(() => setTotalBranches(product?.branches?.length ?? 0));
  }, [open, product]);

  if (!product) return null;

  const isActive = product.status === "Active";
  const priceDisplay = product.price.includes(" ")
    ? product.price
    : product.price.replace("€", "€ ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90dvh] max-w-lg flex-col gap-0 overflow-hidden rounded-3xl border-none p-0 shadow-xl sm:p-0"
      >
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 pb-8 sm:p-6 sm:pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div className="flex flex-wrap items-center gap-3">
              <DialogTitle className="text-xl font-bold text-gray-900">
                {product.name}
              </DialogTitle>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                  isActive ? "bg-[#49AE20]" : "bg-[#FF0000]"
                )}
              >
                {isActive ? "Active" : "In -Active"}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() =>
                    onToggleStatus?.(
                      product.id,
                      isActive ? "Inactive" : "Active"
                    )
                  }
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    isActive ? "bg-[#49AE20]" : "bg-[#FF0000]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                      isActive ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {!readOnly && (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onEdit?.(product);
                    }}
                    className="h-9 rounded-lg bg-[#00562C] px-4 text-white hover:bg-[#004522]"
                  >
                    Edit
                  </Button>
                  <ActionIcon
                    type="delete"
                    size={18}
                    onClick={() => {
                      onOpenChange(false);
                      onDelete?.(product.id);
                    }}
                    label="Delete product"
                  />
                </>
              )}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-2 text-[#00562C] hover:bg-[#F2F2F3]"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex rounded-full bg-[#F2F2F3] p-1">
            <button
              type="button"
              onClick={() => setTab("view")}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-medium",
                tab === "view"
                  ? "bg-[#07C187] text-white"
                  : "text-gray-600"
              )}
            >
              View
            </button>
            <button
              type="button"
              onClick={() => setTab("branches")}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-medium",
                tab === "branches"
                  ? "bg-[#07C187] text-white"
                  : "text-gray-600"
              )}
            >
              Selected branch
            </button>
          </div>

          {tab === "branches" ? (
            <SelectedBranchesPanel
              branches={product.branches ?? []}
              totalCount={Math.max(
                product.totalBranchCount ?? 0,
                totalBranches,
                product.branches?.length ?? 0
              )}
            />
          ) : (
            <>
          <div className="flex items-center justify-center rounded-2xl bg-[#F2F2F3] px-6 py-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="max-h-48 w-auto object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
            <span className="rounded-full bg-orange-400 px-3 py-1 text-xs font-medium text-white">
              {product.subCategory}
            </span>
            <span className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-semibold text-white">
              {priceDisplay}
            </span>
          </div>

          <div className="rounded-2xl bg-[#F2F2F3] p-4">
            <h4 className="mb-2 text-sm font-bold text-gray-900">Description</h4>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <FileText className="mt-0.5 size-4 shrink-0 text-gray-500" />
              <p>{product.description}</p>
            </div>
          </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
