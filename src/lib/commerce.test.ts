import test from "node:test";
import assert from "node:assert/strict";
import { initialProducts } from "../data/catalogue.ts";

test("newest and top-rated order products using their metadata", () => {
  const newest = filterProducts(initialProducts, {
    category: "All",
    query: "",
    sort: "newest",
  });
  const rated = filterProducts(initialProducts, {
    category: "All",
    query: "",
    sort: "rated",
  });
  assert.equal(
    newest[0].createdAt,
    Math.max(...initialProducts.map((product) => product.createdAt ?? 0)),
  );
  assert.equal(rated[0].rating, 4.9);
  for (let index = 1; index < rated.length; index++)
    assert.ok((rated[index - 1].rating ?? 0) >= (rated[index].rating ?? 0));
});

test("relevance prefers product-name matches over category-only matches", () => {
  const products = [
    {
      ...initialProducts[0],
      id: "category",
      name: "Weekend outfit",
      category: "Phones" as const,
    },
    { ...initialProducts[0], id: "name", name: "Phones" },
  ];
  assert.equal(
    filterProducts(products, {
      category: "All",
      query: "phones",
      sort: "relevance",
    })[0].id,
    "name",
  );
});
import {
  loadCatalogue,
  changeQuantity,
  filterProducts,
  money,
  readWishlist,
  toggleWishlist,
} from "./commerce.ts";

test("wishlist validates saved data and toggles without changing the original", () => {
  assert.deepEqual(readWishlist(["p1", "p1", null, 42, ""]), ["p1"]);
  assert.deepEqual(readWishlist({}), []);
  const saved = ["p1"];
  assert.deepEqual(toggleWishlist(saved, "p2"), ["p1", "p2"]);
  assert.deepEqual(toggleWishlist(saved, "p1"), []);
  assert.deepEqual(saved, ["p1"]);
});

test("catalogue refresh adds phones and preserves uploaded products", () => {
  const uploaded: import("../types.ts").Product = {
    id: "custom",
    name: "My necklace",
    category: "Jewellery",
    price: 99,
    image: "data:image/jpeg;base64,a",
    tag: "",
    description: "Test product",
  };
  const products = loadCatalogue(initialProducts, [
    ...initialProducts.slice(0, 6),
    uploaded,
  ]);
  assert.equal(
    products.filter((product) => product.category === "Phones").length,
    3,
  );
  assert.equal(products.filter((product) => product.id === "p1").length, 1);
  assert.deepEqual(products.at(-1), uploaded);
  assert.equal(
    loadCatalogue(initialProducts, {}).length,
    initialProducts.length,
  );
});
test("cart updates are immutable and remove items at zero", () => {
  const original = { p1: 1 };
  assert.deepEqual(changeQuantity(original, "p1", -1), {});
  assert.deepEqual(changeQuantity(original, "p1", 1), { p1: 2 });
  assert.deepEqual(original, { p1: 1 });
});
test("search, categories and price sorting compose without mutating source", () => {
  const originalIds = initialProducts.map((product) => product.id);
  const phones = filterProducts(initialProducts, {
    category: "Phones",
    query: " SMARTPHONE ",
    sort: "high",
  });
  assert.equal(phones.length, 3);
  assert.ok(phones[0].price > phones[1].price);
  assert.deepEqual(
    initialProducts.map((product) => product.id),
    originalIds,
  );
  assert.equal(
    filterProducts(initialProducts, {
      category: "Sneakers",
      query: "necklace",
      sort: "relevance",
    }).length,
    0,
  );
});
test("prices preserve cents", () => {
  assert.match(money(199.99), /199[,.]99/);
});
