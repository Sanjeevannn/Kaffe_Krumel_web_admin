"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Upload, X } from "lucide-react";
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
  createEmptyInclusive,
  createEmptySize,
  DRINK_CUSTOMIZATION_NAMES,
  DRINK_DEFAULT_OPTIONS,
  DRINK_GROUPS,
  EMPTY_PRODUCT_FORM,
} from "@/services/productService";
import type {
  DrinkInclusiveItem,
  DrinkSizeOption,
  ProductFormData,
  ProductRecord,
} from "@/types";

interface DrinkFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  product?: ProductRecord | null;
  subCategories: string[];
  onOpenChange: (open: boolean) => void;
  onSaveRequest: (data: ProductFormData) => void;
}

export default function DrinkFormModal({
  open,
  mode,
  product,
  subCategories = [],
  onOpenChange,
  onSaveRequest,
}: DrinkFormModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ProductFormData>({
    ...EMPTY_PRODUCT_FORM,
    sizes: [createEmptySize(1)],
  });
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError("");
    setForm(
      mode === "edit" && product
        ? {
            name: product.name,
            subCategory: product.subCategory,
            price: product.price.replace(/^€\s?/, ""),
            description: product.description,
            image: product.image,
            sizes:
              product.sizes && product.sizes.length > 0
                ? product.sizes.map((s) => ({
                    ...s,
                    included: s.included?.length
                      ? s.included
                      : [createEmptyInclusive()],
                  }))
                : [createEmptySize(1)],
          }
        : {
            ...EMPTY_PRODUCT_FORM,
            sizes: [createEmptySize(1)],
          }
    );
  }, [open, mode, product]);

  const sizes = form.sizes ?? [];

  const updateField = <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateSizes = (next: DrinkSizeOption[]) => {
    updateField("sizes", next);
  };

  const updateSize = (
    sizeId: string,
    patch: Partial<DrinkSizeOption>
  ) => {
    updateSizes(
      sizes.map((size) => (size.id === sizeId ? { ...size, ...patch } : size))
    );
  };

  const updateInclusive = (
    sizeId: string,
    inclusiveId: string,
    patch: Partial<DrinkInclusiveItem>
  ) => {
    updateSizes(
      sizes.map((size) =>
        size.id === sizeId
          ? {
              ...size,
              included: size.included.map((item) =>
                item.id === inclusiveId ? { ...item, ...patch } : item
              ),
            }
          : size
      )
    );
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
    updateField("image", URL.createObjectURL(file));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.image || !form.name.trim() || !form.subCategory) {
        setError("Please add an image, Product name and Sub Category.");
        return;
      }
      setError("");
      setStep(2);
      return;
    }

    if (sizes.length === 0) {
      setError("Please add at least one size.");
      return;
    }

    const invalidSize = sizes.find((s) => !s.sizeName.trim() || !s.price.trim());
    if (invalidSize) {
      setError("Please fill Size and Price for every size section.");
      return;
    }

    const firstPrice = sizes[0]?.price ?? "0";
    setError("");
    onSaveRequest({
      ...form,
      price: firstPrice,
      description: form.description || "Drink product",
      sizes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[94vh] max-w-lg overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="max-h-[94vh] space-y-4 overflow-y-auto p-4 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {mode === "create" ? "Add Drinks" : "Edit Drinks"}
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
              <h3 className="text-base font-semibold">1. Basic information</h3>
              <Field label="Image Image">
                {form.image ? (
                  <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-[#F2F2F3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image}
                      alt="Drink preview"
                      className="max-h-24 w-auto object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-[#C9F0CE] px-3 py-1.5 text-sm text-[#00562C]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/edit.svg" alt="" className="size-3.5" />
                      Edit
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    <Upload className="size-8 text-[#00562C]" />
                    <p className="text-sm font-medium">
                      Choose a file or drag & drop it here
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG/JPG formats up to 10mb
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 rounded-lg border-gray-300"
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
                  placeholder="eg; American Macha"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-11 rounded-xl border-none bg-[#F2F2F3]"
                />
              </Field>

              <Field label="Sub Category">
                <div className="relative">
                  <select
                    value={form.subCategory}
                    onChange={(e) =>
                      updateField("subCategory", e.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-xl bg-[#F2F2F3] px-4 pr-10 text-sm outline-none"
                  >
                    <option value="">Select</option>
                    {subCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-gray-500" />
                </div>
              </Field>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">
                2. Sizes, prices & What&apos;s Included
              </h3>

              {sizes.map((size, sizeIndex) => (
                <div
                  key={size.id}
                  className="space-y-3 rounded-2xl bg-[#E8F7EA] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Size {sizeIndex + 1}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium text-white",
                          size.status === "Active"
                            ? "bg-[#49AE20]"
                            : "bg-[#FF0000]"
                        )}
                      >
                        {size.status === "Active" ? "Active" : "In Active"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={size.status === "Active"}
                        onClick={() =>
                          updateSize(size.id, {
                            status:
                              size.status === "Active" ? "Inactive" : "Active",
                          })
                        }
                        className={cn(
                          "relative h-5 w-9 rounded-full transition-colors",
                          size.status === "Active"
                            ? "bg-[#49AE20]"
                            : "bg-[#FF0000]"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 size-4 rounded-full bg-white transition-transform",
                            size.status === "Active" ? "left-4" : "left-0.5"
                          )}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateSize(size.id, { collapsed: !size.collapsed })
                        }
                        className="rounded-lg bg-white p-1.5 text-gray-600"
                        aria-label="Toggle size section"
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform",
                            size.collapsed && "-rotate-90"
                          )}
                        />
                      </button>
                      <ActionIcon
                        type="delete"
                        buttonClassName="rounded-lg border border-red-200 bg-white"
                        onClick={() => {
                          if (sizes.length === 1) {
                            setError("At least one size is required.");
                            return;
                          }
                          updateSizes(sizes.filter((s) => s.id !== size.id));
                        }}
                      />
                    </div>
                  </div>

                  {!size.collapsed && (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Size">
                          <Input
                            value={size.sizeName}
                            onChange={(e) =>
                              updateSize(size.id, { sizeName: e.target.value })
                            }
                            placeholder="Small"
                            className="h-10 rounded-xl border-none bg-white"
                          />
                        </Field>
                        <Field label="Price">
                          <div className="relative">
                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                              €
                            </span>
                            <Input
                              value={size.price}
                              onChange={(e) =>
                                updateSize(size.id, { price: e.target.value })
                              }
                              placeholder="0"
                              className="h-10 rounded-xl border-none bg-white pl-7"
                            />
                          </div>
                        </Field>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-900">
                          Select What&apos;s Included
                        </p>
                        {size.included.map((item, itemIndex) => (
                          <div
                            key={item.id}
                            className="space-y-3 rounded-xl bg-white p-3"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-800">
                                Inclusive {itemIndex + 1}
                              </p>
                              <ActionIcon
                                type="delete"
                                onClick={() => {
                                  if (size.included.length === 1) {
                                    updateSize(size.id, {
                                      included: [createEmptyInclusive()],
                                    });
                                    return;
                                  }
                                  updateSize(size.id, {
                                    included: size.included.filter(
                                      (inc) => inc.id !== item.id
                                    ),
                                  });
                                }}
                              />
                            </div>

                            <SelectField
                              label="Customization Name"
                              value={item.customizationName}
                              options={DRINK_CUSTOMIZATION_NAMES}
                              onChange={(value) =>
                                updateInclusive(size.id, item.id, {
                                  customizationName: value,
                                })
                              }
                            />
                            <SelectField
                              label="Select Group"
                              value={item.group}
                              options={DRINK_GROUPS}
                              onChange={(value) =>
                                updateInclusive(size.id, item.id, {
                                  group: value,
                                })
                              }
                            />
                            <SelectField
                              label="Select Default Option"
                              value={item.defaultOption}
                              options={DRINK_DEFAULT_OPTIONS}
                              onChange={(value) =>
                                updateInclusive(size.id, item.id, {
                                  defaultOption: value,
                                })
                              }
                            />

                            {(item.group === "Add Sauce" ||
                              item.group === "Add Syrups" ||
                              item.pumps) && (
                              <Field label="Add how many pumps">
                                <Input
                                  placeholder="eg: 1"
                                  value={item.pumps}
                                  onChange={(e) =>
                                    updateInclusive(size.id, item.id, {
                                      pumps: e.target.value,
                                    })
                                  }
                                  className="h-10 rounded-xl border-none bg-[#F2F2F3]"
                                />
                              </Field>
                            )}
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            updateSize(size.id, {
                              included: [
                                ...size.included,
                                createEmptyInclusive(),
                              ],
                            })
                          }
                          className="h-10 w-full rounded-xl border-[#00562C] text-[#00562C] hover:bg-white"
                        >
                          Add Included Items
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  updateSizes([...sizes, createEmptySize(sizes.length + 1)])
                }
                className="h-10 w-full rounded-xl border-[#00562C] text-[#00562C] hover:bg-white"
              >
                + Add Size
              </Button>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            {step === 2 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="h-11 flex-1 rounded-full bg-[#F2F2F3]"
              >
                Previous
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNext}
              className="h-11 flex-1 rounded-full bg-[#00562C] text-white hover:bg-[#004522]"
            >
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-900">{label}</Label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-xl bg-[#F2F2F3] px-3 pr-9 text-sm outline-none"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
      </div>
    </Field>
  );
}
