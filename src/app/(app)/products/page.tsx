"use client";

import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { getAllProducts, filterByCategory, searchProducts, BackendProduct, formatPKR } from "@/src/services/productService";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { useSearchParams } from "next/navigation";
import QuickViewModal from "@/src/components/QuickViewModal";

const sizes = ["Newborn", "0-3 Months", "3-6 Months", "6-12 Months", "12-24 Months"];
const colorDots = ["#d4a373", "#8aab97", "#9ac1d4", "#c9a96e", "#b5c4b1"];
const categories = ["All", "apparel", "clothing", "toys", "nursery", "feeding", "wellness"];
const CARD_COLORS = ["#f7f0e8", "#e8f0e8", "#e8eef5", "#f5eee8", "#eee8f5", "#e8f5f0"];
const CARD_EMOJIS = ["👕", "🧥", "🌿", "🛏️", "🍼", "🎁", "👶", "🧸"];

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

interface ProductGridCardProps {
  product: BackendProduct;
  index: number;
  addToCart: (id: number, qty: number) => void;
  cartLoading: boolean;
  cols: number;
  onQuickView: (id: number) => void;
}

function ProductGridCard({ product, index, addToCart, cartLoading, cols, onQuickView }: ProductGridCardProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    fetch(`${baseUrl}/products/${product.id}/reviews`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setReviews(res.data);
        }
      })
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [product.id]);

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const ratingNum = totalReviews > 0 ? Math.round(Number(avgRating)) : 0;

  const isDiscounted = product.discountPercent !== undefined && product.discountPercent > 0;
  const finalPrice = isDiscounted && product.discountPercent ? product.price * (1 - product.discountPercent / 100) : product.price;

  // Extract sizes to display in subtext
  const sizesText = product.sizes && product.sizes.length > 0 
    ? product.sizes.slice(0, 3).join(" • ") + (product.sizes.length > 3 ? " +" : "")
    : "";

  return (
    <div
      className="rounded-2xl bg-white border border-[#ebd0d3]/30 hover:border-[#ebd0d3]/70 hover:shadow-[0_20px_45px_-8px_rgba(77,57,61,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden pb-3 h-full"
    >
      {/* Wishlist heart button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggle(product);
        }}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-3.5 right-3.5 z-30 w-8.5 h-8.5 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={wishlisted ? "#9c2a3b" : "none"}
          stroke="#9c2a3b"
          strokeWidth={2}
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>

      <Link href={`/products/${product.id}`} className="block relative overflow-hidden aspect-square flex items-center justify-center bg-gray-50 border-b border-gray-100/30">
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }}
        />
        {product.imageUrl || (product.images && product.images[0]) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl || (product.images && product.images[0])}
            alt={product.name}
            className="relative z-10 w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        ) : (
          <span className="text-6xl z-10 group-hover:scale-105 transition-transform duration-500">{CARD_EMOJIS[index % CARD_EMOJIS.length]}</span>
        )}

        {/* Hover overlay with buttons in the center */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-center items-center p-3 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              addToCart(product.id, 1);
            }}
            disabled={cartLoading}
            className="w-[130px] h-10 rounded-full text-white font-bold text-[9px] uppercase tracking-widest bg-transparent border-2 border-white hover:bg-[#9c2a3b] hover:border-[#9c2a3b] transition-all flex items-center justify-center cursor-pointer shadow-md"
          >
            {cartLoading ? "Adding..." : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onQuickView(product.id);
            }}
            className="w-[130px] h-10 rounded-full text-gray-850 font-bold text-[9px] uppercase tracking-widest bg-white hover:bg-gray-55 transition-all flex items-center justify-center cursor-pointer shadow-md border border-gray-250/20"
          >
            Quick View
          </button>
        </div>

        {/* Badges on the left */}
        <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 items-start">
          {isDiscounted ? (
            <span className="px-2.5 py-1 rounded text-[8px] font-extrabold text-white bg-amber-500 uppercase tracking-widest shadow-sm">
              {product.discountPercent}% Off
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded text-[8px] font-extrabold text-white bg-[#498278] uppercase tracking-widest shadow-sm">
              New
            </span>
          )}

          {product.quantity > 0 ? (
            <span className="px-2.5 py-1 rounded text-[8px] font-extrabold text-white bg-emerald-600 uppercase tracking-widest shadow-sm">
              In Stock
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded text-[8px] font-extrabold text-white bg-[#8e7a7c] uppercase tracking-widest shadow-sm">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 pt-2.5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-lg text-gray-855 hover:text-[#9c2a3b] transition-colors mb-0.5 font-lora line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Size availability subtext */}
          {sizesText && (
            <p className="text-xs text-gray-400 font-semibold mb-0.5">
              Sizes: {sizesText}
            </p>
          )}

          {/* Color variations swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1.5 items-center mb-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Colors:</span>
              <div className="flex gap-1">
                {product.colors.slice(0, 5).map((colorStr, idx) => {
                  const parts = colorStr.split(":");
                  const hex = parts[1] || "#000000";
                  return (
                    <span
                      key={idx}
                      className="w-3.5 h-3.5 rounded-full border border-gray-250/25 shadow-xs"
                      style={{ backgroundColor: hex }}
                      title={parts[0]}
                    />
                  );
                })}
                {product.colors.length > 5 && (
                  <span className="text-[9px] text-gray-400 font-bold">+{product.colors.length - 5}</span>
                )}
              </div>
            </div>
          )}

          {/* Excerpt if spacing allows */}
          {cols <= 3 && (
            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
              {product.description || "Wrap your newborn in organic pure softness."}
            </p>
          )}

          {/* Dynamic Rating stars */}
          <div className="flex gap-0.5 text-amber-400 text-[10px] mt-1 mb-1.5 items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < ratingNum ? "★" : "☆"}</span>
            ))}
            <span className="text-[9px] text-gray-400 ml-1.5 font-sans font-semibold">
              ({avgRating})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            {isDiscounted ? (
              <>
                <span className="font-extrabold text-xs text-[#9c2a3b]">
                  {formatPKR(finalPrice)}
                </span>
                <span className="text-[9px] text-gray-400 line-through">
                  {formatPKR(product.price)}
                </span>
              </>
            ) : (
              <span className="font-extrabold text-xs text-gray-855">
                {formatPKR(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "All");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [keyword, setKeyword] = useState("");
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  
  // Grid Columns State (default 3 columns grid)
  const [cols, setCols] = useState<number>(3);
  
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (searchParam) {
      setKeyword(searchParam);
      runSearch(searchParam);
    } else {
      fetchProducts();
    }
  }, [selectedCategory, searchParam]);

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

  const runSearch = async (term: string) => {
    setLoading(true);
    try {
      const data = await searchProducts(term.trim());
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
    runSearch(keyword);
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  // Dynamic Grid Columns Class Generator
  const getGridClass = () => {
    if (cols === 2) return "grid grid-cols-2 gap-6";
    if (cols === 3) return "grid grid-cols-2 sm:grid-cols-3 gap-5";
    if (cols === 4) return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4";
    if (cols === 5) return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3";
    if (cols === 6) return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2";
    return "grid grid-cols-2 sm:grid-cols-3 gap-5"; // Fallback
  };

  return (
    <>
      <main className="min-h-screen pt-6" style={{ backgroundColor: "var(--color-cream)" }}>
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs" style={{ color: "var(--color-text-light)" }}>
          <Link href="/">Home</Link> › <span style={{ color: "var(--color-primary)" }}>Products</span>
        </div>

        {/* Header + Search */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <h1 className="text-4xl font-bold mb-2 font-lora" style={{ color: "var(--color-text-dark)" }}>Baby Products</h1>
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
              className="px-5 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Search
            </button>
          </form>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-16 flex flex-col md:flex-row gap-8">
          
          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside className="w-full md:w-44 flex-shrink-0">
            {/* Size filter (UI only) */}
            <div className="mb-8">
              <h3 className="font-semibold text-xs uppercase tracking-wider mb-3 text-gray-400">Size</h3>
              <div className="flex flex-col gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-left transition-all duration-200 cursor-pointer"
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
              <h3 className="font-semibold text-xs uppercase tracking-wider mb-3 text-gray-400">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {colorDots.map((c) => (
                  <button
                    key={c}
                    className="w-6.5 h-6.5 rounded-full border-2 border-white transition-transform hover:scale-110 cursor-pointer shadow-sm"
                    style={{ backgroundColor: c, boxShadow: "0 0 0 1px var(--color-sand)" }}
                  />
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="mb-8">
              <h3 className="font-semibold text-xs uppercase tracking-wider mb-3 text-gray-400">Collections</h3>
              <div className="flex flex-col gap-2.5">
                {categories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 cursor-pointer text-xs font-medium"
                    style={{ color: "var(--color-text-mid)" }}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory.toLowerCase() === cat.toLowerCase()}
                      onChange={() => setSelectedCategory(cat)}
                      className="accent-rose-700 w-4 h-4 cursor-pointer"
                    />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <button
              className="w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer hover:bg-[#b5374a] hover:text-white"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              onClick={() => { setSelectedCategory("All"); setSelectedSize(null); setKeyword(""); fetchProducts(); }}
            >
              Clear Filters
            </button>
          </aside>

          {/* ── Product Grid Container ────────────────────────────── */}
          <div className="flex-1">
            
            {/* Top Bar with Grid Columns Selection Choices */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4 border-gray-200/50">
              
              <div className="flex items-center gap-4">
                <p className="text-xs font-medium text-gray-500">
                  {loading ? "Loading..." : `${sorted.length} product${sorted.length !== 1 ? "s" : ""} found`}
                </p>

                {/* ─── GRID LAYOUT POSITION SELECTORS (Image 4) ─── */}
                <div className="hidden sm:flex items-center gap-1.5 bg-white p-1 rounded-lg border border-gray-200">
                  {/* List View choice */}
                  <button
                    onClick={() => setCols(1)}
                    className={`grid-selector-btn ${cols === 1 ? "active" : ""}`}
                    title="List View"
                  >
                    ☰
                  </button>
                  {/* 2 columns grid */}
                  <button
                    onClick={() => setCols(2)}
                    className={`grid-selector-btn font-mono text-xs ${cols === 2 ? "active" : ""}`}
                    title="2 Columns"
                  >
                    ||
                  </button>
                  {/* 3 columns grid */}
                  <button
                    onClick={() => setCols(3)}
                    className={`grid-selector-btn font-mono text-xs ${cols === 3 ? "active" : ""}`}
                    title="3 Columns"
                  >
                    |||
                  </button>
                  {/* 4 columns grid */}
                  <button
                    onClick={() => setCols(4)}
                    className={`grid-selector-btn font-mono text-xs ${cols === 4 ? "active" : ""}`}
                    title="4 Columns"
                  >
                    ||||
                  </button>
                  {/* 5 columns grid */}
                  <button
                    onClick={() => setCols(5)}
                    className={`grid-selector-btn font-mono text-[9px] ${cols === 5 ? "active" : ""}`}
                    title="5 Columns"
                  >
                    |||||
                  </button>
                  {/* 6 columns grid */}
                  <button
                    onClick={() => setCols(6)}
                    className={`grid-selector-btn font-mono text-[8px] ${cols === 6 ? "active" : ""}`}
                    title="6 Columns"
                  >
                    ||||||
                  </button>
                </div>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Sort by</span>
                <select
                  className="rounded-lg px-3 py-2 border text-xs outline-none bg-white font-medium cursor-pointer"
                  style={{ borderColor: "var(--color-sand)", color: "var(--color-text-dark)" }}
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
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-3 w-2/3 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-base font-semibold" style={{ color: "var(--color-text-dark)" }}>No products found</p>
                <p className="text-xs mt-2 text-gray-400">Try adjusting your filters or search term.</p>
                <button
                  onClick={() => { setSelectedCategory("All"); setKeyword(""); fetchProducts(); }}
                  className="btn-primary mt-6 text-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : cols === 1 ? (
              
              /* ─── LIST VIEW (1 Column layout matching Image 4) ─── */
              <div className="space-y-4 animate-fadeIn">
                {sorted.map((product, i) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col sm:flex-row hover-lift p-4 gap-6 items-center"
                  >
                    
                    {/* Left: Product Image */}
                    <Link href={`/products/${product.id}`} className="w-full sm:w-44 h-44 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden relative">
                      <div className="absolute inset-0" style={{ backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }} />
                      
                      {product.imageUrl || (product.images && product.images[0]) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl || (product.images && product.images[0])}
                          alt={product.name}
                          className="relative z-10 w-full h-full object-cover"
                        />
                      ) : (
                        <span className="relative z-10 text-6xl">{CARD_EMOJIS[i % CARD_EMOJIS.length]}</span>
                      )}
                    </Link>

                    {/* Middle: Details */}
                    <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        {product.discountPercent && product.discountPercent > 0 && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-700 font-bold text-[9px] uppercase tracking-wider">
                            {product.discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      <Link href={`/products/${product.id}`} className="block">
                        <h3 className="font-bold text-lg text-gray-800 hover:text-[#b5374a] transition-colors leading-snug font-lora">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                        {product.description || "Wrap your newborn in pure softness! Made from ultra-soft breathable GOTS organic cotton with adorable all-over cartoon prints and contrast ribbed trim."}
                      </p>

                      {/* Clickable mock color circles */}
                      <div className="flex justify-center sm:justify-start gap-1.5 pt-1">
                        {colorDots.map((c, idx) => (
                          <span
                            key={idx}
                            className="w-4 h-4 rounded-full border border-gray-300 hover:scale-115 transition-transform cursor-pointer"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="w-full sm:w-44 flex flex-col gap-2.5 flex-shrink-0 text-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                      
                      {/* Price Display */}
                      <div className="mb-2">
                        {product.discountPercent && product.discountPercent > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-lg text-[#b5374a]">
                              {formatPKR(product.price * (1 - product.discountPercent / 100))}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {formatPKR(product.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-xl text-[#b5374a]">
                            {formatPKR(product.price)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setQuickViewId(product.id)}
                        className="w-full py-2 rounded-full border border-[#b5374a] text-[#b5374a] hover:bg-[#b5374a] hover:text-white transition-colors text-xs font-semibold text-center cursor-pointer block"
                      >
                        Quick view
                      </button>

                      <button
                        onClick={() => addToCart(product.id, 1)}
                        disabled={cartLoading}
                        className="w-full py-2.5 rounded-full text-white bg-teal-600 hover:bg-teal-700 transition-colors text-xs font-semibold cursor-pointer active:scale-95"
                      >
                        Quick Shop
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              
              /* ─── DYNAMIC GRID VIEWS (2 to 6 columns) ─── */
              <div className={`${getGridClass()} animate-fadeIn`}>
                {sorted.map((product, i) => (
                  <ProductGridCard
                    key={product.id}
                    product={product}
                    index={i}
                    addToCart={addToCart}
                    cartLoading={cartLoading}
                    cols={cols}
                    onQuickView={(id) => setQuickViewId(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick View Modal */}
        <QuickViewModal
          productId={quickViewId}
          isOpen={quickViewId !== null}
          onClose={() => setQuickViewId(null)}
        />
      </main>
      <Footer />
    </>
  );
}
