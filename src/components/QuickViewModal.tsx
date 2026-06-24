"use client";

import { useState, useEffect } from "react";
import { getProductById, BackendProduct, formatPKR } from "@/src/services/productService";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";

interface QuickViewModalProps {
  productId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const CARD_COLORS = ["#f7f0e8", "#e8f0e8", "#e8eef5", "#f5eee8", "#eee8f5", "#e8f5f0"];
const CARD_EMOJIS = ["👕", "🧥", "🌿", "🛏️", "🍼", "🎁", "👶", "🧸"];

export default function QuickViewModal({ productId, isOpen, onClose }: QuickViewModalProps) {
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const { isWishlisted, toggle } = useWishlist();
  const { addToCart, loading: cartLoading } = useCart();

  // Variant and Gallery States
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !productId) {
      setProduct(null);
      return;
    }

    setLoading(true);
    getProductById(productId)
      .then((found) => {
        setProduct(found ?? null);
        if (found) {
          const firstImg = found.images && found.images.length > 0 ? found.images[0] : (found.imageUrl || null);
          setActiveImageUrl(firstImg);

          // Auto-select first available size and color
          if (found.sizes && found.sizes.length > 0) {
            setSelectedSize(found.sizes[0]);
          }
          if (found.colors && found.colors.length > 0) {
            setSelectedColor(found.colors[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading quick view details:", err);
        setLoading(false);
      });
  }, [productId, isOpen]);

  // Find matching variant based on selections
  const matchingVariant = product?.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const wishlisted = product ? isWishlisted(product.id) : false;

  const allVariantsAreZeroStock = !!(
    product?.variants &&
    product.variants.length > 0 &&
    product.variants.every((v) => v.stock === 0)
  );

  const originalPrice = matchingVariant ? matchingVariant.price : (product ? product.price : 0);
  const displayStock = matchingVariant && !allVariantsAreZeroStock
    ? matchingVariant.stock
    : (product ? product.quantity : 0);

  const remainingStock = Math.max(0, displayStock - qty);

  const hasDiscount = !!(product?.discountPercent && product.discountPercent > 0);
  const displayPrice = hasDiscount
    ? originalPrice * (1 - (product.discountPercent || 0) / 100)
    : originalPrice;

  const colorIdx = productId ? productId % CARD_COLORS.length : 0;

  // Determine gallery images dynamically
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

  // Auto-swap active image if selected variant has custom images, or fallback to first product image
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
    } else {
      const prodImgs = product?.images && product.images.length > 0
        ? product.images
        : (product?.imageUrl ? [product.imageUrl] : []);
      if (prodImgs.length > 0) {
        setActiveImageUrl(prodImgs[0]);
      }
    }
  }, [matchingVariant, product]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 p-6 md:p-8 no-scrollbar border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer z-30 font-sans text-lg"
          aria-label="Close modal"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex flex-col md:flex-row gap-8 animate-pulse py-10">
            <div className="md:w-1/2 rounded-2xl h-80 bg-gray-100" />
            <div className="md:w-1/2 space-y-4">
              <div className="h-6 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-10 bg-gray-100 rounded w-1/3" />
              <div className="h-20 bg-gray-100 rounded w-full" />
            </div>
          </div>
        ) : !product ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="text-lg font-bold text-gray-800">Product details could not be loaded.</h3>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 pt-4">
            {/* Left side: Images */}
            <div className="md:w-1/2 space-y-4">
              <div
                className="w-full rounded-2xl flex items-center justify-center min-h-[300px] max-h-[360px] text-[100px] relative overflow-hidden bg-gray-50 border border-gray-100"
                style={{ backgroundColor: CARD_COLORS[colorIdx] }}
              >
                {activeImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  CARD_EMOJIS[colorIdx]
                )}
                {product.category && (
                  <span
                    className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-[#b5374a] uppercase tracking-wider"
                  >
                    {product.category}
                  </span>
                )}
                {displayStock === 0 && (
                  <span
                    className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gray-400 uppercase tracking-wider"
                  >
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {galleryImages && galleryImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {galleryImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageUrl(imgUrl)}
                      className="w-12 h-12 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-transform active:scale-95 shadow-sm"
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

            {/* Right side: Details */}
            <div className="md:w-1/2 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 font-lora mb-2 leading-snug">
                  {product.name}
                </h2>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  {hasDiscount ? (
                    <>
                      <span className="text-2xl font-extrabold text-red-600">
                        {formatPKR(displayPrice)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatPKR(originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {product.discountPercent}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-extrabold text-[#b5374a]">
                      {formatPKR(displayPrice)}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-xs text-gray-500 leading-relaxed mb-5 line-clamp-4">
                    {product.description}
                  </p>
                )}

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Size:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
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

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Color:</h4>
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
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer"
                            style={{
                              borderColor: selected ? "var(--color-primary)" : "var(--color-sand)",
                              backgroundColor: selected ? "var(--color-blush)" : "white",
                            }}
                          >
                            <span
                              className="w-3 h-3 rounded-full border inline-block flex-shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-[10px] font-semibold text-gray-500">
                              {name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock status */}
                <p className="text-xs mb-4 flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: displayStock > 0 ? "var(--color-sage)" : "var(--color-text-light)" }}
                  />
                  <span style={{ color: displayStock > 0 ? "var(--color-sage)" : "var(--color-text-light)" }}>
                    {displayStock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 mt-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="font-bold text-sm w-4 text-center cursor-pointer text-[#b5374a]"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-semibold text-xs">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(displayStock, qty + 1))}
                    className="font-bold text-sm w-4 text-center cursor-pointer text-[#b5374a]"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(product.id, qty, selectedSize || undefined, selectedColor || undefined);
                    onClose();
                  }}
                  disabled={cartLoading || displayStock === 0}
                  className="flex-1 py-2 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm bg-[#b5374a] hover:bg-[#8c2536]"
                  style={{
                    cursor: displayStock === 0 || cartLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {cartLoading ? "Adding..." : displayStock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={() => product && toggle(product)}
                  className="w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    borderColor: wishlisted ? "var(--color-primary)" : "var(--color-sand)",
                    backgroundColor: wishlisted ? "var(--color-blush)" : "white",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill={wishlisted ? "var(--color-primary)" : "none"}
                    stroke="var(--color-primary)" strokeWidth={1.8} className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
