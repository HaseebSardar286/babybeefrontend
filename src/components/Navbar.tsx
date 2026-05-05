"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/src/context/CartContext";
import { useRouter } from "next/navigation";
import { logout } from "@/src/services/authService";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, refresh: refreshCart } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "null") {
      setIsLoggedIn(true);
      try {
        const parts = token.split('.');
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

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setIsAdmin(false);
    refreshCart(); // Clear cart items from state
    router.push("/login");
  };

  const navLinks = [
    { label: "Shop All", href: "/products" },
    { label: "Nursery", href: "/products?category=nursery" },
    { label: "Feeding", href: "/products?category=feeding" },
    { label: "Apparel", href: "/products?category=apparel" },
    { label: "Wellness", href: "/products?category=wellness" },
    { label: "Gifts", href: "/products?category=gifts" },
  ];

  return (
    <header
      style={{
        backgroundColor: "var(--color-cream)",
        borderBottom: "1px solid var(--color-sand)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl"
          style={{ color: "var(--color-primary)" }}
        >
          BabyBee
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Wishlist icon - now pointing to products since wishlist doesn't exist */}
          <Link
            href="/products"
            aria-label="Wishlist"
            style={{ color: "var(--color-text-mid)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </Link>

          {/* Cart icon */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative"
            style={{ color: "var(--color-text-mid)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
            {count > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          {/* User icon / Logout */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href={isAdmin ? "/admin" : "/products"}
                aria-label="Account"
                style={{ color: "var(--color-text-mid)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </Link>
              <button
                onClick={handleLogout}
                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-sand hover:bg-sand transition-colors"
                style={{ color: "var(--color-text-mid)" }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Account"
              style={{ color: "var(--color-text-mid)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            style={{ color: "var(--color-text-mid)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          className="md:hidden px-6 pb-4 flex flex-col gap-3"
          style={{ backgroundColor: "var(--color-cream)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
