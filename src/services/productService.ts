import API from "./api";

// ── PKR currency helper ──────────────────────────────────────────────────────
export const formatPKR = (amount: number): string => {
  return "Rs. " + amount.toLocaleString("en-PK", { maximumFractionDigits: 0 });
};

// ── Product type matching the Java entity ──────────────────────────────────
export interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number; // stored in PKR
  quantity: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Product API ──────────────────────────────────────────────────────────────
export const getAllProducts = async (): Promise<BackendProduct[]> => {
  const res = await API.get("/products");
  return res.data.data;
};

export const searchProducts = async (keyword: string): Promise<BackendProduct[]> => {
  const res = await API.get("/products/search", { params: { keyword } });
  return res.data.data;
};

export const filterByCategory = async (category: string): Promise<BackendProduct[]> => {
  const res = await API.get("/products/filter", { params: { category } });
  return res.data.data;
};

// ── Cart types ────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number;
  product: BackendProduct;
  quantity: number;
}

// ── Cart API ──────────────────────────────────────────────────────────────────
export const getCartItems = async (): Promise<CartItem[]> => {
  const res = await API.get("/cart");
  return res.data.data;
};

export const addToCartAPI = async (productId: number, quantity: number): Promise<CartItem> => {
  const res = await API.post("/cart/add", { productId, quantity });
  return res.data.data;
};

export const removeFromCartAPI = async (cartItemId: number): Promise<void> => {
  await API.delete(`/cart/${cartItemId}`);
};

export const updateCartQtyAPI = async (cartItemId: number, quantity: number): Promise<CartItem> => {
  const res = await API.patch(`/cart/${cartItemId}`, null, { params: { quantity } });
  return res.data.data;
};

// ── Orders API ────────────────────────────────────────────────────────────────
export const placeOrderAPI = async () => {
  const res = await API.post("/orders/place");
  return res.data.data;
};