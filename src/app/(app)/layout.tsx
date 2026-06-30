"use client";

import { CartProvider } from "@/src/context/CartContext";
import { WishlistProvider } from "@/src/context/WishlistContext";
import Navbar from "@/src/components/Navbar";
import { usePathname } from "next/navigation";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/login") || 
                     pathname.startsWith("/register") || 
                     pathname.startsWith("/forgot-password") || 
                     pathname.startsWith("/reset-password") ||
                     pathname.startsWith("/checkout");
  const isHome = pathname === "/";
  const isAbout = pathname === "/about";

  return (
    <WishlistProvider>
      <CartProvider>
        {!isAuthPage && <Navbar />}
        <div className={!isAuthPage && !isHome && !isAbout ? "pt-24 md:pt-32 pb-10" : ""}>
          {children}
        </div>
      </CartProvider>
    </WishlistProvider>
  );
}
