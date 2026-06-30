"use client";

import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllProducts, BackendProduct, formatPKR } from "@/src/services/productService";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import API from "@/src/services/api";
import QuickViewModal from "@/src/components/QuickViewModal";

const MINI_CATEGORIES = [
  { name: "New Arrivals", slug: "new-arrivals", img: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200&q=80" },
  { name: "Newborn", slug: "newborn", img: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=200&q=80" },
  { name: "Boys", slug: "boys", img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200&q=80" },
  { name: "Girls", slug: "girls", img: "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=200&q=80" },
  { name: "Comfort", slug: "comfort", img: "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=200&q=80" },
  { name: "Sale", slug: "sale", img: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&q=80" },
  { name: "Jumpsuits", slug: "jumpsuits", img: "https://images.unsplash.com/photo-1604467731651-1d547738218a?w=200&q=80" },
  { name: "2-Piece Sets", slug: "2-piece-sets", img: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=200&q=80" },
  { name: "Sleepwear", slug: "sleepwear", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80" },
];

const MOCK_SLIDES = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80",
    title: "Comfort Collection",
    subtitle: "New Season / Thoughtfully curated baby essentials made from GOTS organic cotton.",
    linkUrl: "/products"
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80",
    title: "Shop Our Best Deals",
    subtitle: "Bundle up and save! Up to 40% Off on selected romper bundles and nursery crib sets.",
    linkUrl: "/products?category=sale"
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=1600&q=80",
    title: "Eco Friendly Play",
    subtitle: "Organic, chemical-free wooden toys and soft cotton teething sets.",
    linkUrl: "/products"
  }
];



const CARD_COLORS = ["#f7f0e8", "#e8f0e8", "#e8eef5", "#f5eee8", "#eee8f5", "#e8f5f0"];
const CARD_EMOJIS = ["👕", "🧥", "🌿", "🛏️", "🍼", "🎁", "👶", "🧸"];

interface ProductCardProps {
  product: BackendProduct;
  index: number;
  addToCart: (id: number, qty: number) => void;
  cartLoading: boolean;
  onQuickView: (id: number) => void;
}

// ─── PREMIUM PRODUCT CARD COMPONENT FOR BABY WEBSITE ───
function ProductCard({ product, index, addToCart, cartLoading, onQuickView }: ProductCardProps) {
  const isDiscounted = product.discountPercent !== undefined && product.discountPercent > 0;
  const finalPrice = isDiscounted && product.discountPercent !== undefined ? product.price * (1 - product.discountPercent / 100) : product.price;
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const [reviews, setReviews] = useState<any[]>([]);

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

  // Extract sizes to display in subtext
  const sizesText = product.sizes && product.sizes.length > 0 
    ? product.sizes.slice(0, 3).join(" • ") + (product.sizes.length > 3 ? " +" : "")
    : "";

  return (
    <div
      className="rounded-2xl bg-white border border-[#ebd0d3]/30 hover:border-[#ebd0d3]/70 hover:shadow-[0_20px_45px_-8px_rgba(77,57,61,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden pb-3"
    >
      {/* Heart Wishlist button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggle(product);
        }}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm z-20 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 cursor-pointer hover:scale-110 border border-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={wishlisted ? "#9c2a3b" : "none"}
          stroke="#9c2a3b"
          strokeWidth={1.8}
          className="w-4.5 h-4.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>

      {/* Product Image Box */}
      <Link href={`/products/${product.id}`} className="block relative overflow-hidden rounded-t-2xl aspect-square flex items-center justify-center bg-gray-50 border-b border-gray-100/30">
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }}
        />
        
        {product.imageUrl || (product.images && product.images[0]) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl || (product.images && product.images[0])}
            alt={product.name}
            className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <span className="relative z-10 text-6xl group-hover:scale-110 transition-transform duration-500">
            {CARD_EMOJIS[index % CARD_EMOJIS.length]}
          </span>
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
            className="w-[130px] h-10 rounded-full text-gray-800 font-bold text-[9px] uppercase tracking-widest bg-white hover:bg-gray-50 transition-all flex items-center justify-center cursor-pointer shadow-md border border-gray-250/20"
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

      {/* Details Area */}
      <div className="p-3 pt-2.5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-[19px] text-gray-855 hover:text-[#9c2a3b] transition-colors mb-0.5 font-lora line-clamp-1 leading-snug">
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

          {/* Rating stars */}
          <div className="flex gap-0.5 text-amber-400 text-xs mb-1.5 items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < ratingNum ? "★" : "☆"}</span>
            ))}
            <span className="text-[10px] text-gray-400 ml-1.5 font-sans font-medium">
              ({avgRating}) • {totalReviews}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2 pt-1 border-t border-gray-50">
            {isDiscounted ? (
              <>
                <span className="font-extrabold text-base text-[#9c2a3b]">
                  {formatPKR(finalPrice)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatPKR(product.price)}
                </span>
              </>
            ) : (
              <span className="font-extrabold text-base text-gray-850">
                {formatPKR(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const { addToCart, loading: cartLoading } = useCart();

  // Slider controls
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch Homepage Content
  useEffect(() => {
    // 1. Fetch products
    getAllProducts()
      .then((data) => setProducts(data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));

    // 2. Fetch slides from backend
    API.get("/slides")
      .then((res) => {
        if (res.data?.success && res.data.data?.length > 0) {
          setSlides(res.data.data);
        } else {
          setSlides([]);
        }
      })
      .catch(() => setSlides([]));

    // 3. Fetch categories from backend
    API.get("/categories")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const formatted = res.data.map((c: any) => ({
            name: c.name,
            slug: c.slug,
            img: c.imageUrl || "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=200&q=80",
            displayOrder: c.displayOrder || 0
          }));
          // Sort categories by displayOrder ascending
          formatted.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setCategories(formatted);
        } else {
          setCategories([]);
        }
      })
      .catch(() => setCategories([]));

    // 4. Fetch reviews/testimonials from backend
    API.get("/reviews")
      .then((res) => {
        if (res.data?.success && res.data.data?.length > 0) {
          const formatted = res.data.data.slice(0, 3).map((r: any) => ({
            id: r.id,
            stars: r.rating,
            text: r.comment,
            author: r.reviewerName,
            tag: "Verified Parent"
          }));
          setTestimonials(formatted);
        } else {
          setTestimonials([]);
        }
      })
      .catch(() => setTestimonials([]));

    // 5. Fetch blogs from backend
    API.get("/blogs")
      .then((res) => {
        if (res.data?.success && res.data.data?.length > 0) {
          setBlogs(res.data.data);
        } else {
          setBlogs([]);
        }
      })
      .catch(() => setBlogs([]));
  }, []);

  // Automatic hero slide transition
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Group products dynamically by section
  const dynamicSections: Record<string, BackendProduct[]> = {};
  products.forEach((p) => {
    if (p.section && p.section.trim()) {
      const sectionKey = p.section.trim();
      const displayName = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).toLowerCase();
      if (!dynamicSections[displayName]) {
        dynamicSections[displayName] = [];
      }
      dynamicSections[displayName].push(p);
    }
  });

  const hasDynamicSections = Object.keys(dynamicSections).length > 0;

  // Fallbacks if no sections are assigned yet
  const trendingProducts = products.filter(p => p.section?.toLowerCase() === "trending");
  const bestsellerProducts = products.filter(p => p.section?.toLowerCase() === "bestseller");
  const trendingToRender = trendingProducts.length > 0 ? trendingProducts.slice(0, 8) : products.slice(0, 8);
  const bestsellerToRender = bestsellerProducts.length > 0 ? bestsellerProducts.slice(0, 8) : products.slice(0, 8);

  return (
    <>
      <main className="overflow-x-hidden" style={{ backgroundColor: "var(--color-cream)" }}>
        
        {/* ─── 1. INTERACTIVE HERO IMAGE SLIDER (DYNAMIC CAROUSEL) ─── */}
        {slides.length > 0 && (
          <section className="relative w-full h-[380px] sm:h-[500px] overflow-hidden group">
            {slides.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((slide, i) => (
              <div
                key={slide.id || i}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out flex items-center ${
                  i === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {/* Slide image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-1000"
                />
                {/* Gradient shading */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent z-10" />

                {/* Text overlay box */}
                <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 w-full text-white">
                  <div className="max-w-xl animate-fadeIn">
                    <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-bold bg-[#b5374a] uppercase tracking-widest text-white mb-4">
                      New Season Collection
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 drop-shadow-sm font-lora">
                      {slide.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-white/95 leading-relaxed mb-8 max-w-md drop-shadow-sm">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.linkUrl || "/products"}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-[#2c1a1f] bg-[#e8ddd0] hover:bg-[#b5374a] hover:text-white transition-all shadow-md active:scale-95"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center z-30 transition-all cursor-pointer opacity-0 group-hover:opacity-100 active:scale-90"
                  aria-label="Previous Slide"
                >
                  &larr;
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center z-30 transition-all cursor-pointer opacity-0 group-hover:opacity-100 active:scale-90"
                  aria-label="Next Slide"
                >
                  &rarr;
                </button>
              </>
            )}

            {/* Indicator dots */}
            {slides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      i === currentSlide ? "bg-[#b5374a] w-6" : "bg-white/60 hover:bg-white"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── 2. CURATED DYNAMIC CATEGORIES AUTOMATIC CAROUSEL ─── */}
        {categories.length > 0 && (
          <section className="w-full py-14 overflow-hidden relative" style={{ backgroundColor: "var(--color-cream)" }}>
            <style>{`
              @keyframes slideLeftToRight {
                0% { transform: translateX(-33.33%); }
                100% { transform: translateX(0); }
              }
              .animate-slide-ltr {
                display: flex;
                gap: 2rem;
                animation: slideLeftToRight 30s linear infinite;
              }
              .animate-slide-ltr:hover {
                animation-play-state: paused;
              }
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>

            <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
              <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest block mb-1">Curated Collections</span>
              <h2 className="text-3xl font-bold tracking-tight text-[#2c1a1f] font-lora">Shop by Category</h2>
              <div className="w-16 h-1 bg-[#b5374a] mx-auto mt-2 rounded-full" />
            </div>

            {/* Sliding track wrapper */}
            <div className="relative w-full overflow-hidden py-4 flex justify-center">
              {/* Soft fade gradients on edges */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--color-cream)] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--color-cream)] to-transparent z-10 pointer-events-none" />

              <div className="animate-slide-ltr flex gap-8">
                {/* Duplicate the items 3 times for a seamless loop */}
                {[...categories, ...categories, ...categories].map((cat, i) => (
                  <Link
                    key={i}
                    href={`/products?category=${cat.slug}`}
                    className="flex flex-col items-center gap-4 flex-shrink-0 group cursor-pointer text-center"
                  >
                    <div 
                      className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden relative flex items-center justify-center bg-white group-hover:scale-105 group-hover:border-[#b5374a] transition-all duration-300" 
                      style={{ boxShadow: "0 10px 30px rgba(92,61,68,0.1)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-[#b5374a] tracking-wide transition-colors font-lora">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── 3. DYNAMIC PRODUCT SECTIONS OR FALLBACKS ─── */}
        {hasDynamicSections ? (
          Object.entries(dynamicSections).map(([sectionName, sectionProducts], sIdx) => (
            <section key={sectionName} className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex items-end justify-between mb-8 border-b pb-3 border-gray-200/50">
                <div>
                  <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Parent Favorites</span>
                  <h2 className="text-3xl font-bold text-[#2c1a1f] font-lora mt-1">{sectionName}</h2>
                </div>
                <Link href="/products" className="text-xs font-semibold text-[#b5374a] hover:underline">
                  See All Items &rarr;
                </Link>
              </div>

              {loadingProducts ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-3xl overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded" />
                        <div className="h-3 w-2/3 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {sectionProducts.slice(0, 8).map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i + sIdx}
                      addToCart={addToCart}
                      cartLoading={cartLoading}
                      onQuickView={(id) => setQuickViewId(id)}
                    />
                  ))}
                </div>
              )}
            </section>
          ))
        ) : (
          /* FALLBACK SHELVES IF NO DYNAMIC SECTIONS DEFINED IN PRODUCTS */
          <>
            {/* TRENDING PRODUCTS grid shelf */}
            <section className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-end justify-between mb-8 border-b pb-3 border-gray-200/50">
                <div>
                  <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Parent Favorites</span>
                  <h2 className="text-3xl font-bold text-[#2c1a1f] font-lora mt-1">Trending Collections</h2>
                </div>
                <Link href="/products" className="text-xs font-semibold text-[#b5374a] hover:underline">
                  See All Items &rarr;
                </Link>
              </div>

              {loadingProducts ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-3xl overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded" />
                        <div className="h-3 w-2/3 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : trendingToRender.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-gray-100">
                  <span className="text-4xl">🧸</span>
                  <p className="text-gray-500 mt-2 text-sm">No products available. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {trendingToRender.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      addToCart={addToCart}
                      cartLoading={cartLoading}
                      onQuickView={(id) => setQuickViewId(id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* PROMOTIONAL panels */}
            <section className="max-w-7xl mx-auto px-6 py-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative rounded-3xl overflow-hidden aspect-[16/9] flex flex-col justify-end p-6 sm:p-10 group shadow-sm bg-amber-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1604467731651-1d547738218a?w=800&q=80"
                    alt="Promo banner deals"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 z-10" />
                  <div className="relative z-20 glass-card p-5 rounded-2xl max-w-sm animate-fadeIn">
                    <span className="text-[9px] font-bold text-[#b5374a] uppercase tracking-widest block mb-1">Bundle Deals</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#2c1a1f] font-lora mb-2">Shop Our Best Deals</h3>
                    <p className="text-[11px] text-gray-700 mb-4">Stock up on premium cotton rompers and comfy coordinate sets.</p>
                    <Link href="/products?category=sale" className="inline-flex px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-[#b5374a] hover:bg-[#8c2536] transition-colors">
                      View Deals
                    </Link>
                  </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden aspect-[16/9] flex flex-col justify-end p-6 sm:p-10 group shadow-sm bg-rose-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80"
                    alt="Promo baby collection"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 z-10" />
                  <div className="relative z-20 glass-card p-5 rounded-2xl max-w-sm animate-fadeIn">
                    <span className="text-[9px] font-bold text-[#b5374a] uppercase tracking-widest block mb-1">GOTS Certified</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#2c1a1f] font-lora mb-2">Shop Our Baby Collection</h3>
                    <p className="text-[11px] text-gray-700 mb-4">Chemical-free fabrics crafted strictly for absolute safety.</p>
                    <Link href="/products" className="inline-flex px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-[#b5374a] hover:bg-[#8c2536] transition-colors">
                      Explore Now
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* BEST SELLER PRODUCTS grid shelf */}
            <section className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-end justify-between mb-8 border-b pb-3 border-gray-200/50">
                <div>
                  <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Customer Loved</span>
                  <h2 className="text-3xl font-bold text-[#2c1a1f] font-lora mt-1">Our Best Sellers</h2>
                </div>
                <Link href="/products" className="text-xs font-semibold text-[#b5374a] hover:underline">
                  View All Best Sellers &rarr;
                </Link>
              </div>

              {loadingProducts ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-3xl overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded" />
                        <div className="h-3 w-2/3 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : bestsellerToRender.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-gray-100">
                  <span className="text-4xl">🧸</span>
                  <p className="text-gray-500 mt-2 text-sm">No products available. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {bestsellerToRender.slice(0, 4).map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i + 4}
                      addToCart={addToCart}
                      cartLoading={cartLoading}
                      onQuickView={(id) => setQuickViewId(id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ─── 4. LATEST BLOG CARDS ─── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Organic Nest</span>
            <h2 className="text-3xl font-bold text-[#2c1a1f] font-lora mt-1">Latest from Our Blog</h2>
            <p className="text-xs text-gray-400 mt-1">Useful insights for peaceful and natural parenting journeys</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.slice(0, 3).map((blog) => {
              const dateText = blog.createdAt
                ? new Date(blog.createdAt).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })
                : "June 2026";
              const excerpt = blog.excerpt || (blog.content ? (blog.content.length > 130 ? blog.content.substring(0, 130) + "..." : blog.content) : "");
              const linkHref = `/blogs/${blog.id}`;
              return (
                <article key={blog.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover-lift flex flex-col group">
                  <div className="h-44 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.imageUrl || "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=600&q=80"}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] font-semibold text-[#b5374a]">
                      {dateText}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-gray-800 leading-snug mb-2 hover:text-[#b5374a] transition-colors font-lora">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">
                        {excerpt}
                      </p>
                    </div>
                    <Link href={linkHref} className="text-xs font-bold text-[#b5374a] hover:text-[#8c2536] transition-colors mt-2 inline-block">
                      Read More &rarr;
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ─── 5. TESTIMONIALS/REVIEWS SLIDER ─── */}
        <section className="py-16" style={{ backgroundColor: "var(--color-blush)" }}>
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="mb-8">
              <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Our Community</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2c1a1f] font-lora mt-1">What Pakistani Moms Are Saying 💛</h2>
              <div className="w-12 h-1 bg-[#b5374a] mx-auto mt-2 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 flex flex-col justify-between min-h-[180px] hover-lift"
                >
                  <div>
                    <div className="flex gap-0.5 text-amber-400 text-sm mb-3">
                      {[...Array(t.stars)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed italic mb-4">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-wider">{t.author}</span>
                    <span className="text-[9px] font-bold bg-[#5a9a8c]/10 text-[#5a9a8c] px-2 py-0.5 rounded-full">{t.tag}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/products"
                className="inline-flex px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#b5374a] hover:bg-[#8c2536] transition-transform active:scale-95 shadow-md"
              >
                Show More Reviews
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 6. VALUE PILLARS BAR ─── */}
        <section className="bg-white border-t border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🚚", title: "Free Shipping", subtitle: "On all orders over Rs. 5,000" },
              { icon: "🔄", title: "30 Days Return", subtitle: "No questions asked easy refunds" },
              { icon: "🌿", title: "100% Organic", subtitle: "GOTS certified safe cotton" },
              { icon: "📞", title: "24/7 Support", subtitle: "Instant help whenever you need" }
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-3xl bg-rose-50/50 w-12 h-12 rounded-xl flex items-center justify-center">{p.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">{p.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

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
