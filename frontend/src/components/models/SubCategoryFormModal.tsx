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
import { EMPTY_SUB_CATEGORY_FORM } from "@/services/productService";
import { ApiError, uploadImageFile } from "@/lib/api";
import type { SubCategoryFormData } from "@/types";

interface SubCategoryFormModalProps {
  open: boolean;
  mode?: "create" | "edit";
  defaultCategory?: "Food" | "Drinks";
  initialData?: SubCategoryFormData | null;
  onOpenChange: (open: boolean) => void;
  onSaveRequest: (data: SubCategoryFormData) => void;
}

export default function SubCategoryFormModal({
  open,
  mode = "create",
  defaultCategory = "Food",
  initialData,
  onOpenChange,
  onSaveRequest,
}: SubCategoryFormModalProps) {
  const [form, setForm] = useState<SubCategoryFormData>(EMPTY_SUB_CATEGORY_FORM);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      mode === "edit" && initialData
        ? initialData
        : { ...EMPTY_SUB_CATEGORY_FORM, category: defaultCategory }
    );
  }, [open, defaultCategory, initialData, mode]);

  const updateField = <K extends keyof SubCategoryFormData>(
    key: K,
    value: SubCategoryFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setError("Only PNG/JPG formats are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be up to 10mb.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const url = await uploadImageFile(file);
      updateField("image", url);
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Image upload failed";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (uploading) {
      setError("Please wait for image upload to finish.");
      return;
    }
    if (!form.image) {
      setError("Please add a subcategory image.");
      return;
    }
    if (form.image.startsWith("blob:")) {
      setError("Image upload incomplete. Please select the image again.");
      return;
    }
    if (!form.category || !form.name.trim()) {
      setError("Please fill Category and Name.");
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
            <DialogTitle className="text-xl font-bold text-gray-900">
              {mode === "edit" ? "Edit Sub Category" : "Add Sub Category"}
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

          <Field label="Image">
            {form.image ? (
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#F2F2F3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="Sub category preview"
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
          </Field>

          <Field label="Category">
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) =>
                  updateField(
                    "category",
                    e.target.value as SubCategoryFormData["category"]
                  )
                }
                className="h-11 w-full appearance-none rounded-xl bg-[#F2F2F3] px-4 pr-10 text-sm outline-none"
              >
                <option value="">Select</option>
                <option value="Food">Food</option>
                <option value="Drinks">Drinks</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-gray-500" />
            </div>
          </Field>

          <Field label="Name">
            <Input
              placeholder="eg; Cake"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 shadow-none"
            />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="button"
            onClick={handleSave}
            className="h-11 w-full rounded-full bg-[#00562C] text-white hover:bg-[#004522]"
          >
            {mode === "edit" ? "Update" : "Save"}
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
