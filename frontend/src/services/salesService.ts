import type { BranchPerformance, OrderPeriod, SalesProduct } from "@/types";

const PRODUCT_ROWS: Array<
  [string, "Food" | "Drinks", string, number, OrderPeriod]
> = [
  ["Caramel Macchiato", "Drinks", "Tea", 125, "now"],
  ["Iced Latte", "Food", "Tea", 110, "now"],
  ["Frappuccino", "Drinks", "Hot Drinks", 100, "now"],
  ["Vanilla Sweet Cream Cold Brew", "Drinks", "Hot Drinks", 98, "now"],
  ["Cappuccino", "Food", "Milkshakes", 96, "now"],
  ["Mocha", "Drinks", "Milkshakes", 83, "now"],
  ["Mocha", "Food", "Coffee", 76, "now"],
  ["Mocha", "Drinks", "Juice", 71, "now"],
  ["Mocha", "Food", "Juice", 65, "now"],
  ["Mocha", "Food", "Mojito", 55, "now"],
  ["Mocha", "Drinks", "Coffee", 52, "now"],
  ["Espresso", "Drinks", "Coffee", 49, "weekly"],
  ["Flat White", "Drinks", "Coffee", 45, "weekly"],
  ["Croissant", "Food", "Coffee", 42, "weekly"],
  ["Cheese Cake", "Food", "Milkshakes", 40, "weekly"],
  ["Brownie", "Food", "Juice", 38, "weekly"],
  ["Green Tea", "Drinks", "Tea", 35, "weekly"],
  ["Black Tea", "Drinks", "Tea", 32, "monthly"],
  ["Lemon Mojito", "Drinks", "Mojito", 30, "monthly"],
  ["Mint Mojito", "Drinks", "Mojito", 28, "monthly"],
  ["Orange Juice", "Drinks", "Juice", 25, "monthly"],
  ["Sandwich", "Food", "Hot Drinks", 22, "monthly"],
];

export const SALES_PRODUCTS: SalesProduct[] = PRODUCT_ROWS.map(
  ([name, category, subCategory, unit, period], index) => ({
    id: index + 1,
    name,
    category,
    subCategory,
    branch: "Bracnh1",
    unit,
    revenue: 123,
    period,
  })
);

export const BRANCH_PERFORMANCE: BranchPerformance[] = Array.from(
  { length: 10 },
  (_, index) => ({
    id: index + 1,
    name: "Jaffna Branch1",
    area: "Vali",
    totalRevenue: "123,00 €",
    totalOrders: "2,45",
  })
);

export const SUB_CATEGORIES = [
  "Tea",
  "Hot Drinks",
  "Milkshakes",
  "Coffee",
  "Juice",
  "Mojito",
];

export function filterSalesByPeriod(
  products: SalesProduct[],
  period: OrderPeriod
): SalesProduct[] {
  if (period === "now") {
    return products.filter((p) => p.period === "now");
  }
  if (period === "weekly") {
    return products.filter((p) => p.period === "now" || p.period === "weekly");
  }
  return products;
}
