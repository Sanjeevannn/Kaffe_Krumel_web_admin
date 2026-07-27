"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmSaveSubCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function ConfirmSaveSubCategoryDialog({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmSaveSubCategoryDialogProps) {
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
            Please confirm if you want to save the Category of Kaffee Krumel.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-row gap-3 sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            className="h-11 flex-1 rounded-full bg-[#F2F2F3] text-gray-600 hover:bg-gray-200"
            onClick={() => onOpenChange(false)}
          >
            No
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-full bg-[#00562C] text-white hover:bg-[#004522]"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
