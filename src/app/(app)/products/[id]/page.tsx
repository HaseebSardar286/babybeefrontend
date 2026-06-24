import ProductDetailPage from "./ProductDetailClient";
import { getProductById } from "@/src/services/productService";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProductById(Number(id));
    if (product) {
      const description = product.description
        ? product.description.substring(0, 160).trim()
        : `Buy ${product.name} at BabyBee. Premium organic & sustainable baby essentials.`;

      const title = `${product.name} | BabyBee`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: "website",
          images: product.imageUrl ? [{ url: product.imageUrl }] : [],
        },
      };
    }
  } catch (error) {
    console.warn(`Sitemap/Metadata: Failed to fetch product details for ID ${id} metadata:`, error);
  }

  // Fallback metadata if API is offline or product not found
  return {
    title: "Product Details | BabyBee",
    description: "Premium organic & sustainable baby essentials.",
  };
}

export default async function ProductPage({ params }: Props) {
  return <ProductDetailPage params={params} />;
}
