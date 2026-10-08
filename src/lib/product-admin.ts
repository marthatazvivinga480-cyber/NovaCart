import { isProductCategory } from "./commerce.ts";
import type { Product } from "../types.ts";

export function validImagePath(path: string): boolean {
  return (
    /^\/images\/[a-zA-Z0-9_/-]+\.(jpg|jpeg|png|webp)$/.test(path) &&
    !path.includes("//")
  );
}
export function parseProductForm(form: FormData, existing?: Product): Product {
  const name = String(form.get("name") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const category = String(form.get("category") ?? "");
  const image = String(form.get("image") ?? "").trim();
  const tag = String(form.get("tag") ?? "").trim();
  const rawPrice = Number(form.get("price"));
  const price = Math.round(rawPrice * 100) / 100;
  if (!name || name.length > 80)
    throw new Error("Enter a product name of up to 80 characters.");
  if (!description || description.length > 500)
    throw new Error("Enter a description of up to 500 characters.");
  if (!isProductCategory(category))
    throw new Error("Choose a product category.");
  if (!Number.isFinite(rawPrice) || price <= 0 || price > 10000000)
    throw new Error("Enter a valid positive price.");
  if (!validImagePath(image))
    throw new Error(
      "Use a local image path such as /images/products/necklace.jpg.",
    );
  if (tag.length > 40) throw new Error("Keep the label below 40 characters.");
  return {
    id: existing?.id ?? crypto.randomUUID(),
    name,
    description,
    category,
    image,
    tag,
    price,
    createdAt: existing?.createdAt ?? Date.now(),
    ...(existing?.rating !== undefined ? { rating: existing.rating } : {}),
  };
}
