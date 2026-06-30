"use client";

import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { formatPKR, CartItem } from "@/src/services/productService";

const CARD_EMOJIS = ["👕", "🧥", "🌿", "🛏️", "🍼", "🎁", "👶", "🧸"];
const SHIPPING_THRESHOLD = 5000; // Free delivery over Rs. 5,000
const SHIPPING_COST = 250; // Flat Rs. 250 delivery otherwise

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
  const total = subtotal + shipping;

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <>
        <main
          className="min-h-screen flex items-center justify-center pt-24 pb-16 animate-fadeIn"
          style={{ backgroundColor: "var(--color-cream)" }}
        >
          <div className="text-center max-w-sm px-6">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-rose-50 animate-pulse" />
              <div className="relative flex items-center justify-center w-full h-full text-6xl">
                🛒
              </div>
            </div>
            <h1
              className="text-2xl font-bold font-lora mb-3"
              style={{ color: "var(--color-text-dark)" }}
            >
              Your Cart is Empty
            </h1>
            <p
              className="text-xs mb-8 leading-relaxed"
              style={{ color: "var(--color-text-light)" }}
            >
              Browse our organic baby products and pick out something special for your little nestling.
            </p>
            <Link href="/products" className="btn-primary px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover-lift">
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
        className="min-h-screen pt-4 pb-16 animate-fadeIn"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        {/* Breadcrumb */}
        <div
          className="max-w-7xl mx-auto px-6 py-4 text-[10px] uppercase tracking-wider font-semibold"
          style={{ color: "var(--color-text-light)" }}
        >
          <Link href="/" className="hover:text-[#b5374a] transition-colors">
            Home
          </Link>{" "}
          <span className="mx-2">/</span>{" "}
          <span style={{ color: "var(--color-primary)" }}>Shopping Bag</span>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Your Bag</span>
            <h1
              className="text-3xl sm:text-4xl font-bold font-lora mt-1 text-gray-800"
            >
              Shopping Cart
            </h1>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--color-text-light)" }}
            >
              You have {count} {count === 1 ? "item" : "items"} in your cart.
            </p>
          </div>

          {/* Shipping Threshold Progress */}
          <div className="mb-8 bg-white border border-[#ebd0d3]/30 rounded-3xl p-5 shadow-2xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-700">
                {subtotal >= SHIPPING_THRESHOLD ? (
                  <span className="text-emerald-600 font-bold">🎉 Congratulations! You qualify for Free Shipping!</span>
                ) : (
                  <span>
                    Add <strong className="text-[#b5374a]">{formatPKR(SHIPPING_THRESHOLD - subtotal)}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                )}
              </span>
              <span className="text-xs font-bold text-gray-400">Rs. 5,000 Threshold</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Cart Items List */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-3xl p-6 bg-white border border-gray-150/15 animate-pulse flex gap-4"
                    >
                      <div className="w-24 h-24 rounded-2xl bg-gray-200" />
                      <div className="flex-1 space-y-3 pt-2">
                        <div className="h-4 w-1/2 rounded bg-gray-200" />
                        <div className="h-3 w-1/3 rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const { originalPrice, discountedPrice, hasDiscount } = getItemPrices(item);
                    return (
                      <div
                        key={item.id}
                        className="rounded-3xl p-5 bg-white border border-[#ebd0d3]/30 hover:border-[#ebd0d3]/65 transition-all duration-300 shadow-2xs hover:shadow-xs flex flex-col sm:flex-row gap-5 relative group"
                      >
                        {/* Image Column */}
                        <Link
                          href={`/products/${item.product.id}`}
                          className="flex-shrink-0 mx-auto sm:mx-0"
                        >
                          <div
                            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl overflow-hidden border bg-gray-50 border-gray-100"
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

                        {/* Detail Column */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between pt-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <Link href={`/products/${item.product.id}`}>
                                <h3
                                  className="font-bold text-base text-gray-800 font-lora hover:text-[#b5374a] transition-colors leading-snug truncate"
                                >
                                  {item.product.name}
                                </h3>
                              </Link>
                              
                              {/* Product Tags and Variations */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {item.product.category && (
                                  <span
                                    className="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                                    style={{
                                      backgroundColor: "var(--color-blush)",
                                      color: "var(--color-primary)",
                                    }}
                                  >
                                    {item.product.category}
                                  </span>
                                )}
                                {item.size && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-bold uppercase tracking-wider border border-gray-200/50">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-bold flex items-center gap-1.5 border border-gray-200/50">
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

                            {/* Delete/Remove button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              disabled={loading}
                              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer shadow-3xs"
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

                          {/* Pricing & Quantity row */}
                          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-gray-50">
                            {/* Quantity Controls */}
                            <div
                              className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-gray-200 bg-white"
                            >
                              <button
                                onClick={() => updateQty(item.id, item.quantity - 1)}
                                disabled={loading || item.quantity <= 1}
                                className="w-5 h-5 flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-40"
                                style={{ color: "var(--color-primary)" }}
                              >
                                −
                              </button>
                              <span className="text-xs font-bold w-5 text-center text-gray-700">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQty(item.id, item.quantity + 1)}
                                disabled={loading}
                                className="w-5 h-5 flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-40"
                                style={{ color: "var(--color-primary)" }}
                              >
                                +
                              </button>
                            </div>

                            {/* Prices */}
                            <div className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                {hasDiscount ? (
                                  <>
                                    <span className="font-extrabold text-sm text-red-600">
                                      {formatPKR(discountedPrice * item.quantity)}
                                    </span>
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatPKR(originalPrice * item.quantity)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-extrabold text-sm text-gray-800">
                                    {formatPKR(originalPrice * item.quantity)}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-semibold block">
                                {formatPKR(discountedPrice)} each
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Continue Shopping Link */}
              <div className="mt-8">
                <Link
                  href="/products"
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#b5374a] hover:underline"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right Column: Summary & Promotion */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div
                className="rounded-3xl p-6 sticky top-24 border border-[#ebd0d3]/30 shadow-2xs space-y-6"
                style={{ backgroundColor: "var(--color-blush)" }}
              >
                <h3
                  className="font-bold text-lg font-lora border-b pb-3 text-gray-800"
                  style={{ borderColor: "var(--color-blush-mid)" }}
                >
                  Order Summary
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: "var(--color-text-mid)" }}>
                      Subtotal ({count} items)
                    </span>
                    <span className="font-bold text-gray-800">
                      {formatPKR(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: "var(--color-text-mid)" }}>
                      Delivery Charges
                    </span>
                    {shipping === 0 ? (
                      <span
                        style={{ color: "var(--color-teal)" }}
                        className="font-bold uppercase tracking-wider text-[10px]"
                      >
                        Free Delivery 🎉
                      </span>
                    ) : (
                      <span className="font-bold text-gray-800">
                        {formatPKR(shipping)}
                      </span>
                    )}
                  </div>

                  <div
                    className="flex justify-between font-bold text-sm pt-4 border-t"
                    style={{ borderColor: "var(--color-blush-mid)" }}
                  >
                    <span style={{ color: "var(--color-text-dark)" }}>
                      Estimated Total
                    </span>
                    <span className="text-base" style={{ color: "var(--color-primary)" }}>
                      {formatPKR(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout Link */}
                <Link
                  href="/checkout"
                  className="btn-primary w-full text-center py-3.5 block font-bold text-xs uppercase tracking-widest shadow-md hover-lift"
                >
                  Proceed to Checkout
                </Link>

                {/* Secure SSL indicator */}
                <p
                  className="text-center text-[10px] font-semibold flex items-center justify-center gap-1.5 text-gray-400"
                >
                  🔒 Secure SSL 256-bit Encrypted Checkout
                </p>

                {/* Promise Block */}
                <div
                  className="p-4 rounded-2xl bg-white/70 border border-white/50"
                >
                  <p
                    className="text-[10px] font-bold mb-1"
                    style={{ color: "var(--color-primary)" }}
                  >
                    🐝 THE BABYBEE PROMISE
                  </p>
                  <p
                    className="text-[10px] leading-relaxed text-gray-500"
                  >
                    We guarantee 100% skin-safe organic apparel. 30 days hassle-free returns. Swift support at info@babybee.com.
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
