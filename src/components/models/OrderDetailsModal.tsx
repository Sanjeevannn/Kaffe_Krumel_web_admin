"use client";

import {
  Calendar,
  Check,
  Clock,
  Download,
  Mail,
  Store,
  User,
  X,
} from "lucide-react";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STEPS: { key: OrderStatus | "Ordered"; label: string }[] = [
  { key: "Pending", label: "Ordered" },
  { key: "In-Progress", label: "In-Progress" },
  { key: "Ready", label: "Ready" },
  { key: "Completed", label: "Completed" },
];

function getCompletedSteps(status: OrderStatus): number {
  switch (status) {
    case "Pending":
      return 1;
    case "In-Progress":
      return 2;
    case "Ready":
      return 3;
    case "Completed":
      return 4;
    default:
      return 1;
  }
}

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onDelete: (orderId: string) => void;
  onAdvanceStatus: (orderId: string) => void;
}

export default function OrderDetailsModal({
  open,
  onOpenChange,
  order,
  onDelete,
  onAdvanceStatus,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const completedCount = getCompletedSteps(order.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl overflow-hidden rounded-2xl border-none p-0 shadow-xl"
      >
        <div className="grid max-h-[90vh] gap-4 overflow-y-auto p-4 sm:p-6 [scrollbar-gutter:stable]">
        <DialogHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Order - {order.id}
            </DialogTitle>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5ee] px-3 py-1 text-sm font-medium text-[#00562C]">
              <Store className="size-3.5" />
              {order.branch === "Bracnh1" ? "Jaffna Branch1" : order.branch}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button className="h-9 rounded-lg bg-[#00562C] px-3 text-white hover:bg-[#004522]">
              <Download className="size-4" />
              Download CSV
            </Button>
            <ActionIcon
              type="delete"
              size={18}
              onClick={() => onDelete(order.id)}
              label="Delete order"
            />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-2 text-[#00562C] hover:bg-[#e8f5ee]"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Progress stepper */}
        <div className="mt-2 px-2">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isDone = index < completedCount;
              return (
                <div key={step.label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full border-2",
                        isDone
                          ? "border-[#00562C] bg-[#00562C] text-white"
                          : "border-gray-300 bg-white text-gray-300"
                      )}
                    >
                      <Check className="size-4" />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isDone ? "text-[#00562C]" : "text-gray-400"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 mb-5 h-1 flex-1 rounded-full",
                        index < completedCount - 1
                          ? "bg-[#00562C]"
                          : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {order.status !== "Completed" && (
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                className="h-9 rounded-lg bg-[#00562C] text-white hover:bg-[#004522]"
                onClick={() => onAdvanceStatus(order.id)}
              >
                Update to next status
              </Button>
            </div>
          )}
        </div>

        {/* QR Code placeholder */}
        <div className="flex justify-center py-4">
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <svg
              width="140"
              height="140"
              viewBox="0 0 140 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Order QR code"
            >
              <rect width="140" height="140" fill="white" />
              {[
                [10, 10],
                [90, 10],
                [10, 90],
              ].map(([x, y], i) => (
                <g key={i}>
                  <rect x={x} y={y} width="40" height="40" fill="black" />
                  <rect x={x + 6} y={y + 6} width="28" height="28" fill="white" />
                  <rect x={x + 12} y={y + 12} width="16" height="16" fill="black" />
                </g>
              ))}
              {[
                [60, 10],
                [60, 30],
                [60, 50],
                [60, 70],
                [60, 90],
                [60, 110],
                [80, 60],
                [100, 60],
                [120, 60],
                [80, 80],
                [100, 100],
                [120, 80],
                [80, 120],
                [100, 120],
                [120, 120],
                [30, 60],
                [10, 60],
                [50, 100],
              ].map(([x, y], i) => (
                <rect key={`d-${i}`} x={x} y={y} width="10" height="10" fill="black" />
              ))}
            </svg>
          </div>
        </div>

        {/* Order Information */}
        <div>
          <h3 className="mb-3 text-base font-bold text-gray-900">
            Order Information
          </h3>
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#F2F2F3] p-4 sm:grid-cols-4">
            <InfoItem
              icon={<Clock className="size-4 text-[#00562C]" />}
              label="Order time"
              value={order.orderTime}
            />
            <InfoItem
              icon={<Calendar className="size-4 text-[#00562C]" />}
              label="Order date"
              value={order.orderDate}
            />
            <InfoItem
              icon={<User className="size-4 text-[#00562C]" />}
              label="Customer name"
              value={order.customerName === "Kishana" ? "John Doe" : order.customerName}
            />
            <InfoItem
              icon={<Mail className="size-4 text-[#00562C]" />}
              label="Email address"
              value={order.email}
            />
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="mb-3 text-base font-bold text-gray-900">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={`${item.name}-${item.size ?? "default"}`}
                className="rounded-xl bg-[#F2F2F3] p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    {item.size ? (
                      <p className="text-sm text-gray-600">
                        {item.size}{" "}
                        <span className="font-medium text-[#00562C]">
                          €{item.unitPrice.toFixed(2)}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-[#00562C]">
                        €{item.unitPrice.toFixed(2)}
                      </p>
                    )}
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="mt-2 space-y-1 border-l-2 border-gray-300 pl-3">
                        {item.customizations.map((c) => (
                          <div
                            key={c.name}
                            className="flex justify-between gap-4 text-sm text-gray-600"
                          >
                            <span>+ {c.name}</span>
                            <span>+€{c.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
                  <span className="text-gray-600">QTY: {item.quantity}</span>
                  <span className="font-bold text-gray-900">
                    €{item.total.toFixed(2)}
                  </span>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
