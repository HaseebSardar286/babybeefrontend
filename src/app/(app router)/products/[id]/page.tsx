"use client";

import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useState, use, useEffect } from "react";
import { getAllProducts, BackendProduct, formatPKR } from "@/src/services/productService";
import { useCart } from "@/src/context/CartContext";

const CARD_COLORS = ["#f7f0e8", "#e8f0e8", "#e8eef5", "#f5eee8", "#eee8f5", "#e8f5f0"];
const CARD_EMOJIS = ["👕", "🧥", "🌿", "🛏️", "🍼", "🎁", "👶", "🧸"];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [related, setRelated] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    getAllProducts().then((all) => {
      const found = all.find((p) => p.id === Number(id)) ?? null;
      setProduct(found);
      if (found) {
        setRelated(all.filter((p) => p.category === found.category && p.id !== found.id).slice(0, 3));
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <>
        <main className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
          <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-12 animate-pulse">
            <div className="md:w-1/2 rounded-3xl h-96" style={{ backgroundColor: "var(--color-sand)" }} />
            <div className="md:w-1/2 space-y-5">
              <div className="h-8 w-2/3 rounded" style={{ backgroundColor: "var(--color-blush-mid)" }} />
              <div className="h-5 w-1/3 rounded" style={{ backgroundColor: "var(--color-blush-mid)" }} />
              <div className="h-10 w-1/4 rounded" style={{ backgroundColor: "var(--color-blush-mid)" }} />
              <div className="h-4 w-full rounded" style={{ backgroundColor: "var(--color-blush-mid)" }} />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-cream)" }}>
          <div className="text-center">
            <p className="text-5xl mb-4">🔍</p>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-dark)" }}>Product not found</h1>
            <Link href="/products" className="btn-primary mt-4 inline-block">Browse Products</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const colorIdx = Number(id) % CARD_COLORS.length;

  return (
    <>
      <main style={{ backgroundColor: "var(--color-cream)" }}>
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs" style={{ color: "var(--color-text-light)" }}>
          <Link href="/" className="hover:underline">Home</Link> ›{" "}
          <Link href="/products" className="hover:underline">Products</Link> ›{" "}
          <span style={{ color: "var(--color-primary)" }}>{product.name}</span>
        </div>

        {/* ── Product Section ───────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Image area */}
            <div
              className="lg:w-1/2 rounded-3xl flex items-center justify-center min-h-96 text-[120px] relative"
              style={{ backgroundColor: CARD_COLORS[colorIdx] }}
            >
              {CARD_EMOJIS[Number(id) % CARD_EMOJIS.length]}
              {product.category && (
                <span
                  className="absolute top-5 left-5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {product.category}
                </span>
              )}
              {product.quantity < 5 && product.quantity > 0 && (
                <span
                  className="absolute top-5 right-5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: "#c9a96e" }}
                >
                  Only {product.quantity} left!
                </span>
              )}
              {product.quantity === 0 && (
                <span
                  className="absolute top-5 right-5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: "var(--color-text-light)" }}
                >
                  Out of Stock
                </span>
              )}
            </div>

            {/* Info */}
            <div className="lg:w-1/2">
              <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text-dark)" }}>
                {product.name}
              </h1>

              {/* Price */}
              <p className="text-3xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>
                {formatPKR(product.price)}
              </p>

              {/* Description */}
              {product.description && (
                <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-text-mid)" }}>
                  {product.description}
                </p>
              )}

              {/* Stock status */}
              <p className="text-sm mb-6 flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: product.quantity > 0 ? "var(--color-sage)" : "var(--color-text-light)" }}
                />
                <span style={{ color: product.quantity > 0 ? "var(--color-sage)" : "var(--color-text-light)" }}>
                  {product.quantity > 0 ? `In Stock (${product.quantity} available)` : "Out of Stock"}
                </span>
              </p>

              {/* Quantity */}
              <div className="flex gap-3 mb-6">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-full border"
                  style={{ borderColor: "var(--color-sand)", backgroundColor: "white" }}
                >
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="font-bold text-lg w-5 text-center"
                    style={{ color: "var(--color-primary)" }}
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                    className="font-bold text-lg w-5 text-center"
                    style={{ color: "var(--color-primary)" }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product.id, qty)}
                  disabled={cartLoading || product.quantity === 0}
                  className="flex-1 py-3 rounded-full text-white font-medium text-sm transition-all duration-200"
                  style={{
                    backgroundColor: product.quantity === 0 ? "var(--color-text-light)" : "var(--color-primary)",
                    cursor: product.quantity === 0 || cartLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {cartLoading ? "Adding..." : product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                  style={{
                    borderColor: wishlisted ? "var(--color-primary)" : "var(--color-sand)",
                    backgroundColor: wishlisted ? "var(--color-blush)" : "white",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill={wishlisted ? "var(--color-primary)" : "none"}
                    stroke="var(--color-primary)" strokeWidth={1.8} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex gap-3 flex-wrap">
                {["🚚 Free Shipping", "🌿 Ethically Sourced", "🔒 Secure Checkout"].map((b) => (
                  <div
                    key={b}
                    className="px-4 py-2 rounded-full text-xs font-medium"
                    style={{ backgroundColor: "var(--color-blush)", color: "var(--color-text-mid)" }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Specs ─────────────────────────────────────────────── */}
        <section className="py-14" style={{ backgroundColor: "white" }}>
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--color-text-dark)" }}>
              Product Details
            </h2>
            <div
              className="max-w-lg mx-auto rounded-2xl p-6"
              style={{ backgroundColor: "var(--color-blush)" }}
            >
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: "Category", value: product.category || "—" },
                    { label: "Price", value: formatPKR(product.price) },
                    { label: "Stock", value: product.quantity > 0 ? `${product.quantity} units` : "Out of stock" },
                  ].map((row) => (
                    <tr key={row.label} className="border-b" style={{ borderColor: "var(--color-blush-mid)" }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: "var(--color-text-mid)" }}>{row.label}</td>
                      <td className="py-3" style={{ color: "var(--color-text-dark)" }}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Related Products ──────────────────────────────────── */}
        {related.length > 0 && (
          <section className="py-14 max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--color-text-dark)" }}>
              You Might Also Love
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {related.map((rp, i) => (
                <Link
                  key={rp.id}
                  href={`/products/${rp.id}`}
                  className="rounded-2xl overflow-hidden transition-transform hover:-translate-y-1"
                  style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "block" }}
                >
                  <div
                    className="h-44 flex items-center justify-center text-6xl"
                    style={{ backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }}
                  >
                    {CARD_EMOJIS[(rp.id) % CARD_EMOJIS.length]}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-dark)" }}>{rp.name}</h3>
                    <span className="font-bold text-sm" style={{ color: "var(--color-primary)" }}>{formatPKR(rp.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
