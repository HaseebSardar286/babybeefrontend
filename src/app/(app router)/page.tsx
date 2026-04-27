"use client";

import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllProducts, BackendProduct, formatPKR } from "@/src/services/productService";
import { useCart } from "@/src/context/CartContext";

const categories = [
  { name: "Clothing", label: "Clothing", subtitle: "Organic Cotton", bg: "#d4a373", img: "👕", slug: "clothing" },
  { name: "Nursery", label: "Nursery", subtitle: "Safe & Calm", bg: "#8aab97", img: "🛏️", slug: "nursery" },
  { name: "Feeding", label: "Feeding", subtitle: "Natural BPA-Free", bg: "#9ac1d4", img: "🍼", slug: "feeding" },
  { name: "Wellness", label: "Wellness", subtitle: "Gentle Care", bg: "#c9a96e", img: "🌿", slug: "wellness" },
  { name: "Toys", label: "Toys", subtitle: "Educational", bg: "#b5c4b1", img: "🧸", slug: "toys" },
  { name: "Gifts", label: "Gifts", subtitle: "Gift Sets", bg: "#d4b5c4", img: "🎁", slug: "gifts" },
];

const testimonials = [
  {
    icon: "🌸",
    title: "Life-changing for anxious mums",
    body: "The quality is simply unmatched. I can sleep knowing every stitch is safe for my baby.",
    author: "Amara, mother of 2",
  },
  {
    icon: "🍃",
    title: "Worth every cent",
    body: "Our pediatrician recommended switching to organic and BabyBee was the first brand we tried. No regrets.",
    author: "Kevin & Priya, new parents",
  },
];

const CARD_COLORS = ["#f7f0e8", "#e8f0e8", "#e8eef5", "#f5eee8", "#eee8f5", "#e8f5f0"];
const CARD_EMOJIS = ["👕", "🧥", "🌿", "🛏️", "🍼", "🎁", "👶", "🧸"];

export default function HomePage() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    getAllProducts()
      .then((data) => setProducts(data.slice(0, 4)))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #c9a96e22 0%, var(--color-blush) 60%, #8aab9722 100%)",
            minHeight: "500px",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 max-w-xl">
              <span className="tag-badge mb-4 inline-block">🌿 100% Organic</span>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4" style={{ color: "var(--color-text-dark)" }}>
                Create a sanctuary for your little one.
              </h1>
              <p className="text-base mb-2 font-medium" style={{ color: "var(--color-text-dark)" }}>
                Sustainably sourced. Thoughtfully designed.
              </p>
              <p className="text-base mb-8" style={{ color: "var(--color-text-mid)" }}>
                Fast delivery nationwide — JazzCash · Easypaisa · COD available
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/products" className="btn-primary">Shop Collection</Link>
                <Link href="/about" className="btn-outline">Our Story</Link>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div
                className="relative w-72 h-80 rounded-3xl flex items-center justify-center text-9xl shadow-lg"
                style={{ backgroundColor: "var(--color-sand)", boxShadow: "0 20px 60px rgba(181,55,74,0.12)" }}
              >
                🛏️
                <div
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow"
                  style={{ backgroundColor: "var(--color-blush)" }}
                >
                  🌿
                </div>
                {/* Floating price badge */}
                <div
                  className="absolute -bottom-4 left-6 px-4 py-2 rounded-full text-white text-sm font-bold shadow-md"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Free Delivery Rs. 5,000+
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust bar ───────────────────────────────────────── */}
        <div style={{ backgroundColor: "var(--color-primary)" }}>
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap justify-center gap-6 md:gap-12">
            {[
              { icon: "🚚", text: "Nationwide Delivery" },
              { icon: "💳", text: "JazzCash · Easypaisa · COD" },
              { icon: "🌿", text: "100% Organic Products" },
              { icon: "🔄", text: "30-Day Returns" },
            ].map((t) => (
              <div key={t.text} className="flex items-center gap-2 text-white text-xs font-medium">
                <span>{t.icon}</span> {t.text}
              </div>
            ))}
          </div>
        </div>

        {/* ── Categories ──────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold" style={{ color: "var(--color-text-dark)" }}>
                Curated for Every Stage
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-light)" }}>
                Everything you need to support your journey.
              </p>
            </div>
            <Link href="/products" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
              Explore All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden flex items-end p-5 transition-transform duration-300 hover:-translate-y-1"
                style={{ backgroundColor: cat.bg + "44", minHeight: "160px" }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20 group-hover:opacity-30 transition-opacity">
                  {cat.img}
                </div>
                <div className="relative z-10">
                  <p className="font-bold text-base" style={{ color: "var(--color-text-dark)" }}>{cat.label}</p>
                  <p className="text-xs font-medium" style={{ color: "var(--color-text-dark)" }}>{cat.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-mid)" }}>{cat.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Best Sellers ────────────────────────────────────── */}
        <section className="py-16" style={{ backgroundColor: "white" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold" style={{ color: "var(--color-text-dark)" }}>
                Our Best Sellers
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-light)" }}>
                Trusted by thousands of parents.
              </p>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-44" style={{ backgroundColor: "var(--color-sand)" }} />
                    <div className="p-4 space-y-2">
                      <div className="h-4 rounded" style={{ backgroundColor: "var(--color-blush-mid)" }} />
                      <div className="h-3 w-2/3 rounded" style={{ backgroundColor: "var(--color-blush-mid)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🌿</p>
                <p style={{ color: "var(--color-text-light)" }}>No products available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className="rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                    style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                  >
                    <Link href={`/products/${product.id}`}>
                      <div
                        className="h-44 flex items-center justify-center text-5xl"
                        style={{ backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }}
                      >
                        {CARD_EMOJIS[i % CARD_EMOJIS.length]}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/products/${product.id}`}>
                        <p className="font-medium text-sm leading-snug mb-1" style={{ color: "var(--color-text-dark)" }}>
                          {product.name}
                        </p>
                      </Link>
                      <p className="text-xs mb-3" style={{ color: "var(--color-text-light)" }}>
                        {product.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm" style={{ color: "var(--color-primary)" }}>
                          {formatPKR(product.price)}
                        </span>
                        <button
                          onClick={() => addToCart(product.id, 1)}
                          disabled={cartLoading}
                          className="w-7 h-7 rounded-full text-white flex items-center justify-center text-sm transition-transform hover:scale-105"
                          style={{ backgroundColor: "var(--color-primary)" }}
                          title="Add to Cart"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link href="/products" className="btn-outline">View All Products</Link>
            </div>
          </div>
        </section>

        {/* ── Testimonials ────────────────────────────────────── */}
        <section className="py-16 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 rounded-3xl p-8" style={{ backgroundColor: "var(--color-blush)" }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { emoji: "🌿", label: "GOTS Certified" },
                  { emoji: "🧪", label: "Dermatologist Tested" },
                  { emoji: "♻️", label: "Sustainable" },
                  { emoji: "💛", label: "Parent Loved" },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center gap-2 p-4 rounded-2xl" style={{ backgroundColor: "white" }}>
                    <span className="text-3xl">{b.emoji}</span>
                    <span className="text-xs font-medium text-center" style={{ color: "var(--color-text-mid)" }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <span className="tag-badge mb-4 inline-block">Community Trust</span>
              <h2 className="text-3xl font-bold mb-8" style={{ color: "var(--color-text-dark)" }}>
                Stories from our Nest.
              </h2>
              <div className="space-y-5">
                {testimonials.map((t) => (
                  <div key={t.title} className="flex gap-4 p-5 rounded-2xl" style={{ backgroundColor: "var(--color-blush)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: "var(--color-sand)" }}>
                      {t.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--color-text-dark)" }}>{t.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-mid)" }}>{t.body}</p>
                      <p className="text-xs mt-2 font-medium" style={{ color: "var(--color-primary)" }}>— {t.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Newsletter ──────────────────────────────────────── */}
        <section className="py-16" style={{ backgroundColor: "var(--color-blush)" }}>
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text-dark)" }}>
              Join our parenting community
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--color-text-mid)" }}>
              Be the first to know about new collections, tips, and 10% off your first order.
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 px-5 py-3 rounded-l-full outline-none text-sm border"
                style={{ borderColor: "var(--color-blush-mid)", backgroundColor: "white", color: "var(--color-text-dark)" }}
              />
              <button
                className="px-6 py-3 rounded-r-full text-white font-medium text-sm"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
