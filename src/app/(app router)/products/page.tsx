"use client";

import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllProducts, filterByCategory, searchProducts, BackendProduct, formatPKR } from "@/src/services/productService";
import { useCart } from "@/src/context/CartContext";

const sizes = ["Newborn", "0-3 Months", "3-6 Months", "6-12 Months", "12-24 Months"];
const colorDots = ["#d4a373", "#8aab97", "#9ac1d4", "#c9a96e", "#b5c4b1"];
const categories = ["All", "apparel", "clothing", "toys", "nursery", "feeding", "wellness"];
const CARD_COLORS = ["#f7f0e8", "#e8f0e8", "#e8eef5", "#f5eee8", "#eee8f5", "#e8f5f0"];
const CARD_EMOJIS = ["👕", "🧥", "🌿", "🛏️", "🍼", "🎁", "👶", "🧸"];

export default function ProductsPage() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [keyword, setKeyword] = useState("");
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let data: BackendProduct[];
      if (selectedCategory === "All") {
        data = await getAllProducts();
      } else {
        data = await filterByCategory(selectedCategory);
      }
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) { fetchProducts(); return; }
    setLoading(true);
    try {
      const data = await searchProducts(keyword.trim());
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs" style={{ color: "var(--color-text-light)" }}>
          <Link href="/">Home</Link> › <span style={{ color: "var(--color-primary)" }}>Products</span>
        </div>

        {/* Header + Search */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--color-text-dark)" }}>Baby Products</h1>
          <p className="text-sm max-w-md mb-5" style={{ color: "var(--color-text-mid)" }}>
            Thoughtfully crafted items made from organic cotton and soft bamboo.
          </p>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search products..."
              className="input-field"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Search
            </button>
          </form>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-16 flex gap-8">
          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside className="w-44 flex-shrink-0 hidden md:block">
            {/* Size filter (UI only — backend doesn't have size field) */}
            <div className="mb-8">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-text-dark)" }}>Size</h3>
              <div className="flex flex-col gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-left transition-all duration-200"
                    style={
                      selectedSize === s
                        ? { backgroundColor: "var(--color-primary)", color: "white" }
                        : { backgroundColor: "var(--color-blush)", color: "var(--color-text-mid)" }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color dots */}
            <div className="mb-8">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-text-dark)" }}>Colors</h3>
              <div className="flex flex-wrap gap-2">
                {colorDots.map((c) => (
                  <button
                    key={c}
                    className="w-7 h-7 rounded-full border-2 border-white transition-transform hover:scale-110"
                    style={{ backgroundColor: c, boxShadow: "0 0 0 1px var(--color-sand)" }}
                  />
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="mb-8">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-text-dark)" }}>Collections</h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 cursor-pointer text-xs"
                    style={{ color: "var(--color-text-mid)" }}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="accent-rose-700"
                    />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <button
              className="w-full py-2 rounded-full text-sm border-2 transition-all"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              onClick={() => { setSelectedCategory("All"); setSelectedSize(null); setKeyword(""); fetchProducts(); }}
            >
              Clear Filters
            </button>
          </aside>

          {/* ── Product Grid ──────────────────────────────────────── */}
          <div className="flex-1">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
                {loading ? "Loading..." : `${sorted.length} product${sorted.length !== 1 ? "s" : ""} found`}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: "var(--color-text-mid)" }}>Sort by</span>
                <select
                  className="rounded-lg px-3 py-1.5 border text-sm outline-none"
                  style={{ borderColor: "var(--color-sand)", color: "var(--color-text-dark)", backgroundColor: "white" }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48" style={{ backgroundColor: "var(--color-sand)" }} />
                    <div className="p-4 space-y-2">
                      <div className="h-4 rounded" style={{ backgroundColor: "var(--color-blush-mid)" }} />
                      <div className="h-3 w-2/3 rounded" style={{ backgroundColor: "var(--color-blush-mid)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-semibold" style={{ color: "var(--color-text-dark)" }}>No products found</p>
                <p className="text-sm mt-2" style={{ color: "var(--color-text-light)" }}>Try adjusting your filters or search term.</p>
                <button
                  onClick={() => { setSelectedCategory("All"); setKeyword(""); fetchProducts(); }}
                  className="btn-primary mt-6"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {sorted.map((product, i) => (
                  <div
                    key={product.id}
                    className="rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                    style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                  >
                    <Link href={`/products/${product.id}`} style={{ display: "block" }}>
                      <div
                        className="h-48 flex items-center justify-center text-6xl relative"
                        style={{ backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }}
                      >
                        {CARD_EMOJIS[i % CARD_EMOJIS.length]}
                        {product.category && (
                          <span
                            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: "var(--color-primary)" }}
                          >
                            {product.category}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold text-sm mb-0.5" style={{ color: "var(--color-text-dark)" }}>
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs mb-3" style={{ color: "var(--color-text-light)" }}>
                        {product.description?.slice(0, 40) || product.category}
                        {product.description && product.description.length > 40 ? "..." : ""}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base" style={{ color: "var(--color-primary)" }}>
                          {formatPKR(product.price)}
                        </span>
                        <button
                          onClick={() => addToCart(product.id, 1)}
                          disabled={cartLoading}
                          className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold transition-transform hover:scale-105"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
