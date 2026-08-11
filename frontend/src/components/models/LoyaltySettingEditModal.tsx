"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LoyaltySettingRule } from "@/types";

interface LoyaltySettingEditModalProps {
  open: boolean;
  rule: LoyaltySettingRule | null;
  onOpenChange: (open: boolean) => void;
  onSave: (ruleId: string, value: string) => void;
}

export default function LoyaltySettingEditModal({
  open,
  rule,
  onOpenChange,
  onSave,
}: LoyaltySettingEditModalProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !rule) return;
    setValue(rule.value);
    setError("");
  }, [open, rule]);

  if (!rule) return null;

  const handleSave = () => {
    if (!value.trim()) {
      setError("Please enter a value.");
      return;
    }
    setError("");
    onSave(rule.id, value.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(92vw,380px)] overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="space-y-5 p-5 sm:p-6">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {rule.sectionTitle}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-8 items-center justify-center rounded-full border border-[#00562C]/30 text-[#00562C] hover:bg-[#F2F2F3]"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </DialogHeader>

          <p className="text-sm font-medium text-gray-900">{rule.label}</p>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-gray-900">Value</Label>
            <Input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              className="h-11 rounded-xl border-none bg-[#F2F2F3] text-[#00562C]"
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <Button
            type="button"
            onClick={handleSave}
            className="h-12 w-full rounded-full bg-[#00562C] text-base font-semibold text-white hover:bg-[#004522]"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
