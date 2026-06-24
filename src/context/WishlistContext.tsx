"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  WishlistItem,
  BackendProduct,
  getWishlistItems,
  toggleWishlistAPI,
  removeFromWishlistAPI,
} from "@/src/services/productService";

interface WishlistContextType {
  items: WishlistItem[];
  ids: number[];            // set of wishlisted product IDs for O(1) lookup
  count: number;
  loading: boolean;
  isWishlisted: (productId: number) => boolean;
  toggle: (product: BackendProduct) => Promise<void>;
  remove: (productId: number) => Promise<void>;
  refresh: () => Promise<void>;
  toastMessage: string | null;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  ids: [],
  count: 0,
  loading: false,
  isWishlisted: () => false,
  toggle: async () => {},
  remove: async () => {},
  refresh: async () => {},
  toastMessage: null,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derived: set of wishlisted product IDs for quick lookup
  const ids = items.map((i) => i.product.id);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  /** Fetches the full wishlist from the server (requires auth). */
  const refresh = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || token === "null") return; // unauthenticated — nothing to load
    try {
      const data = await getWishlistItems();
      setItems(data ?? []);
    } catch {
      // Silently ignore (e.g. token expired)
      setItems([]);
    }
  }, []);

  // Load wishlist on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWishlisted = (productId: number) => ids.includes(productId);

  /**
   * Toggle a product in/out of the wishlist.
   * If the user is not logged in, shows a login prompt toast instead.
   * Performs optimistic UI update for instant feedback.
   */
  const toggle = async (product: BackendProduct) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || token === "null") {
      showToast("Please log in to save to your wishlist 🔒");
      return;
    }

    const alreadyIn = ids.includes(product.id);

    // Optimistic update
    if (alreadyIn) {
      setItems((prev) => prev.filter((i) => i.product.id !== product.id));
    } else {
      // Add a temporary local entry so the heart fills instantly
      setItems((prev) => [...prev, { id: Date.now(), product }]);
    }

    try {
      const result = await toggleWishlistAPI(product.id);
      if (result.wishlisted) {
        showToast("Added to wishlist ♡");
        // Replace the temporary entry with the real one from server
        await refresh();
      } else {
        showToast("Removed from wishlist");
      }
    } catch {
      // Roll back optimistic update on error
      showToast("Something went wrong. Please try again.");
      await refresh();
    }
  };

  /**
   * Removes a product from the wishlist (used by the wishlist page trash button).
   */
  const remove = async (productId: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || token === "null") return;

    // Optimistic update
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    try {
      await removeFromWishlistAPI(productId);
      showToast("Removed from wishlist");
    } catch {
      showToast("Failed to remove item. Please try again.");
      await refresh();
    }
  };

  const count = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, ids, count, loading, isWishlisted, toggle, remove, refresh, toastMessage }}
    >
      {children}

      {/* Global Toast */}
      {toastMessage && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg flex items-center gap-2 animate-fadeIn"
          style={{ backgroundColor: "#b5374a" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 flex-shrink-0"
          >
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.184C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.593l-.012.007-.005.002-.002.001a.752.752 0 01-.704 0l-.002-.001z" />
          </svg>
          {toastMessage}
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
