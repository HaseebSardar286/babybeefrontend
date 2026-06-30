"use client";

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
    email: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    orderNotes: "",
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
  const total = subtotal + shipping;

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
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6f0]/60">
        <div className="animate-spin text-5xl">🐝</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
        
        {/* Minimal header */}
        <header
          className="py-5 text-center border-b bg-white border-[#ebd0d3]/30 shadow-3xs"
        >
          <Link href="/" className="text-2xl font-bold font-lora hover:scale-105 transition-transform inline-block" style={{ color: "var(--color-primary)" }}>
            BabyBee
          </Link>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 animate-fadeIn">
          
          {/* Progress steps capsules */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-12 bg-white/70 backdrop-blur-md px-6 py-4 rounded-full border border-[#ebd0d3]/30 shadow-2xs max-w-xl mx-auto">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={
                      i === step
                        ? { backgroundColor: "var(--color-primary)", color: "white" }
                        : i < step
                          ? { backgroundColor: "var(--color-teal)", color: "white" }
                          : { backgroundColor: "var(--color-sand)", color: "var(--color-text-light)" }
                    }
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline"
                    style={{ color: i === step ? "var(--color-primary)" : i < step ? "var(--color-teal)" : "var(--color-text-light)" }}
                  >
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="w-6 sm:w-10 h-0.5"
                    style={{ backgroundColor: i < step ? "var(--color-teal)" : "var(--color-sand)" }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Main Form Area */}
            <div className="flex-1 min-w-0 w-full">
              {step === 0 && (
                <>
                  <div className="mb-6">
                    <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Step 1 of 2</span>
                    <h2 className="text-2xl font-bold font-lora mt-1 text-gray-800">
                      Shipping Details
                    </h2>
                  </div>

                  <div className="rounded-3xl p-6 mb-6 bg-white border border-[#ebd0d3]/30 shadow-2xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">First Name *</label>
                        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ali" className="input-field" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Last Name *</label>
                        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Khan" className="input-field" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ali.khan@gmail.com" className="input-field" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number *</label>
                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 03001234567" className="input-field" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Delivery Address *</label>
                        <input name="address" value={form.address} onChange={handleChange} placeholder="House, street, sector, area info" className="input-field" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Apartment / Suite</label>
                        <input name="apartment" value={form.apartment} onChange={handleChange} placeholder="Apt 2B, Floor 3 (Optional)" className="input-field" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">City *</label>
                        <input name="city" value={form.city} onChange={handleChange} placeholder="Karachi" className="input-field" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Province *</label>
                        <select name="state" value={form.state} onChange={handleChange} className="input-field" style={{ backgroundColor: "white" }} required>
                          <option value="">Select</option>
                          <option>Punjab</option>
                          <option>Sindh</option>
                          <option>KPK</option>
                          <option>Balochistan</option>
                          <option>Islamabad Capital Territory</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Postal / ZIP Code *</label>
                        <input name="zip" value={form.zip} onChange={handleChange} placeholder="e.g. 75500" className="input-field" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Order Notes & Special Instructions</label>
                      <input name="orderNotes" value={form.orderNotes} onChange={handleChange} placeholder="e.g. Please leave at gate or ring door bell before 6pm..." className="input-field" />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!form.firstName || !form.lastName || !form.email || !form.address || !form.phone || !form.city || !form.state || !form.zip) {
                        alert("Please fill in all the required shipping fields.");
                        return;
                      }
                      if (!form.email.includes("@")) {
                        alert("Please enter a valid email address.");
                        return;
                      }
                      setStep(1);
                    }}
                    className="w-full py-4 rounded-full text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md bg-[#b5374a] hover:bg-[#8c2536] active:scale-[0.99] hover-lift cursor-pointer"
                  >
                    Continue to Payment
                  </button>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep(0)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition shadow-3xs cursor-pointer text-gray-600 font-bold" aria-label="Go Back">
                      ←
                    </button>
                    <div>
                      <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Step 2 of 2</span>
                      <h2 className="text-2xl font-bold font-lora mt-1 text-gray-800">
                        Payment Method
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      { id: "cod", label: "Cash on Delivery (COD)", icon: "💵", desc: "Pay with cash upon package doorstep delivery." },
                      { id: "jazzcash", label: "JazzCash Mobile Wallet", icon: "📱", desc: "Pay instantly from your JazzCash wallet account." },
                      { id: "easypaisa", label: "Easypaisa Wallet", icon: "🟢", desc: "Pay using your Easypaisa wallet application." },
                      { id: "card", label: "Credit or Debit Card", icon: "💳", desc: "Visa, Mastercard, or UnionPay accepted securely." }
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer shadow-3xs hover:border-[#ebd0d3]/60 ${
                          paymentMethod === method.id 
                            ? "bg-white border-[#b5374a] shadow-xs" 
                            : "bg-white/60 border-[#ebd0d3]/20"
                        }`}
                      >
                        <div className="text-3xl p-2 rounded-2xl bg-[#fdf6f0] border border-[#ebd0d3]/20 flex-shrink-0">{method.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-800 font-lora leading-snug">
                            {method.label}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">{method.desc}</p>
                        </div>
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
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
                    <div className="mb-4 p-4 rounded-2xl text-xs font-bold text-red-700 bg-red-50 border border-red-100">
                      {orderError}
                    </div>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="w-full py-4 rounded-full text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md bg-[#b5374a] hover:bg-[#8c2536] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {placingOrder ? "Processing..." : `Place Order • ${formatPKR(total)}`}
                  </button>
                </>
              )}

              {step === 2 && (
                <div className="text-center py-14 px-6 rounded-3xl bg-white border border-[#ebd0d3]/35 shadow-xs max-w-xl mx-auto animate-scaleUp">
                  <div className="text-7xl mb-6">🎉</div>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-widest border border-teal-100 inline-block mb-3 animate-pulse">
                    Order Successful
                  </span>
                  <h2 className="text-3xl font-bold font-lora mb-4 text-gray-800">
                    Thank You for Your Order!
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                    Your organic baby essentials order has been logged into our system successfully. A tracking update email will be sent to you shortly.
                  </p>
                  
                  {/* REDIRECT TO PRODUCTS PAGE AS REQUESTED BY USER */}
                  <Link href="/products" className="btn-primary px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover-lift inline-block cursor-pointer">
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            {step < 2 && (
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="rounded-3xl p-6 bg-white border border-[#ebd0d3]/35 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--color-blush-mid)" }}>
                    <h3 className="font-bold text-gray-800 font-lora">
                      Order Items
                    </h3>
                    <span className="text-[10px] font-bold bg-[#b5374a] text-white px-2 py-0.5 rounded-full">
                      {count} items
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 no-scrollbar">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-start border-b last:border-0 pb-3 last:pb-0 border-gray-50">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden border bg-gray-50 border-gray-100"
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
                          <p className="text-xs font-bold text-gray-800 font-lora truncate mb-0.5">
                            {item.product.name}
                          </p>
                          {(item.size || item.color) && (
                            <p className="text-[9px] text-gray-400 font-semibold truncate mb-1">
                              {[
                                item.size && `Size: ${item.size}`,
                                item.color && `Color: ${item.color.split(":")[0]}`
                              ].filter(Boolean).join(" | ")}
                            </p>
                          )}
                          {(() => {
                            const { originalPrice, discountedPrice, hasDiscount } = getItemPrices(item);
                            return (
                              <div className="flex justify-between items-center mt-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-gray-700">
                                    {formatPKR(discountedPrice * item.quantity)}
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-[10px] text-gray-400 line-through">
                                      {formatPKR(originalPrice * item.quantity)}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] font-bold text-gray-400">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 text-xs" style={{ borderTop: "1px solid var(--color-blush-mid)" }}>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Subtotal</span>
                      <span className="font-bold text-gray-800">{formatPKR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Shipping</span>
                      <span className="font-bold text-gray-800">
                        {shipping === 0 ? (
                          <span style={{ color: "var(--color-teal)" }}>FREE</span>
                        ) : (
                          formatPKR(shipping)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-3 mt-3 border-t border-gray-150/10">
                      <span className="text-gray-800 font-lora">Order Total</span>
                      <span style={{ color: "var(--color-primary)" }}>{formatPKR(total)}</span>
                    </div>
                  </div>

                  <div className="mt-5 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                    <p className="text-[10px] font-bold text-gray-700">🔒 SECURE SSL CHECKOUT</p>
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Your payment & details are fully encrypted</p>
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
