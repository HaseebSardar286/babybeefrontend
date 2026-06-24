import API from "./api";

// ── PKR currency helper ──────────────────────────────────────────────────────
export const formatPKR = (amount: number): string => {
  return "Rs. " + amount.toLocaleString("en-PK", { maximumFractionDigits: 0 });
};

// ── Product type matching the Java entity ──────────────────────────────────
export interface ProductVariant {
  size: string;
  color: string;
  price: number;
  stock: number;
  imageUrl?: string;
  images?: string[];
}

export interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number; // stored in PKR
  quantity: number;
  category: string;
  imageUrl?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  discountPercent?: number;
  section?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Product API ──────────────────────────────────────────────────────────────
export const getAllProducts = async (): Promise<BackendProduct[]> => {
  const res = await API.get("/products");
  return res.data.data;
};

export const getProductById = async (id: number): Promise<BackendProduct> => {
  const res = await API.get(`/products/${id}`);
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
  size?: string;
  color?: string;
}

// ── Cart API ──────────────────────────────────────────────────────────────────
export const getCartItems = async (): Promise<CartItem[]> => {
  const res = await API.get("/cart");
  return res.data.data;
};

export const addToCartAPI = async (
  productId: number,
  quantity: number,
  size?: string,
  color?: string
): Promise<CartItem> => {
  const res = await API.post("/cart/add", { productId, quantity, size, color });
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

// ── Wishlist types ────────────────────────────────────────────────────────────
export interface WishlistItem {
  id: number;
  product: BackendProduct;
}

// ── Wishlist API ──────────────────────────────────────────────────────────────

/** Returns all wishlist items for the authenticated user. */
export const getWishlistItems = async (): Promise<WishlistItem[]> => {
  const res = await API.get("/wishlist");
  return res.data.data;
};

/**
 * Toggles a product in the wishlist (server handles add/remove).
 * Returns { wishlisted: boolean, productId: number }
 */
export const toggleWishlistAPI = async (
  productId: number
): Promise<{ wishlisted: boolean; productId: number }> => {
  const res = await API.post(`/wishlist/toggle/${productId}`);
  return res.data.data;
};

/** Explicitly removes a product from the wishlist. */
export const removeFromWishlistAPI = async (productId: number): Promise<void> => {
  await API.delete(`/wishlist/${productId}`);
};