import type {
  CouponDateParts,
  CouponFormData,
  CouponHistoryRecord,
  CouponRecord,
  CouponStatus,
} from "@/types";

export const EMPTY_COUPON_DATE: CouponDateParts = {
  day: "",
  month: "",
  year: "",
};

export const EMPTY_COUPON_FORM: CouponFormData = {
  title: "",
  minOrder: "",
  discount: "",
  start: { ...EMPTY_COUPON_DATE },
  end: { ...EMPTY_COUPON_DATE },
};

export const COUPON_BRANCHES = ["Branch 1", "Branch 2", "Branch 3"];

export const INITIAL_COUPONS: CouponRecord[] = [
  {
    id: 1,
    couponId: "Cou123",
    title: "Min order 234 euro",
    code: "SummerOffer",
    minOrder: "123.00",
    discount: "10",
    validityFrom: "18/02/2025",
    validityTo: "21/02/2026",
    status: "Active",
    branch: "Branch 1",
  },
  {
    id: 2,
    couponId: "Cou124",
    title: "Min order 234 euro",
    code: "WeekendDeal",
    minOrder: "50.00",
    discount: "15",
    validityFrom: "18/02/2025",
    validityTo: "21/02/2026",
    status: "Inactive",
    branch: "Branch 1",
  },
  {
    id: 3,
    couponId: "Cou125",
    title: "Min order 234 euro",
    code: "Welcome10",
    minOrder: "30.00",
    discount: "10",
    validityFrom: "01/01/2024",
    validityTo: "31/12/2024",
    status: "Expired",
    branch: "Branch 2",
  },
  {
    id: 4,
    couponId: "Cou126",
    title: "Min order 234 euro",
    code: "CoffeeBoost",
    minOrder: "20.00",
    discount: "5",
    validityFrom: "18/02/2025",
    validityTo: "21/02/2026",
    status: "Active",
    branch: "Branch 2",
  },
  {
    id: 5,
    couponId: "Cou127",
    title: "Min order 234 euro",
    code: "PastryLove",
    minOrder: "40.00",
    discount: "12",
    validityFrom: "01/06/2024",
    validityTo: "01/06/2025",
    status: "Expired",
    branch: "Branch 3",
  },
];

export const INITIAL_COUPON_HISTORY: CouponHistoryRecord[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: i + 1,
    customerName: "Kishana",
    customerInitials: "YK",
    orderId: "OR123",
    couponId: "COU123",
    date: "12/02/2025",
    branch: COUPON_BRANCHES[i % COUPON_BRANCHES.length],
    orderTotal: "€ 123.00",
    saving: "-€8.90",
  })
);

export function formatCouponDate(parts: CouponDateParts) {
  const day = parts.day.padStart(2, "0");
  const month = parts.month.padStart(2, "0");
  return `${day}/${month}/${parts.year}`;
}

export function parseCouponDate(value: string): CouponDateParts {
  const [day = "", month = "", year = ""] = value.split("/");
  return { day, month, year };
}

export function couponDatePartsToLocalDate(parts: CouponDateParts): Date | null {
  const day = Number(parts.day);
  const month = Number(parts.month);
  const year = Number(parts.year);
  if (!day || !month || !year || year < 1000) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function validateCouponDateRange(
  start: CouponDateParts,
  end: CouponDateParts
): string | null {
  const startDate = couponDatePartsToLocalDate(start);
  const endDate = couponDatePartsToLocalDate(end);
  if (!startDate || !endDate) return "Please enter a valid start and end date.";
  if (endDate < startDate) return "End date must be after start date.";
  return null;
}

export function buildCouponCode(title: string) {
  const cleaned = title.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  if (!cleaned) return "Coupon";
  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function nextCouponId(coupons: CouponRecord[]) {
  const max = coupons.reduce((acc, c) => Math.max(acc, c.id), 0);
  return {
    id: max + 1,
    couponId: `Cou${String(max + 123).padStart(3, "0")}`,
  };
}

export function resolveCouponStatus(
  validityTo: string,
  preferred?: CouponStatus
): CouponStatus {
  const parts = parseCouponDate(validityTo);
  const end = couponDatePartsToLocalDate(parts);
  if (end) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (end < today) return "Expired";
  }
  if (preferred === "Inactive") return "Inactive";
  if (preferred === "Active") return "Active";
  return preferred ?? "Active";
}

export function couponStatusLabel(status: CouponStatus) {
  if (status === "Inactive") return "InActive";
  return status;
}

export function couponStatusClass(status: CouponStatus) {
  if (status === "Active") return "bg-[#49AE20]";
  if (status === "Inactive") return "bg-[#FF0000]";
  return "bg-[#F6A121]";
}

export function formatEuro(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) return "€ 0.00";
  const num = Number(cleaned);
  if (Number.isNaN(num)) return `€ ${cleaned}`;
  return `€ ${num.toFixed(2)}`;
}

export function formatDiscountLabel(discount: string) {
  const cleaned = discount.replace(/[^\d.]/g, "");
  return `${cleaned || "0"}% OFF`;
}
