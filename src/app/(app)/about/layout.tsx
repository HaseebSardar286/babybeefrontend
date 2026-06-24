import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | BabyBee — Nurturing Little Ones",
  description: "Learn about BabyBee's journey, our GOTS-certified organic cotton garments, and our commitment to gentle, hypoallergenic, and sustainable baby clothing and nursery essentials.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
