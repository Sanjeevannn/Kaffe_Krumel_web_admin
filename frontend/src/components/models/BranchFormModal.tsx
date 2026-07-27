"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BRANCH_COUNTRIES, EMPTY_BRANCH_FORM } from "@/services/branchService";
import type { AmPm, BranchFormData, BranchRecord, DayHours } from "@/types";

interface BranchFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  branch?: BranchRecord | null;
  onOpenChange: (open: boolean) => void;
  onSaveRequest: (data: BranchFormData) => void;
}

type HoursKey = "weekdayHours" | "saturdayHours" | "sundayHours";

const HOUR_SECTIONS: { key: HoursKey; label: string }[] = [
  { key: "weekdayHours", label: "Monday to Friday" },
  { key: "saturdayHours", label: "Saturday" },
  { key: "sundayHours", label: "Sunday" },
];

export default function BranchFormModal({
  open,
  mode,
  branch,
  onOpenChange,
  onSaveRequest,
}: BranchFormModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BranchFormData>(EMPTY_BRANCH_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError("");
    if (mode === "edit" && branch) {
      setForm({
        name: branch.name,
        manager: branch.manager,
        description: branch.description,
        locationName: branch.locationName,
        locationCode: branch.locationCode,
        street: branch.street,
        city: branch.city,
        country: branch.country,
        latitude: branch.latitude,
        longitude: branch.longitude,
        weekdayHours: { ...branch.weekdayHours },
        saturdayHours: { ...branch.saturdayHours },
        sundayHours: { ...branch.sundayHours },
        contactNumber: branch.contactNumber,
        email: branch.email,
      });
    } else {
      setForm({
        ...EMPTY_BRANCH_FORM,
        weekdayHours: { ...EMPTY_BRANCH_FORM.weekdayHours },
        saturdayHours: { ...EMPTY_BRANCH_FORM.saturdayHours },
        sundayHours: { ...EMPTY_BRANCH_FORM.sundayHours },
      });
    }
  }, [open, mode, branch]);

  const updateField = <K extends keyof BranchFormData>(
    key: K,
    value: BranchFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateHours = (
    section: HoursKey,
    field: keyof DayHours,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim() || !form.manager.trim()) {
        setError("Please fill Branch name and Branch Manager.");
        return false;
      }
    }
    if (step === 2) {
      if (
        !form.locationName.trim() ||
        !form.street.trim() ||
        !form.city.trim() ||
        !form.country
      ) {
        setError("Please fill required location details.");
        return false;
      }
    }
    if (step === 4) {
      if (!form.contactNumber.trim() || !form.email.trim()) {
        setError("Please fill Contact number and Email.");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }
    onSaveRequest(form);
  };

  const progressWidth = `${(step / 4) * 100}%`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[96vh] max-w-xl overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="max-h-[96vh] space-y-2.5 overflow-y-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {mode === "create" ? "Add Branch" : "Edit Branch"}
              </DialogTitle>
              <p className="mt-0.5 text-xs text-gray-400">
                Step {String(step).padStart(2, "0")} to 04
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-8 items-center justify-center rounded-full bg-[#F2F2F3] text-[#00562C]"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </DialogHeader>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2F2F3]">
            <div
              className="h-full rounded-full bg-[#00562C] transition-all"
              style={{ width: progressWidth }}
            />
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                1. Branch Basic information
              </h3>
              <Field label="Branch name">
                <Input
                  placeholder="eg; Branch1"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-9 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
                />
              </Field>
              <Field label="Branch Manager">
                <Input
                  placeholder="eg; John Doe"
                  value={form.manager}
                  onChange={(e) => updateField("manager", e.target.value)}
                  className="h-9 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
                />
              </Field>
              <Field label="Description">
                <textarea
                  placeholder="Type here......"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-2xl bg-[#F2F2F3] px-4 py-3 text-sm outline-none"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-gray-900">
                2. Location Details
              </h3>
              <Field label="Location name">
                <Input
                  placeholder="eg; Main Warehouse"
                  value={form.locationName}
                  onChange={(e) => updateField("locationName", e.target.value)}
                  className="h-9 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
                />
              </Field>
              <Field label="Location Code">
                <Input
                  placeholder="eg; DE-BER-WH-001"
                  value={form.locationCode}
                  onChange={(e) => updateField("locationCode", e.target.value)}
                  className="h-9 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
                />
              </Field>
              <Field label="Street">
                <Input
                  placeholder="eg; Friedrichstraße 120"
                  value={form.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  className="h-9 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
                />
              </Field>
              <Field label="City">
                <Input
                  placeholder="eg; Berlin"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="h-9 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
                />
              </Field>
              <Field label="Country">
                <div className="relative">
                  <select
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="h-9 w-full appearance-none rounded-full bg-[#F2F2F3] px-4 pr-10 text-sm outline-none"
                  >
                    <option value="">Select</option>
                    {BRANCH_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-gray-500" />
                </div>
              </Field>
              <Field label="Latitude">
                <Input
                  placeholder="eg; 79.8612"
                  value={form.latitude}
                  onChange={(e) => updateField("latitude", e.target.value)}
                  className="h-9 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
                />
              </Field>
              <Field label="Longitude">
                <Input
                  placeholder="eg; 6.9271"
                  value={form.longitude}
                  onChange={(e) => updateField("longitude", e.target.value)}
                  className="h-9 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-gray-900">
                3. Operating Hours
              </h3>
              {HOUR_SECTIONS.map(({ key, label }) => (
                <DayHoursSection
                  key={key}
                  label={label}
                  hours={form[key]}
                  onChange={(field, value) => updateHours(key, field, value)}
                />
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                4. Contact Details
              </h3>
              <Field label="Contact number">
                <Input
                  placeholder="1234 5678 9123"
                  value={form.contactNumber}
                  onChange={(e) => updateField("contactNumber", e.target.value)}
                  className="h-9 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
                />
              </Field>
              <Field label="Email Address">
                <Input
                  type="email"
                  placeholder="example@gmial.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="h-9 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
                />
              </Field>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setError("");
                  setStep((s) => s - 1);
                }}
                className="h-10 flex-1 rounded-full bg-[#F2F2F3] text-gray-600 hover:bg-gray-200"
              >
                Previous
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNext}
              className="h-10 flex-1 rounded-full bg-[#00562C] text-white hover:bg-[#004522]"
            >
              {step === 4 ? "Save" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DayHoursSection({
  label,
  hours,
  onChange,
}: {
  label: string;
  hours: DayHours;
  onChange: (field: keyof DayHours, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TimeGroup
          label="Open"
          hour={hours.openHour}
          minute={hours.openMinute}
          period={hours.openPeriod}
          onHourChange={(v) => onChange("openHour", v)}
          onMinuteChange={(v) => onChange("openMinute", v)}
          onPeriodChange={(v) => onChange("openPeriod", v)}
        />
        <TimeGroup
          label="Close"
          hour={hours.closeHour}
          minute={hours.closeMinute}
          period={hours.closePeriod}
          onHourChange={(v) => onChange("closeHour", v)}
          onMinuteChange={(v) => onChange("closeMinute", v)}
          onPeriodChange={(v) => onChange("closePeriod", v)}
        />
      </div>
    </div>
  );
}

function TimeGroup({
  label,
  hour,
  minute,
  period,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
}: {
  label: string;
  hour: string;
  minute: string;
  period: AmPm;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onPeriodChange: (value: AmPm) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-900">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          value={hour}
          onChange={(e) => onHourChange(sanitizeTimePart(e.target.value, 12))}
          maxLength={2}
          className="h-11 w-14 rounded-xl border-none bg-[#F2F2F3] px-2 text-center shadow-none"
          aria-label={`${label} hour`}
        />
        <span className="text-sm font-semibold text-gray-700">:</span>
        <Input
          value={minute}
          onChange={(e) => onMinuteChange(sanitizeTimePart(e.target.value, 59))}
          maxLength={2}
          className="h-11 w-14 rounded-xl border-none bg-[#F2F2F3] px-2 text-center shadow-none"
          aria-label={`${label} minute`}
        />
        <div className="relative">
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as AmPm)}
            className="h-11 appearance-none rounded-xl bg-[#F2F2F3] px-3 pr-8 text-sm outline-none"
            aria-label={`${label} period`}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-gray-500" />
        </div>
      </div>
    </div>
  );
}

function sanitizeTimePart(value: string, max: number) {
  const digits = value.replace(/\D/g, "").slice(0, 2);
  if (!digits) return "";
  const num = Math.min(Number(digits), max);
  return String(num).padStart(digits.length === 1 ? 1 : 2, "0");
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-semibold text-gray-900">{label}</Label>
      {children}
    </div>
  );
}
