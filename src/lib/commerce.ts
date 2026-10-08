import type {
  Cart,
  Product,
  ProductCategory,
  ProductFilters,
} from "../types.ts";
import { categories } from "../data/catalogue.ts";
export const PRODUCT_STORAGE_KEY = "nova-fashion-products";
export const CART_STORAGE_KEY = "nova-cart";
export const WISHLIST_STORAGE_KEY = "nova-wishlist";

export function readWishlist(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is string => typeof id === "string" && id.length > 0,
          ),
        ),
      ]
    : [];
}

export function toggleWishlist(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((saved) => saved !== id) : [...ids, id];
}
export function readStored(key: string, fallback: unknown): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function isProductCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === "string" &&
    value !== "All" &&
    categories.some((category) => category === value)
  );
}
export function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    isProductCategory(p.category) &&
    typeof p.price === "number" &&
    Number.isFinite(p.price) &&
    p.price > 0 &&
    typeof p.image === "string" &&
    typeof p.tag === "string" &&
    typeof p.description === "string"
  );
}
export function readCart(value: unknown): Cart {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, quantity]) =>
        typeof quantity === "number" &&
        Number.isSafeInteger(quantity) &&
        quantity > 0,
    ),
  );
}
export function loadCatalogue(seeds: Product[], stored: unknown): Product[] {
  const seedIds = new Set(seeds.map((p) => p.id));
  const uploaded = Array.isArray(stored)
    ? stored.filter(isProduct).filter((p) => !seedIds.has(p.id))
    : [];
  return [...seeds, ...uploaded];
}
export function changeQuantity(cart: Cart, id: string, delta: number): Cart {
  const quantity = Math.max(0, (cart[id] || 0) + delta);
  const next = { ...cart };
  if (quantity) next[id] = quantity;
  else delete next[id];
  return next;
}
export function filterProducts(
  products: Product[],
  { category, query, sort }: ProductFilters,
): Product[] {
  const search = query.trim().toLocaleLowerCase();
  return products
    .filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (p.name + " " + p.category).toLocaleLowerCase().includes(search),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "newest"
            ? (b.createdAt ?? 0) - (a.createdAt ?? 0)
            : sort === "rated"
              ? (b.rating ?? 0) - (a.rating ?? 0)
              : relevanceScore(b, search) - relevanceScore(a, search),
    );
}
function relevanceScore(product: Product, search: string): number {
  if (!search) return 0;
  const name = product.name.toLocaleLowerCase();
  return name === search
    ? 4
    : name.startsWith(search)
      ? 3
      : name.includes(search)
        ? 2
        : 1;
}
export const money = (value: number): string =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value);
