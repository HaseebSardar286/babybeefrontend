import API from "./api";
import { BackendProduct } from "./productService";

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  parent?: BackendCategory | null;
  displayOrder?: number;
}

export const getAllCategoriesAPI = async (): Promise<BackendCategory[]> => {
  const res = await API.get("/categories");
  return res.data;
};

export const createCategoryAPI = async (data: any): Promise<BackendCategory> => {
  const res = await API.post("/categories/admin/new", data);
  return res.data.data;
};

export const updateCategoryAPI = async (id: number, data: any): Promise<BackendCategory> => {
  const res = await API.put(`/categories/admin/${id}`, data);
  return res.data.data;
};

export const deleteCategoryAPI = async (id: number): Promise<void> => {
  await API.delete(`/categories/admin/${id}`);
};

export const getExistingImagesAPI = async (): Promise<string[]> => {
  const res = await API.get("/admin/images");
  return res.data.data;
};

export interface AdminOrder {
  id: number;
  userEmail: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
}

export const getAllOrdersAPI = async (): Promise<AdminOrder[]> => {
  const res = await API.get("/orders/admin/allOrders");
  return res.data.data;
};

export const updateOrderStatusAPI = async (id: number, status: string): Promise<AdminOrder> => {
  const res = await API.put(`/orders/admin/${id}/status`, { status });
  return res.data.data;
};

export const getAllCustomersAPI = async (): Promise<AdminCustomer[]> => {
  const res = await API.get("/admin/customers");
  return res.data.data;
};

export const updateCustomerStatusAPI = async (id: number, status: string): Promise<AdminCustomer> => {
  const res = await API.put(`/admin/customers/${id}/status`, { status });
  return res.data.data;
};

export const addProductAPI = async (data: any): Promise<BackendProduct> => {
  const res = await API.post("/admin/products", data);
  return res.data;
};

export const updateProductAPI = async (id: number, data: any): Promise<BackendProduct> => {
  const res = await API.put(`/admin/products/${id}`, data);
  return res.data;
};

export const deleteProductAPI = async (id: number): Promise<void> => {
  await API.delete(`/admin/products/${id}`);
};

export interface MediaItem {
  id: number;
  url: string;
  createdAt?: string;
}

export const getAllMediaAPI = async (): Promise<MediaItem[]> => {
  const res = await API.get("/admin/media");
  return res.data.data;
};

export const addMediaAPI = async (url: string): Promise<MediaItem> => {
  const res = await API.post("/admin/media", { url });
  return res.data.data;
};

export const deleteMediaAPI = async (id: number): Promise<void> => {
  await API.delete(`/admin/media/${id}`);
};


