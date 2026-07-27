import type {
  CustomizationGroup,
  CustomizationOption,
  CustomizationRecord,
  CustomizationStatus,
} from "@/types";

export const SELECTION_TYPES = ["Select", "Scale", "Checkbox"] as const;

export function createEmptyOption(): CustomizationOption {
  return {
    id: crypto.randomUUID(),
    name: "",
    price: "0",
  };
}

export function createEmptyGroup(_index: number): CustomizationGroup {
  return {
    id: crypto.randomUUID(),
    subtitle: "",
    selectionType: "",
    status: "Active",
    collapsed: false,
    options: [],
  };
}

const SAMPLE_GROUPS: CustomizationGroup[] = [
  {
    id: "g1",
    subtitle: "Add Syrups",
    selectionType: "Scale",
    status: "Active",
    collapsed: false,
    options: [
      { id: "o1", name: "Chocolate", price: "1" },
      { id: "o2", name: "Vanilla", price: "1" },
    ],
  },
  {
    id: "g2",
    subtitle: "Add Syrups",
    selectionType: "Select",
    status: "Active",
    collapsed: false,
    options: [
      { id: "o3", name: "Chocolate", price: "1" },
      { id: "o4", name: "Vanilla", price: "1" },
    ],
  },
  {
    id: "g3",
    subtitle: "Add Sauce",
    selectionType: "Select",
    status: "Active",
    collapsed: false,
    options: [
      { id: "o5", name: "Dark Caramel Sauce", price: "0.5" },
    ],
  },
];

function makeRecord(
  id: number,
  name: string,
  status: CustomizationStatus
): CustomizationRecord {
  return {
    id,
    name,
    status,
    groups: SAMPLE_GROUPS.map((g) => ({
      ...g,
      id: `${g.id}-${id}`,
      options: g.options.map((o) => ({ ...o, id: `${o.id}-${id}` })),
    })),
  };
}

export const INITIAL_CUSTOMIZATIONS: CustomizationRecord[] = Array.from(
  { length: 30 },
  (_, i) =>
    makeRecord(
      i + 1,
      "Flavours",
      i === 1 ? "Inactive" : "Active"
    )
);

export const EMPTY_CUSTOMIZATION_FORM = {
  name: "",
  groups: [] as CustomizationGroup[],
};
