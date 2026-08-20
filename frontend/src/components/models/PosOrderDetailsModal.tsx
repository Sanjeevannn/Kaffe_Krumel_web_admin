"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Download, Store, X } from "lucide-react";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchPosOrder } from "@/services/remoteApi";
import { downloadCsv } from "@/lib/csv";
import type { Order, OrderItem } from "@/types";

function formatOrderEuro(value: number) {
  return (Math.round(value * 100) / 100).toFixed(2);
}

function getCustomizationTotal(item: OrderItem) {
  return (item.customizations ?? []).reduce(
    (sum, customization) => sum + customization.price,
    0
  );
}

function getBaseUnitPrice(item: OrderItem) {
  const customizationTotal = getCustomizationTotal(item);
  return Math.max(0, Number((item.unitPrice - customizationTotal).toFixed(2)));
}

interface PosOrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onDelete: (orderId: string) => void;
}

export default function PosOrderDetailsModal({
  open,
  onOpenChange,
  order,
  onDelete,
}: PosOrderDetailsModalProps) {
  const [details, setDetails] = useState<Order | null>(null);

  useEffect(() => {
    if (!open || !order) {
      setDetails(null);
      return;
    }

    let cancelled = false;
    fetchPosOrder(order.id)
      .then((data) => {
        if (!cancelled) setDetails(data);
      })
      .catch(() => {
        if (!cancelled) setDetails(order);
      });

    return () => {
      cancelled = true;
    };
  }, [open, order]);

  if (!order) return null;

  const activeOrder = details ?? order;
  const subtotal = formatOrderEuro(
    activeOrder.itemsSubtotal ??
      activeOrder.items.reduce((sum, item) => sum + item.total, 0)
  );

  const handleDownloadCsv = () => {
    const headers = [
      "Order ID",
      "Branch",
      "Order date",
      "Order time",
      "Item name",
      "Size",
      "Unit price",
      "Quantity",
      "Customizations",
      "Item total",
      "Subtotal",
    ];
    const rows =
      activeOrder.items.length > 0
        ? activeOrder.items.map((item) => [
            activeOrder.id,
            activeOrder.branch,
            activeOrder.orderDate,
            activeOrder.orderTime,
            item.name,
            item.size ?? "",
            item.unitPrice.toFixed(2),
            item.quantity,
            (item.customizations ?? [])
              .map((c) => `${c.name} (+${c.price.toFixed(2)})`)
              .join("; "),
            item.total.toFixed(2),
            subtotal,
          ])
        : [
            [
              activeOrder.id,
              activeOrder.branch,
              activeOrder.orderDate,
              activeOrder.orderTime,
              "",
              "",
              "",
              activeOrder.itemCount,
              "",
              "",
              subtotal,
            ],
          ];

    downloadCsv(`pos-order-${activeOrder.id}.csv`, headers, rows);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90dvh] w-[calc(100%-1.5rem)] !max-w-[720px] flex-col gap-0 overflow-hidden rounded-2xl border-none p-0 shadow-xl sm:p-0"
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 pb-8 sm:p-6 sm:pb-8">
          <DialogHeader className="flex flex-col items-start justify-between gap-3 space-y-0 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <DialogTitle className="break-words text-xl font-bold text-gray-900">
                Order - {activeOrder.id}
              </DialogTitle>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5ee] px-3 py-1 text-sm font-medium text-[#00562C]">
                <Store className="size-3.5" />
                {activeOrder.branch}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
              <Button
                type="button"
                onClick={handleDownloadCsv}
                className="h-9 rounded-lg bg-[#00562C] px-3 text-white hover:bg-[#004522]"
              >
                <Download className="size-4" />
                Download CSV
              </Button>
              <ActionIcon
                type="delete"
                size={18}
                onClick={() => onDelete(activeOrder.id)}
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

          <div className="flex justify-center py-2">
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
                    <rect
                      x={x + 6}
                      y={y + 6}
                      width="28"
                      height="28"
                      fill="white"
                    />
                    <rect
                      x={x + 12}
                      y={y + 12}
                      width="16"
                      height="16"
                      fill="black"
                    />
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
                  <rect
                    key={`d-${i}`}
                    x={x}
                    y={y}
                    width="10"
                    height="10"
                    fill="black"
                  />
                ))}
              </svg>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-base font-bold text-gray-900">
              Order Information
            </h3>
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-[#F2F2F3] p-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 text-[#00562C]" />
                <div>
                  <p className="text-sm text-gray-500">Order time</p>
                  <p className="font-medium text-gray-900">
                    {activeOrder.orderTime}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 size-4 text-[#00562C]" />
                <div>
                  <p className="text-sm text-gray-500">Order date</p>
                  <p className="font-medium text-gray-900">
                    {activeOrder.orderDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-base font-bold text-gray-900">
              Order Items
            </h3>
            <div className="space-y-3">
              {activeOrder.items.map((item, itemIndex) => {
                const baseUnitPrice = getBaseUnitPrice(item);
                const hasCustomizations =
                  item.customizations && item.customizations.length > 0;

                return (
                  <div
                    key={`${item.name}-${item.size ?? "default"}-${itemIndex}`}
                    className="rounded-xl bg-[#F2F2F3] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">
                          {item.name}
                        </p>
                        {item.size ? (
                          <p className="text-sm text-gray-600">
                            {item.size}{" "}
                            <span className="font-medium text-[#00562C]">
                              €{formatOrderEuro(baseUnitPrice)}
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-[#00562C]">
                            €{formatOrderEuro(baseUnitPrice)}
                          </p>
                        )}
                        {hasCustomizations ? (
                          <div className="mt-2 space-y-1 border-l-2 border-gray-300 pl-3">
                            <p className="text-xs font-medium text-gray-500">
                              Customized
                            </p>
                            {item.customizations!.map(
                              (customization, customizationIndex) => (
                                <div
                                  key={`${customization.name}-${customization.price}-${customizationIndex}`}
                                  className="flex justify-between gap-4 text-sm text-gray-600"
                                >
                                  <span>+ {customization.name}</span>
                                  <span>
                                    +€{formatOrderEuro(customization.price)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-bold text-gray-900">
                        €{formatOrderEuro(item.total)}
                      </span>
                    </div>
                    <div className="mt-3 border-t border-gray-200 pt-2 text-sm text-gray-600">
                      QTY: {item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[#F2F2F3] px-4 py-3">
            <span className="font-bold text-gray-900">Subtotal:</span>
            <span className="font-bold text-gray-900">€{subtotal}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
