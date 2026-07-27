export type UserRole = "admin" | "superadmin";

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedUser extends AuthUser {
  redirectTo: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
}

export type NavIcon =
  | "layout-dashboard"
  | "cup-soda"
  | "settings-2"
  | "badge-percent"
  | "chart-line"
  | "clipboard-list"
  | "store"
  | "users"
  | "user-round";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
}

export interface DashboardStat {
  label: string;
  value: string;
  logo: string;
}

export type OrderStatus = "Pending" | "In-Progress" | "Ready" | "Completed";

export type OrderPeriod = "now" | "weekly" | "monthly";

export interface OrderCustomization {
  name: string;
  price: number;
}

export interface OrderItem {
  name: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  total: number;
  customizations?: OrderCustomization[];
}

export interface Order {
  id: string;
  customerName: string;
  customerInitials: string;
  avatarUrl?: string;
  branch: string;
  email: string;
  itemCount: number;
  amount: number;
  status: OrderStatus;
  period: OrderPeriod;
  orderTime: string;
  orderDate: string;
  items: OrderItem[];
}

export type SalesTab = "top-products" | "branch-performance";

export interface SalesProduct {
  id: number;
  name: string;
  category: "Food" | "Drinks";
  subCategory: string;
  branch: string;
  unit: number;
  revenue: number;
  period: OrderPeriod;
}

export interface BranchPerformance {
  id: number;
  name: string;
  area: string;
  totalRevenue: string;
  totalOrders: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalCustomers: number;
  productSold: string;
  todaysRevenue: string;
  weeklyRevenue: string;
  monthlyRevenue: string;
  totalRevenue: string;
}

export type StaffRole = "Admin" | "Cashier";
export type StaffStatus = "Active" | "Inactive";

export interface StaffUser {
  id: number;
  branch: string;
  username: string;
  manager: string;
  createdAt: string;
  role: StaffRole;
  status: StaffStatus;
  password?: string;
}

export interface StaffUserFormData {
  role: StaffRole | "";
  branch: string;
  manager: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export type CustomerStatus = "Active" | "Account closed";
export type CustomerTab = "directory" | "closure-analysis";

export interface CustomerBranchInfo {
  name: string;
  area: string;
  totalSpend: string;
  totalOrders: string;
}

export interface Customer {
  id: number;
  name: string;
  initials: string;
  email: string;
  phone: string;
  orders: number;
  spend: string;
  status: CustomerStatus;
  gender: string;
  dateOfBirth: string;
  accountCreated: string;
  closureReason?: string;
  branches: CustomerBranchInfo[];
}

export interface ClosureReasonStat {
  id: number;
  reason: string;
  count: number;
  isOther?: boolean;
}

export type BranchStatus = "Active" | "Inactive";

export type AmPm = "AM" | "PM";

export interface DayHours {
  openHour: string;
  openMinute: string;
  openPeriod: AmPm;
  closeHour: string;
  closeMinute: string;
  closePeriod: AmPm;
}

export interface BranchFormData {
  name: string;
  manager: string;
  description: string;
  locationName: string;
  locationCode: string;
  street: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  weekdayHours: DayHours;
  saturdayHours: DayHours;
  sundayHours: DayHours;
  contactNumber: string;
  email: string;
}

export interface BranchRecord {
  id: number;
  name: string;
  manager: string;
  location: string;
  status: BranchStatus;
  description: string;
  locationName: string;
  locationCode: string;
  street: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  weekdayHours: DayHours;
  saturdayHours: DayHours;
  sundayHours: DayHours;
  contactNumber: string;
  email: string;
}

export type OfferStatus = "Active" | "Inactive";
export type OfferTab = "single" | "combo";

export interface OfferProductItem {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  quantity: number;
  discount?: string;
}

export interface OfferRecord {
  id: number;
  type: OfferTab;
  name: string;
  category: string;
  status: OfferStatus;
  image: string;
  validityFrom: string;
  validityTo: string;
  offerPrice: string;
  originalPrice?: string;
  description: string;
  itemsSummary?: string;
  products?: OfferProductItem[];
}

export interface OfferCatalogProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
}

export interface OfferDateParts {
  day: string;
  month: string;
  year: string;
}

export interface SingleOfferFormData {
  start: OfferDateParts;
  end: OfferDateParts;
  product: OfferCatalogProduct | null;
  offerPrice: string;
}

export interface ComboOfferFormProduct {
  key: string;
  productId: number;
  name: string;
  category: string;
  price: string;
  image: string;
  quantity: number;
  discount: string;
}

export interface ComboOfferFormData {
  image: string;
  title: string;
  description: string;
  start: OfferDateParts;
  end: OfferDateParts;
  products: ComboOfferFormProduct[];
}

export type ProductTab = "food" | "drinks";
export type ProductStatus = "Active" | "Inactive";

export interface DrinkInclusiveItem {
  id: string;
  customizationName: string;
  group: string;
  defaultOption: string;
  pumps: string;
}

export interface DrinkSizeOption {
  id: string;
  sizeName: string;
  price: string;
  status: ProductStatus;
  collapsed: boolean;
  included: DrinkInclusiveItem[];
}

export interface ProductFormData {
  name: string;
  subCategory: string;
  price: string;
  description: string;
  image: string;
  sizes?: DrinkSizeOption[];
}

export interface ProductRecord {
  id: number;
  type: ProductTab;
  name: string;
  subCategory: string;
  price: string;
  description: string;
  image: string;
  status: ProductStatus;
  sizes?: DrinkSizeOption[];
}

export interface SubCategoryFormData {
  image: string;
  category: "Food" | "Drinks" | "";
  name: string;
}

export interface SubCategoryRecord {
  id: number;
  name: string;
  category: "Food" | "Drinks";
  image: string;
}

export type CustomizationStatus = "Active" | "Inactive";
export type SelectionType = "Select" | "Scale" | "Checkbox";

export interface CustomizationOption {
  id: string;
  name: string;
  price: string;
}

export interface CustomizationGroup {
  id: string;
  subtitle: string;
  selectionType: SelectionType | "";
  status: CustomizationStatus;
  collapsed: boolean;
  options: CustomizationOption[];
}

export interface CustomizationFormData {
  name: string;
  groups: CustomizationGroup[];
}

export interface CustomizationRecord {
  id: number;
  name: string;
  status: CustomizationStatus;
  groups: CustomizationGroup[];
}
