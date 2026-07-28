"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ConfirmSaveOfferDialog from "@/components/dialogs/ConfirmSaveOfferDialog";
import DeleteOfferDialog from "@/components/dialogs/DeleteOfferDialog";
import ComboOfferDetailsModal from "@/components/models/ComboOfferDetailsModal";
import ComboOfferFormModal from "@/components/models/ComboOfferFormModal";
import SingleOfferDetailsModal from "@/components/models/SingleOfferDetailsModal";
import SingleOfferFormModal from "@/components/models/SingleOfferFormModal";
import ActionIcon from "@/components/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { OFFER_CATEGORIES } from "@/services/offerService";
import {
  createComboOffer,
  createSingleOffer,
  deleteOffer as deleteOfferApi,
  fetchOfferCatalog,
  fetchOffers,
  updateComboOffer,
  updateOfferStatus,
  updateSingleOffer,
} from "@/services/remoteApi";
import type {
  ComboOfferFormData,
  OfferCatalogProduct,
  OfferRecord,
  OfferStatus,
  OfferTab,
  SingleOfferFormData,
} from "@/types";

const SINGLE_PAGE_SIZE = 10;
const COMBO_PAGE_SIZE = 6;

export default function AdminOfferManagement() {
  const [singleOffers, setSingleOffers] = useState<OfferRecord[]>([]);
  const [comboOffers, setComboOffers] = useState<OfferRecord[]>([]);
  const [catalog, setCatalog] = useState<OfferCatalogProduct[]>([]);
  const [tab, setTab] = useState<OfferTab>("single");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewOffer, setViewOffer] = useState<OfferRecord | null>(null);

  const [singleFormOpen, setSingleFormOpen] = useState(false);
  const [comboFormOpen, setComboFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingOffer, setEditingOffer] = useState<OfferRecord | null>(null);
  const [pendingSingleForm, setPendingSingleForm] =
    useState<SingleOfferFormData | null>(null);
  const [pendingComboForm, setPendingComboForm] =
    useState<ComboOfferFormData | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadOffers = async () => {
    try {
      const [single, combo] = await Promise.all([
        fetchOffers("single"),
        fetchOffers("combo"),
      ]);
      setSingleOffers(single);
      setComboOffers(combo);
    } catch (error) {
      console.error("Failed to load offers", error);
    }
  };

  useEffect(() => {
    loadOffers();
    fetchOfferCatalog()
      .then(setCatalog)
      .catch((error) => console.error("Failed to load offer catalog", error));
  }, []);

  const source = tab === "single" ? singleOffers : comboOffers;
  const pageSize = tab === "single" ? SINGLE_PAGE_SIZE : COMBO_PAGE_SIZE;

  const filtered = useMemo(() => {
    let result = source;
    if (tab === "single" && categoryFilter !== "all") {
      result = result.filter((o) => o.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q) ||
          (o.itemsSummary?.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  }, [source, tab, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageOffers = filtered.slice(startIndex, startIndex + pageSize);
  const showingFrom = filtered.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, filtered.length);

  const currentViewOffer = viewOffer
    ? (source.find((o) => o.id === viewOffer.id) ?? viewOffer)
    : null;

  const resetPage = () => setCurrentPage(1);

  const openView = (offer: OfferRecord) => {
    setViewOffer(offer);
    setViewOpen(true);
  };

  const openCreate = () => {
    setFormMode("create");
    setEditingOffer(null);
    if (tab === "single") setSingleFormOpen(true);
    else setComboFormOpen(true);
  };

  const openEdit = (offer: OfferRecord) => {
    setViewOpen(false);
    setFormMode("edit");
    setEditingOffer(offer);
    if (offer.type === "single") setSingleFormOpen(true);
    else setComboFormOpen(true);
  };

  const openDelete = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSingleSaveRequest = (data: SingleOfferFormData) => {
    setPendingComboForm(null);
    setPendingSingleForm(data);
    setSaveConfirmOpen(true);
  };

  const handleComboSaveRequest = (data: ComboOfferFormData) => {
    setPendingSingleForm(null);
    setPendingComboForm(data);
    setSaveConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      if (pendingSingleForm?.product) {
        if (formMode === "create") {
          await createSingleOffer(pendingSingleForm);
        } else if (editingOffer) {
          await updateSingleOffer(editingOffer.id, pendingSingleForm);
        }
        setPendingSingleForm(null);
        setSingleFormOpen(false);
        setEditingOffer(null);
        setSaveConfirmOpen(false);
        await loadOffers();
        return;
      }

      if (pendingComboForm) {
        if (formMode === "create") {
          await createComboOffer(pendingComboForm);
          setTab("combo");
          setCurrentPage(1);
        } else if (editingOffer) {
          await updateComboOffer(editingOffer.id, pendingComboForm);
        }
        setPendingComboForm(null);
        setComboFormOpen(false);
        setEditingOffer(null);
        setSaveConfirmOpen(false);
        await loadOffers();
      }
    } catch (error) {
      console.error("Failed to save offer", error);
      setSaveConfirmOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await deleteOfferApi(deleteId);
      if (viewOffer?.id === deleteId) {
        setViewOpen(false);
        setViewOffer(null);
      }
      setDeleteId(null);
      setDeleteOpen(false);
      await loadOffers();
    } catch (error) {
      console.error("Failed to delete offer", error);
    }
  };

  const handleToggleStatus = async (offerId: number, status: OfferStatus) => {
    try {
      const updated = await updateOfferStatus(offerId, status);
      setSingleOffers((prev) =>
        prev.map((o) => (o.id === offerId ? updated : o))
      );
      setComboOffers((prev) =>
        prev.map((o) => (o.id === offerId ? updated : o))
      );
      setViewOffer((prev) => (prev?.id === offerId ? updated : prev));
    } catch (error) {
      console.error("Failed to update offer status", error);
    }
  };

  return (
    <>
      <DashboardHeader title="Offer management" />

      <div className="overflow-hidden rounded-2xl bg-[#F2F2F3] p-3 sm:p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-white p-1">
            <button
              type="button"
              onClick={() => {
                setTab("single");
                setCategoryFilter("all");
                resetPage();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === "single"
                  ? "bg-[#CBF0CB] text-[#00562C]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Single
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("combo");
                resetPage();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === "combo"
                  ? "bg-[#CBF0CB] text-[#00562C]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Combo
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

          {tab === "single" && (
            <div className="relative">
              <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  resetPage();
                }}
                className="h-11 min-w-[140px] cursor-pointer appearance-none rounded-full border-none bg-white py-2 pr-9 pl-9 text-sm outline-none"
              >
                <option value="all">Category</option>
                {OFFER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
            </div>
          )}

          {tab === "single" && (
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-xl bg-white text-[#00562C] shadow-sm"
              aria-label="Add"
            >
              <Plus className="size-5" />
            </button>
          )}

          <Button
            onClick={openCreate}
            className="h-11 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]"
          >
            Add Offer
          </Button>
        </div>

        {tab === "single" ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
            {pageOffers.map((offer) => (
              <div
                key={offer.id}
                role="button"
                tabIndex={0}
                onClick={() => openView(offer)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openView(offer);
                }}
                className="relative cursor-pointer overflow-hidden rounded-xl bg-white p-3 text-center shadow-sm transition hover:shadow-md"
              >
                <span
                  className={cn(
                    "absolute top-0 right-0 h-[35px] w-10 rounded-tr-[10px] rounded-bl-[10px]",
                    offer.status === "Active" ? "bg-[#49AE20]" : "bg-[#FF0000]"
                  )}
                />
                <div className="mb-2 flex h-20 items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={offer.image}
                    alt={offer.name}
                    className="max-h-20 w-auto object-contain"
                  />
                </div>
                <p className="text-sm font-bold text-gray-900">{offer.name}</p>
                <p className="text-xs text-gray-500">{offer.category}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-gray-500">
                  Validity: {offer.validityFrom} -<br />
                  {offer.validityTo}
                </p>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <span className="text-sm font-bold text-[#49AE20]">
                    {offer.offerPrice}
                  </span>
                  {offer.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {offer.originalPrice}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <ActionIcon
                    type="edit"
                    buttonClassName="size-9 rounded-lg border border-gray-200 bg-white"
                    onClick={() => openEdit(offer)}
                  />
                  <ActionIcon
                    type="delete"
                    buttonClassName="size-9 rounded-lg border border-gray-200 bg-white"
                    onClick={() => openDelete(offer.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pageOffers.map((offer) => (
              <div
                key={offer.id}
                role="button"
                tabIndex={0}
                onClick={() => openView(offer)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openView(offer);
                }}
                className="relative cursor-pointer overflow-hidden rounded-xl bg-white text-left shadow-sm transition hover:shadow-md"
              >
                <span
                  className={cn(
                    "absolute top-0 right-0 z-10 h-[35px] w-10 rounded-tr-[10px] rounded-bl-[10px]",
                    offer.status === "Active" ? "bg-[#49AE20]" : "bg-[#FF0000]"
                  )}
                />
                <div className="h-28 overflow-hidden bg-[#F2F2F3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={offer.image}
                    alt={offer.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-0.5 p-3 text-center">
                  <p className="text-sm font-bold text-gray-900">{offer.name}</p>
                  <p className="text-[10px] text-gray-500">
                    Validity: {offer.validityFrom} - {offer.validityTo}
                  </p>
                  <p className="text-xs text-gray-600">{offer.itemsSummary}</p>
                  <p className="text-sm font-bold text-[#49AE20]">
                    {offer.offerPrice.replace(",", ".")}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <ActionIcon
                      type="edit"
                      buttonClassName="size-9 rounded-lg border border-gray-200 bg-white"
                      onClick={() => openEdit(offer)}
                    />
                    <ActionIcon
                      type="delete"
                      buttonClassName="size-9 rounded-lg border border-gray-200 bg-white"
                      onClick={() => openDelete(offer.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pageOffers.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">
            No offers found.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
          <p className="text-sm text-gray-600">
            Showing {String(showingFrom).padStart(2, "0")}-
            {String(showingTo).padStart(2, "0")} of {filtered.length} Offer
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
                    ? "bg-[#CBF0CB] text-[#00562C]"
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

      <SingleOfferDetailsModal
        open={viewOpen && currentViewOffer?.type === "single"}
        offer={
          currentViewOffer?.type === "single" ? currentViewOffer : null
        }
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewOffer(null);
        }}
        onEdit={openEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={openDelete}
      />

      <ComboOfferDetailsModal
        open={viewOpen && currentViewOffer?.type === "combo"}
        offer={currentViewOffer?.type === "combo" ? currentViewOffer : null}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewOffer(null);
        }}
        onEdit={openEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={openDelete}
      />

      <SingleOfferFormModal
        open={singleFormOpen}
        mode={formMode}
        offer={editingOffer?.type === "single" ? editingOffer : null}
        catalog={catalog}
        onOpenChange={(open) => {
          setSingleFormOpen(open);
          if (!open) setEditingOffer(null);
        }}
        onSaveRequest={handleSingleSaveRequest}
      />

      <ComboOfferFormModal
        open={comboFormOpen}
        mode={formMode}
        offer={editingOffer?.type === "combo" ? editingOffer : null}
        catalog={catalog}
        onOpenChange={(open) => {
          setComboFormOpen(open);
          if (!open) setEditingOffer(null);
        }}
        onSaveRequest={handleComboSaveRequest}
      />

      <ConfirmSaveOfferDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        onConfirm={handleConfirmSave}
        offerName={
          pendingComboForm?.title ||
          pendingSingleForm?.product?.name ||
          "Kaffee Krumel"
        }
      />

      <DeleteOfferDialog
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
