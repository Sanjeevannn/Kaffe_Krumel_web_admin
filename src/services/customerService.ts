import type { ClosureReasonStat, Customer, CustomerBranchInfo } from "@/types";

const BRANCHES: CustomerBranchInfo[] = [
  {
    name: "Jaffna Branch1",
    area: "Vali",
    totalSpend: "123,00 €",
    totalOrders: "2,45",
  },
  {
    name: "Jaffna Branch1",
    area: "Vali",
    totalSpend: "123,00 €",
    totalOrders: "2,45",
  },
  {
    name: "Jaffna Branch1",
    area: "Vali",
    totalSpend: "123,00 €",
    totalOrders: "2,45",
  },
];

export const INITIAL_CUSTOMERS: Customer[] = Array.from({ length: 30 }, (_, i) => {
  const isClosed = i % 5 === 0;
  return {
    id: i + 1,
    name: "Kishana",
    initials: "YK",
    email: "example@gmail.com",
    phone: "077662151548",
    orders: 2,
    spend: "123.00 €",
    status: isClosed ? "Account closed" : "Active",
    gender: "Not yet added",
    dateOfBirth: "12/04/2002",
    accountCreated: "06/02/2025",
    closureReason: isClosed
      ? "I couldn't find the features I needed."
      : undefined,
    branches: BRANCHES,
  };
});

export const CLOSURE_REASONS: ClosureReasonStat[] = [
  { id: 1, reason: "I couldn't find the features I needed.", count: 12 },
  { id: 2, reason: "I couldn't find the features I needed.", count: 12 },
  { id: 3, reason: "I couldn't find the features I needed.", count: 12 },
  { id: 4, reason: "I couldn't find the features I needed.", count: 12 },
  {
    id: 5,
    reason: "Other: I couldn't find the features I needed.",
    count: 1,
    isOther: true,
  },
];

export function getCustomerStats(customers: Customer[]) {
  return {
    totalCustomers: customers.length || 350,
    totalNewCustomers: 45,
    accountDeleted: customers.filter((c) => c.status === "Account closed")
      .length,
  };
}
