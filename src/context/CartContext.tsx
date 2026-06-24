"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  CartItem,
  getCartItems,
  addToCartAPI,
  removeFromCartAPI,
  updateCartQtyAPI,
} from "@/src/services/productService";

interface CartContextType {
  items: CartItem[];
  count: number;
  loading: boolean;
  addToCart: (productId: number, qty?: number, size?: string, color?: string) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQty: (cartItemId: number, quantity: number) => Promise<void>;
  refresh: () => Promise<void>;
  toastMessage: string | null;
}

const CartContext = createContext<CartContextType>({
  items: [],
  count: 0,
  loading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQty: async () => {},
  refresh: async () => {},
  toastMessage: null,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const data = await getCartItems();
      setItems(data ?? []);
    } catch {
      // Not logged in or token expired — silently ignore
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const addToCart = async (productId: number, qty = 1, size?: string, color?: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please log in to add items to cart");
      return;
    }
    setLoading(true);
    try {
      await addToCartAPI(productId, qty, size, color);
      await refresh();
      showToast("Added to cart! 🛒");
    } catch {
      showToast("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    setLoading(true);
    try {
      await removeFromCartAPI(cartItemId);
      setItems((prev) => prev.filter((i) => i.id !== cartItemId));
      showToast("Item removed");
    } catch {
      showToast("Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    setLoading(true);
    try {
      const updated = await updateCartQtyAPI(cartItemId, quantity);
      setItems((prev) => prev.map((i) => (i.id === cartItemId ? updated : i)));
    } catch {
      showToast("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, loading, addToCart, removeFromCart, updateQty, refresh, toastMessage }}>
      {children}
      {/* Global Toast */}
      {toastMessage && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {toastMessage}
        </div>
      )}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
