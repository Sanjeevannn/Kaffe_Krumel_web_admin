"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EMPTY_PRODUCT_FORM,
} from "@/services/productService";
import type { ProductFormData, ProductRecord } from "@/types";

interface ProductFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  product?: ProductRecord | null;
  subCategories: string[];
  onOpenChange: (open: boolean) => void;
  onSaveRequest: (data: ProductFormData) => void;
}

export default function ProductFormModal({
  open,
  mode,
  product,
  subCategories = [],
  onOpenChange,
  onSaveRequest,
}: ProductFormModalProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_PRODUCT_FORM);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (mode === "edit" && product) {
      setForm({
        name: product.name,
        subCategory: product.subCategory,
        price: product.price.replace(/^€\s?/, ""),
        description: product.description,
        image: product.image,
      });
    } else {
      setForm({ ...EMPTY_PRODUCT_FORM });
    }
  }, [open, mode, product]);

  const updateField = <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFile = (file: File | undefined) => {
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
    const url = URL.createObjectURL(file);
    updateField("image", url);
  };

  const handleSave = () => {
    if (!form.image) {
      setError("Please add a product image.");
      return;
    }
    if (!form.name.trim() || !form.subCategory || !form.price.trim()) {
      setError("Please fill Product name, Sub Category and Price.");
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
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-bold text-[#00562C]">
              {mode === "create" ? "Add Food" : "Edit Food"}
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

          <Field label="Image Image">
            {form.image ? (
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#F2F2F3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="Product preview"
                  className="mx-auto max-h-44 w-full object-contain p-4"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-[#e8f5ee] px-3 py-1.5 text-sm font-medium text-[#00562C]"
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
                <Upload className="size-8 text-gray-400" />
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
          </Field>

          <Field label="Product name">
            <Input
              placeholder="eg; Sandwich"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="h-11 rounded-xl border-none bg-[#F2F2F3] px-4 shadow-none"
            />
          </Field>

          <Field label="Sub Category">
            <div className="relative">
              <select
                value={form.subCategory}
                onChange={(e) => updateField("subCategory", e.target.value)}
                className="h-11 w-full appearance-none rounded-xl bg-[#F2F2F3] px-4 pr-10 text-sm outline-none"
              >
                <option value="">Select</option>
                {subCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-gray-500" />
            </div>
          </Field>

          <Field label="Price">
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-gray-500">
                €
              </span>
              <Input
                placeholder="1,20"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="h-11 rounded-xl border-none bg-[#F2F2F3] py-2 pr-4 pl-8 shadow-none"
              />
            </div>
          </Field>

          <Field label="Description">
            <Input
              placeholder="eg; Start your day with our fresh bakery & tea combo"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="h-11 rounded-xl border-none bg-[#F2F2F3] px-4 shadow-none"
            />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="button"
            onClick={handleSave}
            className="h-11 w-full rounded-full bg-[#00562C] text-white hover:bg-[#004522]"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-900">{label}</Label>
      {children}
    </div>
  );
}
