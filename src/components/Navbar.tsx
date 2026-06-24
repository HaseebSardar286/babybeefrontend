"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { useRouter } from "next/navigation";
import { logout } from "@/src/services/authService";

interface NavCategory {
  id?: number;
  name: string;
  slug: string;
  imageUrl?: string;
}

// Curated high-res images for baby apparel categories
const FALLBACK_CATEGORIES = [
  { name: "New Arrivals", slug: "new-arrivals", imageUrl: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&q=80" },
  { name: "Newborn", slug: "newborn", imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80" },
  { name: "Boys", slug: "boys", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80" },
  { name: "Girls", slug: "girls", imageUrl: "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=400&q=80" },
  { name: "Comfort", slug: "comfort", imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=400&q=80" },
  { name: "Sale", slug: "sale", imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80" },
  { name: "Jumpsuits", slug: "jumpsuits", imageUrl: "https://images.unsplash.com/photo-1604467731651-1d547738218a?w=400&q=80" },
  { name: "2-Piece Sets", slug: "2-piece-sets", imageUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&q=80" },
  { name: "Sleepwear", slug: "sleepwear", imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, refresh: refreshCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<"shop" | "products" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleMouseEnter = (type: "shop" | "products") => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(type);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 250);
    setDropdownTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeout) clearTimeout(dropdownTimeout);
    };
  }, [dropdownTimeout]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "null") {
      setIsLoggedIn(true);
      try {
        const parts = token.split(".");
        if (parts.length > 1) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.role && payload.role.toUpperCase() === "ADMIN") {
            setIsAdmin(true);
          }
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

    fetch(`${baseUrl}/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        const loaded: NavCategory[] = Array.isArray(data) ? data : [];
        // Mix custom image fallback if missing
        const combined = FALLBACK_CATEGORIES.map(fb => {
          const match = loaded.find(l => l.slug === fb.slug || l.name.toLowerCase() === fb.name.toLowerCase());
          return {
            ...fb,
            id: match?.id,
            imageUrl: match?.imageUrl || fb.imageUrl
          };
        });
        setCategories(combined);
      })
      .catch((err) => {
        console.error("Failed to fetch categories", err);
        setCategories(FALLBACK_CATEGORIES);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setIsAdmin(false);
    refreshCart();
    router.push("/login");
  };

  return (
    <header
      style={{
        backgroundColor: "transparent",
        borderBottom: "none",
      }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      {/* Top Value Banner */}
      <div className="bg-[#b5374a] text-white text-[10px] py-1.5 px-6 font-semibold tracking-wider text-center flex items-center justify-center gap-2">
        <span>✨ FREE SHIPPING ON ALL ORDERS OVER RS. 5,000 ✨</span>
      </div>

      <div className="w-full px-4 md:px-8 py-4 flex items-center justify-between relative">
        
        {/* Left Side: Logo */}
        <Link
          href="/"
          className="flex items-center hover:scale-105 transition-transform duration-300 z-[60] flex-shrink-0"
          style={{ color: "var(--color-primary)" }}
        >
          {/* Logo Icon */}
          <img 
            src="/images/logo.png" 
            alt="BabyBee Logo" 
            className="w-20 h-20 md:w-20 md:h-20 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]"
          />
        </Link>

        {/* Center: Desktop Navigation links inside a floating glass pod */}
        <nav className="hidden md:flex items-center gap-8 px-8 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[#f5eae3]/60 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:bg-white/95 hover:border-[#f5eae3]/90 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all duration-300">
          
          {/* SHOP WITH BADGE */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => handleMouseEnter("shop")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white bg-teal-500 uppercase tracking-widest leading-none">
              New
            </div>
            <Link 
              href="/products" 
              className={`nav-link text-sm font-semibold transition-colors cursor-pointer pt-2 ${
                activeDropdown === "shop" ? "text-[#b5374a]" : "text-gray-700"
              }`}
            >
              Shop
            </Link>
          </div>

          {/* PRODUCTS */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => handleMouseEnter("products")}
            onMouseLeave={handleMouseLeave}
          >
            <Link 
              href="/products" 
              className={`nav-link text-sm font-semibold transition-colors cursor-pointer pt-2 ${
                activeDropdown === "products" ? "text-[#b5374a]" : "text-gray-700"
              }`}
            >
              Products
            </Link>
          </div>

          {/* SALE WITH BADGE */}
          <div className="relative h-full flex items-center">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white bg-amber-500 uppercase tracking-widest leading-none">
              Sale
            </div>
            <Link href="/products?category=sale" className="nav-link text-sm font-semibold text-gray-700 pt-2">
              Sale
            </Link>
          </div>

          <Link href="/products" className="nav-link text-sm font-semibold text-gray-700 pt-2">
            Size Chart
          </Link>

          <Link href="/about" className="nav-link text-sm font-semibold text-gray-700 pt-2">
            About
          </Link>

          <Link href="/contact" className="nav-link text-sm font-semibold text-gray-700 pt-2">
            Contact
          </Link>
        </nav>

        {/* Right Side Actions inside a floating glass pod */}
        <div className="flex items-center gap-5 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[#f5eae3]/60 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:bg-white/95 hover:border-[#f5eae3]/90 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all duration-300">
          
          {/* Search Icon & Input */}
          <div className="flex items-center gap-2 relative">
            <div className={`overflow-hidden transition-all duration-300 flex items-center ${searchOpen ? "w-44 md:w-64 opacity-100" : "w-0 opacity-0"}`}>
              <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs px-4 py-1.5 rounded-full border border-gray-200 outline-none focus:border-[#b5374a] bg-white/90"
                  ref={(input) => { if (input && searchOpen) input.focus(); }}
                />
              </form>
            </div>
            <button
              onClick={() => {
                if (searchOpen && searchQuery.trim()) {
                  router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                  setSearchOpen(false);
                } else {
                  setSearchOpen(!searchOpen);
                }
              }}
              aria-label="Search"
              className="text-gray-500 hover:text-[#b5374a] transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5.5 h-5.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </button>
          </div>

          {/* Wishlist Link */}
          <Link href="/wishlist" aria-label="Wishlist" className="relative text-gray-500 hover:text-[#b5374a] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5.5 h-5.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {wishlistCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ backgroundColor: "#b5374a" }}
              >
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-gray-500 hover:text-[#b5374a] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5.5 h-5.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            {count > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          {/* User Sign-In / Account Dashboard */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href={isAdmin ? "/admin" : "/products"}
                aria-label="Account"
                className="text-gray-500 hover:text-[#b5374a] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5.5 h-5.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
              <button
                onClick={handleLogout}
                className="text-[11px] font-medium uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-rose-200 bg-rose-50/50 hover:bg-[#b5374a] hover:text-white hover:border-[#b5374a] transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Account"
              className="text-gray-500 hover:text-[#b5374a] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5.5 h-5.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          )}

          {/* Mobile hamburger menu */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

        </div>

        {/* ─── DYNAMIC HOVER DROPDOWNS ─── */}

        {/* 1. SHOP MEGA-MENU: Grid Cards with background images (Image 3) */}
        {activeDropdown === "shop" && (
          <div
            className="absolute left-0 right-0 top-full bg-white border-t border-b border-gray-100 shadow-xl z-50 animate-slideDown max-h-[85vh] overflow-y-auto px-6 py-8"
            onMouseEnter={() => handleMouseEnter("shop")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#b5374a]">Curated Fall Collection</h3>
                <Link href="/products" className="text-xs font-medium text-gray-500 hover:text-[#b5374a] transition-colors">View All Collections &rarr;</Link>
              </div>

              {/* Grid of Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {categories.slice(0, 9).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    className="relative group rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 shadow-sm"
                  >
                    {/* Background Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 z-10 transition-colors" />
                    
                    {/* Category Photo */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Centered Name */}
                    <span className="relative z-20 text-white font-bold text-sm tracking-wide group-hover:scale-[1.03] transition-transform">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS MEGA-MENU: 4-Column Layout containing links (Image 2) */}
        {activeDropdown === "products" && (
          <div
            className="absolute left-0 right-0 top-full bg-white border-t border-b border-gray-100 shadow-xl z-50 animate-slideDown px-6 py-10"
            onMouseEnter={() => handleMouseEnter("products")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Column 1: Categories Section */}
              <div>
                <h4 className="text-[11px] font-bold text-[#b5374a] uppercase tracking-wider mb-4 border-b pb-2">INFANTS</h4>
                <ul className="space-y-2.5">
                  {["Rompers", "2-Piece Sets", "Sleepwear", "Jumpsuits"].map((item) => (
                    <li key={item}>
                      <Link href={`/products?category=${item.toLowerCase()}`} className="text-xs text-gray-600 hover:text-[#b5374a] font-medium transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: TODDLER GIRLS */}
              <div>
                <h4 className="text-[11px] font-bold text-[#b5374a] uppercase tracking-wider mb-4 border-b pb-2">TODDERS</h4>
                <ul className="space-y-2.5">
                  {["Toddler Girls", "Toddler Boys", "Newborn", "Organic Cotton"].map((item) => (
                    <li key={item}>
                      <Link href={`/products?category=${item.toLowerCase()}`} className="text-xs text-gray-600 hover:text-[#b5374a] font-medium transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: COLLECTIONS */}
              <div>
                <h4 className="text-[11px] font-bold text-[#b5374a] uppercase tracking-wider mb-4 border-b pb-2">COLLECTIONS</h4>
                <ul className="space-y-2.5">
                  {["New Arrivals", "Best Sellers", "Sale Items", "Gift Sets"].map((item) => (
                    <li key={item}>
                      <Link href={`/products?category=${item.toLowerCase()}`} className="text-xs text-gray-600 hover:text-[#b5374a] font-medium transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: Promotional visual card */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end p-5 min-h-[160px] group bg-rose-50">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80"
                  alt="Baby model overalls"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="relative z-20 text-white">
                  <h5 className="font-bold text-xs uppercase tracking-wider mb-1" style={{ fontFamily: "'Lora', serif" }}>Baby Comfort</h5>
                  <p className="text-[10px] text-white/90 mb-2">100% GOTS Organic Cotton</p>
                  <Link href="/products" className="inline-block text-[9px] font-bold uppercase tracking-wider bg-white text-[#b5374a] px-3 py-1.5 rounded-full transition-transform hover:scale-105 shadow-sm">
                    Shop 2026 Collection
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Mobile nav screen */}
      {mobileOpen && (
        <nav
          className="md:hidden px-6 pb-6 flex flex-col gap-4 animate-fadeIn"
          style={{ backgroundColor: "var(--color-cream)", borderTop: "1px solid var(--color-sand)" }}
        >
          <Link
            href="/products"
            className="font-semibold text-sm text-gray-700 py-2 border-b border-gray-100/50"
            onClick={() => setMobileOpen(false)}
          >
            Shop All
          </Link>
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="text-sm text-gray-600 py-1.5 pl-3"
              onClick={() => setMobileOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/about"
            className="font-semibold text-sm text-gray-700 py-2 border-t border-gray-100/50"
            onClick={() => setMobileOpen(false)}
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="font-semibold text-sm text-gray-700 py-2"
            onClick={() => setMobileOpen(false)}
          >
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
