"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteBranchDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteBranchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[60]"
        className="z-[60] max-w-md rounded-2xl border border-red-400 bg-white p-6 text-center shadow-xl sm:p-8"
      >
        <DialogHeader className="items-center gap-3">
          <Image src="/delete.svg" alt="Delete" width={40} height={40} />
          <DialogTitle className="text-xl font-bold text-red-500">
            Confirm Branch Deletion
          </DialogTitle>
          <DialogDescription className="text-center text-base text-gray-600">
            Deleting this branch will permanently remove all associated details.
            Do you want to continue?
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
            className="h-11 flex-1 rounded-full bg-red-500 text-white hover:bg-red-600"
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
