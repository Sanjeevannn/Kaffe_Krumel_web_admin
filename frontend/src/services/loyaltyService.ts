import type {
  LoyaltyPointsHistoryRecord,
  LoyaltySettingRule,
} from "@/types";

export const LOYALTY_BRANCHES = ["Branch 1", "Branch 2", "Branch 3"];

export const INITIAL_LOYALTY_HISTORY: LoyaltyPointsHistoryRecord[] = Array.from(
  { length: 30 },
  (_, i) => {
    const earn = i % 3 !== 1;
    return {
      id: i + 1,
      date: "12/02/2025",
      customerName: "Kishana",
      customerInitials: "YK",
      orderId: "OR123",
      branch: LOYALTY_BRANCHES[i % LOYALTY_BRANCHES.length],
      points: earn ? 150 : -10,
      balance: "€ 123.00",
    };
  }
);

export const INITIAL_LOYALTY_SETTINGS: LoyaltySettingRule[] = [
  {
    id: "min-redemption-points",
    section: "general",
    sectionTitle: "General Setting",
    label: "Minimum points needed for redemption",
    value: "50",
  },
  {
    id: "points-per-euro",
    section: "general",
    sectionTitle: "General Setting",
    label: "Points per euro spent",
    value: "0.1",
  },
];

export const LOYALTY_SETTING_SECTIONS: {
  key: LoyaltySettingRule["section"];
  title: string;
}[] = [{ key: "general", title: "General Settings" }];
