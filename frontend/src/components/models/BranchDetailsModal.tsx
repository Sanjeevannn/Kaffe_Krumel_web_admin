"use client";

import type { ReactNode } from "react";
import {
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ActionIcon from "@/components/ui/ActionIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDayHours } from "@/services/branchService";
import type { BranchRecord, BranchStatus } from "@/types";

interface BranchDetailsModalProps {
  open: boolean;
  branch: BranchRecord | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (branch: BranchRecord) => void;
  onDelete: (branchId: number) => void;
  onToggleStatus: (branchId: number, status: BranchStatus) => void;
}

export default function BranchDetailsModal({
  open,
  branch,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleStatus,
}: BranchDetailsModalProps) {
  if (!branch) return null;

  const isActive = branch.status === "Active";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="max-h-[90vh] space-y-5 overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div className="flex flex-wrap items-center gap-3">
              <DialogTitle className="text-xl font-bold text-gray-900">
                {branch.name} ....
              </DialogTitle>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                  isActive ? "bg-green-500" : "bg-red-500"
                )}
              >
                {isActive ? "Active" : "In Active"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() =>
                  onToggleStatus(branch.id, isActive ? "Inactive" : "Active")
                }
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  isActive ? "bg-green-500" : "bg-red-500"
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
                  onEdit(branch);
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
                  onDelete(branch.id);
                }}
                label="Delete branch"
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

          <div>
            <h3 className="mb-3 text-base font-bold text-gray-900">
              Branch Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-[#F2F2F3] p-4 md:grid-cols-3">
              <InfoBlock
                icon={<User className="size-4 text-gray-500" />}
                label="Manager name"
                value={branch.manager || "John Doe"}
              />
              <InfoBlock
                icon={<Store className="size-4 text-gray-500" />}
                label="Branch"
                value={branch.name}
              />
              <InfoBlock
                icon={<FileText className="size-4 text-gray-500" />}
                label="Description"
                value={
                  branch.description ||
                  "Kaffe Krümel is a cozy café offering freshly brewed coffee, handcrafted beverages, delicious pastries, and light meals in a warm and welcoming atmosphere."
                }
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-base font-bold text-gray-900">
              Location Details
            </h3>
            <div className="rounded-xl bg-[#F2F2F3] p-4">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gray-500" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Location</p>
                  <p className="text-sm text-gray-800">
                    {branch.street
                      ? `${branch.street}, ${branch.city || ""}${branch.country ? `, ${branch.country}` : ""}`
                      : branch.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-base font-bold text-gray-900">
                Operating hours
              </h3>
              <div className="space-y-3">
                {(
                  [
                    {
                      label: "Monday - friday",
                      hours: branch.weekdayHours,
                    },
                    { label: "Saturday", hours: branch.saturdayHours },
                    { label: "Sunday", hours: branch.sundayHours },
                  ] as const
                ).map(({ label, hours }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl bg-[#F2F2F3] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {label}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDayHours(hours)}
                      </p>
                    </div>
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#00562C] text-white">
                      <Clock className="size-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-base font-bold text-gray-900">
                Contact Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[#F2F2F3] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Phone number
                    </p>
                    <p className="text-sm text-gray-600">
                      {branch.contactNumber || "+94 7213458564"}
                    </p>
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#00562C] text-white">
                    <Phone className="size-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#F2F2F3] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Mail</p>
                    <p className="text-sm text-gray-600">
                      {branch.email || "example@gmail.com"}
                    </p>
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#00562C] text-white">
                    <Mail className="size-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
        {icon}
        {label}
      </div>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}
