"use client";

import { CartProvider } from "@/src/context/CartContext";
import Navbar from "@/src/components/Navbar";
import { usePathname } from "next/navigation";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  return (
    <CartProvider>
      {!isAuthPage && <Navbar />}
      {children}
    </CartProvider>
  );
}
