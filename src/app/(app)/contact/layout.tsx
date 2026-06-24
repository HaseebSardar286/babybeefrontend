import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | BabyBee — Nurturing Little Ones",
  description: "Get in touch with BabyBee. Have questions about our GOTS-certified fabrics, sizing charts, rompers, or a pending order delivery? Contact our Islamabad-based support team.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
