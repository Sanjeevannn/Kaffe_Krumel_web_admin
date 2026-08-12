import { DASHBOARD_ICONS_PATH } from "@/lib/constants";
import type {
  BranchRecord,
  DashboardCategory,
  DashboardStat,
  Order,
  OrderItem,
  ProductRecord,
  StaffUser,
} from "@/types";

const DASHBOARD_ICONS: Record<string, string> = {
  "Product Sold": `${DASHBOARD_ICONS_PATH}/product_sold.svg`,
  "Today's Revenue": `${DASHBOARD_ICONS_PATH}/todays_revenue.svg`,
  "Weekly Revenue": `${DASHBOARD_ICONS_PATH}/weekly_revenue.svg`,
  "Monthly Revenue": `${DASHBOARD_ICONS_PATH}/monthly_revenue.svg`,
  "Total Revenue": `${DASHBOARD_ICONS_PATH}/total_revenue.svg`,
  "Total Branch": `${DASHBOARD_ICONS_PATH}/total_branch.svg`,
  "Pending orders": `${DASHBOARD_ICONS_PATH}/pending_orders.svg`,
  "Total Users": `${DASHBOARD_ICONS_PATH}/total_users.svg`,
  Admin: `${DASHBOARD_ICONS_PATH}/admin.svg`,
  Cashier: `${DASHBOARD_ICONS_PATH}/cashier.svg`,
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toOrderDateLabel(date: Date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
}

function formatEuro(amount: number) {
  return `${Number(amount || 0).toFixed(2)} €`;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function buildProductTypeByName(products: ProductRecord[]) {
  const map = new Map<string, "food" | "drinks">();
  for (const product of products) {
    map.set(product.name.trim().toLowerCase(), product.type);
  }
  return map;
}

function resolveItemType(
  item: OrderItem,
  productTypeByName: Map<string, "food" | "drinks">
) {
  if (item.productType) return item.productType;
  return productTypeByName.get(item.name.trim().toLowerCase()) ?? null;
}

function itemMatchesCategory(
  item: OrderItem,
  category: DashboardCategory,
  productTypeByName: Map<string, "food" | "drinks">
) {
  if (category === "all") return true;
  return resolveItemType(item, productTypeByName) === category;
}

function orderHasCategoryItems(
  order: Order,
  category: DashboardCategory,
  productTypeByName: Map<string, "food" | "drinks">
) {
  if (category === "all") return true;
  return (order.items ?? []).some((item) =>
    itemMatchesCategory(item, category, productTypeByName)
  );
}

export function buildDashboardStats(
  orders: Order[],
  products: ProductRecord[],
  branches: BranchRecord[],
  staff: StaffUser[],
  category: DashboardCategory
): DashboardStat[] {
  const productTypeByName = buildProductTypeByName(products);
  const now = new Date();
  const todayLabel = toOrderDateLabel(now);
  const weekFrom = startOfDay(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
  );
  const monthFrom = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));

  let productSold = 0;
  let todayRevenue = 0;
  let weeklyRevenue = 0;
  let monthlyRevenue = 0;
  let totalRevenue = 0;

  const completedOrders = orders.filter((order) => order.status === "Completed");

  for (const order of completedOrders) {
    const matchingItems = (order.items ?? []).filter((item) =>
      itemMatchesCategory(item, category, productTypeByName)
    );
    if (!matchingItems.length) continue;

    const itemRevenue = roundMoney(
      matchingItems.reduce((sum, item) => sum + item.total, 0)
    );
    const itemCount = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
    const createdAt = order.orderDate
      ? parseOrderDate(order.orderDate)
      : null;

    productSold += itemCount;
    totalRevenue = roundMoney(totalRevenue + itemRevenue);

    if (order.orderDate === todayLabel) {
      todayRevenue = roundMoney(todayRevenue + itemRevenue);
    }
    if (createdAt && createdAt >= weekFrom && createdAt <= endOfDay(now)) {
      weeklyRevenue = roundMoney(weeklyRevenue + itemRevenue);
    }
    if (createdAt && createdAt >= monthFrom && createdAt <= endOfDay(now)) {
      monthlyRevenue = roundMoney(monthlyRevenue + itemRevenue);
    }
  }

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Pending" &&
      orderHasCategoryItems(order, category, productTypeByName)
  ).length;

  const adminCount = staff.filter((user) => user.role === "Admin").length;
  const cashierCount = staff.filter((user) => user.role === "Cashier").length;

  const labels = [
    { label: "Product Sold", value: String(productSold) },
    { label: "Today's Revenue", value: formatEuro(todayRevenue) },
    { label: "Weekly Revenue", value: formatEuro(weeklyRevenue) },
    { label: "Monthly Revenue", value: formatEuro(monthlyRevenue) },
    { label: "Total Revenue", value: formatEuro(totalRevenue) },
    { label: "Total Branch", value: String(branches.length) },
    { label: "Pending orders", value: String(pendingOrders) },
    { label: "Total Users", value: String(staff.length) },
    { label: "Admin", value: String(adminCount) },
    { label: "Cashier", value: String(cashierCount) },
  ];

  return labels.map((item) => ({
    ...item,
    logo: DASHBOARD_ICONS[item.label],
  }));
}

function parseOrderDate(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}
