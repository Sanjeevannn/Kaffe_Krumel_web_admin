"use client";

import { FileText, X } from "lucide-react";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { OfferRecord, OfferStatus } from "@/types";

interface SingleOfferDetailsModalProps {
  open: boolean;
  offer: OfferRecord | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (offer: OfferRecord) => void;
  onToggleStatus: (offerId: number, status: OfferStatus) => void;
  onDelete: (offerId: number) => void;
}

export default function SingleOfferDetailsModal({
  open,
  offer,
  onOpenChange,
  onEdit,
  onToggleStatus,
  onDelete,
}: SingleOfferDetailsModalProps) {
  if (!offer) return null;

  const isActive = offer.status === "Active";

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
                {offer.name}
              </DialogTitle>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                  isActive ? "bg-[#49AE20]" : "bg-[#FF0000]"
                )}
              >
                {isActive ? "Active" : "In Active"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() =>
                  onToggleStatus(offer.id, isActive ? "Inactive" : "Active")
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
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onEdit?.(offer);
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
                  onDelete(offer.id);
                }}
                label="Delete offer"
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg border border-[#00562C]/30 p-2 text-[#00562C] hover:bg-[#F2F2F3]"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex items-center justify-center rounded-2xl bg-[#F2F2F3] px-6 py-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={offer.image}
              alt={offer.name}
              className="max-h-48 w-auto object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{offer.name}</h3>
            <span className="rounded-full bg-orange-400 px-3 py-1 text-xs font-medium text-white">
              {offer.category}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-semibold text-white">
              {offer.offerPrice.replace("€", "€ ").replace("  ", " ")}
              {offer.originalPrice && (
                <span className="text-xs font-normal line-through opacity-80">
                  {offer.originalPrice.replace("€", "€ ")}
                </span>
              )}
            </span>
          </div>

          <div className="rounded-2xl bg-[#F2F2F3] p-4">
            <h4 className="mb-2 text-sm font-bold text-gray-900">Description</h4>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <FileText className="mt-0.5 size-4 shrink-0 text-gray-500" />
              <p>{offer.description}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
