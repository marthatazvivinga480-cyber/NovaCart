import test from "node:test";
import assert from "node:assert/strict";
import { ADMIN_UID, isAdminUser } from "./admin-config.ts";
import { parseProductForm, validImagePath } from "./product-admin.ts";
import { initialProducts } from "../data/catalogue.ts";

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values = {
    name: "My necklace",
    description: "A demo jewellery piece.",
    category: "Jewellery",
    price: "249.99",
    image: "/images/products/silver-necklace.jpg",
    tag: "New arrival",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
test("admin UI recognises only the configured owner", () => {
  assert.equal(isAdminUser(ADMIN_UID), true);
  for (const uid of [
    null,
    undefined,
    "",
    "customer-account",
    ADMIN_UID.toLowerCase(),
  ])
    assert.equal(isAdminUser(uid), false);
});
test("new product gets its own ID without inventing a rating", () => {
  const product = parseProductForm(form());
  assert.equal(product.price, 249.99);
  assert.ok(product.id.length > 0);
  assert.equal(product.rating, undefined);
  assert.equal(product.category, "Jewellery");
});
test("editing keeps product identity and dates used by saved carts and sorting", () => {
  const existing = initialProducts[0];
  const updated = parseProductForm(
    form({ name: "Updated necklace", price: "399.99" }),
    existing,
  );
  assert.equal(updated.id, existing.id);
  assert.equal(updated.createdAt, existing.createdAt);
  assert.equal(updated.rating, existing.rating);
  assert.equal(updated.name, "Updated necklace");
  assert.equal(existing.name, "Silver double-circle necklace");
});
test("product inputs reject invalid prices, categories and unsafe picture paths", () => {
  for (const price of ["0", "-2", "NaN", "Infinity", "10000001"])
    assert.throws(() => parseProductForm(form({ price })));
  assert.throws(() => parseProductForm(form({ category: "All" })));
  assert.throws(() => parseProductForm(form({ name: " " })));
  for (const image of [
    "javascript:alert(1)",
    "data:image/png;base64,a",
    "https://other.example/photo.jpg",
    "/images/../secret.jpg",
    "/images//photo.jpg",
    "/images/photo.svg",
  ]) {
    assert.equal(validImagePath(image), false);
    assert.throws(() => parseProductForm(form({ image })));
  }
  for (const product of initialProducts)
    assert.equal(validImagePath(product.image), true);
});
