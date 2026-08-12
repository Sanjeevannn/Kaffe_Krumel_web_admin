"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Download,
  GitBranch,
  Mail,
  Phone,
  Star,
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
import {
  fetchCustomerLoyalty,
  type CustomerLoyalty,
} from "@/services/remoteApi";
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
  const [loyalty, setLoyalty] = useState<CustomerLoyalty | null>(null);

  const isClosed = customer?.status === "Account closed";

  useEffect(() => {
    if (!open || !customer || isClosed) {
      setLoyalty(null);
      return;
    }

    let cancelled = false;
    fetchCustomerLoyalty(customer.id)
      .then((data) => {
        if (!cancelled) setLoyalty(data);
      })
      .catch(() => {
        if (!cancelled) {
          setLoyalty({
            cardName: customer.name,
            currentPoints: 0,
            totalRedeemed: 0,
            euroValue: 0,
            memberSince: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, customer, isClosed]);

  if (!customer) return null;

  const memberYear =
    loyalty?.memberSince ||
    customer.accountCreated.split("/")[2] ||
    "";
  const currentPoints = loyalty?.currentPoints ?? 0;
  const totalRedeemed = loyalty?.totalRedeemed ?? 0;
  const euroValue = loyalty?.euroValue ?? 0;
  const cardName = loyalty?.cardName || customer.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90dvh] w-[calc(100%-1.5rem)] !max-w-[980px] flex-col gap-0 overflow-hidden rounded-3xl border-none p-0 shadow-xl sm:p-0"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-5 pb-8 sm:p-7 sm:pb-8">
          <DialogHeader className="flex flex-col items-start justify-between gap-3 space-y-0 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <DialogTitle className="break-words text-xl font-bold text-gray-900 sm:text-2xl">
                {customer.name}
              </DialogTitle>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-medium text-white",
                  isClosed ? "bg-red-500" : "bg-[#22C55E]"
                )}
              >
                {isClosed ? "Account Closed" : "Active"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
              <Button className="h-9 rounded-lg bg-[#00562C] px-3 text-white hover:bg-[#004522]">
                <Download className="size-4" />
                Download CSV
              </Button>
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

          {isClosed && customer.closureReason && (
            <div className="rounded-xl bg-[#FF8383] px-4 py-3 text-center text-sm font-medium text-white">
              Reason: {customer.closureReason}
            </div>
          )}

          <div>
            <h3 className="mb-3 text-base font-bold text-gray-900">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 rounded-xl bg-[#F2F2F3] p-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                icon={<User className="size-4 text-gray-500" />}
                label="Customer name"
                value={customer.name}
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

          {!isClosed ? (
            <div>
              <h3 className="mb-3 text-base font-bold text-gray-900">
                Loyalty points
              </h3>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div
                  className="relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl p-5 text-white"
                  style={{
                    background:
                      "linear-gradient(90deg, #00562C 0%, #07C187 100%)",
                  }}
                >
                  <p className="pointer-events-none absolute right-10 bottom-8 text-5xl font-semibold text-white/20">
                    points
                  </p>
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{cardName}</p>
                      <p className="mt-1 text-sm text-white/80">
                        Member since {memberYear || "—"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="size-4" />
                      Loyalty
                    </span>
                  </div>
                  <div className="relative mt-8">
                    <p className="text-sm text-white/80">Available points</p>
                    <p className="text-3xl font-bold">
                      {currentPoints.toLocaleString("en-US")}
                    </p>
                    <p className="text-sm text-white/80">
                      = {euroValue.toLocaleString("en-US")}€ in rewards
                    </p>
                  </div>
                </div>

                <div className="grid grid-rows-2 gap-3">
                  <div className="relative rounded-2xl bg-[#F2F2F3] p-4">
                    <Star className="absolute top-4 right-4 size-5 text-[#07C187]" />
                    <p className="text-sm text-gray-500">Current points</p>
                    <p className="mt-1 text-2xl font-bold text-[#00562C]">
                      {currentPoints.toLocaleString("en-US")}
                    </p>
                    <p className="text-sm text-gray-700">
                      = {euroValue.toLocaleString("en-US")}€
                    </p>
                  </div>
                  <div className="relative rounded-2xl bg-[#F2F2F3] p-4">
                    <Calendar className="absolute top-4 right-4 size-5 text-gray-400" />
                    <p className="text-sm text-gray-500">Total redeemed</p>
                    <p className="mt-1 text-2xl font-bold text-[#00562C]">
                      {totalRedeemed.toLocaleString("en-US")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Points used for rewards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <h3 className="mb-3 text-base font-bold text-gray-900">
              Branch Information
            </h3>
            <div className="space-y-3">
              {customer.branches.length === 0 ? (
                <div className="rounded-xl bg-[#F2F2F3] px-4 py-5 text-center text-sm text-gray-500">
                  No branch orders yet.
                </div>
              ) : (
                customer.branches.map((branch, index) => (
                  <div
                    key={`${branch.name}-${index}`}
                    className="grid grid-cols-1 items-center gap-3 rounded-xl bg-[#F2F2F3] px-4 py-3 sm:grid-cols-[1.4fr_1fr_1fr]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f5ee]">
                        <GitBranch className="size-5 text-[#00562C]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {branch.name}
                        </p>
                        {branch.area ? (
                          <p className="truncate text-sm text-gray-500">
                            {branch.area}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="sm:text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {branch.totalSpend}
                      </p>
                      <p className="text-sm text-gray-500">Total Spend</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {branch.totalOrders}
                      </p>
                      <p className="text-sm text-gray-500">Total Orders</p>
                    </div>
                  </div>
                ))
              )}
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
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "break-words text-sm font-semibold [overflow-wrap:anywhere]",
          muted ? "text-gray-400" : "text-gray-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}
