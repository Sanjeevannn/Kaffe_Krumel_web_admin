"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ComboOfferDetailsModal from "@/components/models/ComboOfferDetailsModal";
import SingleOfferDetailsModal from "@/components/models/SingleOfferDetailsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { OFFER_CATEGORIES } from "@/services/offerService";
import {
  deleteOffer as deleteOfferApi,
  fetchBranches,
  fetchOffers,
  updateOfferStatus,
} from "@/services/remoteApi";
import type { BranchRecord, OfferRecord, OfferStatus, OfferTab } from "@/types";

const PAGE_SIZE = 10;

export default function OfferManagement() {
  const [singleOffers, setSingleOffers] = useState<OfferRecord[]>([]);
  const [comboOffers, setComboOffers] = useState<OfferRecord[]>([]);
  const [tab, setTab] = useState<OfferTab>("single");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewOffer, setViewOffer] = useState<OfferRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
      setSingleOffers([]);
      setComboOffers([]);
    }
  };

  useEffect(() => {
    loadOffers();
    fetchBranches()
      .then(setBranches)
      .catch(() => setBranches([]));
  }, []);

  const source = tab === "single" ? singleOffers : comboOffers;

  const filtered = useMemo(() => {
    let result = source;

    if (branchFilter !== "all") {
      const branchId = Number(branchFilter);
      result = result.filter((o) => o.branchId === branchId);
    }

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
  }, [source, tab, search, categoryFilter, branchFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageOffers = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + PAGE_SIZE, filtered.length);

  const resetPage = () => setCurrentPage(1);

  const openView = (offer: OfferRecord) => {
    setViewOffer(offer);
    setDetailsOpen(true);
  };

  const currentViewOffer = viewOffer
    ? (source.find((o) => o.id === viewOffer.id) ?? viewOffer)
    : null;

  const updateOfferStatusLocal = async (
    offerId: number,
    status: OfferStatus,
    offerType: OfferRecord["type"]
  ) => {
    try {
      const updated = await updateOfferStatus(offerId, status);
      if (offerType === "single") {
        setSingleOffers((prev) =>
          prev.map((o) => (o.id === offerId ? updated : o))
        );
      } else {
        setComboOffers((prev) =>
          prev.map((o) => (o.id === offerId ? updated : o))
        );
      }
      setViewOffer((prev) => (prev?.id === offerId ? updated : prev));
    } catch (error) {
      console.error("Failed to update offer status", error);
    }
  };

  const deleteOffer = async (offerId: number, offerType: OfferRecord["type"]) => {
    try {
      await deleteOfferApi(offerId);
      if (offerType === "single") {
        setSingleOffers((prev) => prev.filter((o) => o.id !== offerId));
      } else {
        setComboOffers((prev) => prev.filter((o) => o.id !== offerId));
      }
      setDetailsOpen(false);
      setViewOffer(null);
    } catch (error) {
      console.error("Failed to delete offer", error);
    }
  };

  return (
    <>
      <DashboardHeader title="Offer management" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F2F2F3] px-4 py-3">
        <div className="relative">
          <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#00562C]" />
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              resetPage();
            }}
            className="h-10 min-w-[170px] cursor-pointer appearance-none rounded-full border-none bg-white py-2 pr-9 pl-9 text-sm text-gray-700 outline-none"
          >
            <option value="all">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={String(branch.id)}>
                {branch.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
        </div>
        <Button className="h-10 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]">
          <Download className="size-4" />
          Download CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#F2F2F3] p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-white p-1">
            <button
              type="button"
              onClick={() => {
                setTab("single");
                resetPage();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === "single"
                  ? "bg-[#e8f5ee] text-[#00562C]"
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
                  ? "bg-[#e8f5ee] text-[#00562C]"
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

          {tab === "single" ? (
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
          ) : (
            <Button className="h-11 rounded-full bg-[#00562C] px-5 text-white hover:bg-[#004522]">
              Add Offer
            </Button>
          )}
        </div>

        {tab === "single" ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
            {pageOffers.map((offer) => (
              <button
                key={offer.id}
                type="button"
                onClick={() => openView(offer)}
                className="relative overflow-hidden rounded-xl bg-white p-3 text-center shadow-sm transition hover:shadow-md"
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
                    <span className="text-xs text-[#49AE20]/70 line-through">
                      {offer.originalPrice}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pageOffers.map((offer) => (
              <button
                key={offer.id}
                type="button"
                onClick={() => openView(offer)}
                className="relative overflow-hidden rounded-xl bg-white text-left shadow-sm transition hover:shadow-md"
              >
                <span
                  className={cn(
                    "absolute top-0 right-0 z-10 h-[35px] w-10 rounded-tr-[10px] rounded-bl-[10px]",
                    offer.status === "Active" ? "bg-[#49AE20]" : "bg-[#FF0000]"
                  )}
                />
                <div className="h-24 overflow-hidden bg-[#F2F2F3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={offer.image}
                    alt={offer.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-0.5 p-2 text-center">
                  <p className="text-sm font-bold text-gray-900">
                    {offer.name}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Validity: {offer.validityFrom} - {offer.validityTo}
                  </p>
                  <p className="text-xs text-gray-600">{offer.itemsSummary}</p>
                  <p className="text-sm font-bold text-[#49AE20]">
                    {offer.offerPrice.replace("€ ", "€")}
                  </p>
                </div>
              </button>
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
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(
              (page) => (
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
              )
            )}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex size-8 items-center justify-center rounded-full text-gray-600 hover:bg-[#F2F2F3] disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <SingleOfferDetailsModal
        open={detailsOpen && currentViewOffer?.type === "single"}
        offer={currentViewOffer?.type === "single" ? currentViewOffer : null}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setViewOffer(null);
        }}
        onToggleStatus={(offerId, status) => {
          if (currentViewOffer) {
            updateOfferStatusLocal(offerId, status, currentViewOffer.type);
          }
        }}
        onDelete={(offerId) => {
          if (currentViewOffer) {
            deleteOffer(offerId, currentViewOffer.type);
          }
        }}
      />

      <ComboOfferDetailsModal
        open={detailsOpen && currentViewOffer?.type === "combo"}
        offer={currentViewOffer?.type === "combo" ? currentViewOffer : null}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setViewOffer(null);
        }}
        onToggleStatus={(offerId, status) => {
          if (currentViewOffer) {
            updateOfferStatusLocal(offerId, status, currentViewOffer.type);
          }
        }}
        onDelete={(offerId) => {
          if (currentViewOffer) {
            deleteOffer(offerId, currentViewOffer.type);
          }
        }}
      />
    </>
  );
}
