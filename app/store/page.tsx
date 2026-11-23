import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoreClient from "./page.client";
import { listProducts } from "@/lib/store/catalog";
import { getSquareConfig } from "@/lib/store/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Store",
  description: "Downloads from Anthony Dake.",
  alternates: { canonical: "/store" },
  // Unlisted on purpose: not in the nav, not in the sitemap, not indexed.
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StorePage({ searchParams }: Props) {
  // Empty is correct: with no Square keys or nothing to sell, the page 404s.
  const config = getSquareConfig();
  const products = listProducts();
  if (!config || products.length === 0) notFound();

  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  return (
    <StoreClient
      products={products}
      sandbox={config.environment === "sandbox"}
      error={error}
    />
  );
}
