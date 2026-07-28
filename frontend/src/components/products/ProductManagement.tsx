"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ConfirmSaveProductDialog from "@/components/dialogs/ConfirmSaveProductDialog";
import ConfirmSaveSubCategoryDialog from "@/components/dialogs/ConfirmSaveSubCategoryDialog";
import DeleteProductDialog from "@/components/dialogs/DeleteProductDialog";
import DrinkDetailsModal from "@/components/models/DrinkDetailsModal";
import DrinkFormModal from "@/components/models/DrinkFormModal";
import ProductDetailsModal from "@/components/models/ProductDetailsModal";
import ProductFormModal from "@/components/models/ProductFormModal";
import SubCategoryFormModal from "@/components/models/SubCategoryFormModal";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createProduct,
  createSubCategory,
  deleteProduct,
  fetchProducts,
  fetchSubCategories,
  updateProduct,
  updateProductStatus,
  updateSubCategory,
} from "@/services/remoteApi";
import type {
  ProductFormData,
  ProductRecord,
  ProductStatus,
  ProductTab,
  SubCategoryFormData,
  SubCategoryRecord,
} from "@/types";

const PAGE_SIZE = 10;

interface ProductManagementProps {
  role?: "superadmin" | "admin";
}

export default function ProductManagement({
  role = "superadmin",
}: ProductManagementProps) {
  const isSuperadmin = role === "superadmin";
  // Admin cards have no action buttons, so 3 rows (15 cards) fit per page
  const pageSize = isSuperadmin ? PAGE_SIZE : 15;
  const [foodProducts, setFoodProducts] =
    useState<ProductRecord[]>([]);
  const [drinkProducts, setDrinkProducts] =
    useState<ProductRecord[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryRecord[]>(
    []
  );
  const [tab, setTab] = useState<ProductTab>("food");
  const [search, setSearch] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<ProductRecord | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(
    null
  );
  const [pendingForm, setPendingForm] = useState<ProductFormData | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const [subCatOpen, setSubCatOpen] = useState(false);
  const [subCatMode, setSubCatMode] = useState<"create" | "edit">("create");
  const [editingSubCat, setEditingSubCat] = useState<SubCategoryRecord | null>(
    null
  );
  const [pendingSubCat, setPendingSubCat] =
    useState<SubCategoryFormData | null>(null);
  const [subCatConfirmOpen, setSubCatConfirmOpen] = useState(false);
  const [subCategoryMenuOpen, setSubCategoryMenuOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const subCategoryMenuRef = useRef<HTMLDivElement>(null);
  const [saveError, setSaveError] = useState("");

  const loadData = async () => {
    try {
      const [food, drinks, subs] = await Promise.all([
        fetchProducts("food"),
        fetchProducts("drinks"),
        fetchSubCategories(),
      ]);
      setFoodProducts(food);
      setDrinkProducts(drinks);
      setSubCategories(subs);
      setSaveError("");
    } catch (error) {
      console.error("Failed to load products", error);
      setFoodProducts([]);
      setDrinkProducts([]);
      setSaveError("Unable to load products from server.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const source = tab === "food" ? foodProducts : drinkProducts;

  const currentCategory = tab === "food" ? "Food" : "Drinks";

  const foodSubCategoryNames = useMemo(
    () =>
      subCategories
        .filter((s) => s.category === "Food")
        .map((s) => s.name),
    [subCategories]
  );

  const drinkSubCategoryNames = useMemo(
    () =>
      subCategories
        .filter((s) => s.category === "Drinks")
        .map((s) => s.name),
    [subCategories]
  );

  const currentSubCategories = useMemo(
    () => subCategories.filter((s) => s.category === currentCategory),
    [currentCategory, subCategories]
  );
  const selectedSubCategory =
    subCategoryFilter === "all"
      ? null
      : currentSubCategories.find((item) => item.name === subCategoryFilter) ??
        null;

  const filtered = useMemo(() => {
    let result = source;
    if (subCategoryFilter !== "all") {
      result = result.filter((p) => p.subCategory === subCategoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q)
      );
    }
    return result;
  }, [source, search, subCategoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageProducts = filtered.slice(startIndex, startIndex + pageSize);
  const showingFrom = filtered.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, filtered.length);

  const currentViewProduct = viewProduct
    ? (source.find((p) => p.id === viewProduct.id) ?? viewProduct)
    : null;

  const resetPage = () => setCurrentPage(1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        subCategoryMenuRef.current &&
        !subCategoryMenuRef.current.contains(event.target as Node)
      ) {
        setSubCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateProductList = (
    updater: (prev: ProductRecord[]) => ProductRecord[]
  ) => {
    if (tab === "food") setFoodProducts(updater);
    else setDrinkProducts(updater);
  };

  const openView = (product: ProductRecord) => {
    setViewProduct(product);
    setViewOpen(true);
  };

  const openCreate = () => {
    setFormMode("create");
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product: ProductRecord) => {
    setViewOpen(false);
    setFormMode("edit");
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSaveRequest = (data: ProductFormData) => {
    setPendingForm(data);
    setSaveConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingForm) {
      setSaveError("Nothing to save. Please fill the product form again.");
      return;
    }
    const productType = editingProduct?.type ?? tab;
    setSaveError("");

    try {
      if (formMode === "create") {
        await createProduct(productType, pendingForm);
      } else if (editingProduct) {
        await updateProduct(editingProduct.id, productType, pendingForm);
      }

      await loadData();
      setPendingForm(null);
      setFormOpen(false);
      setEditingProduct(null);
      setSaveConfirmOpen(false);
      setCurrentPage(1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save product";
      console.error("Failed to save product", error);
      setSaveError(message);
      setSaveConfirmOpen(false);
    }
  };

  const openDelete = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await deleteProduct(deleteId);
      setFoodProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDrinkProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
      setViewOpen(false);
      setViewProduct(null);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };

  const handleToggleStatus = async (productId: number, status: ProductStatus) => {
    try {
      const updated = await updateProductStatus(productId, status);
      updateProductList((prev) =>
        prev.map((p) => (p.id === productId ? updated : p))
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleSubCatSaveRequest = (data: SubCategoryFormData) => {
    setPendingSubCat(data);
    setSubCatConfirmOpen(true);
  };

  const handleConfirmSubCatSave = async () => {
    if (!pendingSubCat || !pendingSubCat.category) return;
    const name = pendingSubCat.name.trim();

    try {
      if (subCatMode === "create") {
        const created = await createSubCategory({
          ...pendingSubCat,
          name,
        });
        setSubCategories((prev) => [created, ...prev]);
      } else if (editingSubCat) {
        const updated = await updateSubCategory(editingSubCat.id, {
          ...pendingSubCat,
          name,
        });
        setSubCategories((prev) =>
          prev.map((item) => (item.id === editingSubCat.id ? updated : item))
        );
        if (subCategoryFilter === editingSubCat.name) {
          setSubCategoryFilter(name);
        }
      }
      setPendingSubCat(null);
      setSubCatOpen(false);
      setEditingSubCat(null);
      setSubCatMode("create");
      setSubCatConfirmOpen(false);
    } catch (error) {
      console.error("Failed to save sub-category", error);
      setSubCatConfirmOpen(false);
    }
  };

  const openCreateSubCategory = () => {
    setSubCatMode("create");
    setEditingSubCat(null);
    setSubCatOpen(true);
  };

  const openEditSubCategory = () => {
    if (!selectedSubCategory) return;
    setSubCatMode("edit");
    setEditingSubCat(selectedSubCategory);
    setSubCatOpen(true);
  };

  return (
    <>
      <DashboardHeader title="Product management" />

      {saveError ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {saveError}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl bg-[#F2F2F3] p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-white p-1">
            <button
              type="button"
              onClick={() => {
                setTab("food");
                setSubCategoryFilter("all");
                resetPage();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === "food"
                  ? "bg-[#e8f5ee] text-[#00562C]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Food
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("drinks");
                setSubCategoryFilter("all");
                resetPage();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === "drinks"
                  ? "bg-[#e8f5ee] text-[#00562C]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Drinks
            </button>
          </div>

          <div className="relative min-w-[150px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="h-11 rounded-full border-none bg-white pl-10"
            />
          </div>

          <div ref={subCategoryMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setSubCategoryMenuOpen((prev) => !prev)}
              className="flex h-11 min-w-[170px] items-center gap-2 rounded-full bg-white px-4 text-sm text-gray-700 shadow-sm"
            >
              <Filter className="size-4 text-gray-500" />
              <span className="max-w-[120px] truncate">
                {selectedSubCategory?.name ?? "Sub Category"}
              </span>
              <ChevronDown className="ml-auto size-4 text-gray-500" />
            </button>

            {subCategoryMenuOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 z-30 w-[260px] overflow-hidden rounded-[22px] border border-[#49AE20] bg-white shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSubCategoryFilter("all");
                    resetPage();
                    setSubCategoryMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium",
                    subCategoryFilter === "all"
                      ? "bg-[#CBF0CB] text-[#00562C]"
                      : "text-[#49AE20]"
                  )}
                >
                  <span className="truncate">Sub Category</span>
                </button>

                <div className="max-h-72 space-y-1 overflow-y-auto p-3">
                  {currentSubCategories.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSubCategoryFilter(item.name);
                        resetPage();
                        setSubCategoryMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition-colors",
                        subCategoryFilter === item.name
                          ? "bg-[#CBF0CB] text-[#00562C]"
                          : "hover:bg-[#F8F8F8]"
                      )}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F2F2F3]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="truncate">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isSuperadmin && (
            <>
              <button
                type="button"
                onClick={openCreateSubCategory}
                className="flex size-11 items-center justify-center rounded-xl bg-white text-[#00562C] shadow-sm"
                aria-label="Add Sub Category"
                title="Add Sub Category"
              >
                <Plus className="size-5" />
              </button>
              <button
                type="button"
                onClick={openEditSubCategory}
                disabled={!selectedSubCategory}
                className="flex size-11 items-center justify-center rounded-xl bg-white text-[#00562C] shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Edit Sub Category"
                title="Edit Sub Category"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/edit.svg" alt="" className="size-[18px]" />
              </button>
              <Button
                onClick={openCreate}
                className="h-11 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]"
              >
                Add Product
              </Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
            {pageProducts.map((product) => (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                onClick={() => openView(product)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openView(product);
                }}
                className="relative cursor-pointer overflow-hidden rounded-xl bg-white p-3 text-center shadow-sm transition hover:shadow-md"
              >
                <span
                  className={cn(
                    "absolute top-0 right-0 h-[35px] w-10 rounded-tr-[10px] rounded-bl-[10px]",
                    product.status === "Active"
                      ? "bg-[#49AE20]"
                      : "bg-[#FF0000]"
                  )}
                />
                <div className="mb-2 flex h-20 items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-20 w-auto object-contain"
                  />
                </div>
                <p className="text-sm font-bold text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">{product.subCategory}</p>
                <p className="mt-1 text-sm font-bold text-[#00562C]">
                  {product.price}
                </p>
                {isSuperadmin && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <ActionIcon
                      type="edit"
                      buttonClassName="size-9 rounded-lg border border-gray-200 bg-white"
                      onClick={() => openEdit(product)}
                    />
                    <ActionIcon
                      type="delete"
                      buttonClassName="size-9 rounded-lg border border-gray-200 bg-white"
                      onClick={() => openDelete(product.id)}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>

        {pageProducts.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">
            No products found.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
          <p className="text-sm text-gray-600">
            Showing {String(showingFrom).padStart(2, "0")}-
            {String(showingTo).padStart(2, "0")} of {filtered.length} Product
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex size-8 items-center justify-center rounded-full text-gray-600 hover:bg-[#F2F2F3] disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from(
              { length: Math.min(3, totalPages) },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                  safePage === page
                    ? "bg-[#e8f5ee] text-[#00562C]"
                    : "text-gray-600 hover:bg-[#F2F2F3]"
                )}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              className="flex size-8 items-center justify-center rounded-full text-gray-600 hover:bg-[#F2F2F3] disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <ProductDetailsModal
        open={viewOpen && currentViewProduct?.type === "food"}
        product={
          currentViewProduct?.type === "food" ? currentViewProduct : null
        }
        readOnly={!isSuperadmin}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewProduct(null);
        }}
        onEdit={openEdit}
        onDelete={openDelete}
        onToggleStatus={handleToggleStatus}
      />

      <DrinkDetailsModal
        open={viewOpen && currentViewProduct?.type === "drinks"}
        product={
          currentViewProduct?.type === "drinks" ? currentViewProduct : null
        }
        readOnly={!isSuperadmin}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewProduct(null);
        }}
        onEdit={openEdit}
        onDelete={openDelete}
        onToggleStatus={handleToggleStatus}
      />

      <ProductFormModal
        open={formOpen && (editingProduct?.type ?? tab) === "food"}
        mode={formMode}
        product={editingProduct}
        subCategories={foodSubCategoryNames}
        onOpenChange={setFormOpen}
        onSaveRequest={handleSaveRequest}
      />

      <DrinkFormModal
        open={formOpen && (editingProduct?.type ?? tab) === "drinks"}
        mode={formMode}
        product={editingProduct}
        subCategories={drinkSubCategoryNames}
        onOpenChange={setFormOpen}
        onSaveRequest={handleSaveRequest}
      />

      <ConfirmSaveProductDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        onConfirm={handleConfirmSave}
        productName={pendingForm?.name || "this product"}
        message={
          (editingProduct?.type ?? tab) === "drinks"
            ? "Please confirm if you want to save the Drink of Kaffee Krumel."
            : undefined
        }
      />

      <SubCategoryFormModal
        open={subCatOpen}
        mode={subCatMode}
        defaultCategory={tab === "food" ? "Food" : "Drinks"}
        initialData={
          editingSubCat
            ? {
                image: editingSubCat.image,
                category: editingSubCat.category,
                name: editingSubCat.name,
              }
            : null
        }
        onOpenChange={(open) => {
          setSubCatOpen(open);
          if (!open) {
            setEditingSubCat(null);
            setSubCatMode("create");
          }
        }}
        onSaveRequest={handleSubCatSaveRequest}
      />

      <ConfirmSaveSubCategoryDialog
        open={subCatConfirmOpen}
        onOpenChange={setSubCatConfirmOpen}
        onConfirm={handleConfirmSubCatSave}
      />

      <DeleteProductDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
