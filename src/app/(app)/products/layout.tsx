import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Organic Baby Clothing & Essentials | BabyBee",
  description: "Browse BabyBee's collection of premium, GOTS-certified organic baby clothing and nursery essentials. Shop rompers, sleepwear, jumpsuits, and 2-piece coordinate sets.",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
