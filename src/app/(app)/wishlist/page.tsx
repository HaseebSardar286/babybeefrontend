"use client";

import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useWishlist } from "@/src/context/WishlistContext";
import { useCart } from "@/src/context/CartContext";
import { formatPKR, BackendProduct } from "@/src/services/productService";
import { useState, useEffect } from "react";

const CARD_COLORS = ["#f7f0e8", "#e8f0e8", "#e8eef5", "#f5eee8", "#eee8f5", "#e8f5f0"];
const CARD_EMOJIS = ["👕", "🧥", "🌿", "🛏️", "🍼", "🎁", "👶", "🧸"];

function WishlistCard({ product, index }: { product: BackendProduct; index: number }) {
  const { remove, isWishlisted, toggle } = useWishlist();
  const { addToCart, loading: cartLoading } = useCart();
  const [reviews, setReviews] = useState<{ rating: number }[]>([]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    fetch(`${baseUrl}/products/${product.id}/reviews`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setReviews(res.data);
      })
      .catch(() => {});
  }, [product.id]);

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";
  const ratingNum = totalReviews > 0 ? Math.round(Number(avgRating)) : 0;

  const isDiscounted = product.discountPercent !== undefined && product.discountPercent > 0;
  const finalPrice =
    isDiscounted && product.discountPercent
      ? product.price * (1 - product.discountPercent / 100)
      : product.price;

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg flex flex-col relative">
      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        className="block relative overflow-hidden aspect-square flex items-center justify-center"
        style={{ backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }}
      >
        {product.imageUrl || (product.images && product.images[0]) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl || (product.images && product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-7xl">{CARD_EMOJIS[index % CARD_EMOJIS.length]}</span>
        )}

        {/* Badges */}
        {isDiscounted ? (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-bold text-white bg-amber-500 uppercase tracking-widest z-10">
            {product.discountPercent}% Off
          </span>
        ) : (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-bold text-white bg-teal-600 uppercase tracking-widest z-10">
            New
          </span>
        )}
      </Link>

      {/* Heart toggle button */}
      <button
        onClick={() => toggle(product)}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={wishlisted ? "#b5374a" : "none"}
          stroke="#b5374a"
          strokeWidth={1.8}
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm text-gray-800 hover:text-[#b5374a] transition-colors leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex gap-0.5 text-amber-400 text-xs mt-1.5 items-center">
          {[...Array(5)].map((_, i) => (
            <span key={i}>{i < ratingNum ? "★" : "☆"}</span>
          ))}
          <span className="text-[10px] text-gray-400 ml-1">({avgRating})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2 mb-4">
          {isDiscounted ? (
            <>
              <span className="font-bold text-sm text-[#b5374a]">{formatPKR(finalPrice)}</span>
              <span className="text-xs text-gray-400 line-through">{formatPKR(product.price)}</span>
            </>
          ) : (
            <span className="font-bold text-sm text-gray-800">{formatPKR(product.price)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => addToCart(product.id, 1)}
            disabled={cartLoading}
            className="flex-1 py-2.5 rounded-full text-white font-bold text-[10px] uppercase tracking-wider bg-[#b5374a] hover:bg-[#8c2536] transition-colors shadow-sm cursor-pointer disabled:opacity-60"
          >
            {cartLoading ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={() => remove(product.id)}
            className="w-10 h-10 flex-shrink-0 rounded-full border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
            title="Remove from wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 hover:text-red-400">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zm0 1.5h2.5c.69 0 1.25.56 1.25 1.25v.31a43.552 43.552 0 00-5 0v-.31c0-.69.56-1.25 1.25-1.25zM7.5 7.5a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5zm3.5 0a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  // items is now WishlistItem[] — each has .id and .product
  const { items, count, loading } = useWishlist();
  const { addToCart, loading: cartLoading } = useCart();

  // Skeleton loader — show while first loading with items expected
  if (loading && count === 0) {
    return (
      <>
        <main className="min-h-screen pt-10" style={{ backgroundColor: "var(--color-cream)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 rounded-full animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-100 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                    <div className="h-8 bg-gray-100 rounded-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Empty state
  if (!loading && count === 0) {
    return (
      <>
        <main
          className="min-h-screen flex flex-col items-center justify-center"
          style={{ backgroundColor: "var(--color-cream)" }}
        >
          <div className="text-center max-w-sm px-6">
            {/* Animated heart */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-rose-50 animate-pulse" />
              <div className="relative flex items-center justify-center w-full h-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#b5374a"
                  strokeWidth={1.2}
                  className="w-16 h-16 opacity-40"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--color-text-dark)" }}>
              Your wishlist is empty
            </h1>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--color-text-light)" }}>
              Save the items you love by tapping the heart icon on any product.
              They&apos;ll all appear here for easy access!
            </p>
            <Link href="/products" className="btn-primary px-8 py-3 inline-block rounded-full font-bold text-sm">
              Explore Products
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
        {/* Header section with decorative gradient */}
        <div
          className="relative pt-10 pb-12 mb-4 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #fff5f7 0%, #fdf6f0 60%, #f0f7f4 100%)" }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ backgroundColor: "#f8c8cc" }} />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: "#b5d8c8" }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="text-xs mb-5" style={{ color: "var(--color-text-light)" }}>
              <Link href="/" className="hover:underline">Home</Link>{" "}
              ›{" "}
              <span style={{ color: "var(--color-primary)" }}>Wishlist</span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#b5374a" className="w-7 h-7 flex-shrink-0">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                  <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-dark)" }}>
                    My Wishlist
                  </h1>
                </div>
                <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
                  {count} {count === 1 ? "item" : "items"} saved
                </p>
              </div>

              {/* Add all to cart — uses item.product for each WishlistItem */}
              {count > 0 && (
                <button
                  onClick={() => {
                    items.forEach((wishlistItem) => addToCart(wishlistItem.product.id, 1));
                  }}
                  disabled={cartLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-[#b5374a] text-white hover:bg-[#8c2536] transition-colors shadow-sm disabled:opacity-60 cursor-pointer flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                  </svg>
                  Add All to Cart
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          {/* Product Grid — renders item.product for each WishlistItem */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {items.map((wishlistItem, index) => (
              <WishlistCard
                key={wishlistItem.id}
                product={wishlistItem.product}
                index={index}
              />
            ))}
          </div>

          {/* Benefits Strip */}
          <div
            className="mt-12 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
            style={{ backgroundColor: "var(--color-blush)" }}
          >
            {[
              { icon: "🔔", title: "Price Drop Alerts", sub: "We'll notify you when prices drop" },
              { icon: "🔄", title: "Easy Returns", sub: "30-day hassle-free returns" },
              { icon: "🚚", title: "Fast Delivery", sub: "2-4 days nationwide" },
            ].map((b) => (
              <div key={b.title}>
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="font-semibold text-xs" style={{ color: "var(--color-text-dark)" }}>{b.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-light)" }}>{b.sub}</p>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 flex items-center justify-center">
            <Link href="/products" className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
