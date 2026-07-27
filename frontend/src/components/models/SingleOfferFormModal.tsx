"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ActionIcon from "@/components/ui/ActionIcon";
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
  EMPTY_SINGLE_OFFER_FORM,
  OFFER_PRODUCT_CATALOG,
  parseOfferDate,
} from "@/services/offerService";
import type {
  OfferCatalogProduct,
  OfferDateParts,
  OfferRecord,
  SingleOfferFormData,
} from "@/types";

interface SingleOfferFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  offer?: OfferRecord | null;
  onOpenChange: (open: boolean) => void;
  onSaveRequest: (data: SingleOfferFormData) => void;
}

export default function SingleOfferFormModal({
  open,
  mode,
  offer,
  onOpenChange,
  onSaveRequest,
}: SingleOfferFormModalProps) {
  const [form, setForm] = useState<SingleOfferFormData>(EMPTY_SINGLE_OFFER_FORM);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<OfferCatalogProduct | null>(
    null
  );
  const [priceDraft, setPriceDraft] = useState("");
  const [error, setError] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setUpdateMessage("");
    setSearch("");
    setSearchResult(null);

    if (mode === "edit" && offer) {
      const catalogMatch =
        OFFER_PRODUCT_CATALOG.find(
          (p) =>
            p.name.toLowerCase() === offer.name.toLowerCase() ||
            p.image === offer.image
        ) ?? {
          id: offer.id,
          name: offer.name,
          category: offer.category,
          price: offer.originalPrice || offer.offerPrice,
          image: offer.image,
        };

      const price = offer.offerPrice.replace(/^€\s?/, "");
      setForm({
        start: parseOfferDate(offer.validityFrom),
        end: parseOfferDate(offer.validityTo),
        product: catalogMatch,
        offerPrice: price,
      });
      setPriceDraft(price);
      return;
    }

    setForm(EMPTY_SINGLE_OFFER_FORM);
    setPriceDraft("");
  }, [open, mode, offer]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return OFFER_PRODUCT_CATALOG.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [search]);

  const hasAddedProduct = Boolean(form.product);
  const actionLabel = hasAddedProduct ? "Update" : "Add";

  const updateDate = (
    key: "start" | "end",
    part: keyof OfferDateParts,
    value: string
  ) => {
    const digits = value.replace(/\D/g, "").slice(0, part === "year" ? 4 : 2);
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], [part]: digits },
    }));
  };

  const handleSelectSearchResult = (product: OfferCatalogProduct) => {
    setSearchResult(product);
    setSearch(product.name);
    setPriceDraft(product.price.replace(/^€\s?/, ""));
    setUpdateMessage("");
  };

  const handleAddOrUpdate = () => {
    // Update existing added product fields (price) without delete+re-add
    if (hasAddedProduct && !searchResult) {
      if (!priceDraft.trim()) {
        setError("Please enter an offer price.");
        return;
      }
      setError("");
      setForm((prev) => ({
        ...prev,
        offerPrice: priceDraft.trim(),
      }));
      setUpdateMessage("Product details updated.");
      return;
    }

    // Add / replace from search selection
    if (!searchResult) {
      setError(
        hasAddedProduct
          ? "Edit price above and click Update, or search to change product."
          : "Please search and select a product."
      );
      return;
    }
    if (!priceDraft.trim()) {
      setError("Please enter an offer price.");
      return;
    }

    setError("");
    setUpdateMessage(hasAddedProduct ? "Product replaced." : "");
    setForm((prev) => ({
      ...prev,
      product: searchResult,
      offerPrice: priceDraft.trim(),
    }));
    setSearchResult(null);
    setSearch("");
  };

  const handleRemoveProduct = () => {
    setForm((prev) => ({ ...prev, product: null, offerPrice: "" }));
    setPriceDraft("");
    setSearchResult(null);
    setSearch("");
    setUpdateMessage("");
  };

  const isDateComplete = (parts: OfferDateParts) =>
    parts.day.length >= 1 && parts.month.length >= 1 && parts.year.length === 4;

  const handleNext = () => {
    if (!isDateComplete(form.start) || !isDateComplete(form.end)) {
      setError("Please fill Start and End validity dates.");
      return;
    }

    // If user changed price but didn't click Update, sync it before save
    const finalPrice = priceDraft.trim() || form.offerPrice.trim();
    if (!form.product || !finalPrice) {
      setError("Please add a product with price.");
      return;
    }

    setError("");
    onSaveRequest({
      ...form,
      offerPrice: finalPrice,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[94vh] max-w-md overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="max-h-[94vh] space-y-4 overflow-y-auto p-4 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-bold text-[#00562C]">
              {mode === "create" ? "Add Single Offer" : "Edit Single Offer"}
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

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Offer validity period
            </h3>
            <DateRow
              label="Start"
              value={form.start}
              onChange={(part, value) => updateDate("start", part, value)}
            />
            <DateRow
              label="End"
              value={form.end}
              onChange={(part, value) => updateDate("end", part, value)}
            />
          </section>

          <section className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">
              Select Product
            </Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={
                  hasAddedProduct
                    ? "Search to change product (optional)"
                    : "Search"
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchResult(null);
                  setUpdateMessage("");
                }}
                className="h-11 rounded-xl border-none bg-[#F2F2F3] pl-10"
              />
            </div>

            {filteredProducts.length > 0 && !searchResult && (
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectSearchResult(product)}
                    className="flex w-full items-center gap-3 rounded-xl bg-[#F2F2F3] p-3 text-left transition hover:bg-[#e8f5ee]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-12 rounded-lg object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <p className="text-sm font-bold text-[#49AE20]">
                      {product.price}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {searchResult && (
              <div className="flex items-center gap-3 rounded-xl bg-[#F2F2F3] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={searchResult.image}
                  alt={searchResult.name}
                  className="size-12 rounded-lg object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {searchResult.name}
                  </p>
                  <p className="text-xs text-gray-500">{searchResult.category}</p>
                </div>
                <p className="text-sm font-bold text-[#49AE20]">
                  {searchResult.price}
                </p>
              </div>
            )}

            {(searchResult || form.product) && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">
                  Price
                </Label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                    €
                  </span>
                  <Input
                    value={priceDraft}
                    onChange={(e) => {
                      setPriceDraft(e.target.value);
                      setUpdateMessage("");
                    }}
                    className="h-11 rounded-xl border-none bg-[#F2F2F3] pl-7"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddOrUpdate}
              className="h-10 rounded-xl border-[#00562C] bg-white px-6 text-[#00562C] hover:bg-[#e8f5ee]"
            >
              {actionLabel}
            </Button>

            {updateMessage && (
              <p className="text-sm text-[#00562C]">{updateMessage}</p>
            )}

            {form.product && (
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.product.image}
                  alt={form.product.name}
                  className="size-12 rounded-lg object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {form.product.name}
                  </p>
                  <p className="text-xs text-gray-500">{form.product.category}</p>
                  <p className="text-[11px] text-gray-500">
                    Validity: {formatPreviewDate(form.start)} -{" "}
                    {formatPreviewDate(form.end)}
                  </p>
                  <p className="text-sm font-bold text-[#49AE20]">
                    €{form.offerPrice}
                  </p>
                </div>
                <ActionIcon
                  type="delete"
                  size={18}
                  onClick={handleRemoveProduct}
                  label="Remove product"
                />
              </div>
            )}
          </section>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="button"
            onClick={handleNext}
            className="h-12 w-full rounded-xl bg-[#00562C] text-base font-semibold text-white hover:bg-[#004522]"
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatPreviewDate(parts: OfferDateParts) {
  if (!parts.day && !parts.month && !parts.year) return "--/--/----";
  return `${parts.day.padStart(2, "0") || "--"}/${parts.month.padStart(2, "0") || "--"}/${parts.year || "----"}`;
}

function DateRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: OfferDateParts;
  onChange: (part: keyof OfferDateParts, value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-sm font-medium text-gray-700">{label}</span>
      <div className="flex flex-1 items-center gap-1.5">
        <DatePart
          placeholder="DD"
          value={value.day}
          onChange={(v) => onChange("day", v)}
          maxLength={2}
        />
        <span className="text-gray-400">/</span>
        <DatePart
          placeholder="MM"
          value={value.month}
          onChange={(v) => onChange("month", v)}
          maxLength={2}
        />
        <span className="text-gray-400">/</span>
        <DatePart
          placeholder="YYYY"
          value={value.year}
          onChange={(v) => onChange("year", v)}
          maxLength={4}
          className="flex-[1.4]"
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
        "h-10 flex-1 rounded-xl border-none bg-[#F2F2F3] text-center text-sm",
        className
      )}
    />
  );
}
