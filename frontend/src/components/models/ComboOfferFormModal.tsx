"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Upload, X } from "lucide-react";
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
  EMPTY_COMBO_OFFER_FORM,
  parseOfferDate,
} from "@/services/offerService";
import type {
  ComboOfferFormData,
  ComboOfferFormProduct,
  OfferCatalogProduct,
  OfferDateParts,
  OfferRecord,
} from "@/types";

interface ComboOfferFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  offer?: OfferRecord | null;
  catalog?: OfferCatalogProduct[];
  onOpenChange: (open: boolean) => void;
  onSaveRequest: (data: ComboOfferFormData) => void;
}

export default function ComboOfferFormModal({
  open,
  mode,
  offer,
  catalog = [],
  onOpenChange,
  onSaveRequest,
}: ComboOfferFormModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ComboOfferFormData>(EMPTY_COMBO_OFFER_FORM);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<OfferCatalogProduct | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [discount, setDiscount] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError("");
    setSearch("");
    setSelectedProduct(null);
    setEditingKey(null);
    setQuantity("1");
    setDiscount("");

    if (mode === "edit" && offer) {
      setForm({
        image: offer.image,
        title: offer.name,
        description: offer.description,
        start: parseOfferDate(offer.validityFrom),
        end: parseOfferDate(offer.validityTo),
        products: (offer.products ?? []).map((p, index) => ({
          key: `edit-${offer.id}-${p.id}-${index}`,
          productId: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          image: p.image,
          quantity: p.quantity,
          discount: (p.discount || "").replace(/^€\s?/, ""),
        })),
      });
      return;
    }

    setForm(EMPTY_COMBO_OFFER_FORM);
  }, [open, mode, offer]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [search, catalog]);

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

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setError("Only PNG/JPG formats are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be up to 10mb.");
      return;
    }
    setError("");
    setForm((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
  };

  const isDateComplete = (parts: OfferDateParts) =>
    parts.day.length >= 1 && parts.month.length >= 1 && parts.year.length === 4;

  const handleStep1Next = () => {
    if (!form.image) {
      setError("Please add an offer image.");
      return;
    }
    if (!form.title.trim() || !form.description.trim()) {
      setError("Please fill Offer Title and Description.");
      return;
    }
    if (!isDateComplete(form.start) || !isDateComplete(form.end)) {
      setError("Please fill Start and End validity dates.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSelectProduct = (product: OfferCatalogProduct) => {
    setEditingKey(null);
    setSelectedProduct(product);
    setSearch(product.name);
    setQuantity("1");
    setDiscount("");
    setError("");
  };

  const handleEditProduct = (item: ComboOfferFormProduct) => {
    setEditingKey(item.key);
    setSelectedProduct({
      id: item.productId,
      name: item.name,
      category: item.category,
      price: item.price,
      image: item.image,
    });
    setSearch(item.name);
    setQuantity(String(item.quantity));
    setDiscount(item.discount);
    setError("");
  };

  const handleAddOrUpdateProduct = () => {
    if (!selectedProduct) {
      setError("Please search and select a product, or edit an added product.");
      return;
    }
    if (!quantity.trim() || Number(quantity) < 1) {
      setError("Please enter a valid quantity.");
      return;
    }
    if (!discount.trim()) {
      setError("Please enter a discount price.");
      return;
    }

    const discountValue = discount.replace(/^€\s?/, "");

    if (editingKey) {
      setForm((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.key === editingKey
            ? {
                ...p,
                productId: selectedProduct.id,
                name: selectedProduct.name,
                category: selectedProduct.category,
                price: selectedProduct.price,
                image: selectedProduct.image,
                quantity: Number(quantity),
                discount: discountValue,
              }
            : p
        ),
      }));
    } else {
      const item: ComboOfferFormProduct = {
        key: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        price: selectedProduct.price,
        image: selectedProduct.image,
        quantity: Number(quantity),
        discount: discountValue,
      };
      setForm((prev) => ({
        ...prev,
        products: [...prev.products, item],
      }));
    }

    setSelectedProduct(null);
    setEditingKey(null);
    setSearch("");
    setQuantity("1");
    setDiscount("");
    setError("");
  };

  const handleRemoveProduct = (key: string) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.key !== key),
    }));
    if (editingKey === key) {
      setEditingKey(null);
      setSelectedProduct(null);
      setSearch("");
      setQuantity("1");
      setDiscount("");
    }
  };

  const handleStep2Next = () => {
    if (form.products.length === 0) {
      setError("Please add at least one product to the combo.");
      return;
    }
    setError("");
    onSaveRequest(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[94vh] max-w-md overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="max-h-[94vh] space-y-4 overflow-y-auto p-4 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {mode === "create" ? "Add Combo Offer" : "Edit Combo Offer"}
              </DialogTitle>
              <p className="mt-1 text-xs text-gray-700">
                Step {String(step).padStart(2, "0")} to 02
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1 text-[#00562C] hover:bg-[#F2F2F3]"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </DialogHeader>

          <div className="h-2 overflow-hidden rounded-full bg-[#E7E7E8]">
            <div
              className="h-full rounded-full bg-[#00562C] transition-all"
              style={{ width: `${step * 50}%` }}
            />
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">
                1. Basic information
              </h3>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">
                  Offer Image
                </Label>
                {form.image ? (
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#F2F2F3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image}
                      alt="Offer preview"
                      className="mx-auto max-h-44 w-full object-contain p-3"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-[#CBF0CB] px-3 py-1.5 text-sm font-medium text-[#00562C]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/edit.svg" alt="" className="size-3.5" />
                      Edit
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    <Upload className="size-8 text-[#00562C]" />
                    <p className="text-sm font-medium text-gray-700">
                      Choose a file or drag & drop it here
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG/JPG formats up to 10mb
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 h-9 rounded-lg border-gray-300 bg-white px-4 text-sm text-gray-700"
                    >
                      Browse file
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">
                  Offer Title
                </Label>
                <Input
                  placeholder="eg; Summer Breakfast Combo"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="h-11 rounded-xl border-none bg-[#F2F2F3]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">
                  Description
                </Label>
                <Input
                  placeholder="eg; Start your day with our fresh bakery & tea combo"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="h-11 rounded-xl border-none bg-[#F2F2F3]"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">
                  Offer validity period
                </Label>
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
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="button"
                onClick={handleStep1Next}
                className="h-12 w-full rounded-xl bg-[#00562C] text-base font-semibold text-white hover:bg-[#004522]"
              >
                Next
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">
                2. Select Product
              </h3>

              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedProduct(null);
                    setEditingKey(null);
                  }}
                  className="h-11 rounded-xl border-none bg-[#F2F2F3] pl-10"
                />
              </div>

              {filteredProducts.length > 0 && !selectedProduct && !editingKey && (
                <div className="max-h-36 space-y-2 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
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
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#49AE20]">
                        {product.price}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {selectedProduct && (
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-[#F2F2F3] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="size-12 rounded-lg object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {selectedProduct.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedProduct.category}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#49AE20]">
                      {selectedProduct.price}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-gray-900">
                        Quantity
                      </Label>
                      <Input
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(e.target.value.replace(/\D/g, ""))
                        }
                        className="h-11 rounded-xl border-none bg-[#F2F2F3]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-gray-900">
                        Discount
                      </Label>
                      <div className="relative">
                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                          €
                        </span>
                        <Input
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="h-11 rounded-xl border-none bg-[#F2F2F3] pl-7"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddOrUpdateProduct}
                className="h-10 rounded-xl border-[#00562C] bg-white px-5 text-[#00562C] hover:bg-[#e8f5ee]"
              >
                {editingKey ? "Update Product" : "Add Product"}
              </Button>

              {form.products.length > 0 && (
                <div className="space-y-2">
                  {form.products.map((item) => (
                    <div
                      key={item.key}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl bg-[#F2F2F3] p-3 pr-16",
                        editingKey === item.key && "ring-2 ring-[#00562C]/30"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-12 rounded-lg object-contain"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                        <p className="text-sm font-medium text-gray-800">
                          {item.price}
                        </p>
                        <span className="mt-1 inline-flex rounded-full bg-[#CBF0CB] px-2.5 py-0.5 text-xs font-medium text-[#00562C]">
                          {item.quantity} for €{item.discount}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <ActionIcon
                          type="edit"
                          size={16}
                          onClick={() => handleEditProduct(item)}
                          label="Edit product"
                        />
                        <ActionIcon
                          type="delete"
                          size={16}
                          onClick={() => handleRemoveProduct(item.key)}
                          label="Remove product"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setError("");
                    setEditingKey(null);
                    setSelectedProduct(null);
                    setSearch("");
                    setQuantity("1");
                    setDiscount("");
                    setStep(1);
                  }}
                  className="h-12 flex-1 rounded-xl bg-[#F2F2F3] text-gray-700 hover:bg-gray-200"
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={handleStep2Next}
                  className="h-12 flex-1 rounded-xl bg-[#00562C] text-white hover:bg-[#004522]"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
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
