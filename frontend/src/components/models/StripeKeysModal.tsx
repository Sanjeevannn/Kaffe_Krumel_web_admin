"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import {
  fetchStripePublicKey,
  saveStripeKeys,
} from "@/services/remoteApi";
import type { BranchRecord } from "@/types";

interface StripeKeysModalProps {
  open: boolean;
  branch: BranchRecord | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export default function StripeKeysModal({
  open,
  branch,
  onOpenChange,
  onSaved,
}: StripeKeysModalProps) {
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [hasExisting, setHasExisting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !branch) return;

    let cancelled = false;
    setError("");
    setSecretKey("");
    setWebhookSecret("");
    setShowSecret(false);
    setShowWebhook(false);
    setLoading(true);

    fetchStripePublicKey(branch.id)
      .then((data) => {
        if (cancelled) return;
        setPublicKey(data.stripePublicKey || "");
        setHasExisting(true);
      })
      .catch(() => {
        if (cancelled) return;
        setPublicKey("");
        setHasExisting(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, branch]);

  const handleSave = async () => {
    if (!branch) return;

    const pub = publicKey.trim();
    const sec = secretKey.trim();
    const wh = webhookSecret.trim();

    if (!pub) {
      setError("Stripe public key is required.");
      return;
    }
    if (!hasExisting && !sec) {
      setError("Stripe private key is required.");
      return;
    }
    if (!hasExisting && !wh) {
      setError("Stripe webhook secret is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await saveStripeKeys({
        branchId: branch.id,
        stripePublicKey: pub,
        ...(sec ? { stripeSecretKey: sec } : {}),
        ...(wh ? { webhookSecret: wh } : {}),
      });
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to save Stripe keys. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="space-y-4 p-4 sm:p-6">
          <DialogHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <DialogTitle className="text-xl font-bold text-[#00562C]">
                Stripe Keys
              </DialogTitle>
              <p className="mt-1 text-sm text-gray-600">
                {branch?.name ?? "Branch"} — public, private & webhook keys
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

          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">Loading…</p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-900">
                  Stripe Public Key
                </Label>
                <Input
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="pk_live_… or pk_test_…"
                  className="h-11 rounded-xl border-none bg-[#F2F2F3] font-mono text-sm"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-900">
                  Stripe Private Key
                </Label>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder={
                      hasExisting
                        ? "Leave blank to keep current private key"
                        : "sk_live_… or sk_test_…"
                    }
                    className="h-11 rounded-xl border-none bg-[#F2F2F3] pr-10 font-mono text-sm"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showSecret ? "Hide key" : "Show key"}
                  >
                    {showSecret ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-900">
                  Webhook Secret Key
                </Label>
                <div className="relative">
                  <Input
                    type={showWebhook ? "text" : "password"}
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    placeholder={
                      hasExisting
                        ? "Leave blank to keep current webhook secret"
                        : "whsec_…"
                    }
                    className="h-11 rounded-xl border-none bg-[#F2F2F3] pr-10 font-mono text-sm"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhook((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={
                      showWebhook ? "Hide webhook secret" : "Show webhook secret"
                    }
                  >
                    {showWebhook ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {hasExisting ? (
                  <p className="text-[11px] text-gray-500">
                    Private & webhook secrets are never shown again. Enter new
                    values only to replace them.
                  </p>
                ) : null}
              </div>

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <div className="flex gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  className="h-10 flex-1 rounded-full bg-[#F2F2F3] text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-10 flex-1 rounded-full bg-[#00562C] text-sm text-white hover:bg-[#004522]"
                >
                  {saving ? "Saving…" : hasExisting ? "Update Keys" : "Save Keys"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
