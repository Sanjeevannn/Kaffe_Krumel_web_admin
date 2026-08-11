"use client";

import { useEffect, useState, type ReactNode } from "react";
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
import { cn } from "@/lib/utils";
import {
  EMPTY_COUPON_FORM,
  formatCouponDate,
  parseCouponDate,
  validateCouponDateRange,
} from "@/services/couponService";
import type {
  CouponDateParts,
  CouponFormData,
  CouponRecord,
} from "@/types";

interface CouponFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  coupon?: CouponRecord | null;
  onOpenChange: (open: boolean) => void;
  onSaveRequest: (data: CouponFormData) => void;
}

export default function CouponFormModal({
  open,
  mode,
  coupon,
  onOpenChange,
  onSaveRequest,
}: CouponFormModalProps) {
  const [form, setForm] = useState<CouponFormData>(EMPTY_COUPON_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (mode === "edit" && coupon) {
      setForm({
        title: coupon.title,
        minOrder: coupon.minOrder.replace(/[^\d.]/g, ""),
        discount: coupon.discount.replace(/[^\d.]/g, ""),
        start: parseCouponDate(coupon.validityFrom),
        end: parseCouponDate(coupon.validityTo),
      });
      return;
    }
    setForm({
      ...EMPTY_COUPON_FORM,
      start: { ...EMPTY_COUPON_FORM.start },
      end: { ...EMPTY_COUPON_FORM.end },
    });
  }, [open, mode, coupon]);

  const updateField = <K extends keyof CouponFormData>(
    key: K,
    value: CouponFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateDate = (
    key: "start" | "end",
    part: keyof CouponDateParts,
    value: string
  ) => {
    const digits = value.replace(/\D/g, "").slice(0, part === "year" ? 4 : 2);
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], [part]: digits },
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!form.minOrder.trim()) {
      setError("Please enter a minimum order amount.");
      return;
    }
    if (!form.discount.trim()) {
      setError("Please enter a discount.");
      return;
    }
    const dateError = validateCouponDateRange(form.start, form.end);
    if (dateError) {
      setError(dateError);
      return;
    }
    setError("");
    onSaveRequest({
      ...form,
      title: form.title.trim(),
      minOrder: form.minOrder.replace(/[^\d.]/g, ""),
      discount: form.discount.replace(/[^\d.]/g, ""),
      start: { ...form.start },
      end: { ...form.end },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] w-[min(92vw,400px)] overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="max-h-[90vh] space-y-4 overflow-y-auto p-5 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {mode === "create" ? "Add Coupon" : "Edit Coupon"}
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

          <Field label="Title">
            <Input
              placeholder="eg; Sandwich"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-white"
            />
          </Field>

          <Field label="Min. Order €">
            <Input
              placeholder="eg; € 30"
              value={form.minOrder}
              onChange={(e) =>
                updateField("minOrder", e.target.value.replace(/[^\d.]/g, ""))
              }
              className="h-11 rounded-xl border border-gray-200 bg-white"
            />
          </Field>

          <Field label="Discount">
            <Input
              placeholder="eg; 45%"
              value={form.discount}
              onChange={(e) =>
                updateField("discount", e.target.value.replace(/[^\d.]/g, ""))
              }
              className="h-11 rounded-xl border border-gray-200 bg-white"
            />
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              Offer validity period
            </p>
            <div className="grid grid-cols-2 gap-3">
              <DateColumn
                label="Start"
                value={form.start}
                onChange={(part, value) => updateDate("start", part, value)}
              />
              <DateColumn
                label="End"
                value={form.end}
                onChange={(part, value) => updateDate("end", part, value)}
              />
            </div>
            {(form.start.day || form.end.day) && (
              <p className="text-xs text-gray-500">
                {formatCouponDate(form.start)} - {formatCouponDate(form.end)}
              </p>
            )}
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-900">{label}</Label>
      {children}
    </div>
  );
}

function DateColumn({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CouponDateParts;
  onChange: (part: keyof CouponDateParts, value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <div className="flex items-center gap-1">
        <DatePart
          placeholder="DD"
          value={value.day}
          maxLength={2}
          onChange={(v) => onChange("day", v)}
        />
        <span className="text-gray-400">/</span>
        <DatePart
          placeholder="MM"
          value={value.month}
          maxLength={2}
          onChange={(v) => onChange("month", v)}
        />
        <span className="text-gray-400">/</span>
        <DatePart
          placeholder="YYYY"
          value={value.year}
          maxLength={4}
          onChange={(v) => onChange("year", v)}
          className="flex-[1.3]"
        />
      </div>
    </div>
  );
}

function DatePart({
  placeholder,
  value,
  onChange,
  maxLength,
  className,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  className?: string;
}) {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 flex-1 rounded-xl border border-gray-200 bg-white px-1 text-center text-sm",
        className
      )}
    />
  );
}
