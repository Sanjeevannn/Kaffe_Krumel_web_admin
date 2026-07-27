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
import type {
  CustomizationRecord,
  CustomizationStatus,
  SelectionType,
} from "@/types";

function formatSelectionType(type: SelectionType | "") {
  if (type === "Select") return "Multiple selection";
  if (type === "Scale") return "Scale";
  if (type === "Checkbox") return "Checkbox";
  return "Not set";
}

function formatOptionLabel(name: string, price: string) {
  const displayName = name.trim() || "New option";
  const displayPrice = price.trim() || "0";
  return `${displayName} - € ${displayPrice}`;
}

interface CustomizationDetailsModalProps {
  open: boolean;
  customization: CustomizationRecord | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (item: CustomizationRecord) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, status: CustomizationStatus) => void;
}

export default function CustomizationDetailsModal({
  open,
  customization,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleStatus,
}: CustomizationDetailsModalProps) {
  if (!customization) return null;

  const isActive = customization.status === "Active";

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
                {customization.name}
              </DialogTitle>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                  isActive ? "bg-[#49AE20]" : "bg-[#FF0000]"
                )}
              >
                {isActive ? "Active" : "In -Active"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() =>
                  onToggleStatus(
                    customization.id,
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
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(customization);
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
                  onDelete(customization.id);
                }}
                label="Delete customization"
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

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">Options</p>

            {customization.groups.map((group, index) => (
              <div
                key={group.id}
                className="space-y-3 rounded-2xl bg-[#F2F2F3] p-4"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Group {index + 1}
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#F5A623] px-3 py-1 text-xs font-medium text-white">
                    Title: {group.subtitle || "—"}
                  </span>
                  <span className="rounded-full bg-[#F5A623] px-3 py-1 text-xs font-medium text-white">
                    Type: {formatSelectionType(group.selectionType)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {group.options.length > 0 ? (
                    group.options.map((option) => (
                      <span
                        key={option.id}
                        className="rounded-full bg-[#CBF0CB] px-3 py-1 text-xs font-medium text-[#00562C]"
                      >
                        {formatOptionLabel(option.name, option.price)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">
                      No options added.
                    </span>
                  )}
                </div>
              </div>
            ))}

            {customization.groups.length === 0 && (
              <p className="rounded-2xl bg-[#F2F2F3] p-4 text-sm text-gray-500">
                No groups configured.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
