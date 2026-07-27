"use client";

import { Calendar, FileText, X } from "lucide-react";
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

interface ComboOfferDetailsModalProps {
  open: boolean;
  offer: OfferRecord | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (offer: OfferRecord) => void;
  onToggleStatus: (offerId: number, status: OfferStatus) => void;
  onDelete: (offerId: number) => void;
}

export default function ComboOfferDetailsModal({
  open,
  offer,
  onOpenChange,
  onEdit,
  onToggleStatus,
  onDelete,
}: ComboOfferDetailsModalProps) {
  if (!offer) return null;

  const isActive = offer.status === "Active";
  const priceLabel = offer.offerPrice.includes("€")
    ? offer.offerPrice
    : `€ ${offer.offerPrice}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="max-h-[94vh] space-y-3 overflow-y-auto p-4 sm:p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                className="rounded-lg p-2 text-[#00562C] hover:bg-[#F2F2F3]"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="overflow-hidden rounded-2xl bg-[#F2F2F3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={offer.image}
              alt={offer.name}
              className="h-36 w-full object-cover sm:h-44"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">{offer.name}</h3>
              <span className="rounded-full bg-violet-500 px-3 py-1 text-sm font-semibold text-white">
                For {priceLabel.replace("€", "€ ").replace("  ", " ")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F2F2F3] px-3 py-1 text-xs text-gray-700">
              <Calendar className="size-3.5 text-gray-500" />
              Validity: {offer.validityFrom} - {offer.validityTo}
            </div>
          </div>

          <div className="rounded-2xl bg-[#F2F2F3] p-3">
            <h4 className="mb-1 text-sm font-bold text-gray-900">Description</h4>
            <div className="flex items-start gap-2 text-xs text-gray-700 sm:text-sm">
              <FileText className="mt-0.5 size-4 shrink-0 text-gray-500" />
              <p>{offer.description}</p>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold text-gray-900">Products</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(offer.products ?? []).map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="flex items-center gap-3 rounded-xl bg-[#F2F2F3] p-2.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-12 shrink-0 rounded-lg object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <p className="text-xs font-medium text-[#49AE20]">
                      {product.price}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[#49AE20]">
                    QTY : {product.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
