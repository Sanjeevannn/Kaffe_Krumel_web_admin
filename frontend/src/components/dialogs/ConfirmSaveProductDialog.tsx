"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmSaveProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  productName?: string;
  message?: string;
}

export default function ConfirmSaveProductDialog({
  open,
  onOpenChange,
  onConfirm,
  productName = "this product",
  message,
}: ConfirmSaveProductDialogProps) {
  const [saving, setSaving] = useState(false);

  const handleYes = async () => {
    setSaving(true);
    try {
      await onConfirm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[60]"
        className="z-[60] max-w-md rounded-2xl border border-[#00562C] bg-white p-6 text-center shadow-xl sm:p-8"
      >
        <DialogHeader className="items-center gap-2">
          <DialogTitle className="text-xl font-bold text-[#00562C]">
            Confirm Save Action
          </DialogTitle>
          <DialogDescription className="text-center text-base text-gray-600">
            {message ||
              `Please confirm if you want to save the product record of ${productName}.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-row gap-3 sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            className="h-11 flex-1 rounded-full bg-[#F2F2F3] text-gray-600 hover:bg-gray-200"
            onClick={() => onOpenChange(false)}
          >
            No
          </Button>
          <Button
            type="button"
            disabled={saving}
            className="h-11 flex-1 rounded-full bg-[#00562C] text-white hover:bg-[#004522]"
            onClick={() => void handleYes()}
          >
            {saving ? "Saving..." : "Yes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
