"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
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
  createEmptyGroup,
  createEmptyOption,
  EMPTY_CUSTOMIZATION_FORM,
  SELECTION_TYPES,
} from "@/services/customizationService";
import type {
  CustomizationFormData,
  CustomizationGroup,
  CustomizationOption,
  CustomizationRecord,
  CustomizationStatus,
  SelectionType,
} from "@/types";

interface CustomizationFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  customization?: CustomizationRecord | null;
  onOpenChange: (open: boolean) => void;
  onSaveRequest: (data: CustomizationFormData) => void;
}

export default function CustomizationFormModal({
  open,
  mode,
  customization,
  onOpenChange,
  onSaveRequest,
}: CustomizationFormModalProps) {
  const [form, setForm] = useState<CustomizationFormData>(EMPTY_CUSTOMIZATION_FORM);
  const [nameInput, setNameInput] = useState("");
  const [showGroups, setShowGroups] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (mode === "edit" && customization) {
      setForm({
        name: customization.name,
        groups: customization.groups.map((g) => ({
          ...g,
          options: g.options.map((o) => ({ ...o })),
        })),
      });
      setNameInput(customization.name);
      setShowGroups(true);
      return;
    }
    setForm(EMPTY_CUSTOMIZATION_FORM);
    setNameInput("");
    setShowGroups(false);
  }, [open, mode, customization]);

  const groups = form.groups;

  const updateGroups = (next: CustomizationGroup[]) => {
    setForm((prev) => ({ ...prev, groups: next }));
  };

  const updateGroup = (groupId: string, patch: Partial<CustomizationGroup>) => {
    updateGroups(
      groups.map((g) => (g.id === groupId ? { ...g, ...patch } : g))
    );
  };

  const updateOption = (
    groupId: string,
    optionId: string,
    patch: Partial<CustomizationOption>
  ) => {
    updateGroups(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((o) =>
                o.id === optionId ? { ...o, ...patch } : o
              ),
            }
          : g
      )
    );
  };

  const handleAddGroup = () => {
    if (!showGroups) {
      if (!nameInput.trim()) {
        setError("Please enter a customization name.");
        return;
      }
      setError("");
      setForm({
        name: nameInput.trim(),
        groups: [createEmptyGroup(1)],
      });
      setShowGroups(true);
      return;
    }

    updateGroups([...groups, createEmptyGroup(groups.length + 1)]);
  };

  const handleRemoveGroup = (groupId: string) => {
    const next = groups.filter((g) => g.id !== groupId);
    updateGroups(next);
    if (next.length === 0) {
      setShowGroups(false);
    }
  };

  const handleAddOption = (groupId: string) => {
    updateGroup(groupId, {
      options: [
        ...groups.find((g) => g.id === groupId)!.options,
        createEmptyOption(),
      ],
    });
  };

  const handleRemoveOption = (groupId: string, optionId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    updateGroup(groupId, {
      options: group.options.filter((o) => o.id !== optionId),
    });
  };

  const handleNext = () => {
    if (!showGroups) {
      if (!nameInput.trim()) {
        setError("Please enter a customization name.");
        return;
      }
      setError("Please click Add Group to continue.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter a customization name.");
      return;
    }

    if (groups.length === 0) {
      setError("Please add at least one group.");
      return;
    }

    const invalidGroup = groups.find(
      (g) => !g.subtitle.trim() || !g.selectionType
    );
    if (invalidGroup) {
      setError("Please fill Sub Title and Selection type for every group.");
      return;
    }

    setError("");
    onSaveRequest(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[94vh] max-w-lg overflow-hidden rounded-3xl border-none p-0 shadow-xl"
      >
        <div className="max-h-[94vh] space-y-4 overflow-y-auto p-4 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader className="flex flex-row items-start justify-between space-y-0">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {mode === "create" ? "Add Customization" : "Edit Customization"}
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

          {!showGroups ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customization-name">Group Name</Label>
                <Input
                  id="customization-name"
                  placeholder="eg; Flavour"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="h-11 rounded-xl border-none bg-[#F2F2F3]"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddGroup}
                className="h-11 w-full rounded-xl border-[#00562C] bg-white text-[#00562C] hover:bg-[#e8f5ee]"
              >
                Add Group
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customization-name-full">
                  Customization Name
                </Label>
                <Input
                  id="customization-name-full"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="h-11 rounded-xl border-none bg-[#F2F2F3]"
                />
              </div>

              <p className="text-sm font-medium text-gray-900">Option</p>

              {groups.map((group, index) => {
                const isActive = group.status === "Active";
                return (
                  <div
                    key={group.id}
                    className="space-y-3 rounded-2xl bg-[#e8f5ee] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Group {index + 1}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-3 py-0.5 text-xs font-medium text-white",
                            isActive ? "bg-[#49AE20]" : "bg-[#FF0000]"
                          )}
                        >
                          {isActive ? "Active" : "In -Active"}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          onClick={() =>
                            updateGroup(group.id, {
                              status: isActive ? "Inactive" : "Active",
                            })
                          }
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            isActive ? "bg-[#49AE20]" : "bg-[#FF0000]"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                              isActive ? "left-5" : "left-0.5"
                            )}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateGroup(group.id, {
                              collapsed: !group.collapsed,
                            })
                          }
                          className="flex size-8 items-center justify-center rounded-lg bg-white text-gray-600 hover:bg-gray-50"
                          aria-label={
                            group.collapsed ? "Expand group" : "Collapse group"
                          }
                        >
                          {group.collapsed ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronUp className="size-4" />
                          )}
                        </button>
                        <ActionIcon
                          type="delete"
                          size={18}
                          buttonClassName="size-8 rounded-lg bg-white"
                          onClick={() => handleRemoveGroup(group.id)}
                          label="Delete group"
                        />
                      </div>
                    </div>

                    {!group.collapsed && (
                      <>
                        <div className="space-y-2">
                          <Label>Sub Title</Label>
                          <Input
                            placeholder="eg; Add Syrups"
                            value={group.subtitle}
                            onChange={(e) =>
                              updateGroup(group.id, {
                                subtitle: e.target.value,
                              })
                            }
                            className="h-11 rounded-xl border-none bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Selection type</Label>
                          <div className="relative">
                            <select
                              value={group.selectionType}
                              onChange={(e) =>
                                updateGroup(group.id, {
                                  selectionType: e.target
                                    .value as SelectionType,
                                })
                              }
                              className="h-11 w-full cursor-pointer appearance-none rounded-xl border-none bg-white px-3 text-sm outline-none"
                            >
                              <option value="">Select</option>
                              {SELECTION_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Option</Label>
                          {group.options.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-2"
                            >
                              <Input
                                placeholder="New option"
                                value={option.name}
                                onChange={(e) =>
                                  updateOption(group.id, option.id, {
                                    name: e.target.value,
                                  })
                                }
                                className="h-10 flex-1 rounded-xl border-none bg-white"
                              />
                              <div className="relative w-24 shrink-0">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                                  €
                                </span>
                                <Input
                                  value={option.price}
                                  onChange={(e) =>
                                    updateOption(group.id, option.id, {
                                      price: e.target.value,
                                    })
                                  }
                                  className="h-10 rounded-xl border-none bg-white pl-7"
                                />
                              </div>
                              <ActionIcon
                                type="delete"
                                size={16}
                                buttonClassName="size-9 shrink-0 rounded-lg bg-white"
                                onClick={() =>
                                  handleRemoveOption(group.id, option.id)
                                }
                                label="Delete option"
                              />
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddOption(group.id)}
                            className="h-10 rounded-xl border-[#00562C] bg-white text-sm text-[#00562C] hover:bg-[#e8f5ee]"
                          >
                            Add Option
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddGroup}
                className="h-11 w-full rounded-xl border-[#00562C] bg-white text-[#00562C] hover:bg-[#e8f5ee]"
              >
                Add Group
              </Button>
            </div>
          )}

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
