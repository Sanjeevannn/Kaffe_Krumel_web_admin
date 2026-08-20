import type { DashboardStat, NavItem } from "@/types";
import { DASHBOARD_ICONS_PATH } from "@/lib/constants";

export const SUPERADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/superadmin/dashboard", icon: "layout-dashboard" },
  { label: "Product", href: "/superadmin/product", icon: "cup-soda" },
  { label: "Customization", href: "/superadmin/customization", icon: "settings-2" },
  { label: "Offer", href: "/superadmin/offer", icon: "badge-percent" },
  { label: "Loyalty points", href: "/superadmin/loyalty-points", icon: "star" },
  { label: "Coupon", href: "/superadmin/coupon", icon: "ticket-percent" },
  { label: "Sales", href: "/superadmin/sales", icon: "chart-line" },
  { label: "Orders", href: "/superadmin/orders", icon: "clipboard-list" },
  { label: "POS Orders", href: "/superadmin/pos-orders", icon: "monitor" },
  { label: "Branch", href: "/superadmin/branch", icon: "store" },
  { label: "Users", href: "/superadmin/users", icon: "users" },
  { label: "Customers", href: "/superadmin/customers", icon: "user-round" },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "layout-dashboard" },
  { label: "Product", href: "/admin/product", icon: "cup-soda" },
  { label: "Offer", href: "/admin/offer", icon: "badge-percent" },
  { label: "Loyalty points", href: "/admin/loyalty-points", icon: "star" },
  { label: "Coupon", href: "/admin/coupon", icon: "ticket-percent" },
  { label: "Sales", href: "/admin/sales", icon: "chart-line" },
  { label: "Orders", href: "/admin/orders", icon: "clipboard-list" },
  { label: "POS Orders", href: "/admin/pos-orders", icon: "monitor" },
];

export const DASHBOARD_STATS: DashboardStat[] = [
  { label: "Product Sold", value: "1.234", logo: `${DASHBOARD_ICONS_PATH}/product_sold.svg` },
  { label: "Today's Revenue", value: "123,00 €", logo: `${DASHBOARD_ICONS_PATH}/todays_revenue.svg` },
  { label: "Weekly Revenue", value: "123,00 €", logo: `${DASHBOARD_ICONS_PATH}/weekly_revenue.svg` },
  { label: "Monthly Revenue", value: "123,00 €", logo: `${DASHBOARD_ICONS_PATH}/monthly_revenue.svg` },
  { label: "Total Revenue", value: "123,00 €", logo: `${DASHBOARD_ICONS_PATH}/total_revenue.svg` },
  { label: "Total Branch", value: "10", logo: `${DASHBOARD_ICONS_PATH}/total_branch.svg` },
  { label: "Pending orders", value: "45", logo: `${DASHBOARD_ICONS_PATH}/pending_orders.svg` },
  { label: "Total Users", value: "45", logo: `${DASHBOARD_ICONS_PATH}/total_users.svg` },
  { label: "Admin", value: "35", logo: `${DASHBOARD_ICONS_PATH}/admin.svg` },
  { label: "Cashier", value: "10", logo: `${DASHBOARD_ICONS_PATH}/cashier.svg` },
];
