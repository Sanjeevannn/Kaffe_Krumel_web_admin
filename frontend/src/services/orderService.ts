import type { Order, OrderPeriod, OrderStats, OrderStatus } from "@/types";

const ORDER_ITEMS_TEMPLATE = [
  {
    name: "Bread",
    unitPrice: 3.15,
    quantity: 1,
    total: 3.15,
  },
  {
    name: "Amercian Macho",
    size: "Medium",
    unitPrice: 3.15,
    quantity: 1,
    total: 3.15,
    customizations: [
      { name: "Signature expresso", price: 1 },
      { name: "Extra Ice", price: 1 },
    ],
  },
];

function createOrder(
  id: string,
  status: OrderStatus,
  period: OrderPeriod,
  branch = "Bracnh1"
): Order {
  return {
    id,
    customerName: "Kishana",
    customerInitials: "YK",
    branch,
    email: "example@gmail.com",
    itemCount: 2,
    amount: 3.15,
    status,
    period,
    orderTime: "04:23:09PM",
    orderDate: "06/06/2026",
    items: ORDER_ITEMS_TEMPLATE,
  };
}

const statuses: OrderStatus[] = [
  "In-Progress",
  "Ready",
  "Completed",
  "Pending",
  "In-Progress",
  "Ready",
  "Completed",
  "In-Progress",
  "Ready",
  "Completed",
];

const periods: OrderPeriod[] = [
  "now",
  "now",
  "now",
  "now",
  "now",
  "now",
  "now",
  "now",
  "now",
  "now",
  "weekly",
  "weekly",
  "weekly",
  "weekly",
  "weekly",
  "weekly",
  "weekly",
  "weekly",
  "monthly",
  "monthly",
  "monthly",
  "monthly",
  "monthly",
  "monthly",
  "monthly",
  "monthly",
  "monthly",
  "monthly",
];

export const INITIAL_ORDERS: Order[] = periods.map((period, index) => {
  const orderNumber = 1234 - index;
  return createOrder(
    `Or ${orderNumber}`,
    statuses[index % statuses.length],
    period,
    index % 3 === 0 ? "Jaffna Branch1" : "Bracnh1"
  );
});

export function getOrderStats(orders: Order[]): OrderStats {
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "Pending").length,
    inProgressOrders: orders.filter((o) => o.status === "In-Progress").length,
    completedOrders: orders.filter((o) => o.status === "Completed").length,
    totalCustomers: new Set(orders.map((o) => o.email)).size || 45,
    productSold: "1,234",
    todaysRevenue: "123,00 €",
    weeklyRevenue: "123,00 €",
    monthlyRevenue: "123,00 €",
    totalRevenue: "123,00 €",
  };
}

export function filterOrdersByPeriod(
  orders: Order[],
  period: OrderPeriod
): Order[] {
  if (period === "now") {
    return orders.filter((o) => o.period === "now");
  }
  if (period === "weekly") {
    return orders.filter((o) => o.period === "now" || o.period === "weekly");
  }
  return orders;
}

export function getStatusStepIndex(status: OrderStatus): number {
  const steps: OrderStatus[] = ["Pending", "In-Progress", "Ready", "Completed"];
  // Map Pending to Ordered (step 0)
  if (status === "Pending") return 0;
  return steps.indexOf(status);
}
