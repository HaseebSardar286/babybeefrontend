"use client";

import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { formatPKR, CartItem } from "@/src/services/productService";

const CARD_EMOJIS = ["👕", "🧥", "🌿", "🛏️", "🍼", "🎁", "👶", "🧸"];
const SHIPPING_THRESHOLD = 5000; // Free delivery over Rs. 5,000
const SHIPPING_COST = 250; // Flat Rs. 250 delivery otherwise
const TAX_RATE = 0.17; // 17% GST Pakistan

export default function CartPage() {
  const { items, count, loading, removeFromCart, updateQty } = useCart();

  const getItemPrices = (item: CartItem) => {
    const matchingVariant = item.product.variants?.find(
      (v) => v.size === item.size && v.color === item.color
    );
    const originalPrice = matchingVariant ? matchingVariant.price : item.product.price;
    const hasDiscount = !!(item.product.discountPercent && item.product.discountPercent > 0);
    const discountedPrice = hasDiscount
      ? originalPrice * (1 - (item.product.discountPercent || 0) / 100)
      : originalPrice;
    return { originalPrice, discountedPrice, hasDiscount };
  };

  const subtotal = items.reduce((acc, item) => {
    const { discountedPrice } = getItemPrices(item);
    return acc + discountedPrice * item.quantity;
  }, 0);

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const gst = +(subtotal * TAX_RATE);
  const total = subtotal + shipping + gst;

  if (!loading && items.length === 0) {
    return (
      <>
        <main
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--color-cream)" }}
        >
          <div className="text-center max-w-sm px-6">
            <div className="text-7xl mb-5">🛒</div>
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--color-text-dark)" }}
            >
              Your cart is empty
            </h1>
            <p
              className="text-sm mb-8"
              style={{ color: "var(--color-text-light)" }}
            >
              Browse our organic baby products and pick out something special
              for your little one.
            </p>
            <Link href="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        {/* Breadcrumb */}
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs"
          style={{ color: "var(--color-text-light)" }}
        >
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          › <span style={{ color: "var(--color-primary)" }}>Shopping Cart</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--color-text-dark)" }}
            >
              Your Shopping Bag
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-light)" }}
            >
              {count} {count === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          {/* Free shipping banner */}
          {subtotal < SHIPPING_THRESHOLD && (
            <div
              className="mb-6 px-5 py-3 rounded-2xl text-sm flex items-center gap-3"
              style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}
            >
              <span className="text-xl">🚚</span>
              <span>
                Free delivery on orders above {formatPKR(SHIPPING_THRESHOLD)}{" "}
                (Add <strong>{formatPKR(SHIPPING_THRESHOLD - subtotal)}</strong>{" "}
                more)
              </span>
            </div>
          )}
          {subtotal >= SHIPPING_THRESHOLD && (
            <div
              className="mb-6 px-5 py-3 rounded-2xl text-sm flex items-center gap-3"
              style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}
            >
              <span className="text-xl">🎉</span>
              <span>Congratulations! You qualify for FREE delivery!</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Cart Items ─────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-5 animate-pulse"
                      style={{ backgroundColor: "white" }}
                    >
                      <div className="flex gap-4">
                        <div
                          className="w-20 h-20 rounded-xl flex-shrink-0"
                          style={{ backgroundColor: "var(--color-sand)" }}
                        />
                        <div className="flex-1 space-y-2 pt-1">
                          <div
                            className="h-4 w-1/2 rounded"
                            style={{
                              backgroundColor: "var(--color-blush-mid)",
                            }}
                          />
                          <div
                            className="h-3 w-1/3 rounded"
                            style={{
                              backgroundColor: "var(--color-blush-mid)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl p-4 sm:p-5"
                      style={{
                        backgroundColor: "white",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="flex gap-4">
                        {/* Dynamic Image or Emoji thumbnail */}
                        <Link
                          href={`/products/${item.product.id}`}
                          className="flex-shrink-0"
                        >
                          <div
                            className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl overflow-hidden border"
                            style={{ backgroundColor: "var(--color-blush)" }}
                          >
                            {item.product.imageUrl || (item.product.images && item.product.images.length > 0) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.product.imageUrl || (item.product.images && item.product.images[0])}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              CARD_EMOJIS[item.product.id % CARD_EMOJIS.length]
                            )}
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link href={`/products/${item.product.id}`}>
                                <h3
                                  className="font-semibold text-sm leading-snug truncate"
                                  style={{ color: "var(--color-text-dark)" }}
                                >
                                  {item.product.name}
                                </h3>
                              </Link>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {item.product.category && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: "var(--color-blush)",
                                      color: "var(--color-text-mid)",
                                    }}
                                  >
                                    {item.product.category}
                                  </span>
                                )}
                                {item.size && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-semibold flex items-center gap-1">
                                    Color: {item.color.includes(":") ? (
                                      <>
                                        <span
                                          className="w-2.5 h-2.5 rounded-full inline-block border border-gray-300 flex-shrink-0"
                                          style={{ backgroundColor: item.color.split(":")[1] }}
                                        />
                                        {item.color.split(":")[0]}
                                      </>
                                    ) : (
                                      item.color
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Delete button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              disabled={loading}
                              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-red-50"
                              style={{ color: "#e53935" }}
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zm0 1.5h2.5c.69 0 1.25.56 1.25 1.25v.31a43.552 43.552 0 00-5 0v-.31c0-.69.56-1.25 1.25-1.25zM7.5 7.5a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5zm3.5 0a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Unit price */}
                          {(() => {
                            const { originalPrice, discountedPrice, hasDiscount } = getItemPrices(item);
                            return (
                              <>
                                <div className="flex items-center gap-2 mt-1.5">
                                  {hasDiscount ? (
                                    <>
                                      <span className="font-bold text-xs text-red-600">
                                        {formatPKR(discountedPrice)}
                                      </span>
                                      <span className="text-[10px] text-gray-400 line-through">
                                        {formatPKR(originalPrice)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-semibold text-xs" style={{ color: "var(--color-primary)" }}>
                                      {formatPKR(originalPrice)}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-400">each</span>
                                </div>

                                {/* Qty + line total */}
                                <div className="flex items-center justify-between mt-3">
                                  {/* Qty controls */}
                                  <div
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                                    style={{
                                      borderColor: "var(--color-sand)",
                                      backgroundColor: "var(--color-cream)",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        updateQty(item.id, item.quantity - 1)
                                      }
                                      disabled={loading || item.quantity <= 1}
                                      className="w-5 h-5 flex items-center justify-center font-bold text-base leading-none disabled:opacity-40"
                                      style={{ color: "var(--color-primary)" }}
                                    >
                                      −
                                    </button>
                                    <span className="text-sm font-medium w-5 text-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateQty(item.id, item.quantity + 1)
                                      }
                                      disabled={loading}
                                      className="w-5 h-5 flex items-center justify-center font-bold text-base leading-none disabled:opacity-40"
                                      style={{ color: "var(--color-primary)" }}
                                    >
                                      +
                                    </button>
                                  </div>

                                  {/* Line total */}
                                  <span
                                    className="font-bold text-sm"
                                    style={{ color: "var(--color-text-dark)" }}
                                  >
                                    {formatPKR(discountedPrice * item.quantity)}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <Link
                  href="/products"
                  className="text-sm font-medium flex items-center gap-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  ← Continue Shopping
                </Link>
              </div>

              {/* Delivery info */}
              <div
                className="mt-6 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
                style={{ backgroundColor: "var(--color-blush)" }}
              >
                {[
                  {
                    icon: "🚚",
                    title: "Fast Delivery",
                    sub: "2-4 days nationwide",
                  },
                  { icon: "🔄", title: "Easy Returns", sub: "Within 30 days" },
                  {
                    icon: "💳",
                    title: "Payment",
                    sub: "JazzCash · Easypaisa · COD",
                  },
                ].map((b) => (
                  <div key={b.title}>
                    <div className="text-2xl mb-1">{b.icon}</div>
                    <p
                      className="font-semibold text-xs"
                      style={{ color: "var(--color-text-dark)" }}
                    >
                      {b.title}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      {b.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Order Summary ─────────────────────────────────── */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div
                className="rounded-2xl p-6 sticky top-24"
                style={{ backgroundColor: "var(--color-blush)" }}
              >
                <h3
                  className="font-bold text-lg mb-5"
                  style={{ color: "var(--color-text-dark)" }}
                >
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-mid)" }}>
                      Subtotal ({count} items)
                    </span>
                    <span style={{ color: "var(--color-text-dark)" }}>
                      {formatPKR(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-mid)" }}>
                      Delivery Charges
                    </span>
                    {shipping === 0 ? (
                      <span
                        style={{ color: "var(--color-sage)" }}
                        className="font-medium"
                      >
                        FREE 🎉
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-text-dark)" }}>
                        {formatPKR(shipping)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-mid)" }}>
                      GST (17%)
                    </span>
                    <span style={{ color: "var(--color-text-dark)" }}>
                      {formatPKR(gst)}
                    </span>
                  </div>

                  <div
                    className="flex justify-between font-bold text-base pt-4 border-t"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <span style={{ color: "var(--color-text-dark)" }}>
                      Total
                    </span>
                    <span style={{ color: "var(--color-primary)" }}>
                      {formatPKR(total)}
                    </span>
                  </div>
                </div>

                {/* Payment methods */}
                <div
                  className="flex flex-wrap gap-2 mb-5 p-3 rounded-xl justify-center"
                  style={{ backgroundColor: "white" }}
                >
                  {["JazzCash", "Easypaisa", "COD", "Card"].map((pm) => (
                    <span
                      key={pm}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: "var(--color-blush)",
                        color: "var(--color-text-mid)",
                      }}
                    >
                      {pm}
                    </span>
                  ))}
                </div>

                <Link
                  href="/checkout"
                  className="btn-primary w-full text-center py-4 block"
                >
                  Proceed to Checkout
                </Link>

                <p
                  className="text-center text-xs mt-3 flex items-center justify-center gap-1"
                  style={{ color: "var(--color-text-light)" }}
                >
                  🔒 Secure SSL Payment
                </p>

                {/* BabyBee promise */}
                <div
                  className="mt-5 p-4 rounded-xl"
                  style={{ backgroundColor: "white" }}
                >
                  <p
                    className="text-xs font-bold mb-1"
                    style={{ color: "var(--color-primary)" }}
                  >
                    🐝 BABYBEE PROMISE
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    100% authentic & organic products. 30 days return policy.
                    Fast delivery across Pakistan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
