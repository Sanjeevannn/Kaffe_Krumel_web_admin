"use client";

import { X } from "lucide-react";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  couponStatusClass,
  couponStatusLabel,
  formatDiscountLabel,
  formatEuro,
} from "@/services/couponService";
import type { CouponRecord, CouponStatus } from "@/types";

interface CouponDetailsModalProps {
  open: boolean;
  coupon: CouponRecord | null;
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (coupon: CouponRecord) => void;
  onToggleStatus?: (couponId: number, status: CouponStatus) => void;
  onDelete?: (couponId: number) => void;
}

export default function CouponDetailsModal({
  open,
  coupon,
  readOnly = false,
  onOpenChange,
  onEdit,
  onToggleStatus,
  onDelete,
}: CouponDetailsModalProps) {
  if (!coupon) return null;

  const isActive = coupon.status === "Active";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-lg overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="max-h-[90vh] space-y-4 overflow-y-auto p-4 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div className="flex flex-wrap items-center gap-3">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Coupon
              </DialogTitle>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                  couponStatusClass(coupon.status)
                )}
              >
                {couponStatusLabel(coupon.status)}
              </span>
              {!readOnly && onToggleStatus && coupon.status !== "Expired" ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() =>
                    onToggleStatus(
                      coupon.id,
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
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {!readOnly ? (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onEdit?.(coupon);
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
                      onDelete?.(coupon.id);
                    }}
                    label="Delete coupon"
                  />
                </>
              ) : null}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-2 text-[#00562C] hover:bg-[#F2F2F3]"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="rounded-2xl border border-dashed border-[#00562C] bg-[#CBF0CB] px-6 py-8 text-center">
            <p className="text-3xl font-bold text-[#00562C]">
              {formatDiscountLabel(coupon.discount)}
            </p>
            <p className="mt-2 text-sm font-medium text-gray-800">
              Min order {formatEuro(coupon.minOrder)}
            </p>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex rounded-full bg-[#00562C] px-5 py-2 text-sm font-semibold text-white">
                {coupon.code}
              </span>
            </div>
            <p className="mt-4 text-xs text-gray-700">
              Validity: {coupon.validityFrom} - {coupon.validityTo}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
