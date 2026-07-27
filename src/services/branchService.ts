import type { BranchFormData, BranchRecord, DayHours } from "@/types";

export const BRANCH_COUNTRIES = [
  "Germany",
  "Sri Lanka",
  "United States",
  "United Kingdom",
  "India",
];

export const DEFAULT_DAY_HOURS: DayHours = {
  openHour: "00",
  openMinute: "00",
  openPeriod: "AM",
  closeHour: "00",
  closeMinute: "00",
  closePeriod: "PM",
};

const SAMPLE_DAY_HOURS: DayHours = {
  openHour: "09",
  openMinute: "00",
  openPeriod: "AM",
  closeHour: "04",
  closeMinute: "00",
  closePeriod: "PM",
};

export function formatDayHours(hours: DayHours) {
  return `${hours.openHour}:${hours.openMinute}${hours.openPeriod} - ${hours.closeHour}:${hours.closeMinute}${hours.closePeriod}`;
}

export const INITIAL_BRANCHES: BranchRecord[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: i + 1,
    name: `Branch ${(i % 5) + 1}`,
    manager: "Kishana",
    location: "123 Main St, New York, United states of America",
    status: i % 5 === 0 ? "Inactive" : "Active",
    description: "Main coffee branch",
    locationName: "Main Warehouse",
    locationCode: `DE-BER-WH-00${(i % 9) + 1}`,
    street: "Friedrichstraße 120",
    city: "Berlin",
    country: "Germany",
    latitude: "79.8612",
    longitude: "6.9271",
    weekdayHours: { ...SAMPLE_DAY_HOURS },
    saturdayHours: { ...SAMPLE_DAY_HOURS },
    sundayHours: { ...SAMPLE_DAY_HOURS },
    contactNumber: "1234 5678 9123",
    email: "example@gmial.com",
  })
);

export function getBranchStats(branches: BranchRecord[]) {
  return {
    totalBranch: branches.length,
    activeBranch: branches.filter((b) => b.status === "Active").length,
    inactiveBranch: branches.filter((b) => b.status === "Inactive").length,
  };
}

export const EMPTY_BRANCH_FORM: BranchFormData = {
  name: "",
  manager: "",
  description: "",
  locationName: "",
  locationCode: "",
  street: "",
  city: "",
  country: "",
  latitude: "",
  longitude: "",
  weekdayHours: { ...DEFAULT_DAY_HOURS },
  saturdayHours: { ...DEFAULT_DAY_HOURS },
  sundayHours: { ...DEFAULT_DAY_HOURS },
  contactNumber: "",
  email: "",
};
