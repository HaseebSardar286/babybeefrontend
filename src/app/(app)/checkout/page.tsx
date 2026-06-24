"use client";

import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { formatPKR, placeOrderAPI } from "@/src/services/productService";
import { useRouter } from "next/navigation";

const steps = ["Shipping", "Payment", "Confirmation"];

const CARD_EMOJIS = ["👕", "🧥", "🌿", "🛏️", "🍼", "🎁", "👶", "🧸"];
const SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 250;
const TAX_RATE = 0.17;

export default function CheckoutPage() {
  const { items, count, loading, refresh } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  const getItemPrices = (item: any) => {
    const matchingVariant = item.product.variants?.find(
      (v: any) => v.size === item.size && v.color === item.color
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
  const tax = +(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  useEffect(() => {
    // If the cart is empty and we haven't completed the order, go back to cart
    if (!loading && items.length === 0 && step < 2) {
      router.push("/cart");
    }
  }, [items, loading, step, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setOrderError("");
    try {
      await placeOrderAPI();
      await refresh();
      setStep(2); // Go to Confirmation
    } catch (err) {
      setOrderError("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading && step < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin text-4xl">🐝</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
        {/* Minimal header */}
        <header
          className="py-5 text-center"
          style={{ borderBottom: "1px solid var(--color-sand)", backgroundColor: "white" }}
        >
          <Link href="/" className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
            BabyBee
          </Link>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
          {/* Progress steps */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300"
                    style={
                      i === step
                        ? { backgroundColor: "var(--color-primary)", color: "white" }
                        : i < step
                          ? { backgroundColor: "var(--color-sage)", color: "white" }
                          : { backgroundColor: "var(--color-sand)", color: "var(--color-text-light)" }
                    }
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span
                    className="text-[10px] sm:text-xs"
                    style={{ color: i === step ? "var(--color-primary)" : "var(--color-text-light)" }}
                  >
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="w-12 sm:w-20 h-0.5 mb-4 sm:mb-5"
                    style={{ backgroundColor: i < step ? "var(--color-sage)" : "var(--color-sand)" }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Form Area */}
            <div className="flex-1 min-w-0">
              {step === 0 && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-dark)" }}>
                      Shipping Information
                    </h2>
                  </div>

                  <div className="rounded-2xl p-5 sm:p-6 mb-6" style={{ backgroundColor: "white", border: "1px solid var(--color-sand)" }}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-mid)" }}>First Name</label>
                        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ali" className="input-field w-full px-4 py-2 border rounded-lg" style={{ borderColor: "var(--color-sand)" }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-mid)" }}>Last Name</label>
                        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Khan" className="input-field w-full px-4 py-2 border rounded-lg" style={{ borderColor: "var(--color-sand)" }} />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-mid)" }}>Delivery Address</label>
                      <input name="address" value={form.address} onChange={handleChange} placeholder="House 1, Street 2, Sector 3" className="input-field w-full px-4 py-2 border rounded-lg" style={{ borderColor: "var(--color-sand)" }} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-mid)" }}>City</label>
                        <input name="city" value={form.city} onChange={handleChange} placeholder="Lahore" className="input-field w-full px-4 py-2 border rounded-lg" style={{ borderColor: "var(--color-sand)" }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-mid)" }}>Province</label>
                        <select name="state" value={form.state} onChange={handleChange} className="input-field w-full px-4 py-2 border rounded-lg" style={{ borderColor: "var(--color-sand)", backgroundColor: "transparent" }}>
                          <option value="">Select</option>
                          <option>Punjab</option>
                          <option>Sindh</option>
                          <option>KPK</option>
                          <option>Balochistan</option>
                          <option>Islamabad</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-mid)" }}>Phone Number</label>
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="0300 1234567" className="input-field w-full px-4 py-2 border rounded-lg" style={{ borderColor: "var(--color-sand)" }} />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!form.firstName || !form.address || !form.phone || !form.city) {
                        alert("Please fill in all required shipping fields.");
                        return;
                      }
                      setStep(1);
                    }}
                    className="w-full py-4 rounded-full text-white font-medium mt-4 transition-all hover:opacity-90"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    Continue to Payment
                  </button>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setStep(0)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition">
                      ←
                    </button>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-dark)" }}>
                      Payment Method
                    </h2>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      { id: "cod", label: "Cash on Delivery (COD)", icon: "💵" },
                      { id: "jazzcash", label: "JazzCash", icon: "📱" },
                      { id: "easypaisa", label: "Easypaisa", icon: "🟢" },
                      { id: "card", label: "Credit / Debit Card", icon: "💳" }
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method.id ? "bg-red-50 border-red-500" : "bg-white border-gray-200"
                        }`}
                        style={{ borderColor: paymentMethod === method.id ? "var(--color-primary)" : "var(--color-sand)" }}
                      >
                        <div className="text-2xl">{method.icon}</div>
                        <div className="flex-1 font-medium text-sm" style={{ color: "var(--color-text-dark)" }}>
                          {method.label}
                        </div>
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: paymentMethod === method.id ? "var(--color-primary)" : "var(--color-sand)" }}
                        >
                          {paymentMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {orderError && (
                    <div className="mb-4 p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>
                      {orderError}
                    </div>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="w-full py-4 rounded-full text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {placingOrder ? "Processing..." : `Place Order • ${formatPKR(total)}`}
                  </button>
                </>
              )}

              {step === 2 && (
                <div className="text-center py-12 px-6 rounded-3xl" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                  <div className="text-8xl mb-6 animate-bounce">🎉</div>
                  <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--color-text-dark)" }}>
                    Thank you for your order!
                  </h2>
                  <p className="text-base mb-8 max-w-md mx-auto" style={{ color: "var(--color-text-mid)" }}>
                    Your order has been placed successfully and will be delivered to you shortly.
                  </p>
                  <Link href="/products" className="btn-primary inline-block">
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            {step < 2 && (
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="rounded-2xl p-6 sticky top-10" style={{ backgroundColor: "var(--color-blush)" }}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold" style={{ color: "var(--color-text-dark)" }}>
                      Order Summary
                    </h3>
                    <span className="text-xs" style={{ color: "var(--color-text-light)" }}>
                      {count} Items
                    </span>
                  </div>

                  <div className="space-y-4 mb-5 max-h-[300px] overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-start">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden border bg-white"
                          style={{ backgroundColor: "var(--color-sand)" }}
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate mb-0.5" style={{ color: "var(--color-text-dark)" }}>
                            {item.product.name}
                          </p>
                          {(item.size || item.color) && (
                            <p className="text-[10px] text-gray-500 truncate mb-1">
                              {[
                                item.size && `Size: ${item.size}`,
                                item.color && `Color: ${item.color.split(":")[0]}`
                              ].filter(Boolean).join(" | ")}
                            </p>
                          )}
                          {(() => {
                            const { originalPrice, discountedPrice, hasDiscount } = getItemPrices(item);
                            return (
                              <div className="flex justify-between mt-1 items-center">
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
                                    {formatPKR(discountedPrice * item.quantity)}
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-[10px] text-gray-400 line-through">
                                      {formatPKR(originalPrice * item.quantity)}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "white", color: "var(--color-text-mid)" }}>
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 text-sm" style={{ borderTop: "1px solid var(--color-blush-mid)" }}>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-mid)" }}>Subtotal</span>
                      <span style={{ color: "var(--color-text-dark)" }}>{formatPKR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-mid)" }}>Shipping</span>
                      <span style={{ color: shipping === 0 ? "var(--color-sage)" : "var(--color-text-dark)", fontWeight: shipping === 0 ? "bold" : "normal" }}>
                        {shipping === 0 ? "FREE" : formatPKR(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-mid)" }}>GST (17%)</span>
                      <span style={{ color: "var(--color-text-dark)" }}>{formatPKR(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-3 mt-3" style={{ borderTop: "1px solid var(--color-blush-mid)" }}>
                      <span style={{ color: "var(--color-text-dark)" }}>Total</span>
                      <span style={{ color: "var(--color-primary)" }}>{formatPKR(total)}</span>
                    </div>
                  </div>

                  <div className="mt-5 p-3 rounded-xl text-center" style={{ backgroundColor: "white" }}>
                    <p className="text-xs font-bold mb-1" style={{ color: "var(--color-text-dark)" }}>🔒 Secure Checkout</p>
                    <p className="text-xs" style={{ color: "var(--color-text-light)" }}>SSL Encrypted Payment</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
