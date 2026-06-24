import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Use the production URL if defined, otherwise fall back to a default domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://babybee.com.pk";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/checkout/",
        "/cart/",
        "/orders/",
        "/wishlist/",
        "/forgot-password/",
        "/reset-password/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
