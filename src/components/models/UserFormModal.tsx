"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { USER_BRANCHES } from "@/services/userService";
import type { StaffRole, StaffUser, StaffUserFormData } from "@/types";

const EMPTY_FORM: StaffUserFormData = {
  role: "",
  branch: "",
  manager: "",
  username: "",
  password: "",
  confirmPassword: "",
};

interface UserFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  user?: StaffUser | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StaffUserFormData) => void;
}

export default function UserFormModal({
  open,
  mode,
  user,
  onOpenChange,
  onSubmit,
}: UserFormModalProps) {
  const [form, setForm] = useState<StaffUserFormData>(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && user) {
      setForm({
        role: user.role,
        branch: user.branch,
        manager: user.manager,
        username: user.username,
        password: user.password ?? "",
        confirmPassword: user.password ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError("");
  }, [open, mode, user]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.role || !form.branch || !form.manager.trim() || !form.username.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    if (!form.password || form.password !== form.confirmPassword) {
      setError("Password and Confirm Password must match.");
      return;
    }
    setError("");
    onSubmit(form);
  };

  const updateField = <K extends keyof StaffUserFormData>(
    key: K,
    value: StaffUserFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl rounded-3xl border-none p-5 shadow-xl"
      >
        <DialogHeader className="mb-1 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-bold text-gray-900">
            {mode === "create" ? "Create Users" : "Edit Users"}
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-8 items-center justify-center rounded-lg bg-[#F2F2F3] text-[#00562C]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <Field label="Role">
            <div className="relative">
              <select
                value={form.role}
                onChange={(e) =>
                  updateField("role", e.target.value as StaffRole | "")
                }
                className="h-10 w-full appearance-none rounded-full bg-[#F2F2F3] px-4 pr-10 text-sm outline-none"
              >
                <option value="">Select</option>
                <option value="Admin">Admin</option>
                <option value="Cashier">Cashier</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-gray-500" />
            </div>
          </Field>

          <Field label="Branch">
            <div className="relative">
              <select
                value={form.branch}
                onChange={(e) => updateField("branch", e.target.value)}
                className="h-10 w-full appearance-none rounded-full bg-[#F2F2F3] px-4 pr-10 text-sm outline-none"
              >
                <option value="">Select</option>
                {USER_BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-gray-500" />
            </div>
          </Field>

          <Field label="Branch Manager">
            <Input
              placeholder="eg; John Doe"
              value={form.manager}
              onChange={(e) => updateField("manager", e.target.value)}
              className="h-10 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
            />
          </Field>

          <Field label="User name">
            <Input
              placeholder="eg; Friedrichstraße 120"
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
              className="h-10 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              placeholder="**********"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="h-10 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
            />
          </Field>

          <Field label="Confirm Password">
            <Input
              type="password"
              placeholder="**********"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              className="h-10 rounded-full border-none bg-[#F2F2F3] px-4 shadow-none"
            />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="mt-1 h-11 w-full rounded-full bg-[#00562C] text-base font-semibold text-white hover:bg-[#004522]"
          >
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-900">{label}</Label>
      {children}
    </div>
  );
}
