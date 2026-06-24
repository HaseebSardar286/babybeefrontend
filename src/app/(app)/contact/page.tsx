"use client";

import Footer from "@/src/components/Footer";
import { useState } from "react";
import API from "@/src/services/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/contact", formData);
      if (res.data?.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to deliver message. Check network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
        
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-gray-400">
          <a href="/">Home</a> › <span style={{ color: "var(--color-primary)" }}>Contact Us</span>
        </div>

        {/* Content Container */}
        <section className="max-w-6xl mx-auto px-6 pb-20 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Left: Contact Info */}
            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Get In Touch</span>
                <h1 className="text-4xl font-bold text-gray-800 font-lora mt-2">We would love to hear from your nest.</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed">
                  Have a question about GOTS fabrics, sizing charts, rompers, or a pending order delivery? Drop us a line and our baby care assistants will get back to you within 24 hours.
                </p>
              </div>

              {/* Info Rows */}
              <div className="space-y-5">
                
                <div className="flex gap-4 items-start">
                  <span className="w-10 h-10 rounded-xl bg-[#f7e8ea] text-[#b5374a] flex items-center justify-center text-lg flex-shrink-0">📍</span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Our Workshop</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-normal">Office 402, Block D, Gulberg Green, Islamabad, Pakistan</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-10 h-10 rounded-xl bg-[#f7e8ea] text-[#b5374a] flex items-center justify-center text-lg flex-shrink-0">✉️</span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Email Address</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-normal">support@babybee.com.pk<br />info@babybee.com</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-10 h-10 rounded-xl bg-[#f7e8ea] text-[#b5374a] flex items-center justify-center text-lg flex-shrink-0">📞</span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Phone / WhatsApp</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-normal">+92 312 345 6789<br />Mon - Sat: 9 AM - 6 PM PST</p>
                  </div>
                </div>

              </div>

              {/* Support channels trust points */}
              <div className="p-4 bg-white rounded-2xl border border-rose-50 shadow-sm flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <p className="text-[11px] text-gray-500 leading-normal">
                  <strong>JazzCash, Easypaisa & Cash on Delivery (COD)</strong> are supported across Pakistan. Fast shipment dispatch in 24 hours.
                </p>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6 font-lora border-b pb-3">Send a Message</h3>
              
              {success ? (
                <div className="text-center py-10 space-y-4 animate-scaleUp">
                  <span className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 text-3xl flex items-center justify-center mx-auto shadow-sm">✓</span>
                  <h4 className="text-lg font-bold text-gray-800 font-lora">Message Delivered!</h4>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Thank you for contacting BabyBee. Our baby care nest assistants have received your message and will reply shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="inline-block text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl text-xs font-semibold bg-red-50 text-red-600">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ayesha Khan"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ayesha@email.com"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 03001234567"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Message / Question *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your questions here..."
                      rows={5}
                      className="input-field resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-full text-white font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin text-sm">🐝</span> Delivering...
                      </>
                    ) : (
                      "Deliver Message"
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
