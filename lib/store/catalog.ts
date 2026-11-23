import { STORE_PRODUCTS, type StoreProduct } from "@/data/store.data";
import { squareEnvironment } from "./config";
import { getProductFile } from "./files";

/**
 * Products a visitor can see and buy right now: placeholders only in sandbox,
 * and never a product whose file is not set up — nobody should be able to pay
 * for something the site cannot deliver.
 */
export function listProducts(): StoreProduct[] {
  const sandbox = squareEnvironment() === "sandbox";
  return STORE_PRODUCTS.filter(
    (p) => (sandbox || !p.placeholder) && getProductFile(p.id) !== undefined
  );
}

export function findProduct(id: string): StoreProduct | undefined {
  return listProducts().find((p) => p.id === id);
}

/** Any product in the catalog, including ones no longer listed — for existing orders. */
export function getProduct(id: string): StoreProduct | undefined {
  return STORE_PRODUCTS.find((p) => p.id === id);
}
