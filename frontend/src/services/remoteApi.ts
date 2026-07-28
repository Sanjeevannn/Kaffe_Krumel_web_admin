import { api, uploadImageFromUrlIfNeeded } from "@/lib/api";
import type {
  BranchFormData,
  BranchRecord,
  BranchStatus,
  ComboOfferFormData,
  CustomizationFormData,
  CustomizationRecord,
  CustomizationStatus,
  Customer,
  ClosureReasonStat,
  DashboardStat,
  OfferCatalogProduct,
  OfferRecord,
  OfferStatus,
  Order,
  OrderPeriod,
  OrderStats,
  OrderStatus,
  ProductFormData,
  ProductRecord,
  ProductStatus,
  ProductTab,
  SalesProduct,
  BranchPerformance,
  SingleOfferFormData,
  StaffUser,
  StaffUserFormData,
  StaffStatus,
  SubCategoryFormData,
  SubCategoryRecord,
} from "@/types";

// --- Dashboard ---
export async function fetchDashboardStats(): Promise<DashboardStat[]> {
  const data = await api.get<{ stats: DashboardStat[] }>("/api/dashboard/stats");
  return data.stats;
}

// --- Products ---
export async function fetchProducts(type?: ProductTab) {
  const query = type ? `?type=${type}` : "";
  return api.get<ProductRecord[]>(`/api/products${query}`);
}

export async function createProduct(
  type: ProductTab,
  form: ProductFormData
): Promise<ProductRecord> {
  const image = await uploadImageFromUrlIfNeeded(form.image);
  return api.post<ProductRecord>("/api/products", { ...form, image, type });
}

export async function updateProduct(
  id: number,
  type: ProductTab,
  form: ProductFormData
): Promise<ProductRecord> {
  const image = await uploadImageFromUrlIfNeeded(form.image);
  return api.put<ProductRecord>(`/api/products/${id}`, {
    ...form,
    image,
    type,
  });
}

export async function deleteProduct(id: number) {
  return api.delete(`/api/products/${id}`);
}

export async function updateProductStatus(id: number, status: ProductStatus) {
  return api.patch<ProductRecord>(`/api/products/${id}/status`, { status });
}

export async function fetchSubCategories(category?: "Food" | "Drinks") {
  const query = category ? `?category=${category}` : "";
  return api.get<SubCategoryRecord[]>(`/api/sub-categories${query}`);
}

export async function createSubCategory(form: SubCategoryFormData) {
  const image = await uploadImageFromUrlIfNeeded(form.image);
  return api.post<SubCategoryRecord>("/api/sub-categories", { ...form, image });
}

export async function updateSubCategory(id: number, form: SubCategoryFormData) {
  const image = await uploadImageFromUrlIfNeeded(form.image);
  return api.put<SubCategoryRecord>(`/api/sub-categories/${id}`, {
    ...form,
    image,
  });
}

export async function fetchOfferCatalog() {
  return api.get<OfferCatalogProduct[]>("/api/products/catalog");
}

// --- Customizations ---
export async function fetchCustomizations(params?: {
  search?: string;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  const q = searchParams.toString();
  return api.get<CustomizationRecord[]>(
    `/api/customizations${q ? `?${q}` : ""}`
  );
}

export async function createCustomization(form: CustomizationFormData) {
  return api.post<CustomizationRecord>("/api/customizations", form);
}

export async function updateCustomization(
  id: number,
  form: CustomizationFormData
) {
  return api.put<CustomizationRecord>(`/api/customizations/${id}`, form);
}

export async function deleteCustomization(id: number) {
  return api.delete(`/api/customizations/${id}`);
}

export async function updateCustomizationStatus(
  id: number,
  status: CustomizationStatus
) {
  return api.patch<CustomizationRecord>(
    `/api/customizations/${id}/status`,
    { status }
  );
}

// --- Offers ---
export async function fetchOffers(type: "single" | "combo") {
  return api.get<OfferRecord[]>(`/api/offers?type=${type}`);
}

export async function createSingleOffer(form: SingleOfferFormData) {
  return api.post<OfferRecord>("/api/offers/single", form);
}

export async function createComboOffer(form: ComboOfferFormData) {
  const image = await uploadImageFromUrlIfNeeded(form.image);
  return api.post<OfferRecord>("/api/offers/combo", { ...form, image });
}

export async function updateSingleOffer(id: number, form: SingleOfferFormData) {
  return api.put<OfferRecord>(`/api/offers/single/${id}`, form);
}

export async function updateComboOffer(id: number, form: ComboOfferFormData) {
  const image = await uploadImageFromUrlIfNeeded(form.image);
  return api.put<OfferRecord>(`/api/offers/combo/${id}`, { ...form, image });
}

export async function deleteOffer(id: number) {
  return api.delete(`/api/offers/${id}`);
}

export async function updateOfferStatus(id: number, status: OfferStatus) {
  return api.patch<OfferRecord>(`/api/offers/${id}/status`, { status });
}

// --- Orders ---
export async function fetchOrders(params?: {
  period?: OrderPeriod;
  status?: OrderStatus;
  branch?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.period) searchParams.set("period", params.period);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.branch) searchParams.set("branch", params.branch);
  if (params?.search) searchParams.set("search", params.search);
  const q = searchParams.toString();
  return api.get<Order[]>(`/api/orders${q ? `?${q}` : ""}`);
}

export async function fetchOrderStats(period?: OrderPeriod) {
  const q = period ? `?period=${period}` : "";
  return api.get<OrderStats>(`/api/orders/stats${q}`);
}

export async function advanceOrderStatus(id: string) {
  return api.patch<Order>(`/api/orders/${id}/status`);
}

export async function deleteOrder(id: string) {
  return api.delete(`/api/orders/${id}`);
}

// --- Sales ---
export async function fetchSalesStats(period: OrderPeriod = "now") {
  return api.get<{
    productSold: string;
    todaysRevenue: string;
    weeklyRevenue: string;
    monthlyRevenue: string;
    totalRevenue: string;
  }>(`/api/sales/stats?period=${period}`);
}

export async function fetchTopProducts(params?: {
  period?: OrderPeriod;
  category?: string;
  subCategory?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.period) searchParams.set("period", params.period);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.subCategory) searchParams.set("subCategory", params.subCategory);
  if (params?.search) searchParams.set("search", params.search);
  const q = searchParams.toString();
  return api.get<SalesProduct[]>(`/api/sales/products${q ? `?${q}` : ""}`);
}

export async function fetchBranchPerformance(period: OrderPeriod = "now") {
  return api.get<BranchPerformance[]>(
    `/api/sales/branch-performance?period=${period}`
  );
}

// --- Branches ---
export async function fetchBranches(params?: {
  search?: string;
  status?: BranchStatus;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  const q = searchParams.toString();
  return api.get<BranchRecord[]>(`/api/branches${q ? `?${q}` : ""}`);
}

export async function fetchBranchStats() {
  return api.get<{
    totalBranch: number;
    activeBranch: number;
    inactiveBranch: number;
  }>("/api/branches/stats");
}

export async function createBranch(form: BranchFormData) {
  return api.post<BranchRecord>("/api/branches", form);
}

export async function updateBranch(id: number, form: BranchFormData) {
  return api.put<BranchRecord>(`/api/branches/${id}`, form);
}

export async function deleteBranch(id: number) {
  return api.delete(`/api/branches/${id}`);
}

export async function updateBranchStatus(id: number, status: BranchStatus) {
  return api.patch<BranchRecord>(`/api/branches/${id}/status`, { status });
}

// --- Staff / Users ---
export async function fetchStaffUsers(params?: {
  branch?: string;
  role?: string;
  status?: StaffStatus;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.branch) searchParams.set("branch", params.branch);
  if (params?.role) searchParams.set("role", params.role);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  const q = searchParams.toString();
  return api.get<StaffUser[]>(`/api/users${q ? `?${q}` : ""}`);
}

export async function fetchStaffStats() {
  return api.get<{
    totalBranch: number;
    totalUsers: number;
    admin: number;
    cashier: number;
  }>("/api/users/stats");
}

export async function createStaffUser(form: StaffUserFormData) {
  return api.post<StaffUser>("/api/users", form);
}

export async function updateStaffUser(id: number, form: StaffUserFormData) {
  return api.put<StaffUser>(`/api/users/${id}`, form);
}

export async function deleteStaffUser(id: number) {
  return api.delete(`/api/users/${id}`);
}

export async function updateStaffStatus(id: number, status: StaffStatus) {
  return api.patch<StaffUser>(`/api/users/${id}/status`, { status });
}

// --- Customers ---
export async function fetchCustomers(params?: {
  search?: string;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  const q = searchParams.toString();
  return api.get<Customer[]>(`/api/customers${q ? `?${q}` : ""}`);
}

export async function fetchCustomerStats() {
  return api.get<{
    totalCustomers: number;
    totalNewCustomers: number;
    accountDeleted: number;
  }>("/api/customers/stats");
}

export async function fetchClosureAnalysis() {
  return api.get<ClosureReasonStat[]>("/api/customers/closure-analysis");
}
