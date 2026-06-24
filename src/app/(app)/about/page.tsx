"use client";

import Footer from "@/src/components/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <main className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
        
        {/* Banner */}
        <section
          className="relative py-20 overflow-hidden flex items-center justify-center text-center bg-cover bg-center"
          style={{
            backgroundImage: "linear-gradient(rgba(44, 26, 31, 0.4), rgba(44, 26, 31, 0.4)), url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80')"
          }}
        >
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-white animate-fadeIn">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#b5374a] px-3 py-1.5 rounded-full text-white inline-block mb-4">Our Story</span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 font-lora">Nurturing Little Ones, Gently.</h1>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl mx-auto">
              Thoughtfully curated organic apparel and baby essentials made with absolute love, safety, and natural sustainability in mind.
            </p>
          </div>
        </section>

        {/* Content Section 1: Philosophy */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Our Philosophy</span>
              <h2 className="text-3xl font-bold text-gray-800 font-lora">Crafted strictly for delicate cocoons.</h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                At <strong>BabyBee</strong>, we believe parenting is a beautiful, anxious, and profound journey. Your baby's clothing shouldn't add to the worry. That is why every single thread, seam, and button is scrutinized under rigorous standards before arriving in your home.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We work strictly with certified GOTS (Global Organic Textile Standard) cotton and natural biodegradable bamboo fibers. Our garments are completely hypoallergenic, chemical-free, and dermatologist-tested, giving your little one absolute comfort.
              </p>
              <div className="flex gap-4 pt-2">
                <Link href="/products" className="btn-primary text-xs font-bold uppercase tracking-wider">Shop Collection</Link>
                <Link href="/contact" className="btn-outline text-xs font-bold uppercase tracking-wider">Contact Us</Link>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-md aspect-[4/3] bg-rose-50 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80"
                alt="Baby modeling organic clothing"
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </section>

        {/* Content Section 2: Values Cards */}
        <section className="bg-white border-t border-b border-gray-100 py-16">
          <div className="max-w-6xl mx-auto px-6">
            
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-bold text-[#b5374a] uppercase tracking-widest">Core Values</span>
              <h2 className="text-3xl font-bold text-gray-800 font-lora mt-1">What defines a BabyBee garment?</h2>
              <p className="text-xs text-gray-400 mt-2">Our commitment to sustainable production and complete skin-safety</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              
              <div className="bg-[#fdf6f0] p-6 rounded-2xl border border-rose-50/50 hover-lift text-center">
                <span className="text-4xl block mb-4">🌿</span>
                <h4 className="font-bold text-sm text-gray-800 mb-2 font-lora">100% GOTS Certified</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Made from organic cotton harvested without synthetic pesticides or toxic dyes.</p>
              </div>

              <div className="bg-[#fdf6f0] p-6 rounded-2xl border border-rose-50/50 hover-lift text-center">
                <span className="text-4xl block mb-4">🧪</span>
                <h4 className="font-bold text-sm text-gray-800 mb-2 font-lora">Dermatologist Approved</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Hypoallergenic stitching vetted safe for newborn eczema and dry baby skin.</p>
              </div>

              <div className="bg-[#fdf6f0] p-6 rounded-2xl border border-rose-50/50 hover-lift text-center">
                <span className="text-4xl block mb-4">🧸</span>
                <h4 className="font-bold text-sm text-gray-800 mb-2 font-lora">Ergonomic Fit</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Stretchable tags, premium nickelfree snaps, and simple overlays for fast diaper changes.</p>
              </div>

              <div className="bg-[#fdf6f0] p-6 rounded-2xl border border-rose-50/50 hover-lift text-center">
                <span className="text-4xl block mb-4">♻️</span>
                <h4 className="font-bold text-sm text-gray-800 mb-2 font-lora">Eco-Friendly Craft</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Biodegradable packaging and ethical factory operations with zero wastage.</p>
              </div>

            </div>

          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <span className="text-4xl mb-4 inline-block">🐝</span>
          <h2 className="text-3xl font-bold text-gray-800 font-lora mb-3">Join our boutique parenting community</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-6">
            Get early alerts on organic stock drops, premium clothing sales, and parenting insights delivered straight to your inbox.
          </p>
          <Link href="/register" className="btn-primary text-xs font-bold uppercase tracking-wider active:scale-95 transition-all shadow-md">
            Create Free Account
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
