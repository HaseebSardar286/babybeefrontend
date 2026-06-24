import type { MetadataRoute } from "next";
import { getAllProducts } from "@/src/services/productService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://babybee.com.pk";

  // Define static routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/products",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    // Dynamically fetch products to generate product detail page links
    const products = await getAllProducts();
    if (Array.isArray(products)) {
      const productRoutes = products.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
      return [...staticRoutes, ...productRoutes];
    }
  } catch (error) {
    // If backend is down or unreachable (e.g. during build), log the warning and return static pages only
    console.warn("Sitemap: Backend API unreachable. Generating static sitemap routes only.");
  }

  return staticRoutes;
}
