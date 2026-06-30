"use client";

import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useState, use, useEffect } from "react";
import { getAllProducts, getProductById, BackendProduct, formatPKR } from "@/src/services/productService";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";

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
  const { addToCart, loading: cartLoading } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  // Variant and Gallery States
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  // Reviews States
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    setLoading(true);
    getProductById(Number(id))
      .then((found) => {
        setProduct(found ?? null);
        if (found) {
          const firstImg = found.images && found.images.length > 0 ? found.images[0] : (found.imageUrl || null);
          setActiveImageUrl(firstImg);

          // Auto-select first size/color
          if (found.sizes && found.sizes.length > 0) {
            setSelectedSize(found.sizes[0]);
          }
          if (found.colors && found.colors.length > 0) {
            setSelectedColor(found.colors[0]);
          }
        }
        return getAllProducts();
      })
      .then((all) => {
        if (all && product) {
          setRelated(all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3));
        } else if (all && id) {
          // fallback if product state hasn't updated in closure
          const p = all.find(item => item.id === Number(id));
          if (p) {
            setRelated(all.filter((item) => item.category === p.category && item.id !== p.id).slice(0, 3));
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading product detail page:", err);
        setLoading(false);
      });
  }, [id]);

  // Fetch product reviews
  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    fetch(`${baseUrl}/products/${id}/reviews`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setReviews(res.data);
        }
        setReviewsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching reviews:", err);
        setReviewsLoading(false);
      });
  }, [id]);

  // Variant matching
  const matchingVariant = product?.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  // Auto-swap active image if selected variant has customized images
  useEffect(() => {
    if (matchingVariant) {
      const variantImgs = matchingVariant.images && matchingVariant.images.length > 0
        ? matchingVariant.images
        : (matchingVariant.imageUrl && matchingVariant.imageUrl.trim() !== "" ? matchingVariant.imageUrl.split(",") : []);
      if (variantImgs.length > 0) {
        setActiveImageUrl(variantImgs[0]);
      } else {
        const prodImgs = product?.images && product.images.length > 0
          ? product.images
          : (product?.imageUrl ? [product.imageUrl] : []);
        if (prodImgs.length > 0) {
          setActiveImageUrl(prodImgs[0]);
        }
      }
    }
  }, [matchingVariant, product]);

  const wishlisted = product ? isWishlisted(product.id) : false;

  const originalPrice = matchingVariant ? matchingVariant.price : (product ? product.price : 0);
  const displayStock = matchingVariant && !(product?.variants?.every(v => v.stock === 0))
    ? matchingVariant.stock
    : (product ? product.quantity : 0);

  const hasDiscount = !!(product?.discountPercent && product.discountPercent > 0);
  const displayPrice = hasDiscount
    ? originalPrice * (1 - (product.discountPercent || 0) / 100)
    : originalPrice;

  // Determine gallery images
  const galleryImages = matchingVariant && (
    (matchingVariant.images && matchingVariant.images.length > 0) ||
    (matchingVariant.imageUrl && matchingVariant.imageUrl.trim() !== "")
  )
    ? (matchingVariant.images && matchingVariant.images.length > 0
        ? matchingVariant.images
        : (matchingVariant.imageUrl ? matchingVariant.imageUrl.split(",") : []))
    : (product?.images && product.images.length > 0
        ? product.images
        : (product?.imageUrl ? [product.imageUrl] : []));

  const colorIdx = Number(id) % CARD_COLORS.length;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewMessage("Please fill in both your name and review details.");
      return;
    }
    setReviewSubmitting(true);
    setReviewMessage(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
        ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const res = await fetch(`${baseUrl}/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerName: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => [data.data, ...prev]);
        setReviewName("");
        setReviewComment("");
        setReviewRating(5);
        setReviewMessage("Thank you! Your review has been submitted successfully.");
      } else {
        setReviewMessage(data.message || "Failed to post review.");
      }
    } catch (err) {
      console.error("Failed to post review", err);
      setReviewMessage("Connection error. Could not post review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const ratingNum = totalReviews > 0 ? Math.round(Number(avgRating)) : 0;

  if (loading) {
    return (
      <>
        <main className="min-h-screen animate-pulse" style={{ backgroundColor: "var(--color-cream)" }}>
          <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2 rounded-3xl h-[420px] bg-gray-200" />
            <div className="lg:w-1/2 space-y-5">
              <div className="h-6 w-24 rounded bg-gray-200" />
              <div className="h-10 w-2/3 rounded bg-gray-200" />
              <div className="h-5 w-1/3 rounded bg-gray-200" />
              <div className="h-10 w-1/4 rounded bg-gray-200" />
              <div className="h-24 w-full rounded bg-gray-200" />
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
        <main className="min-h-screen flex items-center justify-center animate-fadeIn" style={{ backgroundColor: "var(--color-cream)" }}>
          <div className="text-center px-6">
            <p className="text-6xl mb-4">🔍</p>
            <h1 className="text-2xl font-bold mb-2 font-lora text-gray-800">Product Not Found</h1>
            <p className="text-xs text-gray-500 mb-6">The product you are looking for might have been removed or is unavailable.</p>
            <Link href="/products" className="btn-primary px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider">Browse Products</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="animate-fadeIn" style={{ backgroundColor: "var(--color-cream)" }}>
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-4 text-[10px] uppercase tracking-wider font-semibold animate-slideDown" style={{ color: "var(--color-text-light)" }}>
          <Link href="/" className="hover:text-[#b5374a] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-[#b5374a] transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <span style={{ color: "var(--color-primary)" }}>{product.name}</span>
        </div>

        {/* ── Product Section ───────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column: Image Area */}
            <div className="lg:w-1/2 space-y-4">
              <div
                className="w-full rounded-3xl flex items-center justify-center min-h-[380px] max-h-[500px] text-[120px] relative overflow-hidden bg-gray-50 border border-gray-100/50 shadow-sm"
                style={{ backgroundColor: CARD_COLORS[colorIdx] }}
              >
                {activeImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                  />
                ) : (
                  CARD_EMOJIS[colorIdx]
                )}
                {product.category && (
                  <span
                    className="absolute top-5 left-5 px-3 py-1.5 rounded-full text-[10px] font-bold text-white bg-[#b5374a] uppercase tracking-wider shadow-sm animate-slideDown"
                  >
                    {product.category}
                  </span>
                )}
                {displayStock <= 5 && displayStock > 0 && (
                  <span
                    className="absolute top-5 right-5 px-3 py-1.5 rounded-full text-[10px] font-bold text-white bg-amber-500 uppercase tracking-wider shadow-sm animate-pulse"
                  >
                    Only {displayStock} Left!
                  </span>
                )}
                {displayStock === 0 && (
                  <span
                    className="absolute top-5 right-5 px-3 py-1.5 rounded-full text-[10px] font-bold text-white bg-gray-400 uppercase tracking-wider shadow-sm"
                  >
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Thumbnails Gallery */}
              {galleryImages && galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-1 no-scrollbar">
                  {galleryImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageUrl(imgUrl)}
                      className="w-16 h-16 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-transform active:scale-95 shadow-sm hover:scale-105"
                      style={{
                        borderColor: activeImageUrl === imgUrl ? "var(--color-primary)" : "var(--color-sand)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`thumbnail-${i}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Info & Selections */}
            <div className="lg:w-1/2 flex flex-col justify-between">
              <div>
                {/* GOTS Label Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-teal-100">
                    🌿 100% GOTS Certified Cotton
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold font-lora mb-2 text-gray-800 leading-tight">
                  {product.name}
                </h1>

                {/* Rating stars display summary */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5 text-amber-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < ratingNum ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    ({avgRating} / 5.0 from {totalReviews} reviews)
                  </span>
                  <a href="#reviews" className="text-xs text-[#b5374a] font-semibold hover:underline ml-2">Read Reviews</a>
                </div>

                {/* Price Display */}
                <div className="flex items-center gap-4 mb-6">
                  {hasDiscount ? (
                    <>
                      <span className="text-3xl font-extrabold text-red-600">
                        {formatPKR(displayPrice)}
                      </span>
                      <span className="text-lg text-gray-400 line-through font-medium">
                        {formatPKR(originalPrice)}
                      </span>
                      <span className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full font-bold border border-red-100">
                        {product.discountPercent}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-extrabold text-[#b5374a]">
                      {formatPKR(displayPrice)}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-xs sm:text-sm leading-relaxed mb-6 text-gray-600">
                    {product.description}
                  </p>
                )}

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Select Size:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs"
                          style={{
                            backgroundColor: selectedSize === sz ? "var(--color-primary)" : "white",
                            color: selectedSize === sz ? "white" : "var(--color-text-mid)",
                            borderColor: selectedSize === sz ? "var(--color-primary)" : "var(--color-sand)",
                          }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Select Color:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((colorStr) => {
                        const parts = colorStr.split(":");
                        const name = parts[0];
                        const hex = parts[1] || "#000000";
                        const selected = selectedColor === colorStr;
                        return (
                          <button
                            key={colorStr}
                            type="button"
                            onClick={() => setSelectedColor(colorStr)}
                            className="flex items-center gap-2 px-3 py-2 rounded-full border transition-all cursor-pointer shadow-xs"
                            style={{
                              borderColor: selected ? "var(--color-primary)" : "var(--color-sand)",
                              backgroundColor: selected ? "var(--color-blush)" : "white",
                            }}
                          >
                            <span
                              className="w-4.5 h-4.5 rounded-full border border-gray-200/50 inline-block flex-shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-[10px] font-semibold text-gray-600">
                              {name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock details */}
                <p className="text-xs mb-6 flex items-center gap-2 font-medium">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: displayStock > 0 ? "var(--color-sage)" : "var(--color-text-light)" }}
                  />
                  <span style={{ color: displayStock > 0 ? "var(--color-sage)" : "var(--color-text-light)" }}>
                    {displayStock > 0 ? `In Stock (Only ${displayStock} left)` : "Out of Stock"}
                  </span>
                </p>
              </div>

              {/* Actions Area */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  {/* Quantity Counter */}
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="font-bold text-lg w-5 text-center cursor-pointer text-[#b5374a]"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold text-sm">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(Math.min(Math.max(1, displayStock), qty + 1))}
                      className="font-bold text-lg w-5 text-center cursor-pointer text-[#b5374a]"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    type="button"
                    onClick={() => addToCart(product.id, qty, selectedSize || undefined, selectedColor || undefined)}
                    disabled={cartLoading || displayStock === 0}
                    className="flex-1 py-3 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md bg-[#b5374a] hover:bg-[#8c2536] active:scale-[0.99]"
                    style={{
                      cursor: displayStock === 0 || cartLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {cartLoading ? "Adding..." : displayStock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>

                  {/* Heart Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className="w-12 h-12 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    style={{
                      borderColor: wishlisted ? "var(--color-primary)" : "var(--color-sand)",
                      backgroundColor: wishlisted ? "var(--color-blush)" : "white",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                      fill={wishlisted ? "var(--color-primary)" : "none"}
                      stroke="var(--color-primary)" strokeWidth={1.8} className="w-5.5 h-5.5">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="flex gap-2 flex-wrap pt-2">
                  {[
                    { icon: "🚚", label: "Free Shipping on Rs. 5000+" },
                    { icon: "🔄", label: "Easy 30-Day Returns" },
                    { icon: "💳", label: "Cash on Delivery Available" }
                  ].map((badge, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold bg-white border border-gray-100 text-gray-500 shadow-2xs"
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ── Product Specifications ───────────────────────────────── */}
        <section className="py-14 border-t border-b border-gray-100 bg-white mt-12 animate-fadeIn">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center font-lora mb-8 text-gray-800">
              Product Specifications
            </h2>
            <div
              className="max-w-2xl mx-auto rounded-3xl p-6 md:p-8"
              style={{ backgroundColor: "var(--color-cream)", border: "1px solid var(--color-sand)" }}
            >
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: "Category", value: product.category || "General Essentials" },
                    { label: "Fabric Material", value: "100% GOTS Certified Organic Cotton Blend" },
                    { label: "Design Features", value: "Tagless neck labels, nickel-free snap button closure, stretchable collar" },
                    { label: "Pricing Tier", value: "Premium Boutique Collection" },
                    { label: "Care Instructions", value: "Gentle machine wash cold, wash inside out, tumble dry low" }
                  ].map((row) => (
                    <tr key={row.label} className="border-b last:border-0" style={{ borderColor: "var(--color-sand)" }}>
                      <td className="py-3.5 pr-4 font-bold text-xs uppercase tracking-wider text-gray-400 w-1/3">{row.label}</td>
                      <td className="py-3.5 text-xs sm:text-sm text-gray-600 w-2/3">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Reviews Section ────────────────────────────────────────── */}
        <section id="reviews" className="py-14 bg-white animate-fadeIn">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold font-lora mb-8 text-gray-800 text-center">
              Customer Feedbacks & Ratings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12">
              
              {/* Write a Review Form */}
              <div className="bg-[#fdf6f0]/70 p-6 rounded-3xl border border-[#ebd0d3]/40 shadow-xs">
                <h3 className="font-bold font-lora text-lg mb-4 text-gray-800">Post a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="reviewerName" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Name:</label>
                    <input
                      id="reviewerName"
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Zainab L."
                      className="input-field w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Rating Rating Stars:</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-2xl cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-95"
                          style={{ color: star <= reviewRating ? "#fbbf24" : "#e5e7eb" }}
                          aria-label={`Rate ${star} Stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reviewComment" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Feedback Comments:</label>
                    <textarea
                      id="reviewComment"
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with GOTS fabric quality..."
                      className="input-field w-full"
                      required
                    />
                  </div>

                  {reviewMessage && (
                    <p className={`text-xs font-semibold py-1 ${reviewMessage.includes("successfully") ? "text-emerald-600" : "text-rose-500"}`}>
                      {reviewMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="btn-primary w-full text-xs font-bold uppercase tracking-wider py-3"
                  >
                    {reviewSubmitting ? "Submitting..." : "Post Review"}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                <h3 className="font-bold font-lora text-lg mb-4 text-gray-800">
                  Reviews ({totalReviews})
                </h3>

                {reviewsLoading ? (
                  <div className="text-center py-8 text-gray-400 text-xs animate-pulse">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-xs font-medium">No reviews posted yet.</p>
                    <p className="text-[10px] text-gray-400 mt-1">Be the first to share your GOTS organic experience!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 no-scrollbar">
                    {reviews.map((r, index) => (
                      <div
                        key={r.id || index}
                        className="bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-2xs hover:border-[#ebd0d3]/35 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-gray-800 font-lora">{r.reviewerName}</span>
                          <div className="flex gap-0.5 text-amber-400 text-xs">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed italic">{r.comment}</p>
                        {r.createdAt && (
                          <span className="block text-[9px] text-gray-400 font-medium text-right mt-1">
                            {new Date(r.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── Related Products ──────────────────────────────────── */}
        {related.length > 0 && (
          <section className="py-14 max-w-7xl mx-auto px-6 border-t border-gray-100 animate-fadeIn">
            <h2 className="text-2xl font-bold font-lora mb-8 text-gray-800 text-center">
              You Might Also Love
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {related.map((rp, i) => {
                const isDisc = rp.discountPercent !== undefined && rp.discountPercent > 0;
                const finalP = isDisc && rp.discountPercent ? rp.price * (1 - rp.discountPercent / 100) : rp.price;

                return (
                  <Link
                    key={rp.id}
                    href={`/products/${rp.id}`}
                    className="rounded-2xl overflow-hidden bg-white border border-gray-100/50 hover:border-[#ebd0d3]/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col group relative"
                  >
                    <div
                      className="aspect-square flex items-center justify-center text-6xl relative overflow-hidden bg-gray-50"
                      style={{ backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }}
                    >
                      {rp.imageUrl || (rp.images && rp.images[0]) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rp.imageUrl || (rp.images && rp.images[0])}
                          alt={rp.name}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        CARD_EMOJIS[(rp.id) % CARD_EMOJIS.length]
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-sm text-gray-700 mb-1 group-hover:text-[#b5374a] transition-colors font-lora line-clamp-1">{rp.name}</h3>
                      <div className="flex flex-col">
                        {isDisc ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-red-600">{formatPKR(finalP)}</span>
                            <span className="text-[10px] text-gray-400 line-through">{formatPKR(rp.price)}</span>
                          </div>
                        ) : (
                          <span className="font-extrabold text-xs text-gray-800">{formatPKR(rp.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
