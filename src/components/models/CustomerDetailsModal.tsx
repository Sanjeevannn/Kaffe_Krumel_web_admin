"use client";

import {
  Calendar,
  Clock,
  Download,
  Mail,
  Phone,
  Store,
  User,
  VenusAndMars,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types";

interface CustomerDetailsModalProps {
  open: boolean;
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerDetailsModal({
  open,
  customer,
  onOpenChange,
}: CustomerDetailsModalProps) {
  if (!customer) return null;

  const isClosed = customer.status === "Account closed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="max-h-[90vh] space-y-5 overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                John Doe
              </DialogTitle>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                  isClosed ? "bg-red-500" : "bg-green-500"
                )}
              >
                {customer.status === "Account closed"
                  ? "Account Closed"
                  : "Active"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button className="h-9 rounded-lg bg-[#00562C] px-3 text-white hover:bg-[#004522]">
                <Download className="size-4" />
                Download CSV
              </Button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-2 text-gray-700 hover:bg-[#F2F2F3]"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
          </DialogHeader>

          {isClosed && customer.closureReason && (
            <div className="rounded-xl bg-[#FF8383] px-4 py-3 text-center text-sm font-medium text-white">
              Reason: {customer.closureReason}
            </div>
          )}

          <div>
            <h3 className="mb-3 text-base font-bold text-gray-900">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-[#F2F2F3] p-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                icon={<User className="size-4 text-gray-500" />}
                label="Customer name"
                value="John Doe"
              />
              <InfoItem
                icon={<Mail className="size-4 text-gray-500" />}
                label="Email address"
                value={customer.email}
              />
              <InfoItem
                icon={<Phone className="size-4 text-gray-500" />}
                label="Phone number"
                value={customer.phone}
              />
              <InfoItem
                icon={<Clock className="size-4 text-gray-500" />}
                label="Account Created"
                value={customer.accountCreated}
              />
              <InfoItem
                icon={<VenusAndMars className="size-4 text-gray-500" />}
                label="Gender"
                value={customer.gender}
                muted
              />
              <InfoItem
                icon={<Calendar className="size-4 text-gray-500" />}
                label="Date of Birth"
                value={customer.dateOfBirth}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-base font-bold text-gray-900">
              Branch Information
            </h3>
            <div className="space-y-3">
              {customer.branches.map((branch, index) => (
                <div
                  key={`${branch.name}-${index}`}
                  className="grid grid-cols-1 items-center gap-3 rounded-xl bg-[#F2F2F3] px-4 py-3 sm:grid-cols-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#e8f5ee]">
                      <Store className="size-5 text-[#00562C]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{branch.name}</p>
                      <p className="text-sm text-gray-500">{branch.area}</p>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-bold text-gray-900">
                      {branch.totalSpend}
                    </p>
                    <p className="text-sm text-gray-500">Total Spend</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {branch.totalOrders}
                    </p>
                    <p className="text-sm text-gray-500">Total Orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  icon,
  label,
  value,
  muted = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "text-sm font-semibold",
          muted ? "text-gray-400" : "text-gray-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}
